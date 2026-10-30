import { ChartConfig, Dataset } from '../../state/types';
import { downsampleLTTB } from './lttb';
import { BuiltChartResult, ChartDataPoint, ChartSeriesMeta } from './types';

export function buildSeries(dataset: Dataset | null, config: ChartConfig | null): BuiltChartResult {
  const emptyMeta: ChartSeriesMeta = {
    seriesKeys: [],
    notes: [],
    totalPoints: 0,
    hasDots: false,
  };

  if (!dataset || dataset.rows.length === 0) {
    return {
      problem: {
        code: 'EMPTY_SERIES',
        message: 'No data available in this dataset.',
      },
      data: [],
      meta: emptyMeta,
    };
  }

  if (!config || !config.xKey) {
    const firstCol = dataset.columns[0];
    return {
      problem: {
        code: 'NO_X',
        message: 'Please choose an X-axis column to plot.',
        suggestion: firstCol ? { label: `Use ${firstCol.label}`, action: { xKey: firstCol.key } } : undefined,
      },
      data: [],
      meta: emptyMeta,
    };
  }

  if (config.yKeys.length === 0) {
    const numCol = dataset.columns.find((c) => c.type === 'number');
    return {
      problem: {
        code: 'NO_Y',
        message: 'Please select at least one numeric Y-axis column.',
        suggestion: numCol ? { label: `Use ${numCol.label}`, action: { yKeys: [numCol.key] } } : undefined,
      },
      data: [],
      meta: emptyMeta,
    };
  }

  const xCol = dataset.columns.find((c) => c.key === config.xKey);
  const isDateX = xCol?.type === 'date';
  const isNumericX = xCol?.type === 'number';

  // Check Scatter specific constraints
  if (config.type === 'scatter') {
    if (!isNumericX && !isDateX) {
      const numCol = dataset.columns.find((c) => c.type === 'number');
      return {
        problem: {
          code: 'NON_NUMERIC_X',
          message: `Scatter plots require a numeric or date X-axis. "${xCol?.label || config.xKey}" is ${xCol?.type || 'non-numeric'}.`,
          suggestion: numCol
            ? { label: `Switch X to ${numCol.label}`, action: { xKey: numCol.key } }
            : { label: 'Switch to Bar chart', action: { type: 'bar' } },
        },
        data: [],
        meta: emptyMeta,
      };
    }
  }

  // Check Pie specific constraints: exactly one Y
  const yKeys = config.type === 'pie' ? config.yKeys.slice(0, 1) : config.yKeys;
  const notes: string[] = [];
  let maxY = 0;

  // 1. BAR CHART
  if (config.type === 'bar') {
    // Aggregate by X: Map<X_string, { count: number, sums: Record<yKey, number> }>
    const groups = new Map<string, { x: string; count: number; sums: Record<string, number> }>();

    for (const row of dataset.rows) {
      const rawX = row[config.xKey];
      if (rawX === null || rawX === undefined) continue;
      const xStr = String(rawX);

      let group = groups.get(xStr);
      if (!group) {
        group = { x: xStr, count: 0, sums: {} };
        yKeys.forEach((y) => (group!.sums[y] = 0));
        groups.set(xStr, group);
      }
      group.count++;

      for (const y of yKeys) {
        const val = row[y];
        if (typeof val === 'number' && Number.isFinite(val)) {
          group.sums[y] = (group.sums[y] || 0) + val;
        }
      }
    }

    let points: ChartDataPoint[] = [];
    for (const [xStr, group] of groups.entries()) {
      const pt: ChartDataPoint = {
        x: xStr,
        xDisplay: xStr,
      };

      for (const y of yKeys) {
        if (config.aggregation === 'count') {
          pt[y] = group.count;
        } else if (config.aggregation === 'mean') {
          pt[y] = group.count > 0 ? Number(((group.sums[y] || 0) / group.count).toFixed(2)) : 0;
        } else {
          // sum
          pt[y] = Number((group.sums[y] || 0).toFixed(2));
        }
        const val = Number(pt[y]) || 0;
        if (val > maxY) maxY = val;
      }
      points.push(pt);
    }

    // Sort dates ascending if date (unless user specified explicit value sortOrder)
    if (isDateX && !config.sortOrder) {
      points.sort((a, b) => {
        const da = Date.parse(String(a.x)) || 0;
        const db = Date.parse(String(b.x)) || 0;
        return da - db;
      });
    }

    // Apply explicit sortOrder if configured
    if (config.sortOrder && yKeys[0]) {
      const primaryY = yKeys[0];
      if (config.sortOrder === 'desc') {
        points.sort((a, b) => (Number(b[primaryY]) || 0) - (Number(a[primaryY]) || 0));
      } else if (config.sortOrder === 'asc') {
        points.sort((a, b) => (Number(a[primaryY]) || 0) - (Number(b[primaryY]) || 0));
      }
    }

    // >30 categories handling
    let truncatedCategories = false;
    if (points.length > 30) {
      truncatedCategories = true;
      if ((config.top30ByValue || config.sortOrder === 'desc') && yKeys[0]) {
        const primaryY = yKeys[0];
        points.sort((a, b) => (Number(b[primaryY]) || 0) - (Number(a[primaryY]) || 0));
        notes.push(`Showing top 30 categories by ${primaryY}.`);
      } else {
        notes.push('Showing first 30 categories.');
      }
      points = points.slice(0, 30);
    }

    return {
      data: points,
      meta: {
        seriesKeys: yKeys,
        notes,
        totalPoints: points.length,
        hasDots: false,
        truncatedCategories,
        maxY,
      },
    };
  }

  // 2. LINE CHART
  if (config.type === 'line') {
    let points: ChartDataPoint[] = [];

    for (const row of dataset.rows) {
      const rawX = row[config.xKey];
      if (rawX === null || rawX === undefined) continue;

      let xVal: string | number = String(rawX);
      let sortVal = 0;

      if (isDateX) {
        sortVal = Date.parse(String(rawX)) || 0;
      } else if (isNumericX) {
        sortVal = Number(rawX) || 0;
        xVal = Number(rawX);
      }

      const pt: ChartDataPoint = {
        x: xVal,
        xDisplay: String(rawX),
        _sort: sortVal,
      };

      for (const y of yKeys) {
        const val = row[y];
        if (typeof val === 'number' && Number.isFinite(val)) {
          pt[y] = val;
          if (val > maxY) maxY = val;
        } else {
          pt[y] = null; // break line at nulls (connectNulls=false)
        }
      }
      points.push(pt);
    }

    // Sort by X (date or numeric)
    if (isDateX || isNumericX) {
      points.sort((a, b) => (Number(a._sort) || 0) - (Number(b._sort) || 0));
    }

    // LTTB downsampling if > 2,000 points
    let downsampled = false;
    if (points.length > 2000 && yKeys[0]) {
      const originalCount = points.length;
      points = downsampleLTTB(points, 1000, yKeys[0]);
      downsampled = true;
      notes.push(`Downsampled from ${originalCount.toLocaleString()} to ~${points.length.toLocaleString()} points (LTTB).`);
    }

    const hasDots = points.length <= 60;

    return {
      data: points,
      meta: {
        seriesKeys: yKeys,
        notes,
        totalPoints: points.length,
        hasDots,
        downsampled,
        isDateX,
        maxY,
      },
    };
  }

  // 3. SCATTER PLOT
  if (config.type === 'scatter') {
    let points: ChartDataPoint[] = [];

    for (const row of dataset.rows) {
      const rawX = row[config.xKey];
      if (rawX === null || rawX === undefined) continue;

      let xNum: number;
      if (isDateX) {
        xNum = Date.parse(String(rawX)) || 0;
      } else {
        xNum = Number(rawX);
        if (!Number.isFinite(xNum)) continue;
      }

      const pt: ChartDataPoint = {
        x: xNum,
        xDisplay: String(rawX),
      };

      for (const y of yKeys) {
        const val = row[y];
        if (typeof val === 'number' && Number.isFinite(val)) {
          pt[y] = val;
          if (val > maxY) maxY = val;
        } else {
          pt[y] = null;
        }
      }
      points.push(pt);
    }

    // > 5,000 points -> seeded sample to 3,000
    if (points.length > 5000) {
      const target = 3000;
      const step = points.length / target;
      const sampled: ChartDataPoint[] = [];
      for (let i = 0; i < target; i++) {
        const idx = Math.min(Math.floor(i * step), points.length - 1);
        if (points[idx]) sampled.push(points[idx]!);
      }
      notes.push(`Sampled ${target.toLocaleString()} points from ${points.length.toLocaleString()} for responsiveness.`);
      points = sampled;
    }

    return {
      data: points,
      meta: {
        seriesKeys: yKeys,
        notes,
        totalPoints: points.length,
        hasDots: true,
        isDateX,
        maxY,
      },
    };
  }

  // 4. PIE CHART
  if (config.type === 'pie') {
    const primaryY = yKeys[0];
    if (!primaryY) {
      return {
        problem: {
          code: 'NO_Y',
          message: 'Pie chart requires one numeric value column.',
        },
        data: [],
        meta: emptyMeta,
      };
    }

    // Sum duplicates, exclude null/zero/negative values
    const sliceMap = new Map<string, number>();
    let excludedCount = 0;

    for (const row of dataset.rows) {
      const rawX = row[config.xKey];
      const rawY = row[primaryY];

      if (rawX === null || rawX === undefined) {
        excludedCount++;
        continue;
      }

      if (typeof rawY !== 'number' || !Number.isFinite(rawY) || rawY <= 0) {
        excludedCount++;
        continue;
      }

      const xStr = String(rawX);
      sliceMap.set(xStr, (sliceMap.get(xStr) || 0) + rawY);
    }

    if (excludedCount > 0) {
      notes.push(`Excluded ${excludedCount} rows with null, zero or negative values.`);
    }

    // Convert to array and sort descending by value
    const sorted = Array.from(sliceMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    if (sorted.length === 0) {
      return {
        problem: {
          code: 'PIE_INVALID',
          message: 'No positive numeric values found to build a pie chart.',
        },
        data: [],
        meta: emptyMeta,
      };
    }

    // Top 8 slices plus "Other (k items)"
    let finalSlices: { name: string; value: number }[] = [];
    if (sorted.length > 8) {
      const top8 = sorted.slice(0, 8);
      const remaining = sorted.slice(8);
      const otherSum = remaining.reduce((acc, curr) => acc + curr.value, 0);
      finalSlices = [...top8, { name: `Other (${remaining.length} items)`, value: otherSum }];
    } else {
      finalSlices = sorted;
    }

    const totalVal = finalSlices.reduce((acc, s) => acc + s.value, 0);
    const pieData: ChartDataPoint[] = finalSlices.map((s) => ({
      x: s.name,
      xDisplay: s.name,
      [primaryY]: Number(s.value.toFixed(2)),
      percent: totalVal > 0 ? (s.value / totalVal) * 100 : 0,
    }));

    return {
      data: pieData,
      meta: {
        seriesKeys: [primaryY],
        notes,
        totalPoints: pieData.length,
        hasDots: false,
        excludedCount,
      },
    };
  }

  return {
    data: [],
    meta: emptyMeta,
  };
}
