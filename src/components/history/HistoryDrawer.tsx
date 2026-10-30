import React, { useState, useEffect, useCallback } from 'react';
import { X, Trash2, Clock, FileSpreadsheet, ArrowRight } from 'lucide-react';
import { useApp } from '../../state/store';
import { clearAllHistory, deleteHistoryItem, HistoryItem, loadHistory } from '../../lib/storage/history';

export const HistoryDrawer: React.FC = () => {
  const { state, dispatch, showToast } = useApp();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await loadHistory(state.user?.uid);
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [state.user?.uid]);

  useEffect(() => {
    if (state.historyOpen) {
      fetchHistory();
    }
  }, [state.historyOpen, fetchHistory]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && state.historyOpen) {
        dispatch({ type: 'TOGGLE_HISTORY', open: false });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.historyOpen, dispatch]);

  if (!state.historyOpen) return null;

  const handleOpenItem = (item: HistoryItem) => {
    dispatch({
      type: 'RESTORE_DATASET_AND_CONFIG',
      dataset: item.dataset,
      config: item.config,
    });
    dispatch({ type: 'TOGGLE_HISTORY', open: false });
    showToast(`Restored "${item.name}"`);
  };

  const handleDeleteItem = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = await deleteHistoryItem(id, state.user?.uid);
    setItems(updated);
    showToast('Removed from history');
  };

  const handleClearAll = async () => {
    await clearAllHistory(state.user?.uid);
    setItems([]);
    showToast('History cleared');
  };

  const formatRelativeTime = (timestamp: number) => {
    const diffMs = Date.now() - timestamp;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    return `${diffDay}d ago`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#1A1714]/40 backdrop-blur-sm transition-opacity"
        onClick={() => dispatch({ type: 'TOGGLE_HISTORY', open: false })}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex">
        {/* Drawer panel (Slide over right desktop, full width mobile) */}
        <div className="w-screen max-w-md bg-card border-l border-line shadow-2xl flex flex-col font-mono text-ink">
          {/* Header */}
          <div className="p-5 border-b border-line flex items-center justify-between bg-bg">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#F26B21]" />
              <h3 className="font-bold text-base text-ink">Saved Charts & Datasets</h3>
            </div>
            <button
              type="button"
              onClick={() => dispatch({ type: 'TOGGLE_HISTORY', open: false })}
              className="p-1.5 rounded-full hover:bg-card text-ink-muted hover:text-ink transition-colors"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subheader info & Clear all */}
          <div className="px-5 py-2.5 bg-card border-b border-line flex items-center justify-between text-xs text-ink-subtle">
            <span>Stored locally in browser (Max 10)</span>
            {items.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[#B42318] hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          {/* List content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="py-12 text-center text-xs text-ink-muted">Loading history...</div>
            ) : items.length === 0 ? (
              <div className="py-16 text-center text-xs text-ink-muted">
                <FileSpreadsheet className="w-8 h-8 text-ink-subtle mx-auto mb-3" />
                <p className="font-semibold text-sm text-ink mb-1">No saved history yet</p>
                <p>Charts you build will automatically be saved here for quick restoration.</p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleOpenItem(item)}
                  className="p-4 rounded-xl border border-line bg-bg hover:border-ink cursor-pointer transition-all hover:shadow-sm group flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-sm text-ink truncate group-hover:text-[#F26B21] transition-colors">
                      {item.config.title || item.name}
                    </h4>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteItem(e, item.id)}
                      className="text-ink-subtle hover:text-[#B42318] p-1 rounded transition-colors"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-ink-subtle">
                    <span>
                      {item.rowCount.toLocaleString()} rows · {item.colCount} cols
                    </span>
                    <span>{formatRelativeTime(item.timestamp)}</span>
                  </div>

                  <div className="mt-3 pt-2 border-t border-line flex items-center justify-between text-xs font-semibold text-ink">
                    <span className="text-[11px] uppercase tracking-wider text-ink-subtle">
                      {item.config.type} chart
                    </span>
                    <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-[#F26B21]">
                      <span>Open</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
