import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-bg border-t border-line py-10 px-4 sm:px-8 font-mono text-xs text-ink-subtle transition-colors">
      <div className="max-w-[1480px] mx-auto space-y-8">
        {/* Internal links grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-2 pb-6 border-b border-line">
          <div>
            <h4 className="font-bold text-ink uppercase tracking-wider text-[11px] mb-3">Tools</h4>
            <ul className="space-y-2">
              <li>
                <a href="/csv-to-chart" className="hover:text-ink transition-colors">CSV to Chart</a>
              </li>
              <li>
                <a href="/excel-to-chart" className="hover:text-ink transition-colors">Excel to Chart</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-ink uppercase tracking-wider text-[11px] mb-3">Chart Types</h4>
            <ul className="space-y-2">
              <li>
                <a href="/csv-to-bar-chart" className="hover:text-ink transition-colors">CSV to Bar Chart</a>
              </li>
              <li>
                <a href="/csv-to-line-chart" className="hover:text-ink transition-colors">CSV to Line Chart</a>
              </li>
              <li>
                <a href="/csv-to-line-graph" className="hover:text-ink transition-colors">CSV to Line Graph</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-ink uppercase tracking-wider text-[11px] mb-3">More Plots</h4>
            <ul className="space-y-2">
              <li>
                <a href="/csv-to-pie-chart" className="hover:text-ink transition-colors">CSV to Pie Chart</a>
              </li>
              <li>
                <a href="/csv-to-scatter-plot" className="hover:text-ink transition-colors">CSV to Scatter Plot</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-ink uppercase tracking-wider text-[11px] mb-3">Legal & Privacy</h4>
            <ul className="space-y-2">
              <li>
                <a href="/privacy" className="hover:text-ink transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="/" className="hover:text-ink transition-colors">Home Generator</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <a href="/" className="font-sans font-extrabold text-xl text-ink lowercase tracking-tight hover:opacity-80 transition-opacity">
              iqplotter
            </a>
            <span aria-hidden="true" className="font-bold">·</span>
            <span>Free. Private. Runs in your browser.</span>
          </div>

          <div>
            <span>© {currentYear} iqplotter. All processing client-side.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
