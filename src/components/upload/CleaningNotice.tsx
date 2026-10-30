import React from 'react';
import { Sparkles, X } from 'lucide-react';
import { CleaningReport } from '../../state/types';
import { useApp } from '../../state/store';

export const CleaningNotice: React.FC<{ report: CleaningReport }> = ({ report }) => {
  const { state, dispatch } = useApp();

  if (state.cleaningNoticeDismissed) return null;

  const actions: string[] = [];
  if (report.removedDuplicateRows > 0) {
    actions.push(`removed ${report.removedDuplicateRows} duplicate row${report.removedDuplicateRows > 1 ? 's' : ''}`);
  }
  if (report.removedEmptyRows > 0) {
    actions.push(`dropped ${report.removedEmptyRows} empty row${report.removedEmptyRows > 1 ? 's' : ''}`);
  }
  if (report.removedEmptyColumns > 0) {
    actions.push(`dropped ${report.removedEmptyColumns} empty column${report.removedEmptyColumns > 1 ? 's' : ''}`);
  }
  if (report.renamedHeaders.length > 0) {
    actions.push(`renamed ${report.renamedHeaders.length} duplicate/blank header${report.renamedHeaders.length > 1 ? 's' : ''}`);
  }
  if (report.normalizedNumericColumns.length > 0) {
    actions.push(`cleaned formatted numbers in: ${report.normalizedNumericColumns.join(', ')}`);
  }
  if (report.missingValueCells > 0) {
    actions.push(`normalized ${report.missingValueCells} missing/NA cell${report.missingValueCells > 1 ? 's' : ''}`);
  }

  if (actions.length === 0) return null;

  return (
    <div className="w-full bg-card border border-[#FEDF89] dark:border-[#B54708]/40 rounded-2xl p-4 sm:p-5 mb-6 flex items-start gap-3.5 shadow-sm text-left transition-colors">
      <div className="w-8 h-8 rounded-full bg-[#FEF7EC] dark:bg-[#B54708]/20 text-[#B54708] dark:text-[#F79009] flex items-center justify-center shrink-0 mt-0.5">
        <Sparkles className="w-4 h-4" />
      </div>
      <div className="flex-1 font-mono text-xs sm:text-sm">
        <p className="font-semibold text-ink mb-1">Auto-cleaning applied to your dataset</p>
        <p className="text-ink-muted leading-relaxed">
          iqplotter automatically {actions.join(', ')}. All raw data remained private in your browser.
        </p>
      </div>
      <button
        type="button"
        onClick={() => dispatch({ type: 'DISMISS_CLEANING_NOTICE' })}
        className="text-ink-subtle hover:text-ink p-1 rounded-full hover:bg-bg transition-colors"
        aria-label="Dismiss cleaning notice"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

