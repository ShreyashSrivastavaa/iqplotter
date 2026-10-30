import { ChartConfig, Column, ColumnType, Row } from '../../state/types';

/**
 * Checks if a string or number represents a date:
 * - ISO: 2024-01-15, 2024-01-15T00:00:00Z
 * - YYYY/MM/DD or YYYY-MM-DD
 * - MM/DD/YYYY or DD/MM/YYYY (prefer MM/DD unless first part >12)
 * - "Jan 5, 2024", "January 2024", "Mon YYYY", "2023-01"
 * - Year integer (e.g. 1900-2100) if header contains "year"
 */
export function isDateLike(val: unknown, headerName: string): boolean {
  if (val === null || val === undefined) return false;

  const str = String(val).trim();
  if (!str) return false;

  // Year check if header has 'year'
  if (/year/i.test(headerName)) {
    const num = Number(str);
    if (Number.isInteger(num) && num >= 1800 && num <= 2150) {
      return true;
    }
  }

  // Month-Year like: 2023-01, 2024/05
  if (/^\d{4}[-/]\d{1,2}$/.test(str)) {
    return true;
  }

  // ISO / Date format like YYYY-MM-DD or YYYY/MM/DD
  if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(str)) {
    const timestamp = Date.parse(str.replace(/\//g, '-'));
    return !isNaN(timestamp);
  }

  // MM/DD/YYYY or DD/MM/YYYY
  if (/^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}$/.test(str)) {
    const timestamp = Date.parse(str);
    return !isNaN(timestamp);
  }

  // "Jan 5, 2024", "January 2024", "Mon YYYY"
  const monthWordPattern = /^(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s,.-]+(?:\d{1,2}[\s,.-]+)?\d{2,4}$/i;
  if (monthWordPattern.test(str)) {
    const timestamp = Date.parse(str);
    return !isNaN(timestamp);
  }

  return false;
}

export function inferColumnType(
  header: string,
  rows: Row[]
): {
  type: ColumnType;
  missingCount: number;
  uniqueCount: number;
  min?: number;
  max?: number;
  mean?: number;
} {
  let missingCount = 0;
  let nonNullCount = 0;
  let numberCount = 0;
  let dateCount = 0;

  let sum = 0;
  let min: number | undefined;
  let max: number | undefined;

  const uniqueValues = new Set<string>();

  for (const r of rows) {
    const val = r[header];
    if (val === null || val === undefined) {
      missingCount++;
      continue;
    }

    nonNullCount++;
    uniqueValues.add(String(val));

    if (typeof val === 'number') {
      numberCount++;
      sum += val;
      if (min === undefined || val < min) min = val;
      if (max === undefined || val > max) max = val;
    } else {
      if (isDateLike(val, header)) {
        dateCount++;
      }
    }
  }

  const uniqueCount = uniqueValues.size;

  if (nonNullCount === 0) {
    return { type: 'text', missingCount, uniqueCount: 0 };
  }

  // Check 90% threshold in order: number -> date -> category -> text
  if (numberCount / nonNullCount >= 0.9) {
    const mean = nonNullCount > 0 ? sum / numberCount : undefined;
    return {
      type: 'number',
      missingCount,
      uniqueCount,
      min,
      max,
      mean,
    };
  }

  if (dateCount / nonNullCount >= 0.9) {
    return { type: 'date', missingCount, uniqueCount };
  }

  // Category: unique <= max(20, 50% of non-null)
  const categoryThreshold = Math.max(20, Math.floor(nonNullCount * 0.5));
  if (uniqueCount <= categoryThreshold) {
    return { type: 'category', missingCount, uniqueCount };
  }

  return { type: 'text', missingCount, uniqueCount };
}

export function inferColumnsAndDefaults(
  headers: string[],
  rows: Row[]
): {
  columns: Column[];
  defaultConfig: ChartConfig | null;
  hasNumericColumns: boolean;
} {
  const columns: Column[] = headers.map((key) => {
    const inferred = inferColumnType(key, rows);
    return {
      key,
      label: key,
      type: inferred.type,
      missingCount: inferred.missingCount,
      uniqueCount: inferred.uniqueCount,
      min: inferred.min,
      max: inferred.max,
      mean: inferred.mean,
    };
  });

  const numericCols = columns.filter((c) => c.type === 'number');
  const dateCols = columns.filter((c) => c.type === 'date');
  const categoryCols = columns.filter((c) => c.type === 'category');
  const textCols = columns.filter((c) => c.type === 'text');

  if (numericCols.length === 0) {
    return {
      columns,
      defaultConfig: null,
      hasNumericColumns: false,
    };
  }

  // Defaults rule from 7.5:
  // X = first date, else first category, else first text, else first column.
  let xCol: Column | undefined;
  if (dateCols.length > 0) {
    xCol = dateCols[0];
  } else if (categoryCols.length > 0) {
    xCol = categoryCols[0];
  } else if (textCols.length > 0) {
    xCol = textCols[0];
  } else {
    xCol = columns[0];
  }

  const xKey = xCol ? xCol.key : null;

  // Y = first numeric column != X
  const yCol = numericCols.find((c) => c.key !== xKey) || numericCols[0];
  const yKeys = yCol ? [yCol.key] : [];

  // Type: line if X is date, scatter if X is numeric and no date/category exists, else bar.
  let chartType: 'bar' | 'line' | 'scatter' | 'pie' = 'bar';
  if (xCol?.type === 'date') {
    chartType = 'line';
  } else if (xCol?.type === 'number' && dateCols.length === 0 && categoryCols.length === 0) {
    chartType = 'scatter';
  } else {
    chartType = 'bar';
  }

  const title = yCol && xCol ? `${yCol.label} by ${xCol.label}` : 'Data Chart';

  const defaultConfig: ChartConfig = {
    type: chartType,
    xKey,
    yKeys,
    aggregation: 'sum',
    title,
    xLabel: xCol ? xCol.label : '',
    yLabel: yCol ? yCol.label : '',
    palette: 'classic',
  };

  return {
    columns,
    defaultConfig,
    hasNumericColumns: true,
  };
}
