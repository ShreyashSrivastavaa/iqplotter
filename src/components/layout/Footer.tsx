import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-bg border-t border-line py-8 sm:py-10 px-4 sm:px-8 font-mono text-xs text-ink-subtle transition-colors">
      <div className="max-w-[1480px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <span className="font-sans font-extrabold text-xl text-ink lowercase tracking-tight">
            iqplotter
          </span>
          <span aria-hidden="true" className="font-bold">·</span>
          <span>Free. Private. Runs in your browser.</span>
        </div>

        <div>
          <span>© {currentYear} iqplotter. All processing client-side.</span>
        </div>
      </div>
    </footer>
  );
};

