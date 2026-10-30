import React from 'react';
import { useTranslation } from 'react-i18next';
import { BadgeCluster } from './FileBadge';
import { useApp } from '../../state/store';
import { Button } from '../ui/Button';

export const Hero: React.FC = () => {
  const { t } = useTranslation();
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
        <span>{t('hero.headlinePrefix')}</span>
        <BadgeCluster />
        <span>{t('hero.headlineMiddle')}</span>
        <br />
        <span>{t('hero.headlineSuffix')}</span>
      </h1>

      {/* Subcopy */}
      <p className="mt-8 sm:mt-10 font-mono text-ink-muted text-base sm:text-xl lg:text-[22px] leading-[1.55] max-w-[720px] mx-auto text-balance">
        {t('hero.subcopy')}
      </p>

      {/* CTA Row */}
      <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full sm:w-auto">
        <Button
          variant="primary"
          size="lg"
          onClick={handleTryForFree}
          className="w-full sm:w-[187px] !h-[57px] text-base font-mono font-semibold"
        >
          {t('hero.tryFree')}
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={handleSeeItInAction}
          className="w-full sm:w-[229px] !h-[58px] text-base font-mono font-semibold"
        >
          {t('hero.seeAction')}
        </Button>
      </div>

      {/* Trust Line */}
      <div className="mt-5 font-mono text-xs sm:text-[15px] tracking-[0.02em] text-ink-subtle flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
        <span>{t('hero.badgePrivacy')}</span>
        <span aria-hidden="true" className="select-none font-bold">
          ·
        </span>
        <span>{t('hero.badgeBrowser')}</span>
        <span aria-hidden="true" className="select-none font-bold">
          ·
        </span>
        <span>{t('hero.badgeNoAccount')}</span>
      </div>

      {/* Interactive Quick-start bar */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2 pt-2 text-xs font-mono">
        <span className="text-ink-subtle">{t('hero.instantPreview')}</span>
        <button
          type="button"
          onClick={async () => {
            scrollToWorkspace(false);
            await loadSampleByName('monthly-sales.csv', 'visualization');
          }}
          className="px-3 py-1 rounded-full border border-line bg-card hover:bg-bg hover:border-outline text-ink transition-colors flex items-center gap-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-accent-orange" />
          <span>{t('hero.sampleSales')}</span>
          <span className="text-[10px] text-ink-subtle font-normal">{t('hero.rowsCount', { count: 96 })}</span>
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
          <span>{t('hero.sampleWeather')}</span>
          <span className="text-[10px] text-ink-subtle font-normal">{t('hero.rowsCount', { count: 180 })}</span>
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
          <span>{t('hero.sampleScores')}</span>
          <span className="text-[10px] text-ink-subtle font-normal">{t('hero.rowsCount', { count: 150 })}</span>
        </button>
      </div>
    </section>
  );
};
