import { get, set } from 'idb-keyval';
import { ChartConfig, Dataset } from '../../state/types';

export interface HistoryItem {
  id: string;
  name: string;
  rowCount: number;
  colCount: number;
  timestamp: number;
  dataset: Dataset;
  config: ChartConfig;
}

const MAX_HISTORY_ITEMS = 10;
const MAX_ITEM_BYTES = 5 * 1024 * 1024; // 5 MB

export function getHistoryKey(uid?: string | null): string {
  return uid ? `iqplotter:history:v1:${uid}` : 'iqplotter:history:v1';
}

export async function loadHistory(uid?: string | null): Promise<HistoryItem[]> {
  try {
    const key = getHistoryKey(uid);
    const stored = await get<HistoryItem[]>(key);
    return Array.isArray(stored) ? stored : [];
  } catch (err) {
    console.warn('IndexedDB unavailable or error reading history:', err);
    return [];
  }
}

export async function saveHistoryItem(
  dataset: Dataset,
  config: ChartConfig,
  uid?: string | null
): Promise<{ success: boolean; tooLarge?: boolean; error?: string }> {
  try {
    const key = getHistoryKey(uid);
    const current = await loadHistory(uid);

    // Approximate size check
    const serialized = JSON.stringify({ dataset, config });
    if (serialized.length > MAX_ITEM_BYTES) {
      return { success: false, tooLarge: true };
    }

    const newItem: HistoryItem = {
      id: dataset.id || `hist-${Date.now()}`,
      name: dataset.name,
      rowCount: dataset.rows.length,
      colCount: dataset.columns.length,
      timestamp: Date.now(),
      dataset,
      config,
    };

    // Filter out previous version of this dataset if exists, prepend new item
    const filtered = current.filter((item) => item.id !== newItem.id);
    const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);

    await set(key, updated);
    return { success: true };
  } catch (err) {
    console.warn('IndexedDB error saving item:', err);
    return { success: false, error: 'Storage unavailable in this mode' };
  }
}

export async function deleteHistoryItem(id: string, uid?: string | null): Promise<HistoryItem[]> {
  try {
    const key = getHistoryKey(uid);
    const current = await loadHistory(uid);
    const updated = current.filter((item) => item.id !== id);
    await set(key, updated);
    return updated;
  } catch (err) {
    console.warn('IndexedDB error deleting item:', err);
    return [];
  }
}

export async function clearAllHistory(uid?: string | null): Promise<void> {
  try {
    const key = getHistoryKey(uid);
    await set(key, []);
  } catch (err) {
    console.warn('IndexedDB error clearing history:', err);
  }
}
