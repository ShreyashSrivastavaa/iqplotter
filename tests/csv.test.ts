import { describe, it, expect } from 'vitest';
import { validateFile } from '../src/lib/csv/validator';
import { cleanData, parseNumericValue } from '../src/lib/csv/cleaner';
import { inferColumnsAndDefaults, isDateLike } from '../src/lib/csv/infer';

describe('CSV Pipeline - Validation', () => {
  it('rejects empty file', () => {
    const file = new File([], 'empty.csv', { type: 'text/csv' });
    const res = validateFile(file);
    expect(res.valid).toBe(false);
    expect(res.error?.code).toBe('EMPTY_FILE');
  });

  it('rejects file larger than 10MB', () => {
    const largeBlob = new Uint8Array(11 * 1024 * 1024);
    const file = new File([largeBlob], 'big.csv', { type: 'text/csv' });
    const res = validateFile(file);
    expect(res.valid).toBe(false);
    expect(res.error?.code).toBe('TOO_LARGE');
  });

  it('rejects unsupported file type', () => {
    const file = new File(['some data'], 'document.pdf', { type: 'application/pdf' });
    const res = validateFile(file);
    expect(res.valid).toBe(false);
    expect(res.error?.code).toBe('BAD_TYPE');
  });

  it('rejects legacy .xls with informative message', () => {
    const file = new File(['legacy excel'], 'sheet.xls', { type: 'application/vnd.ms-excel' });
    const res = validateFile(file);
    expect(res.valid).toBe(false);
    expect(res.error?.message).toContain('Legacy .xls format is not supported');
  });

  it('accepts valid .csv and .xlsx files', () => {
    const csv = new File(['a,b\n1,2'], 'data.csv', { type: 'text/csv' });
    expect(validateFile(csv).valid).toBe(true);

    const xlsx = new File(['PK...'], 'data.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const xlsxRes = validateFile(xlsx);
    expect(xlsxRes.valid).toBe(true);
    expect(xlsxRes.isExcel).toBe(true);
  });
});

describe('CSV Pipeline - Cleaner & Numeric Normalization', () => {
  it('parses numeric values with currency symbols, percentages, and parentheses', () => {
    expect(parseNumericValue('$1,234.50')).toBe(1234.5);
    expect(parseNumericValue('€ 450.75')).toBe(450.75);
    expect(parseNumericValue('£10,000')).toBe(10000);
    expect(parseNumericValue('₹2,500.00')).toBe(2500);
    expect(parseNumericValue('(12.5)')).toBe(-12.5);
    expect(parseNumericValue('($500.00)')).toBe(-500);
    expect(parseNumericValue('92%')).toBe(92);
  });

  it('handles European number formatting with comma decimals', () => {
    expect(parseNumericValue('1.234,56')).toBe(1234.56);
    expect(parseNumericValue('12,5')).toBe(12.5);
  });

  it('cleans headers: dedupes duplicates and names empty columns', () => {
    const rawHeaders = ['Score', 'Score', '', 'Revenue'];
    const rawRows = [
      { Score: '10', 'Score (2)': '20', '': 'A', Revenue: '100' },
      { Score: '30', 'Score (2)': '40', '': 'B', Revenue: '200' },
    ];
    const cleaned = cleanData(rawHeaders, rawRows);
    expect(cleaned.headers).toEqual(['Score', 'Score (2)', 'Column 3', 'Revenue']);
    expect(cleaned.report.renamedHeaders.length).toBeGreaterThan(0);
  });

  it('converts missing tokens to null', () => {
    const rawHeaders = ['ColA', 'ColB'];
    const rawRows = [
      { ColA: 'NA', ColB: '10' },
      { ColA: 'n/a', ColB: '20' },
      { ColA: '-', ColB: '30' },
      { ColA: 'Valid', ColB: '40' },
    ];
    const cleaned = cleanData(rawHeaders, rawRows);
    expect(cleaned.rows.length).toBe(4);
    expect(cleaned.rows[0]?.ColA).toBeNull();
    expect(cleaned.rows[1]?.ColA).toBeNull();
    expect(cleaned.rows[2]?.ColA).toBeNull();
    expect(cleaned.rows[3]?.ColA).toBe('Valid');
  });

  it('removes exact duplicate rows and reports them', () => {
    const rawHeaders = ['A', 'B'];
    const rawRows = [
      { A: '1', B: '2' },
      { A: '1', B: '2' }, // duplicate
      { A: '3', B: '4' },
    ];
    const cleaned = cleanData(rawHeaders, rawRows);
    expect(cleaned.rows.length).toBe(2);
    expect(cleaned.report.removedDuplicateRows).toBe(1);
  });

  it('removes completely empty rows and empty columns', () => {
    const rawHeaders = ['A', 'EmptyCol'];
    const rawRows = [
      { A: '1', EmptyCol: null },
      { A: null, EmptyCol: null }, // empty row
      { A: '2', EmptyCol: '' },
    ];
    const cleaned = cleanData(rawHeaders, rawRows);
    expect(cleaned.rows.length).toBe(2);
    expect(cleaned.headers).toEqual(['A']);
    expect(cleaned.report.removedEmptyRows).toBe(1);
    expect(cleaned.report.removedEmptyColumns).toBe(1);
  });
});

describe('CSV Pipeline - Type Inference & Defaults', () => {
  it('identifies dates including year columns and ISO strings', () => {
    expect(isDateLike('2024-01-15', 'Date')).toBe(true);
    expect(isDateLike('2023-01', 'Month')).toBe(true);
    expect(isDateLike('2020', 'Release_Year')).toBe(true);
    expect(isDateLike('Jan 5, 2024', 'Created')).toBe(true);
    expect(isDateLike('NotADate', 'Date')).toBe(false);
  });

  it('infers date, number and category types properly and assigns sensible defaults', () => {
    const headers = ['Date', 'Category', 'Sales', 'Units'];
    const rows = [
      { Date: '2023-01', Category: 'A', Sales: 100, Units: 5 },
      { Date: '2023-02', Category: 'B', Sales: 200, Units: 10 },
      { Date: '2023-03', Category: 'A', Sales: 300, Units: 15 },
    ];

    const { columns, defaultConfig, hasNumericColumns } = inferColumnsAndDefaults(headers, rows);
    expect(hasNumericColumns).toBe(true);
    expect(columns.find((c) => c.key === 'Date')?.type).toBe('date');
    expect(columns.find((c) => c.key === 'Sales')?.type).toBe('number');
    expect(columns.find((c) => c.key === 'Category')?.type).toBe('category');

    // Default chart should be 'line' because X is a date
    expect(defaultConfig?.type).toBe('line');
    expect(defaultConfig?.xKey).toBe('Date');
    expect(defaultConfig?.yKeys).toContain('Sales');
    expect(defaultConfig?.title).toBe('Sales by Date');
  });

  it('selects scatter plot default when X is numeric and no date/category exists', () => {
    const headers = ['Height', 'Weight'];
    const rows = [
      { Height: 170, Weight: 65 },
      { Height: 180, Weight: 75 },
      { Height: 165, Weight: 60 },
    ];

    const { defaultConfig } = inferColumnsAndDefaults(headers, rows);
    expect(defaultConfig?.type).toBe('scatter');
  });
});
