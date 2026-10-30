import React from 'react';

export const Toast: React.FC<{ message: string | null }> = ({ message }) => {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1A1714] text-[#FAF7E9] px-5 py-2.5 rounded-full shadow-lg border border-[#34301F] font-mono text-sm flex items-center gap-2 pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      <span className="w-2 h-2 rounded-full bg-[#F26B21]"></span>
      <span>{message}</span>
    </div>
  );
};
