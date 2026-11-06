import React from 'react';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { ChartProblem } from '../../lib/chart/types';
import { useApp } from '../../state/store';
import { Button } from '../ui/Button';

export const ChartProblemCard: React.FC<{ problem: ChartProblem }> = ({ problem }) => {
  const { dispatch } = useApp();

  return (
    <div className="h-[360px] flex flex-col items-center justify-center p-6 text-center bg-card/60 dark:bg-card/40 border border-dashed border-line dark:border-outline rounded-2xl">
      <div className="w-12 h-12 rounded-full bg-warning/10 text-warning flex items-center justify-center mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h4 className="font-mono font-semibold text-base text-ink mb-1">Configuration Needed</h4>
      <p className="font-mono text-xs sm:text-sm text-ink-muted max-w-sm mb-4">
        {problem.message}
      </p>
      {problem.suggestion && (
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            dispatch({ type: 'SET_CONFIG', config: problem.suggestion!.action });
          }}
          className="gap-1.5"
        >
          <span>{problem.suggestion.label}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  );
};
