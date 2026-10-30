import React from 'react';

export const ContentSections: React.FC = () => {
  return (
    <section className="w-full max-w-[1248px] mx-auto px-4 sm:px-6 py-16 sm:py-24 border-t border-line transition-colors">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-14 lg:gap-16">
        {/* Section 1 */}
        <div className="space-y-3 font-mono">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-[#F26B21]">
            Free CSV Chart Generator
          </span>
          <h2 className="font-sans font-bold text-xl sm:text-2xl text-ink">
            CSV to Chart in Seconds – No Coding Required
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-ink-muted">
            Upload any CSV file to iqplotter and instantly generate bar charts, line graphs, scatter
            plots, and pie charts. Perfect for students, researchers, professors, and engineers who
            need to visualize and analyze data quickly without writing a single line of code.
          </p>
        </div>

        {/* Section 2 */}
        <div className="space-y-3 font-mono">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-ink-subtle">
            Academic & Scientific
          </span>
          <h2 className="font-sans font-bold text-xl sm:text-2xl text-ink">
            Data Visualization Tool for Students and Researchers
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-ink-muted">
            Whether you're working on a thesis, lab report, research paper, or class project, iqplotter
            helps you turn raw CSV data into clear, shareable charts in seconds. Free, browser-based,
            and no sign-up needed.
          </p>
        </div>

        {/* Section 3 */}
        <div className="space-y-3 font-mono">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-ink-subtle">
            Professional Engineering
          </span>
          <h2 className="font-sans font-bold text-xl sm:text-2xl text-ink">
            Engineering and Academic Data Analysis Made Simple
          </h2>
          <p className="text-sm sm:text-base leading-relaxed text-ink-muted">
            iqplotter is used by college students, graduate researchers, data analysts, and engineering
            professionals to explore datasets, identify trends, and create publication-ready
            visualizations.
          </p>
        </div>

        {/* Section 4 */}
        <div className="space-y-3 font-mono">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-ink-subtle">
            Simple Workflow
          </span>
          <h2 className="font-sans font-bold text-xl sm:text-2xl text-ink">
            How to Plot CSV Data Online
          </h2>
          <ol className="list-decimal list-inside space-y-1.5 text-sm sm:text-base text-ink-muted leading-relaxed">
            <li>Upload your CSV file.</li>
            <li>Select the X and Y columns.</li>
            <li>Choose your chart type.</li>
            <li>Download or share your chart.</li>
          </ol>
          <p className="text-sm sm:text-base text-ink font-medium pt-1">
            That's it — no software to install, no account to create.
          </p>
        </div>
      </div>
    </section>
  );
};

