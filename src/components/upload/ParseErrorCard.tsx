import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { AppError } from '../../state/types';
import { Button } from '../ui/Button';

export const ParseErrorCard: React.FC<{
  error: AppError;
  onReset: () => void;
}> = ({ error, onReset }) => {
  const getErrorMessage = () => {
    if (error.message) return error.message;
    switch (error.code) {
      case 'EMPTY_FILE':
        return 'This file is empty.';
      case 'NO_ROWS':
        return 'We found column headers but no data rows.';
      case 'TOO_FEW_ROWS':
        return 'We need at least 2 rows of data to draw a chart.';
      case 'TOO_LARGE':
        return `This file is larger than ${error.maxMB || 10} MB. Try a smaller export or split the file.`;
      case 'BAD_TYPE':
        return "That doesn't look like a supported file. Try a .csv, .tsv or .txt file.";
      case 'PARSE_FAILED':
        return "We couldn't read this file. Check for unclosed quotes or a corrupted export.";
      case 'NO_NUMERIC_COLUMNS':
        return "We couldn't find a numeric column to plot.";
      default:
        return 'Could not parse this file.';
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6 sm:p-8 rounded-2xl border border-[#B42318]/30 bg-[#FEF3F2] dark:bg-[#7A271A]/20 text-center my-6 animate-in fade-in zoom-in-95">
      <div className="w-12 h-12 rounded-full bg-[#FECDCA] dark:bg-[#B42318]/30 text-[#B42318] dark:text-[#FDA29B] flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="font-mono font-semibold text-lg text-[#B42318] dark:text-[#FDA29B] mb-2">Parsing Error</h3>
      <p className="font-mono text-sm text-ink-muted max-w-md mx-auto mb-6 leading-relaxed">
        {getErrorMessage()}
      </p>
      <Button variant="outline" size="md" onClick={onReset} className="gap-2 mx-auto">
        <RefreshCw className="w-4 h-4" />
        <span>Try another file</span>
      </Button>
    </div>
  );
};
