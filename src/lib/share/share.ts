import LZString from 'lz-string';
import { ChartConfig, Dataset, Row } from '../../state/types';
import { inferColumnsAndDefaults } from '../csv/infer';

export const MAX_SHARE_HASH_LENGTH = 8000;

export interface SharePayload {
  name: string;
  rows: Row[];
  config: ChartConfig;
}

export function encodeShareLink(payload: SharePayload): { url: string; charCount: number; tooLarge: boolean } {
  try {
    const jsonStr = JSON.stringify(payload);
    const compressed = LZString.compressToEncodedURIComponent(jsonStr);
    const fullUrl = `${window.location.origin}${window.location.pathname}#s=${compressed}`;
    const charCount = fullUrl.length;

    return {
      url: fullUrl,
      charCount,
      tooLarge: charCount > MAX_SHARE_HASH_LENGTH,
    };
  } catch (err) {
    console.error('Share link encode error:', err);
    return {
      url: '',
      charCount: 99999,
      tooLarge: true,
    };
  }
}

export function decodeShareHash(): { dataset: Dataset; config: ChartConfig } | null {
  try {
    const hash = window.location.hash;
    if (!hash || !hash.startsWith('#s=')) return null;

    const compressed = hash.slice(3);
    if (!compressed) return null;

    const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
    if (!decompressed) return null;

    const parsed = JSON.parse(decompressed) as Partial<SharePayload>;
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.rows) || parsed.rows.length === 0) {
      return null;
    }

    // Clear hash cleanly
    window.history.replaceState(null, '', window.location.pathname + window.location.search);

    const rows = parsed.rows as Row[];
    const firstRow = rows[0];
    if (!firstRow) return null;

    const headers = Object.keys(firstRow);
    const { columns, defaultConfig } = inferColumnsAndDefaults(headers, rows);

    const dataset: Dataset = {
      id: `shared-${Date.now()}`,
      name: parsed.name ? `${parsed.name} (Shared)` : 'Shared chart',
      rows,
      columns,
      report: {
        removedEmptyRows: 0,
        removedEmptyColumns: 0,
        removedDuplicateRows: 0,
        renamedHeaders: [],
        normalizedNumericColumns: [],
        missingValueCells: 0,
        truncated: false,
      },
      loadedAt: Date.now(),
    };

    const config = (parsed.config as ChartConfig) || defaultConfig;
    if (!config) return null;

    return { dataset, config };
  } catch (err) {
    console.warn('Failed to parse share payload:', err);
    return null;
  }
}
