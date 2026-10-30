import { AppError } from '../../state/types';

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export interface FileValidationResult {
  valid: boolean;
  error?: AppError;
  isExcel?: boolean;
}

export function validateFile(file: File): FileValidationResult {
  if (file.size === 0) {
    return { valid: false, error: { code: 'EMPTY_FILE', message: 'This file is empty.' } };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: { code: 'TOO_LARGE', maxMB: 10, message: 'This file is larger than 10 MB. Try a smaller export or split the file.' },
    };
  }

  const name = file.name.toLowerCase();
  const isExcel = name.endsWith('.xlsx') || name.endsWith('.xls');
  const isCsvOrText = name.endsWith('.csv') || name.endsWith('.tsv') || name.endsWith('.txt');

  if (!isExcel && !isCsvOrText) {
    // Check MIME type as fallback
    const validMimes = [
      'text/csv',
      'text/plain',
      'text/tab-separated-values',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    if (!validMimes.includes(file.type)) {
      return {
        valid: false,
        error: { code: 'BAD_TYPE', message: "That doesn't look like a supported file. Try a .csv, .tsv or .txt file." },
      };
    }
  }

  if (name.endsWith('.xls')) {
    return {
      valid: false,
      error: { code: 'BAD_TYPE', message: 'Legacy .xls format is not supported. Please save as CSV or .xlsx.' },
    };
  }

  return { valid: true, isExcel };
}

export async function checkBinaryContent(file: File): Promise<AppError | null> {
  const name = file.name.toLowerCase();
  if (name.endsWith('.xlsx')) {
    // XLSX is a zip/binary file by definition
    return null;
  }

  const slice = file.slice(0, 4096);
  const buffer = await slice.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  if (bytes.length === 0) return null;

  let nonPrintableCount = 0;
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i]!;
    if (b === 0) {
      return { code: 'BAD_TYPE', message: "That doesn't look like a supported file. Try a .csv, .tsv or .txt file." };
    }
    // Printable ASCII or UTF-8 or common whitespace (tab 9, LF 10, CR 13)
    if (b < 32 && b !== 9 && b !== 10 && b !== 13) {
      nonPrintableCount++;
    }
  }

  if (nonPrintableCount / bytes.length > 0.1) {
    return { code: 'BAD_TYPE', message: "That doesn't look like a supported file. Try a .csv, .tsv or .txt file." };
  }

  return null;
}
