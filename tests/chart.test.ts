import { describe, it, expect } from 'vitest';
import { buildSeries } from '../src/lib/chart/buildSeries';
import { downsampleLTTB } from '../src/lib/chart/lttb';
import { ChartConfig, Dataset } from '../src/state/types';

describe('Chart Engine - buildSeries', () => {
  const sampleDataset: Dataset = {
    id: 'test-1',
    name: 'test.csv',
    loadedAt: Date.now(),
    report: {
      removedEmptyRows: 0,
      removedEmptyColumns: 0,
      removedDuplicateRows: 0,
      renamedHeaders: [],
      normalizedNumericColumns: [],
      missingValueCells: 0,
      truncated: false,
    },
    columns: [
      { key: 'Region', label: 'Region', type: 'category', missingCount: 0, uniqueCount: 3 },
      { key: 'Revenue', label: 'Revenue', type: 'number', missingCount: 0, uniqueCount: 4 },
      { key: 'Units', label: 'Units', type: 'number', missingCount: 0, uniqueCount: 4 },
      { key: 'Date', label: 'Date', type: 'date', missingCount: 0, uniqueCount: 4 },
    ],
    rows: [
      { Region: 'North', Revenue: 100, Units: 10, Date: '2024-01-02' },
      { Region: 'North', Revenue: 200, Units: 20, Date: '2024-01-01' },
      { Region: 'South', Revenue: 150, Units: 15, Date: '2024-01-03' },
      { Region: 'East', Revenue: 300, Units: 30, Date: '2024-01-04' },
    ],
  };

  it('builds Bar chart with aggregation sum, mean and count', () => {
    const configSum: ChartConfig = {
      type: 'bar',
      xKey: 'Region',
      yKeys: ['Revenue'],
      aggregation: 'sum',
      title: 'Revenue by Region',
      xLabel: 'Region',
      yLabel: 'Revenue',
      palette: 'classic',
    };

    const resSum = buildSeries(sampleDataset, configSum);
    expect(resSum.problem).toBeUndefined();
    const northPt = resSum.data.find((d) => d.x === 'North');
    expect(northPt?.Revenue).toBe(300); // 100 + 200

    const configMean: ChartConfig = { ...configSum, aggregation: 'mean' };
    const resMean = buildSeries(sampleDataset, configMean);
    const northMean = resMean.data.find((d) => d.x === 'North');
    expect(northMean?.Revenue).toBe(150); // (100 + 200) / 2

    const configCount: ChartConfig = { ...configSum, aggregation: 'count' };
    const resCount = buildSeries(sampleDataset, configCount);
    const northCount = resCount.data.find((d) => d.x === 'North');
    expect(northCount?.Revenue).toBe(2);
  });

  it('builds Line chart sorted chronologically and handles null points', () => {
    const configLine: ChartConfig = {
      type: 'line',
      xKey: 'Date',
      yKeys: ['Revenue'],
      aggregation: 'sum',
      title: 'Revenue over Time',
      xLabel: 'Date',
      yLabel: 'Revenue',
      palette: 'warm',
    };

    const res = buildSeries(sampleDataset, configLine);
    expect(res.problem).toBeUndefined();
    // 2024-01-01 should be first, then 2024-01-02
    expect(res.data[0]?.x).toBe('2024-01-01');
    expect(res.data[1]?.x).toBe('2024-01-02');
    expect(res.meta.hasDots).toBe(true); // <= 60 points
  });

  it('flags Scatter problem when X is non-numeric/non-date and gives suggestion', () => {
    const configScatter: ChartConfig = {
      type: 'scatter',
      xKey: 'Region', // Category
      yKeys: ['Revenue'],
      aggregation: 'sum',
      title: 'Scatter',
      xLabel: 'Region',
      yLabel: 'Revenue',
      palette: 'cool',
    };

    const res = buildSeries(sampleDataset, configScatter);
    expect(res.problem).toBeDefined();
    expect(res.problem?.code).toBe('NON_NUMERIC_X');
    expect(res.problem?.suggestion).toBeDefined();
  });

  it('builds Pie chart with top 8 slices + Other, excluding null/zero/negative', () => {
    const rowsWithMany = Array.from({ length: 15 }, (_, i) => ({
      Category: `Cat_${i + 1}`,
      Val: (i + 1) * 10,
    }));
    // Add null and negative values that should be excluded
    rowsWithMany.push({ Category: 'Negative', Val: -50 });
    rowsWithMany.push({ Category: 'Zero', Val: 0 });

    const pieDataset: Dataset = {
      id: 'pie-test',
      name: 'pie.csv',
      loadedAt: Date.now(),
      report: sampleDataset.report,
      columns: [
        { key: 'Category', label: 'Category', type: 'category', missingCount: 0, uniqueCount: 17 },
        { key: 'Val', label: 'Val', type: 'number', missingCount: 0, uniqueCount: 17 },
      ],
      rows: rowsWithMany,
    };

    const configPie: ChartConfig = {
      type: 'pie',
      xKey: 'Category',
      yKeys: ['Val'],
      aggregation: 'sum',
      title: 'Pie',
      xLabel: 'Category',
      yLabel: 'Val',
      palette: 'classic',
    };

    const res = buildSeries(pieDataset, configPie);
    expect(res.problem).toBeUndefined();
    // 8 top slices + 1 "Other (7 items)" = 9 slices total
    expect(res.data.length).toBe(9);
    expect(res.data[8]?.x).toContain('Other (7 items)');
    expect(res.meta.excludedCount).toBe(2);
  });
});

describe('LTTB Downsampling algorithm', () => {
  it('preserves first and last point and downsamples to target size', () => {
    const points = Array.from({ length: 500 }, (_, i) => ({
      x: i,
      xDisplay: String(i),
      val: Math.sin(i / 10) * 50,
    }));

    const downsampled = downsampleLTTB(points, 50, 'val');
    expect(downsampled.length).toBe(50);
    expect(downsampled[0]?.x).toBe(0);
    expect(downsampled[downsampled.length - 1]?.x).toBe(499);
  });
});
