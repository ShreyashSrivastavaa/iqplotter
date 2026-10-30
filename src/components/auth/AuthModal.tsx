import React, { useState } from 'react';
import { X, ShieldCheck, AlertCircle } from 'lucide-react';
import { useApp } from '../../state/store';
import { signInWithGoogle } from '../../lib/auth/firebase';

export const AuthModal: React.FC = () => {
  const { state, dispatch, showToast } = useApp();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!state.authModalOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const user = await signInWithGoogle();
      if (user) {
        dispatch({ type: 'SET_USER', user });
        dispatch({ type: 'TOGGLE_AUTH_MODAL', open: false });
        showToast(`Signed in as ${user.displayName || user.email}`);
      }
    } catch (err: unknown) {
      console.error('Google sign-in error:', err);
      setErrorMsg((err as Error)?.message || 'Failed to sign in with Google. Check configuration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1A1714]/40 backdrop-blur-sm transition-opacity"
        onClick={() => dispatch({ type: 'TOGGLE_AUTH_MODAL', open: false })}
      />

      <div className="min-h-full flex items-center justify-center p-4">
        {/* Modal card */}
        <div className="relative w-full max-w-sm bg-card border border-line rounded-3xl p-6 sm:p-8 shadow-2xl font-mono text-center animate-in fade-in zoom-in-95">
          <button
            type="button"
            onClick={() => dispatch({ type: 'TOGGLE_AUTH_MODAL', open: false })}
            className="absolute top-5 right-5 p-1 rounded-full text-ink-subtle hover:text-ink hover:bg-bg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <h3 className="font-sans font-bold text-2xl text-ink mb-2">Sign in to iqplotter</h3>
          <p className="text-xs text-ink-muted mb-6 leading-relaxed">
            Sign in is completely optional. Your datasets, charts and history always remain 100% private in your browser.
          </p>

          {errorMsg && (
            <div className="p-3 mb-4 rounded-xl bg-[#FEF3F2] dark:bg-[#7A271A]/20 border border-[#FECDCA] dark:border-[#B42318]/40 text-[#B42318] dark:text-[#FDA29B] text-xs flex items-start gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleSignIn}
            className="w-full h-12 rounded-full border border-line bg-card hover:bg-bg text-ink font-mono font-semibold text-sm active:translate-y-[1px] transition-all flex items-center justify-center gap-3 shadow-sm disabled:opacity-50"
          >
            {/* Google Icon SVG */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{loading ? 'Signing in...' : 'Continue with Google'}</span>
          </button>

          <div className="mt-6 pt-4 border-t border-line flex items-center justify-center gap-1.5 text-[11px] text-ink-subtle">
            <ShieldCheck className="w-3.5 h-3.5 text-[#067647]" />
            <span>No data ever leaves your device</span>
          </div>
        </div>
      </div>
    </div>
  );
};
