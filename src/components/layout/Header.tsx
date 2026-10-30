import React from 'react';
import { History, LogOut, Sun, Moon, Keyboard, Globe, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../state/store';
import { Button } from '../ui/Button';
import { isFirebaseConfigured, signOutUser } from '../../lib/auth/firebase';
import { SUPPORTED_LOCALES } from '../../lib/i18n';

export const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { state, dispatch, scrollToWorkspace, toggleTheme } = useApp();
  const [accountMenuOpen, setAccountMenuOpen] = React.useState(false);
  const [langMenuOpen, setLangMenuOpen] = React.useState(false);
  const accountMenuRef = React.useRef<HTMLDivElement>(null);
  const langMenuRef = React.useRef<HTMLDivElement>(null);
  const hasFirebase = isFirebaseConfigured();

  // Close menus on click outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (accountMenuRef.current && !accountMenuRef.current.contains(target)) {
        setAccountMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(target)) {
        setLangMenuOpen(false);
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
            title={state.isDark ? t('nav.lightMode') : t('nav.darkMode')}
            aria-label={t('nav.toggleTheme')}
          >
            {state.isDark ? (
              <Sun className="w-4 h-4 text-[#F7CDA6] transition-transform hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-ink transition-transform hover:-rotate-12" />
            )}
            <span className="hidden md:inline font-mono text-xs">
              {state.isDark ? t('nav.lightMode') : t('nav.darkMode')}
            </span>
          </button>

          {/* Minimal Language Selector */}
          <div className="relative" ref={langMenuRef}>
            <button
              type="button"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="p-2 sm:px-3 sm:py-2 text-xs sm:text-sm font-mono text-ink-muted hover:text-ink hover:bg-card rounded-full border border-transparent hover:border-line transition-all flex items-center gap-1.5"
              title={t('nav.language')}
              aria-label={t('nav.language')}
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline font-mono text-xs uppercase">
                {i18n.language || 'en'}
              </span>
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-card border border-line rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 font-mono text-xs max-h-80 overflow-y-auto">
                <div className="px-3 py-1 text-[11px] font-semibold text-ink-subtle uppercase tracking-wider border-b border-line mb-1">
                  {t('nav.language')}
                </div>
                {SUPPORTED_LOCALES.map((loc) => {
                  const isCurrent = i18n.language === loc.code;
                  return (
                    <button
                      key={loc.code}
                      type="button"
                      onClick={() => {
                        i18n.changeLanguage(loc.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-bg transition-colors ${
                        isCurrent ? 'font-semibold text-ink bg-bg/60' : 'text-ink-muted'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{loc.nativeName}</span>
                        <span className="text-[10px] text-ink-subtle">({loc.label})</span>
                      </div>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-accent-orange" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Keyboard Shortcuts Trigger Button */}
          <button
            type="button"
            onClick={() => dispatch({ type: 'TOGGLE_SHORTCUTS_MODAL', open: true })}
            className="p-2 text-ink-muted hover:text-ink hover:bg-card rounded-full border border-transparent hover:border-line transition-colors"
            title={t('nav.shortcuts')}
            aria-label={t('nav.shortcuts')}
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* History drawer trigger button */}
          <button
            type="button"
            onClick={() => dispatch({ type: 'TOGGLE_HISTORY' })}
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-mono text-ink-muted hover:text-ink hover:bg-card rounded-full border border-transparent hover:border-line transition-colors"
            title={t('nav.history')}
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">{t('nav.history')}</span>
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
                  {t('nav.signIn')}
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
                    <span>{t('nav.signOut')}</span>
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
            {t('nav.getStarted')}
          </Button>
        </div>
      </div>
    </header>
  );
};
