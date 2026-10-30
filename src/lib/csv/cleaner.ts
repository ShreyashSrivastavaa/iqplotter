import { CleaningReport, Row } from '../../state/types';

const MISSING_TOKENS = new Set([
  '',
  'na',
  'n/a',
  'nan',
  'null',
  'none',
  '-',
  '--',
  '#n/a',
  'undefined',
]);

export interface CleanRawResult {
  headers: string[];
  rows: Row[];
  report: CleaningReport;
}

/**
 * Checks if a string looks like a number with potential formatting:
 * Currency ($ € £ ₹ ¥), percentages, thousand commas, European dots/commas, parenthesized negatives (12.5) -> -12.5.
 */
export function parseNumericValue(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') return Number.isFinite(val) ? val : null;

  let str = String(val).trim();
  if (!str) return null;

  // Check parenthesized negative: e.g. (12.5) or ($1,234.50)
  let isNegative = false;
  if (str.startsWith('(') && str.endsWith(')')) {
    isNegative = true;
    str = str.slice(1, -1).trim();
  } else if (str.startsWith('-')) {
    isNegative = true;
    str = str.slice(1).trim();
  } else if (str.startsWith('+')) {
    str = str.slice(1).trim();
  }

  // Strip currency symbols ($ € £ ₹ ¥) and whitespace
  str = str.replace(/[$€£₹¥\s]/g, '');

  // Strip trailing percentage
  let isPercent = false;
  if (str.endsWith('%')) {
    isPercent = true;
    str = str.slice(0, -1).trim();
  }

  if (!str) return null;

  // Handle European formatting: 1.234,56 vs Standard 1,234.56
  // Check if string contains both dot and comma
  const hasComma = str.includes(',');
  const hasDot = str.includes('.');

  if (hasComma && hasDot) {
    if (str.lastIndexOf(',') > str.lastIndexOf('.')) {
      // European: 1.234,56 -> remove dots, replace comma with dot
      str = str.replace(/\./g, '').replace(',', '.');
    } else {
      // Standard: 1,234.56 -> remove commas
      str = str.replace(/,/g, '');
    }
  } else if (hasComma) {
    // Only comma: could be decimal (12,5) or thousands (1,234)
    // If followed by 1 or 2 digits at the end, likely decimal: 12,5 or 12,50
    // If followed by 3 digits (e.g. 1,000 or 1,234), likely thousands
    if (/,\d{1,2}$/.test(str)) {
      str = str.replace(',', '.');
    } else if (/,\d{3}$/.test(str)) {
      str = str.replace(',', '');
    } else {
      str = str.replace(',', '.');
    }
  }

  // Final check if it parses to valid finite number
  const num = Number(str);
  if (!Number.isFinite(num)) return null;

  let result = isNegative ? -num : num;
  if (isPercent) {
    // Keep raw numeric percentage value (e.g., 92% -> 92 or 0.92; standard user expectation is 92)
    // Let's keep 92 as parsed numeric so "92%" plots as 92.
  }
  return result;
}

export function cleanData(
  rawHeaders: string[],
  rawRows: Record<string, unknown>[],
  truncated: boolean = false
): CleanRawResult {
  const report: CleaningReport = {
    removedEmptyRows: 0,
    removedEmptyColumns: 0,
    removedDuplicateRows: 0,
    renamedHeaders: [],
    normalizedNumericColumns: [],
    missingValueCells: 0,
    truncated,
  };

  // 1 & 2. Clean and deduplicate headers
  const seenHeaderCounts = new Map<string, number>();
  const cleanedHeaders: string[] = [];
  const headerKeyMap: { raw: string; clean: string }[] = [];

  rawHeaders.forEach((h, index) => {
    let clean = (h || '').trim();
    if (!clean) {
      clean = `Column ${index + 1}`;
      report.renamedHeaders.push({ from: h || `(blank #${index + 1})`, to: clean });
    }

    const lower = clean.toLowerCase();
    const count = seenHeaderCounts.get(lower) || 0;
    seenHeaderCounts.set(lower, count + 1);

    if (count > 0) {
      const deduped = `${clean} (${count + 1})`;
      report.renamedHeaders.push({ from: clean, to: deduped });
      clean = deduped;
    }

    cleanedHeaders.push(clean);
    headerKeyMap.push({ raw: h, clean });
  });

  // 3 & 4. Process rows: trim string cells, missing tokens -> null, drop all-null rows
  const initialRows: Row[] = [];

  for (const rawRow of rawRows) {
    const rowObj: Row = {};
    let nonNullCount = 0;

    for (const { raw, clean } of headerKeyMap) {
      const rawVal = rawRow[raw];
      if (rawVal === null || rawVal === undefined) {
        rowObj[clean] = null;
        report.missingValueCells++;
        continue;
      }

      if (typeof rawVal === 'string') {
        const trimmed = rawVal.trim();
        if (MISSING_TOKENS.has(trimmed.toLowerCase())) {
          rowObj[clean] = null;
          report.missingValueCells++;
        } else {
          rowObj[clean] = trimmed;
          nonNullCount++;
        }
      } else if (typeof rawVal === 'number') {
        if (Number.isFinite(rawVal)) {
          rowObj[clean] = rawVal;
          nonNullCount++;
        } else {
          rowObj[clean] = null;
          report.missingValueCells++;
        }
      } else {
        const str = String(rawVal).trim();
        if (MISSING_TOKENS.has(str.toLowerCase())) {
          rowObj[clean] = null;
          report.missingValueCells++;
        } else {
          rowObj[clean] = str;
          nonNullCount++;
        }
      }
    }

    if (nonNullCount === 0) {
      report.removedEmptyRows++;
    } else {
      initialRows.push(rowObj);
    }
  }

  // Deduplicate exact duplicate rows
  const uniqueRows: Row[] = [];
  const seenRowSignatures = new Set<string>();

  for (const r of initialRows) {
    const sig = JSON.stringify(r);
    if (seenRowSignatures.has(sig)) {
      report.removedDuplicateRows++;
    } else {
      seenRowSignatures.add(sig);
      uniqueRows.push(r);
    }
  }

  // Drop all-null columns
  const activeHeaders: string[] = [];
  for (const header of cleanedHeaders) {
    let hasNonNull = false;
    for (const r of uniqueRows) {
      if (r[header] !== null && r[header] !== undefined) {
        hasNonNull = true;
        break;
      }
    }

    if (!hasNonNull && uniqueRows.length > 0) {
      report.removedEmptyColumns++;
      // remove from rows
      for (const r of uniqueRows) {
        delete r[header];
      }
    } else {
      activeHeaders.push(header);
    }
  }

  // 5. Numeric normalization: For columns >=90% numeric-looking among non-nulls
  for (const col of activeHeaders) {
    let nonNullCount = 0;
    let numericCount = 0;

    for (const r of uniqueRows) {
      const val = r[col];
      if (val !== null && val !== undefined) {
        nonNullCount++;
        if (typeof val === 'number') {
          numericCount++;
        } else if (typeof val === 'string') {
          const parsed = parseNumericValue(val);
          if (parsed !== null) {
            numericCount++;
          }
        }
      }
    }

    if (nonNullCount > 0 && numericCount / nonNullCount >= 0.9) {
      report.normalizedNumericColumns.push(col);
      for (const r of uniqueRows) {
        const val = r[col];
        if (val !== null && val !== undefined) {
          const parsed = parseNumericValue(val);
          r[col] = parsed;
          if (parsed === null) {
            report.missingValueCells++;
          }
        }
      }
    }
  }

  return {
    headers: activeHeaders,
    rows: uniqueRows,
    report,
  };
}
