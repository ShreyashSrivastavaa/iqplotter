import { describe, it, expect, beforeEach } from 'vitest';
import { slugify } from '../src/lib/export/slugify';
import { encodeShareLink, decodeShareHash } from '../src/lib/share/share';
import { getHistoryKey, saveHistoryItem, loadHistory, clearAllHistory } from '../src/lib/storage/history';
import { ChartConfig, Dataset } from '../src/state/types';

describe('Export Module - slugify', () => {
  it('converts titles to clean, URL-safe and filesystem-safe slugs', () => {
    expect(slugify('Monthly Revenue by Region')).toBe('monthly-revenue-by-region');
    expect(slugify('Temp (°C) in São Paulo & New York!')).toBe('temp-c-in-sao-paulo-new-york');
    expect(slugify('   Multiple   Spaces   ')).toBe('multiple-spaces');
    expect(slugify('')).toBe('iqplotter-chart');
  });
});

describe('Share Module - Backend-Free URL Compression', () => {
  const dummyDataset: Dataset = {
    id: 'd1',
    name: 'Sample',
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
      { key: 'A', label: 'A', type: 'category', missingCount: 0, uniqueCount: 2 },
      { key: 'B', label: 'B', type: 'number', missingCount: 0, uniqueCount: 2 },
    ],
    rows: [
      { A: 'X', B: 10 },
      { A: 'Y', B: 20 },
    ],
  };

  const dummyConfig: ChartConfig = {
    type: 'bar',
    xKey: 'A',
    yKeys: ['B'],
    aggregation: 'sum',
    title: 'Test Chart',
    xLabel: 'A',
    yLabel: 'B',
    palette: 'classic',
  };

  it('encodes payload and flags tooLarge correctly', () => {
    const encoded = encodeShareLink({
      name: dummyDataset.name,
      rows: dummyDataset.rows,
      config: dummyConfig,
    });

    expect(encoded.tooLarge).toBe(false);
    expect(encoded.url).toContain('#s=');
    expect(encoded.charCount).toBeGreaterThan(10);
    expect(encoded.charCount).toBeLessThan(8000);
  });

  it('decodes share hash round-trip accurately', () => {
    const encoded = encodeShareLink({
      name: dummyDataset.name,
      rows: dummyDataset.rows,
      config: dummyConfig,
    });

    // Simulate location hash
    const hash = encoded.url.substring(encoded.url.indexOf('#'));
    window.location.hash = hash;

    const restored = decodeShareHash();
    expect(restored).not.toBeNull();
    expect(restored?.config.title).toBe('Test Chart');
    expect(restored?.dataset.rows.length).toBe(2);
    expect(window.location.hash).toBe(''); // cleared cleanly
  });

  it('returns null on invalid or empty hash', () => {
    window.location.hash = '';
    expect(decodeShareHash()).toBeNull();

    window.location.hash = '#s=not-valid-lz-data-!@#$';
    expect(decodeShareHash()).toBeNull();
  });
});

describe('Storage Module - IndexedDB History', () => {
  beforeEach(async () => {
    await clearAllHistory(null);
  });

  it('namespaces history key by uid', () => {
    expect(getHistoryKey(null)).toBe('iqplotter:history:v1');
    expect(getHistoryKey('user-123')).toBe('iqplotter:history:v1:user-123');
  });

  it('persists datasets, limits to 10 entries and sorts newest first', async () => {
    const baseDataset: Dataset = {
      id: 'd-test',
      name: 'Dataset',
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
      columns: [{ key: 'X', label: 'X', type: 'category', missingCount: 0, uniqueCount: 1 }],
      rows: [{ X: 'val' }],
    };

    const baseConfig: ChartConfig = {
      type: 'bar',
      xKey: 'X',
      yKeys: ['X'],
      aggregation: 'count',
      title: 'Title',
      xLabel: 'X',
      yLabel: 'Count',
      palette: 'classic',
    };

    // Save 12 items
    for (let i = 0; i < 12; i++) {
      const ds = { ...baseDataset, id: `item-${i}`, name: `Dataset ${i}` };
      await saveHistoryItem(ds, baseConfig);
    }

    const items = await loadHistory();
    expect(items.length).toBe(10);
    expect(items[0]?.name).toBe('Dataset 11'); // newest first
  });
});
