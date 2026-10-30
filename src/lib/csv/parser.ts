import Papa from 'papaparse';
import readXlsxFile from 'read-excel-file';
import { AppError, ChartConfig, Dataset } from '../../state/types';
import { cleanData } from './cleaner';
import { inferColumnsAndDefaults } from './infer';
import { checkBinaryContent, validateFile } from './validator';

export const MAX_ROWS = 100000;

export interface ParseResult {
  dataset: Dataset;
  config: ChartConfig | null;
  notices: string[];
  error?: AppError;
}

export async function parseCsvFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<ParseResult> {
  // Step 1: Validate file meta and size
  const validation = validateFile(file);
  if (!validation.valid && validation.error) {
    throw validation.error;
  }

  // Step 2: Binary check
  const binaryError = await checkBinaryContent(file);
  if (binaryError) {
    throw binaryError;
  }

  // Step 3: Excel import branch
  if (validation.isExcel) {
    return parseExcelFile(file);
  }

  // Step 4: CSV parsing via PapaParse
  return new Promise<ParseResult>((resolve, reject) => {
    const isLarge = file.size > 2 * 1024 * 1024;
    const notices: string[] = [];

    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: 'greedy',
      delimitersToGuess: [',', ';', '\t', '|'],
      transformHeader: (h) => h.trim().replace(/^\uFEFF/, ''),
      worker: isLarge,
      step: isLarge
        ? (_row, parser) => {
            if (onProgress && file.size > 0) {
              const currentOffset = (parser as unknown as { stream?: { cursor?: number } }).stream?.cursor || 0;
              const percent = Math.min(100, Math.round((currentOffset / file.size) * 100));
              onProgress(percent);
            }
          }
        : undefined,
      complete: (results) => {
        try {
          if (results.errors && results.errors.length > 0) {
            const hasFatal = results.data.length === 0;
            for (const err of results.errors) {
              if (err.type === 'FieldMismatch') {
                notices.push(`Row ${err.row}: field count mismatch (expected vs received).`);
              }
            }
            if (hasFatal) {
              reject({
                code: 'PARSE_FAILED',
                message: "We couldn't read this file. Check for unclosed quotes or a corrupted export.",
              } as AppError);
              return;
            }
          }

          let rawRows = results.data;
          let rawHeaders = results.meta.fields || [];

          if (rawHeaders.length === 0 && rawRows.length > 0) {
            const firstRow = rawRows[0];
            if (firstRow) {
              rawHeaders = Object.keys(firstRow);
            }
          }

          if (rawHeaders.length === 0) {
            reject({ code: 'NO_ROWS', message: 'We found column headers but no data rows.' } as AppError);
            return;
          }

          let truncated = false;
          if (rawRows.length > MAX_ROWS) {
            rawRows = rawRows.slice(0, MAX_ROWS);
            truncated = true;
            notices.push(`Dataset capped at ${MAX_ROWS.toLocaleString()} rows for browser performance.`);
          }

          // Clean data
          const cleaned = cleanData(rawHeaders, rawRows, truncated);

          if (cleaned.rows.length === 0) {
            reject({ code: 'NO_ROWS', message: 'We found column headers but no data rows.' } as AppError);
            return;
          }

          if (cleaned.rows.length < 2) {
            reject({
              code: 'TOO_FEW_ROWS',
              message: 'We need at least 2 rows of data to draw a chart.',
            } as AppError);
            return;
          }

          // Infer types and defaults
          const { columns, defaultConfig, hasNumericColumns } = inferColumnsAndDefaults(
            cleaned.headers,
            cleaned.rows
          );

          if (!hasNumericColumns) {
            notices.push("We couldn't find a numeric column to plot. You can still inspect the columns.");
          }

          const dataset: Dataset = {
            id: `ds-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            name: file.name,
            rows: cleaned.rows,
            columns,
            report: cleaned.report,
            loadedAt: Date.now(),
            rawSizeBytes: file.size,
          };

          resolve({
            dataset,
            config: defaultConfig,
            notices,
          });
        } catch (err) {
          reject(err);
        }
      },
      error: () => {
        reject({
          code: 'PARSE_FAILED',
          message: "We couldn't read this file. Check for unclosed quotes or a corrupted export.",
        } as AppError);
      },
    });
  });
}

/**
 * Excel (.xlsx) parser using read-excel-file
 */
export async function parseExcelFile(file: File): Promise<ParseResult> {
  const notices: string[] = [];

  try {
    const rows = await readXlsxFile(file);
    if (!rows || rows.length === 0) {
      throw { code: 'EMPTY_FILE', message: 'This file is empty.' } as AppError;
    }

    const headerRow = rows[0];
    if (!headerRow || headerRow.length === 0) {
      throw { code: 'NO_ROWS', message: 'We found column headers but no data rows.' } as AppError;
    }

    const rawHeaders = headerRow.map((cell, idx) => (cell !== null && cell !== undefined ? String(cell) : `Column ${idx + 1}`));
    const dataRows = rows.slice(1);

    if (dataRows.length === 0) {
      throw { code: 'NO_ROWS', message: 'We found column headers but no data rows.' } as AppError;
    }

    let truncated = false;
    let slicedRows = dataRows;
    if (slicedRows.length > MAX_ROWS) {
      slicedRows = slicedRows.slice(0, MAX_ROWS);
      truncated = true;
      notices.push(`Dataset capped at ${MAX_ROWS.toLocaleString()} rows for browser performance.`);
    }

    const objectRows: Record<string, unknown>[] = slicedRows.map((r) => {
      const obj: Record<string, unknown> = {};
      rawHeaders.forEach((h, idx) => {
        const val = r[idx];
        obj[h] = val instanceof Date ? val.toISOString().slice(0, 10) : val;
      });
      return obj;
    });

    const cleaned = cleanData(rawHeaders, objectRows, truncated);

    if (cleaned.rows.length === 0) {
      throw { code: 'NO_ROWS', message: 'We found column headers but no data rows.' } as AppError;
    }
    if (cleaned.rows.length < 2) {
      throw { code: 'TOO_FEW_ROWS', message: 'We need at least 2 rows of data to draw a chart.' } as AppError;
    }

    const { columns, defaultConfig, hasNumericColumns } = inferColumnsAndDefaults(
      cleaned.headers,
      cleaned.rows
    );

    if (!hasNumericColumns) {
      notices.push("We couldn't find a numeric column to plot. You can still inspect the columns.");
    }

    const dataset: Dataset = {
      id: `ds-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: file.name,
      rows: cleaned.rows,
      columns,
      report: cleaned.report,
      loadedAt: Date.now(),
      rawSizeBytes: file.size,
    };

    return {
      dataset,
      config: defaultConfig,
      notices,
    };
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err) {
      throw err;
    }
    throw {
      code: 'PARSE_FAILED',
      message: "We couldn't read this Excel file. Check that it is a valid .xlsx file.",
    } as AppError;
  }
}
