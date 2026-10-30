import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppAction, AppState, ThemeMode } from './types';
import { decodeShareHash } from '../lib/share/share';
import { subscribeToAuthChanges } from '../lib/auth/firebase';
import { saveHistoryItem } from '../lib/storage/history';

function getInitialThemeState(): { theme: ThemeMode; isDark: boolean } {
  if (typeof window === 'undefined') {
    return { theme: 'system', isDark: false };
  }
  try {
    const stored = localStorage.getItem('iqplotter_theme') as ThemeMode | null;
    const theme: ThemeMode = stored || 'system';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = theme === 'dark' || (theme === 'system' && prefersDark);
    return { theme, isDark };
  } catch (e) {
    return { theme: 'system', isDark: false };
  }
}

const initialTheme = getInitialThemeState();

export const initialAppState: AppState = {
  dataset: null,
  config: null,
  activeTab: 'ingestion',
  status: 'idle',
  error: null,
  notices: [],
  cleaningNoticeDismissed: false,
  historyOpen: false,
  authModalOpen: false,
  shortcutsModalOpen: false,
  user: null,
  theme: initialTheme.theme,
  isDark: initialTheme.isDark,
};

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.tab };

    case 'START_PARSING':
      return { ...state, status: 'parsing', error: null };

    case 'PARSE_SUCCESS':
      return {
        ...state,
        dataset: action.dataset,
        config: action.config,
        status: 'ready',
        error: null,
        cleaningNoticeDismissed: false,
        notices: action.notices ? [...action.notices] : [],
      };

    case 'PARSE_ERROR':
      return {
        ...state,
        status: 'error',
        error: action.error,
      };

    case 'SET_CONFIG':
      if (!state.config) return state;
      return {
        ...state,
        config: { ...state.config, ...action.config },
      };

    case 'DISMISS_CLEANING_NOTICE':
      return { ...state, cleaningNoticeDismissed: true };

    case 'ADD_NOTICE':
      return { ...state, notices: [...state.notices, action.notice] };

    case 'DISMISS_NOTICE':
      return {
        ...state,
        notices: state.notices.filter((_, idx) => idx !== action.index),
      };

    case 'CLEAR_DATASET':
      return {
        ...state,
        dataset: null,
        config: null,
        status: 'idle',
        error: null,
        notices: [],
        activeTab: 'ingestion',
      };

    case 'TOGGLE_HISTORY':
      return {
        ...state,
        historyOpen: action.open !== undefined ? action.open : !state.historyOpen,
      };

    case 'TOGGLE_AUTH_MODAL':
      return {
        ...state,
        authModalOpen: action.open !== undefined ? action.open : !state.authModalOpen,
      };

    case 'TOGGLE_SHORTCUTS_MODAL':
      return {
        ...state,
        shortcutsModalOpen: action.open !== undefined ? action.open : !state.shortcutsModalOpen,
      };

    case 'SET_USER':
      return {
        ...state,
        user: action.user,
      };

    case 'SET_THEME':
      return {
        ...state,
        theme: action.theme,
        isDark: action.isDark,
      };

    case 'RESTORE_DATASET_AND_CONFIG':
      return {
        ...state,
        dataset: action.dataset,
        config: action.config,
        status: 'ready',
        error: null,
        cleaningNoticeDismissed: true,
        activeTab: 'visualization',
      };

    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  toastMessage: string | null;
  showToast: (msg: string, isError?: boolean) => void;
  loadSampleByName: (sampleName: string) => Promise<void>;
  scrollToWorkspace: (focusDropzone?: boolean) => void;
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialAppState);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const toastTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync theme changes with DOM and localStorage
  React.useEffect(() => {
    try {
      if (state.isDark) {
        document.documentElement.classList.add('dark');
        const meta = document.getElementById('theme-color-meta');
        if (meta) meta.setAttribute('content', '#12110F');
      } else {
        document.documentElement.classList.remove('dark');
        const meta = document.getElementById('theme-color-meta');
        if (meta) meta.setAttribute('content', '#FAF7E9');
      }
      localStorage.setItem('iqplotter_theme', state.theme);
    } catch (e) {}
  }, [state.theme, state.isDark]);

  // Listen to system theme changes if in 'system' mode
  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (state.theme === 'system') {
        dispatch({ type: 'SET_THEME', theme: 'system', isDark: e.matches });
      }
    };
    if (media.addEventListener) {
      media.addEventListener('change', handleChange);
      return () => media.removeEventListener('change', handleChange);
    }
  }, [state.theme]);

  const toggleTheme = React.useCallback(() => {
    const nextIsDark = !state.isDark;
    const nextTheme: ThemeMode = nextIsDark ? 'dark' : 'light';
    dispatch({ type: 'SET_THEME', theme: nextTheme, isDark: nextIsDark });
  }, [state.isDark]);

  const showToast = React.useCallback((msg: string, _isError?: boolean) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  const scrollToWorkspace = React.useCallback((focusDropzone = false) => {
    const el = document.getElementById('workspace');
    if (el) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });

      if (focusDropzone) {
        setTimeout(() => {
          const dropzoneBtn = document.getElementById('browse-files-btn');
          dropzoneBtn?.focus();
        }, prefersReducedMotion ? 50 : 400);
      }
    }
  }, []);

  // Load sample dataset
  const loadSampleByName = React.useCallback(
    async (sampleName: string) => {
      dispatch({ type: 'START_PARSING' });
      try {
        const res = await fetch(`/samples/${sampleName}`);
        if (!res.ok) throw new Error('Sample file could not be fetched');
        const text = await res.text();
        const { parseCsvFile } = await import('../lib/csv/parser');
        const file = new File([text], sampleName, { type: 'text/csv' });
        const result = await parseCsvFile(file);
        dispatch({
          type: 'PARSE_SUCCESS',
          dataset: result.dataset,
          config: result.config!,
          notices: result.notices,
        });
        showToast(`Loaded ${sampleName.replace('.csv', '').replace('-', ' ')} data`);
      } catch (err: unknown) {
        console.error('Failed to load sample:', err);
        showToast('Failed to load sample data', true);
        dispatch({
          type: 'PARSE_ERROR',
          error: { code: 'PARSE_FAILED', message: 'Could not load sample data.' },
        });
      }
    },
    [showToast]
  );

  // Check for shared URL hash on mount
  useEffect(() => {
    const shared = decodeShareHash();
    if (shared) {
      dispatch({
        type: 'RESTORE_DATASET_AND_CONFIG',
        dataset: shared.dataset,
        config: shared.config,
      });
      showToast('Loaded shared chart');
    }
  }, [showToast]);

  // Listen to auth changes
  useEffect(() => {
    let unsub = () => {};
    subscribeToAuthChanges((u) => {
      dispatch({ type: 'SET_USER', user: u });
    }).then((fn) => {
      unsub = fn;
    });
    return () => unsub();
  }, []);

  // Debounced auto-save to IndexedDB history when dataset or config changes
  useEffect(() => {
    if (!state.dataset || !state.config) return;

    const timer = setTimeout(() => {
      saveHistoryItem(state.dataset!, state.config!, state.user?.uid).then((res) => {
        if (res.tooLarge) {
          showToast('Dataset is over 5 MB; skipping history storage.', true);
        }
      });
    }, 800);

    return () => clearTimeout(timer);
  }, [state.dataset, state.config, state.user?.uid, showToast]);

  // Global Keyboard Shortcuts (1, 2, 3 for tabs, 't' or 'd' for theme, '?' for shortcuts modal)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input, textarea or select
      const activeEl = document.activeElement;
      const isInput =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        activeEl instanceof HTMLSelectElement;

      if (e.key === 'Escape') {
        if (state.shortcutsModalOpen) dispatch({ type: 'TOGGLE_SHORTCUTS_MODAL', open: false });
        if (state.historyOpen) dispatch({ type: 'TOGGLE_HISTORY', open: false });
        if (state.authModalOpen) dispatch({ type: 'TOGGLE_AUTH_MODAL', open: false });
        return;
      }

      if (isInput) return;

      if (e.key === '1') {
        dispatch({ type: 'SET_ACTIVE_TAB', tab: 'ingestion' });
      } else if (e.key === '2') {
        dispatch({ type: 'SET_ACTIVE_TAB', tab: 'inspection' });
      } else if (e.key === '3') {
        dispatch({ type: 'SET_ACTIVE_TAB', tab: 'visualization' });
      } else if (e.key === 't' || e.key === 'T' || e.key === 'd' || e.key === 'D') {
        toggleTheme();
      } else if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        dispatch({ type: 'TOGGLE_SHORTCUTS_MODAL' });
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [toggleTheme, state.shortcutsModalOpen, state.historyOpen, state.authModalOpen]);

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        toastMessage,
        showToast,
        loadSampleByName,
        scrollToWorkspace,
        toggleTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
