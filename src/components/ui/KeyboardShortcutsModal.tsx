import React from 'react';
import { X, Keyboard } from 'lucide-react';
import { useApp } from '../../state/store';

export const KeyboardShortcutsModal: React.FC = () => {
  const { state, dispatch } = useApp();

  if (!state.shortcutsModalOpen) return null;

  const shortcuts = [
    { key: '1', desc: 'Jump to Data Ingestion' },
    { key: '2', desc: 'Jump to Data Inspection' },
    { key: '3', desc: 'Jump to Data Visualization' },
    { key: 'T / D', desc: 'Toggle Dark / Light Theme' },
    { key: '?', desc: 'Show / Hide Keyboard Shortcuts' },
    { key: 'Esc', desc: 'Close any active modal or drawer' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard Shortcuts"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={() => dispatch({ type: 'TOGGLE_SHORTCUTS_MODAL', open: false })}
    >
      <div
        className="relative w-full max-w-md bg-card border border-line rounded-3xl p-6 sm:p-8 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => dispatch({ type: 'TOGGLE_SHORTCUTS_MODAL', open: false })}
          className="absolute top-5 right-5 p-2 rounded-full text-ink-subtle hover:text-ink hover:bg-bg transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-2 text-accent-orange">
          <Keyboard className="w-6 h-6" />
          <h3 className="font-sans font-bold text-xl text-ink">Keyboard Shortcuts</h3>
        </div>
        <p className="font-mono text-xs text-ink-muted mb-6">
          Navigate and control iqplotter quickly without leaving your keyboard.
        </p>

        <div className="space-y-2.5 font-mono text-xs">
          {shortcuts.map((sc) => (
            <div
              key={sc.key}
              className="flex items-center justify-between p-2.5 rounded-xl bg-bg border border-line"
            >
              <span className="text-ink">{sc.desc}</span>
              <kbd className="px-2.5 py-1 rounded-md bg-card border border-outline/40 text-ink font-semibold shadow-xs">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
