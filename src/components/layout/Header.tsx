import React from 'react';
import { History, LogOut, Sun, Moon, Keyboard } from 'lucide-react';
import { useApp } from '../../state/store';
import { Button } from '../ui/Button';
import { isFirebaseConfigured, signOutUser } from '../../lib/auth/firebase';

export const Header: React.FC = () => {
  const { state, dispatch, scrollToWorkspace, toggleTheme } = useApp();
  const [accountMenuOpen, setAccountMenuOpen] = React.useState(false);
  const accountMenuRef = React.useRef<HTMLDivElement>(null);
  const hasFirebase = isFirebaseConfigured();

  // Close account menu on click outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full h-[74px] bg-bg/95 backdrop-blur-md border-b border-line px-4 sm:px-8 transition-colors">
      <div className="max-w-[1480px] h-full mx-auto flex items-center justify-between">
        {/* Wordmark */}
        <div className="flex items-center gap-3">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="font-sans font-extrabold text-[28px] sm:text-[38px] tracking-[-0.04em] text-ink select-none lowercase leading-none flex items-center gap-2 group"
          >
            <span>iqplotter</span>
            <span className="w-2 h-2 rounded-full bg-accent-orange opacity-90 group-hover:scale-125 transition-transform" />
          </a>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 sm:px-3 sm:py-2 text-xs sm:text-sm font-mono text-ink-muted hover:text-ink hover:bg-card rounded-full border border-transparent hover:border-line transition-all flex items-center gap-1.5"
            title={state.isDark ? 'Switch to light mode (T)' : 'Switch to dark mode (T)'}
            aria-label="Toggle theme"
          >
            {state.isDark ? (
              <Sun className="w-4 h-4 text-[#F7CDA6] transition-transform hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-ink transition-transform hover:-rotate-12" />
            )}
            <span className="hidden md:inline font-mono text-xs">
              {state.isDark ? 'Light' : 'Dark'}
            </span>
          </button>

          {/* Keyboard Shortcuts Trigger Button */}
          <button
            type="button"
            onClick={() => dispatch({ type: 'TOGGLE_SHORTCUTS_MODAL', open: true })}
            className="p-2 text-ink-muted hover:text-ink hover:bg-card rounded-full border border-transparent hover:border-line transition-colors"
            title="Keyboard shortcuts (?)"
            aria-label="Keyboard shortcuts"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* History drawer trigger button */}
          <button
            type="button"
            onClick={() => dispatch({ type: 'TOGGLE_HISTORY' })}
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-mono text-ink-muted hover:text-ink hover:bg-card rounded-full border border-transparent hover:border-line transition-colors"
            title="Open saved history"
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">History</span>
          </button>

          {/* Optional Sign in / Account Profile */}
          {hasFirebase && (
            <div className="relative" ref={accountMenuRef}>
              {state.user ? (
                <button
                  type="button"
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full border border-outline hover:bg-card transition-colors"
                  aria-label="User account"
                >
                  {state.user.photoURL ? (
                    <img
                      src={state.user.photoURL}
                      alt={state.user.displayName || 'Avatar'}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-ink text-bg flex items-center justify-center font-mono text-xs">
                      {state.user.displayName ? state.user.displayName[0]?.toUpperCase() : 'U'}
                    </div>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'TOGGLE_AUTH_MODAL', open: true })}
                  className="h-[44px] px-4 sm:px-5 rounded-full border border-outline text-ink font-mono text-sm hover:bg-card transition-colors"
                >
                  Sign in
                </button>
              )}

              {/* Account Dropdown Menu */}
              {accountMenuOpen && state.user && (
                <div className="absolute right-0 mt-2 w-56 bg-card border border-line rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 font-mono text-xs">
                  <div className="px-4 py-2 border-b border-line">
                    <p className="font-semibold text-ink truncate">
                      {state.user.displayName || 'User'}
                    </p>
                    <p className="text-ink-subtle truncate text-[11px]">{state.user.email}</p>
                  </div>
                  <button
                    onClick={async () => {
                      setAccountMenuOpen(false);
                      await signOutUser();
                    }}
                    className="w-full text-left px-4 py-2 text-danger hover:bg-bg flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Primary Get Started Button */}
          <Button
            variant="primary"
            onClick={() => scrollToWorkspace(true)}
            className="hidden sm:inline-flex w-[145px] !h-[49px] font-sans font-semibold text-[17px]"
          >
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
};
