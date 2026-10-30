import React from 'react';
import { BadgeCluster } from './FileBadge';
import { useApp } from '../../state/store';
import { Button } from '../ui/Button';

export const Hero: React.FC = () => {
  const { scrollToWorkspace, loadSampleByName } = useApp();

  const handleTryForFree = () => {
    scrollToWorkspace(true);
  };

  const handleSeeItInAction = async () => {
    scrollToWorkspace(false);
    await loadSampleByName('monthly-sales.csv', 'visualization');
  };

  return (
    <section className="pt-16 sm:pt-24 pb-12 sm:pb-16 px-4 text-center flex flex-col items-center">
      {/* H1 Headline */}
      <h1 className="font-sans font-extrabold text-ink tracking-[-0.035em] leading-[1.06] text-balance text-center text-[clamp(2.25rem,5vw+0.5rem,4.75rem)] max-w-5xl mx-auto">
        <span>Convert your</span>
        <BadgeCluster />
        <span>data into</span>
        <br />
        <span>powerful insights.</span>
      </h1>

      {/* Subcopy */}
      <p className="mt-8 sm:mt-10 font-mono text-ink-muted text-base sm:text-xl lg:text-[22px] leading-[1.55] max-w-[720px] mx-auto text-balance">
        Generate charts from CSV data instantly. Turn raw data into clear visual insights with a fast
        and simple workflow.
      </p>

      {/* CTA Row */}
      <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full sm:w-auto">
        <Button
          variant="primary"
          size="lg"
          onClick={handleTryForFree}
          className="w-full sm:w-[187px] !h-[57px] text-base font-mono font-semibold"
        >
          Try for free
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={handleSeeItInAction}
          className="w-full sm:w-[229px] !h-[58px] text-base font-mono font-semibold"
        >
          See it in action
        </Button>
      </div>

      {/* Trust Line */}
      <div className="mt-5 font-mono text-xs sm:text-[15px] tracking-[0.02em] text-ink-subtle flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
        <span>Privacy-first</span>
        <span aria-hidden="true" className="select-none font-bold">
          ·
        </span>
        <span>Runs in your browser</span>
        <span aria-hidden="true" className="select-none font-bold">
          ·
        </span>
        <span>No account needed</span>
      </div>

      {/* Interactive Quick-start bar */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2 pt-2 text-xs font-mono">
        <span className="text-ink-subtle">Instant preview:</span>
        <button
          type="button"
          onClick={async () => {
            scrollToWorkspace(false);
            await loadSampleByName('monthly-sales.csv', 'visualization');
          }}
          className="px-3 py-1 rounded-full border border-line bg-card hover:bg-bg hover:border-outline text-ink transition-colors flex items-center gap-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-accent-orange" />
          <span>Monthly Sales</span>
          <span className="text-[10px] text-ink-subtle font-normal">96 rows</span>
        </button>
        <button
          type="button"
          onClick={async () => {
            scrollToWorkspace(false);
            await loadSampleByName('daily-temperature.csv', 'visualization');
          }}
          className="px-3 py-1 rounded-full border border-line bg-card hover:bg-bg hover:border-outline text-ink transition-colors flex items-center gap-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
          <span>Daily Weather</span>
          <span className="text-[10px] text-ink-subtle font-normal">180 rows</span>
        </button>
        <button
          type="button"
          onClick={async () => {
            scrollToWorkspace(false);
            await loadSampleByName('exam-scores.csv', 'visualization');
          }}
          className="px-3 py-1 rounded-full border border-line bg-card hover:bg-bg hover:border-outline text-ink transition-colors flex items-center gap-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
          <span>Exam Scores</span>
          <span className="text-[10px] text-ink-subtle font-normal">150 rows</span>
        </button>
      </div>
    </section>
  );
};
