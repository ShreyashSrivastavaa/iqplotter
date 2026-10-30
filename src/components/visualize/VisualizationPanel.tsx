import React, { useMemo, useRef, useState } from 'react';
import {
  BarChart3,
  LineChart as LineIcon,
  ScatterChart as ScatterIcon,
  PieChart as PieIcon,
  Sliders,
  ChevronDown,
  ChevronUp,
  Database,
  Sparkles,
  ArrowUpDown,
  Grid,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../state/store';
import { buildSeries } from '../../lib/chart/buildSeries';
import { PALETTES } from '../../lib/chart/types';
import { Aggregation, ChartType, PaletteId } from '../../state/types';
import { ChartCanvas } from './ChartCanvas';
import { ExportMenu } from './ExportMenu';
import { SharePopover } from './SharePopover';
import { Button } from '../ui/Button';
import { useTranslation } from 'react-i18next';

export const VisualizationPanel: React.FC = () => {
  const { t } = useTranslation();
  const { state, dispatch, loadSampleByName } = useApp();
  const exportFrameRef = useRef<HTMLDivElement>(null);
  const [customizeOpen, setCustomizeOpen] = useState(false);

  // If no dataset loaded
  if (!state.dataset || !state.config) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-full bg-bg border border-line flex items-center justify-center text-ink-subtle mx-auto mb-4">
          <Database className="w-6 h-6" />
        </div>
        <h3 className="font-mono font-bold text-lg text-ink mb-2">{t('visualize.emptyTitle')}</h3>
        <p className="font-mono text-sm text-ink-muted mb-6">
          {t('visualize.emptyDesc')}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', tab: 'ingestion' })}
          >
            {t('visualize.uploadButton')}
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => loadSampleByName('monthly-sales.csv')}
          >
            {t('visualize.useSample')}
          </Button>
        </div>
      </div>
    );
  }

  const { dataset, config } = state;

  // Memoize buildSeries for performance
  const chartResult = useMemo(() => {
    return buildSeries(dataset, config);
  }, [dataset, config]);

  // Check if X has duplicate values (to enable aggregation selector)
  const hasDuplicateX = useMemo(() => {
    if (!config.xKey) return false;
    const seen = new Set<string>();
    for (const r of dataset.rows) {
      const v = String(r[config.xKey] ?? '');
      if (seen.has(v)) return true;
      seen.add(v);
    }
    return false;
  }, [dataset.rows, config.xKey]);

  const numericColumns = dataset.columns.filter((c) => c.type === 'number');
  const dateColumns = dataset.columns.filter((c) => c.type === 'date');
  const categoryColumns = dataset.columns.filter((c) => c.type === 'category' || c.type === 'text');

  // Smart Recommendations (One-click presets)
  const smartRecommendations = useMemo(() => {
    const recs: { label: string; icon: React.ComponentType<{ className?: string }>; config: Partial<typeof config> }[] = [];
    const firstNum = numericColumns[0];
    const secondNum = numericColumns[1];
    const firstDate = dateColumns[0];
    const firstCat = categoryColumns[0];

    if (firstDate && firstNum) {
      recs.push({
        label: `Line: ${firstNum.label} over ${firstDate.label}`,
        icon: LineIcon,
        config: {
          type: 'line',
          xKey: firstDate.key,
          yKeys: [firstNum.key],
          xLabel: firstDate.label,
          yLabel: firstNum.label,
          title: `${firstNum.label} Trend`,
        },
      });
    }

    if (firstCat && firstNum) {
      recs.push({
        label: `Bar: ${firstNum.label} by ${firstCat.label}`,
        icon: BarChart3,
        config: {
          type: 'bar',
          xKey: firstCat.key,
          yKeys: [firstNum.key],
          xLabel: firstCat.label,
          yLabel: firstNum.label,
          title: `${firstNum.label} by ${firstCat.label}`,
        },
      });
    }

    if (firstNum && secondNum) {
      recs.push({
        label: `Scatter: ${secondNum.label} vs ${firstNum.label}`,
        icon: ScatterIcon,
        config: {
          type: 'scatter',
          xKey: firstNum.key,
          yKeys: [secondNum.key],
          xLabel: firstNum.label,
          yLabel: secondNum.label,
          title: `${secondNum.label} vs ${firstNum.label}`,
        },
      });
    }

    if (firstCat && firstNum && firstCat.uniqueCount <= 8) {
      recs.push({
        label: `Pie: ${firstNum.label} by ${firstCat.label}`,
        icon: PieIcon,
        config: {
          type: 'pie',
          xKey: firstCat.key,
          yKeys: [firstNum.key],
          title: `${firstNum.label} Share`,
        },
      });
    }

    return recs;
  }, [numericColumns, dateColumns, categoryColumns, config]);

  const handleTypeSelect = (type: ChartType) => {
    // If switching to pie, clamp yKeys to 1
    const yKeys = type === 'pie' ? config.yKeys.slice(0, 1) : config.yKeys;
    dispatch({ type: 'SET_CONFIG', config: { type, yKeys } });
  };

  const handleYToggle = (key: string) => {
    if (config.type === 'pie') {
      dispatch({ type: 'SET_CONFIG', config: { yKeys: [key] } });
      return;
    }
    let updated: string[];
    if (config.yKeys.includes(key)) {
      if (config.yKeys.length === 1) return; // keep at least 1
      updated = config.yKeys.filter((k) => k !== key);
    } else {
      updated = [...config.yKeys, key];
    }
    dispatch({ type: 'SET_CONFIG', config: { yKeys: updated } });
  };

  return (
    <div className="w-full space-y-6">
      {/* Quick Insights Bar */}
      {smartRecommendations.length > 0 && (
        <div className="p-3 rounded-2xl bg-bg border border-line flex flex-wrap items-center gap-2 font-mono text-xs">
          <span className="flex items-center gap-1.5 text-accent-orange font-semibold pl-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Quick Insights:</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {smartRecommendations.map((rec, i) => {
              const Icon = rec.icon;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => dispatch({ type: 'SET_CONFIG', config: rec.config })}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-card hover:bg-line border border-line text-ink transition-all hover:scale-105 active:scale-95 shadow-2xs"
                >
                  <Icon className="w-3 h-3 text-accent-orange" />
                  <span>{rec.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="w-full flex flex-col lg:flex-row gap-6 sm:gap-8 items-start">
        {/* Left Control Column (approx 320px on desktop) */}
        <div className="w-full lg:w-[320px] shrink-0 bg-card border border-line rounded-2xl p-4 sm:p-5 space-y-5 font-mono text-xs shadow-xs">
          {/* Chart Type Segmented Control */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-ink-subtle font-semibold mb-2">
              Chart Type
            </label>
            <div className="grid grid-cols-4 gap-1 p-1 bg-bg rounded-xl border border-line">
              {(
                [
                  { type: 'bar', label: 'Bar', icon: BarChart3 },
                  { type: 'line', label: 'Line', icon: LineIcon },
                  { type: 'scatter', label: 'Scatter', icon: ScatterIcon },
                  { type: 'pie', label: 'Pie', icon: PieIcon },
                ] as const
              ).map((item) => {
                const Icon = item.icon;
                const isSelected = config.type === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => handleTypeSelect(item.type)}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-all ${
                      isSelected
                        ? 'bg-ink text-bg shadow-sm font-semibold'
                        : 'text-ink-muted hover:text-ink hover:bg-card'
                    }`}
                    title={`${item.label} chart`}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    <span className="text-[11px]">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* X-Axis Selector */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-ink-subtle font-semibold mb-1.5">
              X Axis (Categories / Dates)
            </label>
            <select
              value={config.xKey || ''}
              onChange={(e) => {
                const xKey = e.target.value;
                const col = dataset.columns.find((c) => c.key === xKey);
                const title = config.yKeys[0] ? `${config.yKeys[0]} by ${col?.label || xKey}` : config.title;
                dispatch({
                  type: 'SET_CONFIG',
                  config: {
                    xKey,
                    xLabel: col?.label || xKey,
                    title,
                  },
                });
              }}
              className="w-full bg-bg border border-line text-ink rounded-xl px-3 py-2 text-xs outline-none focus:border-ink"
            >
              {dataset.columns.map((col) => (
                <option key={col.key} value={col.key}>
                  {col.label} ({col.type})
                </option>
              ))}
            </select>
          </div>

          {/* Y-Axis Column Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] uppercase tracking-wider text-ink-subtle font-semibold">
                Y Axis {config.type === 'pie' ? '(Single value)' : '(Metrics)'}
              </label>
              <span className="text-[10px] text-ink-subtle">
                {config.yKeys.length} selected
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1.5 border border-line rounded-xl bg-bg">
              {numericColumns.map((col) => {
                const isSelected = config.yKeys.includes(col.key);
                return (
                  <button
                    key={col.key}
                    type="button"
                    onClick={() => handleYToggle(col.key)}
                    className={`px-2.5 py-1 rounded-full text-xs transition-colors border ${
                      isSelected
                        ? 'bg-ink text-bg border-ink font-semibold'
                        : 'bg-card text-ink-muted border-line hover:border-outline'
                    }`}
                  >
                    {col.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Aggregation Select (Enabled when X has repeated values) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] uppercase tracking-wider text-ink-subtle font-semibold">
                Aggregation
              </label>
              {!hasDuplicateX && (
                <span className="text-[10px] text-ink-subtle">X values unique</span>
              )}
            </div>
            <select
              value={config.aggregation}
              disabled={!hasDuplicateX}
              onChange={(e) =>
                dispatch({
                  type: 'SET_CONFIG',
                  config: { aggregation: e.target.value as Aggregation },
                })
              }
              className={`w-full bg-bg border border-line text-ink rounded-xl px-3 py-2 text-xs outline-none ${
                !hasDuplicateX ? 'opacity-50 cursor-not-allowed' : 'focus:border-ink'
              }`}
            >
              <option value="sum">Sum</option>
              <option value="mean">Average / Mean</option>
              <option value="count">Count of rows</option>
            </select>
          </div>

          {/* Collapsible "Customize" Group */}
          <div className="border-t border-line pt-4">
            <button
              type="button"
              onClick={() => setCustomizeOpen(!customizeOpen)}
              className="w-full flex items-center justify-between text-ink font-semibold py-1 hover:text-ink-muted transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-accent-orange" />
                <span>Customize Chart</span>
              </span>
              {customizeOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {customizeOpen && (
              <div className="mt-3 space-y-3.5 pt-2">
                <div>
                  <label className="block text-[10px] text-ink-subtle uppercase mb-1">Chart Title</label>
                  <input
                    type="text"
                    value={config.title}
                    onChange={(e) => dispatch({ type: 'SET_CONFIG', config: { title: e.target.value } })}
                    className="w-full bg-bg border border-line text-ink rounded-xl px-3 py-1.5 text-xs outline-none focus:border-ink"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-ink-subtle uppercase mb-1">X Label</label>
                    <input
                      type="text"
                      value={config.xLabel}
                      onChange={(e) => dispatch({ type: 'SET_CONFIG', config: { xLabel: e.target.value } })}
                      className="w-full bg-bg border border-line text-ink rounded-xl px-3 py-1.5 text-xs outline-none focus:border-ink"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-ink-subtle uppercase mb-1">Y Label</label>
                    <input
                      type="text"
                      value={config.yLabel}
                      onChange={(e) => dispatch({ type: 'SET_CONFIG', config: { yLabel: e.target.value } })}
                      className="w-full bg-bg border border-line text-ink rounded-xl px-3 py-1.5 text-xs outline-none focus:border-ink"
                    />
                  </div>
                </div>

                {/* Color Palettes (5 options) */}
                <div>
                  <label className="block text-[10px] text-ink-subtle uppercase mb-1.5">Color Palette</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(Object.keys(PALETTES) as PaletteId[]).map((pid) => {
                      const p = PALETTES[pid];
                      const isSelected = config.palette === pid;
                      return (
                        <button
                          key={pid}
                          type="button"
                          onClick={() => dispatch({ type: 'SET_CONFIG', config: { palette: pid } })}
                          className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                            isSelected
                              ? 'border-ink bg-bg shadow-sm ring-1 ring-ink'
                              : 'border-line bg-card hover:border-outline'
                          }`}
                        >
                          <span className="text-[10px] font-semibold text-ink">{p.name}</span>
                          <div className="flex gap-0.5">
                            {p.colors.slice(0, 4).map((c, i) => (
                              <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Interactive Gridlines toggle */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-ink flex items-center gap-1.5">
                    <Grid className="w-3.5 h-3.5 text-ink-subtle" />
                    <span>Gridlines</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={config.showGrid !== false}
                    onChange={(e) => dispatch({ type: 'SET_CONFIG', config: { showGrid: e.target.checked } })}
                    className="rounded border-outline text-ink focus:ring-0 cursor-pointer"
                  />
                </div>

                {/* Line specific options */}
                {config.type === 'line' && (
                  <div className="space-y-2 pt-1 border-t border-line">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-ink">Curve Style</span>
                      <select
                        value={config.curveType || 'monotone'}
                        onChange={(e) =>
                          dispatch({
                            type: 'SET_CONFIG',
                            config: { curveType: e.target.value as 'monotone' | 'linear' },
                          })
                        }
                        className="bg-bg border border-line text-ink rounded-lg px-2 py-1 text-[11px] outline-none"
                      >
                        <option value="monotone">Smooth Curve</option>
                        <option value="linear">Straight Angles</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-ink">Data Points (Dots)</span>
                      <input
                        type="checkbox"
                        checked={config.showDots !== undefined ? config.showDots : chartResult.meta.hasDots}
                        onChange={(e) => dispatch({ type: 'SET_CONFIG', config: { showDots: e.target.checked } })}
                        className="rounded border-outline text-ink focus:ring-0 cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* Bar specific options */}
                {config.type === 'bar' && (
                  <div className="space-y-2 pt-1 border-t border-line">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-ink flex items-center gap-1">
                        <ArrowUpDown className="w-3 h-3 text-ink-subtle" />
                        <span>Sort Order</span>
                      </span>
                      <select
                        value={config.sortOrder || 'default'}
                        onChange={(e) =>
                          dispatch({
                            type: 'SET_CONFIG',
                            config: { sortOrder: e.target.value as 'default' | 'desc' | 'asc' },
                          })
                        }
                        className="bg-bg border border-line text-ink rounded-lg px-2 py-1 text-[11px] outline-none"
                      >
                        <option value="default">Default Order</option>
                        <option value="desc">Highest First</option>
                        <option value="asc">Lowest First</option>
                      </select>
                    </div>

                    {chartResult.meta.truncatedCategories && (
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="top30-toggle"
                          checked={Boolean(config.top30ByValue)}
                          onChange={(e) =>
                            dispatch({
                              type: 'SET_CONFIG',
                              config: { top30ByValue: e.target.checked },
                            })
                          }
                          className="rounded border-outline text-ink focus:ring-0 cursor-pointer"
                        />
                        <label htmlFor="top30-toggle" className="text-xs text-ink cursor-pointer">
                          Sort top 30 by value
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Chart Area & Action Row */}
        <div className="flex-1 w-full space-y-4">
          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-mono text-ink-subtle">
              {t('visualize.totalPoints', { count: chartResult.meta.totalPoints.toLocaleString() })}
            </span>
            <div className="flex items-center gap-2.5">
              <SharePopover containerRef={exportFrameRef} />
              <ExportMenu containerRef={exportFrameRef} title={config.title} />
            </div>
          </div>

          {/* Responsive Chart Canvas */}
          <ChartCanvas
            result={chartResult}
            config={config}
            exportFrameRef={exportFrameRef}
            onTitleChange={(title) => dispatch({ type: 'SET_CONFIG', config: { title } })}
          />
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-6 mt-6 border-t border-line">
        <Button
          variant="outline"
          size="md"
          onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', tab: 'inspection' })}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('visualize.backInspection')}</span>
        </Button>

        <Button
          variant="outline"
          size="md"
          onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', tab: 'ingestion' })}
          className="gap-2"
        >
          <span>{t('visualize.loadNewFile')}</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
