import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Maximize2, Minimize2, Edit2 } from 'lucide-react';
import { BuiltChartResult } from '../../lib/chart/types';
import { PALETTES } from '../../lib/chart/types';
import { ChartConfig } from '../../state/types';
import { ChartProblemCard } from './ChartProblemCard';
import { ErrorBoundary } from '../ui/Spinner';
import { useApp } from '../../state/store';

interface ChartCanvasProps {
  result: BuiltChartResult;
  config: ChartConfig;
  exportFrameRef: React.RefObject<HTMLDivElement>;
  onTitleChange: (newTitle: string) => void;
}

export const ChartCanvas: React.FC<ChartCanvasProps> = ({
  result,
  config,
  exportFrameRef,
  onTitleChange,
}) => {
  const { state } = useApp();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(config.title);
  const [isFullscreen, setIsFullscreen] = useState(false);

  React.useEffect(() => {
    setTitleInput(config.title);
  }, [config.title]);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleInput.trim()) {
      onTitleChange(titleInput.trim());
    }
  };

  if (result.problem) {
    return <ChartProblemCard problem={result.problem} />;
  }

  const { data, meta } = result;
  const palette = PALETTES[config.palette] || PALETTES.classic;
  const colors = palette.colors;

  // Format compact numbers (>= 10,000 -> 10k, 1M etc.)
  const formatYTick = (val: number | string) => {
    const num = Number(val);
    if (!Number.isFinite(num)) return String(val);
    if (Math.abs(num) >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(1)}M`;
    }
    if (Math.abs(num) >= 10_000) {
      return `${(num / 1_000).toFixed(0)}k`;
    }
    return num.toLocaleString();
  };

  // Determine if X axis labels should rotate
  const shouldRotateX = data.length > 12 || data.some((d) => String(d.x).length > 8);

  const formatXTick = (val: string | number) => {
    const str = String(val);
    if (str.length > 14) {
      return `${str.slice(0, 13)}…`;
    }
    return str;
  };

  // Theme-aware colors
  const isDark = state.isDark;
  const axisColor = isDark ? '#A8A29E' : '#5C574D';
  const gridColor = isDark ? '#292524' : '#ECE6CE';
  const tooltipBg = isDark ? '#201E1A' : '#FFFFFF';
  const tooltipBorder = isDark ? '#3D3933' : '#E9E4D2';
  const tooltipText = isDark ? '#F7F5EC' : '#1A1714';
  const showGrid = config.showGrid !== false;
  const showDots = config.showDots !== undefined ? config.showDots : meta.hasDots;
  const curveType = config.curveType || 'monotone';
  const barRadius = config.barRadius !== undefined ? config.barRadius : 4;

  // Accessibility screen-reader summary
  const a11ySummary = `${config.type.toUpperCase()} chart of ${config.yKeys.join(', ')} by ${
    config.xKey || 'X'
  }, containing ${meta.totalPoints} points.`;

  const renderChart = (height: number | string) => (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {config.type === 'bar' ? (
          <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: shouldRotateX ? 35 : 10 }}>
            {showGrid && <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />}
            <XAxis
              dataKey="x"
              tickFormatter={formatXTick}
              angle={shouldRotateX ? -35 : 0}
              textAnchor={shouldRotateX ? 'end' : 'middle'}
              interval={0}
              stroke={axisColor}
              tick={{ fill: axisColor, fontSize: 12, fontFamily: 'IBM Plex Mono' }}
              height={shouldRotateX ? 55 : 30}
            />
            <YAxis
              tickFormatter={formatYTick}
              stroke={axisColor}
              tick={{ fill: axisColor, fontSize: 12, fontFamily: 'IBM Plex Mono' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: tooltipBg,
                borderRadius: '10px',
                border: `1px solid ${tooltipBorder}`,
                color: tooltipText,
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                fontFamily: 'IBM Plex Mono',
                fontSize: '12px',
              }}
            />
            {meta.seriesKeys.length >= 2 && (
              <Legend wrapperStyle={{ fontFamily: 'IBM Plex Mono', fontSize: '12px', paddingTop: '10px', color: axisColor }} />
            )}
            {meta.seriesKeys.map((k, idx) => (
              <Bar
                key={k}
                dataKey={k}
                fill={colors[idx % colors.length]}
                radius={[barRadius, barRadius, 0, 0]}
              />
            ))}
          </BarChart>
        ) : config.type === 'line' ? (
          <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: shouldRotateX ? 35 : 10 }}>
            {showGrid && <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />}
            <XAxis
              dataKey="x"
              tickFormatter={formatXTick}
              angle={shouldRotateX ? -35 : 0}
              textAnchor={shouldRotateX ? 'end' : 'middle'}
              stroke={axisColor}
              tick={{ fill: axisColor, fontSize: 12, fontFamily: 'IBM Plex Mono' }}
              height={shouldRotateX ? 55 : 30}
            />
            <YAxis
              tickFormatter={formatYTick}
              stroke={axisColor}
              tick={{ fill: axisColor, fontSize: 12, fontFamily: 'IBM Plex Mono' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: tooltipBg,
                borderRadius: '10px',
                border: `1px solid ${tooltipBorder}`,
                color: tooltipText,
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                fontFamily: 'IBM Plex Mono',
                fontSize: '12px',
              }}
            />
            {meta.seriesKeys.length >= 2 && (
              <Legend wrapperStyle={{ fontFamily: 'IBM Plex Mono', fontSize: '12px', paddingTop: '10px', color: axisColor }} />
            )}
            {meta.seriesKeys.map((k, idx) => (
              <Line
                key={k}
                type={curveType}
                dataKey={k}
                stroke={colors[idx % colors.length]}
                strokeWidth={2.5}
                connectNulls={false}
                dot={showDots ? { r: 3, fill: colors[idx % colors.length] } : false}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        ) : config.type === 'scatter' ? (
          <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
            {showGrid && <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />}
            <XAxis
              dataKey="x"
              type="number"
              stroke={axisColor}
              tick={{ fill: axisColor, fontSize: 12, fontFamily: 'IBM Plex Mono' }}
              tickFormatter={(v) => (meta.isDateX ? new Date(v).toISOString().slice(0, 10) : formatYTick(v))}
            />
            <YAxis
              dataKey={meta.seriesKeys[0]}
              type="number"
              stroke={axisColor}
              tickFormatter={formatYTick}
              tick={{ fill: axisColor, fontSize: 12, fontFamily: 'IBM Plex Mono' }}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{
                backgroundColor: tooltipBg,
                borderRadius: '10px',
                border: `1px solid ${tooltipBorder}`,
                color: tooltipText,
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                fontFamily: 'IBM Plex Mono',
                fontSize: '12px',
              }}
            />
            {meta.seriesKeys.length >= 2 && (
              <Legend wrapperStyle={{ fontFamily: 'IBM Plex Mono', fontSize: '12px', color: axisColor }} />
            )}
            {meta.seriesKeys.map((k, idx) => {
              const shapes: ('circle' | 'cross' | 'diamond' | 'square' | 'triangle')[] = [
                'circle',
                'triangle',
                'square',
                'diamond',
                'cross',
              ];
              const shape = shapes[idx % shapes.length];
              return (
                <Scatter
                  key={k}
                  name={k}
                  data={data}
                  fill={colors[idx % colors.length]}
                  shape={shape}
                />
              );
            })}
          </ScatterChart>
        ) : (
          /* Pie Chart */
          <PieChart>
            <Tooltip
              formatter={(val, name, item) => [
                `${Number(val).toLocaleString()} (${Number(
                  (item.payload as { percent?: number }).percent || 0
                ).toFixed(1)}%)`,
                name,
              ]}
              contentStyle={{
                backgroundColor: tooltipBg,
                borderRadius: '10px',
                border: `1px solid ${tooltipBorder}`,
                color: tooltipText,
                fontFamily: 'IBM Plex Mono',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontFamily: 'IBM Plex Mono', fontSize: '12px', color: axisColor }} />
            <Pie
              data={data}
              dataKey={meta.seriesKeys[0] || 'value'}
              nameKey="x"
              cx="50%"
              cy="50%"
              outerRadius="75%"
              label={({ percent }) => (percent >= 0.04 ? `${(percent * 100).toFixed(0)}%` : '')}
              labelLine={false}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
          </PieChart>
        )}
      </ResponsiveContainer>
    </div>
  );

  return (
    <ErrorBoundary>
      <div className="w-full flex flex-col">
        {/* Visually hidden screen reader summary */}
        <span className="sr-only" aria-live="polite">
          {a11ySummary}
        </span>

        {/* Export frame container: white background for export, dark/light aware for screen */}
        <div
          ref={exportFrameRef}
          className="w-full bg-white dark:bg-card rounded-2xl p-4 sm:p-6 border border-line shadow-innerCard transition-colors relative"
        >
          {/* Header row: Editable Title + Expand button */}
          <div className="mb-4 flex items-center justify-between gap-2">
            {isEditingTitle ? (
              <input
                type="text"
                value={titleInput}
                autoFocus
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleSubmit();
                  if (e.key === 'Escape') {
                    setTitleInput(config.title);
                    setIsEditingTitle(false);
                  }
                }}
                className="w-full font-sans font-bold text-lg sm:text-xl text-ink bg-bg border border-line rounded-lg px-2 py-1 outline-none font-mono"
              />
            ) : (
              <div className="flex items-center gap-2 group">
                <h3
                  onClick={() => setIsEditingTitle(true)}
                  title="Click to edit title"
                  className="font-sans font-bold text-lg sm:text-xl text-ink cursor-pointer hover:bg-bg rounded px-1.5 py-0.5 inline-block transition-colors"
                >
                  {config.title || 'Untitled Chart'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditingTitle(true)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-ink-subtle hover:text-ink transition-opacity"
                  title="Edit title"
                  aria-label="Edit title"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="p-1.5 rounded-lg border border-line hover:bg-bg text-ink-muted hover:text-ink transition-colors flex items-center gap-1 text-xs font-mono"
              title="Expand to fullscreen view"
              aria-label="Expand chart to fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Expand</span>
            </button>
          </div>

          {/* Chart Canvas */}
          {renderChart('320px')}
        </div>

        {/* Fullscreen Interactive Modal */}
        {isFullscreen && (
          <div
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md p-4 sm:p-8 flex flex-col justify-between animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-label="Fullscreen Chart"
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/20">
              <h2 className="font-sans font-bold text-xl sm:text-2xl text-white">
                {config.title || 'Untitled Chart'}
              </h2>
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-mono text-xs transition-colors"
              >
                <Minimize2 className="w-4 h-4" />
                <span>Exit Fullscreen</span>
              </button>
            </div>

            <div className="flex-1 w-full my-6 flex items-center justify-center">
              <div className="w-full h-full max-h-[80vh] bg-card/90 rounded-2xl p-6 border border-line shadow-2xl">
                {renderChart('100%')}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-white/70">
              <span>Press Escape to close</span>
              <span>{meta.totalPoints.toLocaleString()} data points</span>
            </div>
          </div>
        )}

        {/* Captions and Notes */}
        {meta.notes.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-mono text-ink-subtle">
            {meta.notes.map((n, i) => (
              <span key={i} className="bg-bg px-2.5 py-1 rounded-full border border-line">
                ℹ {n}
              </span>
            ))}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};
