import { UserProfile } from '../../state/types';

export function isFirebaseConfigured(): boolean {
  return Boolean(
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID
  );
}

// In browsers that partition third-party storage (like Safari/iOS),
// using the hosting domain 'iqplotter.web.app' as the authDomain prevents iframe blocking.
export function getResolvedAuthDomain(): string {
  if (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) {
    return import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
  }
  return typeof window !== 'undefined' && window.location.hostname === 'iqplotter.web.app'
    ? 'iqplotter.web.app'
    : 'iqplotter.firebaseapp.com';
}

let firebaseAppInstance: unknown = null;
let authInstance: unknown = null;
let isSigningIn = false;
let redirectResultPromise: Promise<UserProfile | null> | null = null;

export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (window.innerWidth <= 768 && 'ontouchstart' in window);
}

export async function getFirebaseAuth() {
  if (!isFirebaseConfigured()) return null;

  if (!firebaseAppInstance) {
    const { initializeApp, getApps } = await import('firebase/app');
    const { getAuth, getRedirectResult, browserLocalPersistence, setPersistence } = await import('firebase/auth');

    const config = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: getResolvedAuthDomain(),
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };

    const apps = getApps();
    const app = apps.length > 0 ? apps[0] : initializeApp(config);
    firebaseAppInstance = app;

    const auth = getAuth(app as import('firebase/app').FirebaseApp);
    try {
      await setPersistence(auth, browserLocalPersistence);
    } catch {
      // Persistence fallback to memory if local storage is disabled
    }
    authInstance = auth;

    // Check redirect result on startup for mobile users returning from redirect flow
    redirectResultPromise = getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          const u = result.user;
          return {
            uid: u.uid,
            email: u.email,
            displayName: u.displayName,
            photoURL: u.photoURL,
            emailVerified: u.emailVerified,
            providerId: u.providerData?.[0]?.providerId || 'google.com',
          };
        }
        return null;
      })
      .catch((err) => {
        const errCode = (err as { code?: string })?.code;
        if (errCode !== 'auth/operation-not-supported-in-this-environment') {
          console.error('Error handling redirect auth result:', err);
        }
        return null;
      });
  }

  return authInstance as import('firebase/auth').Auth;
}

export async function checkInitialRedirectResult(): Promise<UserProfile | null> {
  const auth = await getFirebaseAuth();
  if (!auth || !redirectResultPromise) return null;
  return redirectResultPromise;
}

export type AuthErrorCode =
  | 'POPUP_CLOSED'
  | 'POPUP_BLOCKED'
  | 'CANCELLED'
  | 'NETWORK_ERROR'
  | 'UNAUTHORIZED_DOMAIN'
  | 'IN_FLIGHT'
  | 'UNKNOWN';

export interface AuthErrorResult {
  code: AuthErrorCode;
  key: string;
  originalMessage: string;
}

export function mapAuthError(err: unknown): AuthErrorResult {
  const code = (err as { code?: string })?.code || '';
  const message = (err as Error)?.message || 'Authentication failed';

  switch (code) {
    case 'auth/popup-closed-by-user':
      return { code: 'POPUP_CLOSED', key: 'auth.errors.popup_closed', originalMessage: message };
    case 'auth/cancelled-popup-request':
      return { code: 'CANCELLED', key: 'auth.errors.cancelled', originalMessage: message };
    case 'auth/popup-blocked':
      return { code: 'POPUP_BLOCKED', key: 'auth.errors.popup_blocked', originalMessage: message };
    case 'auth/network-request-failed':
      return { code: 'NETWORK_ERROR', key: 'auth.errors.network_error', originalMessage: message };
    case 'auth/unauthorized-domain':
      return { code: 'UNAUTHORIZED_DOMAIN', key: 'auth.errors.unauthorized_domain', originalMessage: message };
    default:
      return { code: 'UNKNOWN', key: 'auth.errors.generic', originalMessage: message };
  }
}

export async function signInWithGoogle(forceRedirect = false): Promise<UserProfile | null> {
  if (isSigningIn) {
    throw { code: 'IN_FLIGHT', key: 'auth.errors.in_flight', originalMessage: 'A sign-in request is already in progress.' };
  }

  const auth = await getFirebaseAuth();
  if (!auth) {
    throw new Error('Firebase configuration missing in environment.');
  }

  const { GoogleAuthProvider, signInWithPopup, signInWithRedirect } = await import('firebase/auth');
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  isSigningIn = true;

  try {
    // If mobile or explicitly requested redirect
    if (forceRedirect || isMobileDevice()) {
      await signInWithRedirect(auth, provider);
      return null;
    }

    // Desktop: Popup flow
    try {
      const result = await signInWithPopup(auth, provider);
      const u = result.user;
      return {
        uid: u.uid,
        email: u.email,
        displayName: u.displayName,
        photoURL: u.photoURL,
        emailVerified: u.emailVerified,
        providerId: u.providerData?.[0]?.providerId || 'google.com',
      };
    } catch (popupErr: unknown) {
      const errCode = (popupErr as { code?: string })?.code;
      // If popup was blocked by browser, automatically fall back to redirect
      if (errCode === 'auth/popup-blocked' || errCode === 'auth/cancelled-popup-request') {
        await signInWithRedirect(auth, provider);
        return null;
      }
      throw popupErr;
    }
  } finally {
    isSigningIn = false;
  }
}

export async function signOutUser(): Promise<void> {
  const auth = await getFirebaseAuth();
  if (!auth) return;
  const { signOut } = await import('firebase/auth');
  await signOut(auth);
}

export async function subscribeToAuthChanges(callback: (user: UserProfile | null) => void): Promise<() => void> {
  const auth = await getFirebaseAuth();
  if (!auth) {
    callback(null);
    return () => {};
  }

  const { onAuthStateChanged } = await import('firebase/auth');
  const unsubscribe = onAuthStateChanged(auth, (u) => {
    if (u) {
      callback({
        uid: u.uid,
        email: u.email,
        displayName: u.displayName,
        photoURL: u.photoURL,
        emailVerified: u.emailVerified,
        providerId: u.providerData?.[0]?.providerId || 'google.com',
      });
    } else {
      callback(null);
    }
  });

  return unsubscribe;
}
