import { UserProfile } from '../../state/types';

export function isFirebaseConfigured(): boolean {
  return Boolean(
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID
  );
}

let firebaseAppInstance: unknown = null;
let authInstance: unknown = null;

export async function getFirebaseAuth() {
  if (!isFirebaseConfigured()) return null;

  if (!firebaseAppInstance) {
    const { initializeApp, getApps } = await import('firebase/app');
    const { getAuth } = await import('firebase/auth');

    const config = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };

    const apps = getApps();
    firebaseAppInstance = apps.length > 0 ? apps[0] : initializeApp(config);
    authInstance = getAuth(firebaseAppInstance as import('firebase/app').FirebaseApp);
  }

  return authInstance as import('firebase/auth').Auth;
}

export async function signInWithGoogle(): Promise<UserProfile | null> {
  const auth = await getFirebaseAuth();
  if (!auth) {
    throw new Error('Firebase configuration missing in environment.');
  }

  const { GoogleAuthProvider, signInWithPopup, signInWithRedirect } = await import('firebase/auth');
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    const u = result.user;
    return {
      uid: u.uid,
      email: u.email,
      displayName: u.displayName,
      photoURL: u.photoURL,
    };
  } catch (err: unknown) {
    // If popup blocked or on restrictive mobile browser, fallback to redirect
    const errorCode = (err as { code?: string })?.code;
    if (errorCode === 'auth/popup-blocked' || errorCode === 'auth/cancelled-popup-request') {
      await signInWithRedirect(auth, provider);
      return null;
    }
    throw err;
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
      });
    } else {
      callback(null);
    }
  });

  return unsubscribe;
}
