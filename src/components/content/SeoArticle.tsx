import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileSpreadsheet,
  BarChart3,
  TrendingUp,
  PieChart,
  ScatterChart,
  Layers,
  Lock,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

export const SeoArticle: React.FC = () => {
  const { t } = useTranslation();

  return (
    <article
      id="in-depth-guide"
      aria-labelledby="seo-guide-heading"
      className="w-full mt-16 sm:mt-24 pt-12 sm:pt-16 border-t border-line font-mono text-ink text-sm transition-colors"
    >
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Main Header / Intro */}
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-orange/10 border border-accent-orange/30 text-[#F26B21] text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('seoArticle.badge')}</span>
          </div>

          <h2
            id="seo-guide-heading"
            className="font-sans font-extrabold text-2xl sm:text-3xl lg:text-4xl text-ink tracking-tight leading-tight"
          >
            {t('seoArticle.mainTitle')}
          </h2>

          <div className="space-y-4 text-ink-muted text-sm sm:text-base leading-relaxed pt-2">
            <p>{t('seoArticle.introP1')}</p>
            <p>{t('seoArticle.introP2')}</p>
          </div>
        </header>

        {/* Section 1: Workflow Architecture */}
        <section aria-labelledby="workflow-heading" className="space-y-6">
          <div className="space-y-2">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[#F26B21]">
              {t('seoArticle.section1Badge')}
            </span>
            <h3
              id="workflow-heading"
              className="font-sans font-bold text-xl sm:text-2xl text-ink"
            >
              {t('seoArticle.section1Title')}
            </h3>
            <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
              {t('seoArticle.section1P1')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* Stage 1 */}
            <div className="bg-card border border-line rounded-xl p-5 sm:p-6 space-y-3 shadow-sm hover:border-[#F26B21]/40 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-accent-orange/10 flex items-center justify-center text-[#F26B21]">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h4 className="font-sans font-bold text-base text-ink">
                {t('seoArticle.stage1Title')}
              </h4>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                {t('seoArticle.stage1Desc')}
              </p>
            </div>

            {/* Stage 2 */}
            <div className="bg-card border border-line rounded-xl p-5 sm:p-6 space-y-3 shadow-sm hover:border-[#F26B21]/40 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-accent-orange/10 flex items-center justify-center text-[#F26B21]">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="font-sans font-bold text-base text-ink">
                {t('seoArticle.stage2Title')}
              </h4>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                {t('seoArticle.stage2Desc')}
              </p>
            </div>

            {/* Stage 3 */}
            <div className="bg-card border border-line rounded-xl p-5 sm:p-6 space-y-3 shadow-sm hover:border-[#F26B21]/40 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-accent-orange/10 flex items-center justify-center text-[#F26B21]">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h4 className="font-sans font-bold text-base text-ink">
                {t('seoArticle.stage3Title')}
              </h4>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                {t('seoArticle.stage3Desc')}
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Visualization Archetypes */}
        <section aria-labelledby="archetypes-heading" className="space-y-6">
          <div className="space-y-2">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[#F26B21]">
              {t('seoArticle.section2Badge')}
            </span>
            <h3
              id="archetypes-heading"
              className="font-sans font-bold text-xl sm:text-2xl text-ink"
            >
              {t('seoArticle.section2Title')}
            </h3>
            <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
              {t('seoArticle.section2Intro')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Bar Charts */}
            <div className="bg-card border border-line rounded-xl p-6 space-y-3 shadow-sm">
              <div className="flex items-center gap-3 text-ink">
                <BarChart3 className="w-5 h-5 text-[#F26B21]" />
                <h4 className="font-sans font-bold text-base sm:text-lg">
                  {t('seoArticle.chartBarTitle')}
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                {t('seoArticle.chartBarDesc')}
              </p>
            </div>

            {/* Line Charts */}
            <div className="bg-card border border-line rounded-xl p-6 space-y-3 shadow-sm">
              <div className="flex items-center gap-3 text-ink">
                <TrendingUp className="w-5 h-5 text-[#F26B21]" />
                <h4 className="font-sans font-bold text-base sm:text-lg">
                  {t('seoArticle.chartLineTitle')}
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                {t('seoArticle.chartLineDesc')}
              </p>
            </div>

            {/* Scatter Plots */}
            <div className="bg-card border border-line rounded-xl p-6 space-y-3 shadow-sm">
              <div className="flex items-center gap-3 text-ink">
                <ScatterChart className="w-5 h-5 text-[#F26B21]" />
                <h4 className="font-sans font-bold text-base sm:text-lg">
                  {t('seoArticle.chartScatterTitle')}
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                {t('seoArticle.chartScatterDesc')}
              </p>
            </div>

            {/* Pie Charts */}
            <div className="bg-card border border-line rounded-xl p-6 space-y-3 shadow-sm">
              <div className="flex items-center gap-3 text-ink">
                <PieChart className="w-5 h-5 text-[#F26B21]" />
                <h4 className="font-sans font-bold text-base sm:text-lg">
                  {t('seoArticle.chartPieTitle')}
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                {t('seoArticle.chartPieDesc')}
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Privacy & Security */}
        <section
          aria-labelledby="privacy-heading"
          className="rounded-2xl bg-card border border-line p-6 sm:p-8 lg:p-10 space-y-4 shadow-sm"
        >
          <div className="flex items-center gap-2 text-success font-semibold text-xs tracking-wider uppercase">
            <Lock className="w-4 h-4" />
            <span>{t('seoArticle.section3Badge')}</span>
          </div>

          <h3
            id="privacy-heading"
            className="font-sans font-bold text-xl sm:text-2xl text-ink"
          >
            {t('seoArticle.section3Title')}
          </h3>

          <div className="space-y-3 text-xs sm:text-sm text-ink-muted leading-relaxed">
            <p>{t('seoArticle.section3P1')}</p>
            <p>{t('seoArticle.section3P2')}</p>
          </div>
        </section>

        {/* Section 4: Comparison Table */}
        <section aria-labelledby="comparison-heading" className="space-y-6">
          <div className="space-y-2">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[#F26B21]">
              {t('seoArticle.section4Badge')}
            </span>
            <h3
              id="comparison-heading"
              className="font-sans font-bold text-xl sm:text-2xl text-ink"
            >
              {t('seoArticle.section4Title')}
            </h3>
          </div>

          <div className="overflow-x-auto rounded-xl border border-line shadow-sm">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-card/70 border-b border-line">
                  <th className="py-3.5 px-4 sm:px-5 font-bold text-ink">
                    {t('seoArticle.tableColFeature')}
                  </th>
                  <th className="py-3.5 px-4 sm:px-5 font-bold text-[#F26B21] bg-accent-orange/5">
                    {t('seoArticle.tableColIqplotter')}
                  </th>
                  <th className="py-3.5 px-4 sm:px-5 font-bold text-ink-muted">
                    {t('seoArticle.tableColSpreadsheets')}
                  </th>
                  <th className="py-3.5 px-4 sm:px-5 font-bold text-ink-muted">
                    {t('seoArticle.tableColCloud')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                <tr className="hover:bg-card/40 transition-colors">
                  <td className="py-3 px-4 sm:px-5 font-semibold text-ink">
                    {t('seoArticle.tableRow1Feature')}
                  </td>
                  <td className="py-3 px-4 sm:px-5 text-[#F26B21] font-medium bg-accent-orange/5">
                    {t('seoArticle.tableRow1Iqplotter')}
                  </td>
                  <td className="py-3 px-4 sm:px-5 text-ink-muted">
                    {t('seoArticle.tableRow1Spreadsheets')}
                  </td>
                  <td className="py-3 px-4 sm:px-5 text-ink-muted">
                    {t('seoArticle.tableRow1Cloud')}
                  </td>
                </tr>
                <tr className="hover:bg-card/40 transition-colors">
                  <td className="py-3 px-4 sm:px-5 font-semibold text-ink">
                    {t('seoArticle.tableRow2Feature')}
                  </td>
                  <td className="py-3 px-4 sm:px-5 text-[#F26B21] font-medium bg-accent-orange/5">
                    {t('seoArticle.tableRow2Iqplotter')}
                  </td>
                  <td className="py-3 px-4 sm:px-5 text-ink-muted">
                    {t('seoArticle.tableRow2Spreadsheets')}
                  </td>
                  <td className="py-3 px-4 sm:px-5 text-ink-muted">
                    {t('seoArticle.tableRow2Cloud')}
                  </td>
                </tr>
                <tr className="hover:bg-card/40 transition-colors">
                  <td className="py-3 px-4 sm:px-5 font-semibold text-ink">
                    {t('seoArticle.tableRow3Feature')}
                  </td>
                  <td className="py-3 px-4 sm:px-5 text-[#F26B21] font-medium bg-accent-orange/5">
                    {t('seoArticle.tableRow3Iqplotter')}
                  </td>
                  <td className="py-3 px-4 sm:px-5 text-ink-muted">
                    {t('seoArticle.tableRow3Spreadsheets')}
                  </td>
                  <td className="py-3 px-4 sm:px-5 text-ink-muted">
                    {t('seoArticle.tableRow3Cloud')}
                  </td>
                </tr>
                <tr className="hover:bg-card/40 transition-colors">
                  <td className="py-3 px-4 sm:px-5 font-semibold text-ink">
                    {t('seoArticle.tableRow4Feature')}
                  </td>
                  <td className="py-3 px-4 sm:px-5 text-[#F26B21] font-medium bg-accent-orange/5">
                    {t('seoArticle.tableRow4Iqplotter')}
                  </td>
                  <td className="py-3 px-4 sm:px-5 text-ink-muted">
                    {t('seoArticle.tableRow4Spreadsheets')}
                  </td>
                  <td className="py-3 px-4 sm:px-5 text-ink-muted">
                    {t('seoArticle.tableRow4Cloud')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 5: Technical FAQ */}
        <section aria-labelledby="faq-heading" className="space-y-6">
          <div className="space-y-2">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[#F26B21]">
              {t('seoArticle.section5Badge')}
            </span>
            <h3
              id="faq-heading"
              className="font-sans font-bold text-xl sm:text-2xl text-ink"
            >
              {t('seoArticle.section5Title')}
            </h3>
          </div>

          <div className="space-y-4">
            {/* FAQ 1 */}
            <div className="bg-card border border-line rounded-xl p-5 sm:p-6 space-y-2">
              <h4 className="font-sans font-bold text-base text-ink flex items-start gap-2.5">
                <HelpCircle className="w-5 h-5 text-[#F26B21] shrink-0 mt-0.5" />
                <span>{t('seoArticle.faq1Q')}</span>
              </h4>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed pl-7">
                {t('seoArticle.faq1A')}
              </p>
            </div>

            {/* FAQ 2 */}
            <div className="bg-card border border-line rounded-xl p-5 sm:p-6 space-y-2">
              <h4 className="font-sans font-bold text-base text-ink flex items-start gap-2.5">
                <HelpCircle className="w-5 h-5 text-[#F26B21] shrink-0 mt-0.5" />
                <span>{t('seoArticle.faq2Q')}</span>
              </h4>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed pl-7">
                {t('seoArticle.faq2A')}
              </p>
            </div>

            {/* FAQ 3 */}
            <div className="bg-card border border-line rounded-xl p-5 sm:p-6 space-y-2">
              <h4 className="font-sans font-bold text-base text-ink flex items-start gap-2.5">
                <HelpCircle className="w-5 h-5 text-[#F26B21] shrink-0 mt-0.5" />
                <span>{t('seoArticle.faq3Q')}</span>
              </h4>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed pl-7">
                {t('seoArticle.faq3A')}
              </p>
            </div>

            {/* FAQ 4 */}
            <div className="bg-card border border-line rounded-xl p-5 sm:p-6 space-y-2">
              <h4 className="font-sans font-bold text-base text-ink flex items-start gap-2.5">
                <HelpCircle className="w-5 h-5 text-[#F26B21] shrink-0 mt-0.5" />
                <span>{t('seoArticle.faq4Q')}</span>
              </h4>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed pl-7">
                {t('seoArticle.faq4A')}
              </p>
            </div>

            {/* FAQ 5 */}
            <div className="bg-card border border-line rounded-xl p-5 sm:p-6 space-y-2">
              <h4 className="font-sans font-bold text-base text-ink flex items-start gap-2.5">
                <HelpCircle className="w-5 h-5 text-[#F26B21] shrink-0 mt-0.5" />
                <span>{t('seoArticle.faq5Q')}</span>
              </h4>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed pl-7">
                {t('seoArticle.faq5A')}
              </p>
            </div>
          </div>
        </section>
      </div>
    </article>
  );
};
