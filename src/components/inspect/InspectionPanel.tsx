import React, { useState, useMemo } from 'react';
import { ArrowRight, Database, FileSpreadsheet, Search, ArrowUpDown, ArrowUp, ArrowDown, Download, Copy, Check } from 'lucide-react';
import { useApp } from '../../state/store';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ColumnType } from '../../state/types';

export const InspectionPanel: React.FC = () => {
  const { state, dispatch, loadSampleByName, showToast } = useApp();
  const [colTypeFilter, setColTypeFilter] = useState<'all' | ColumnType>('all');
  const [colSearch, setColSearch] = useState('');
  const [tableSearch, setTableSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [pageSize, setPageSize] = useState<number>(50);
  const [copiedCell, setCopiedCell] = useState<string | null>(null);

  if (!state.dataset) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-full bg-bg border border-line flex items-center justify-center text-ink-subtle mx-auto mb-4">
          <Database className="w-6 h-6" />
        </div>
        <h3 className="font-mono font-bold text-lg text-ink mb-2">Nothing to inspect yet</h3>
        <p className="font-mono text-sm text-ink-muted mb-6">
          Load a CSV or Excel file first, or choose one of our prepared sample datasets.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', tab: 'ingestion' })}
          >
            Upload a file
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => loadSampleByName('monthly-sales.csv')}
          >
            Use sample data
          </Button>
        </div>
      </div>
    );
  }

  const { dataset } = state;
  const rows = dataset.rows;
  const columns = dataset.columns;
  const report = dataset.report;

  // Filter column profiles
  const filteredColumns = useMemo(() => {
    return columns.filter((col) => {
      const matchesType = colTypeFilter === 'all' || col.type === colTypeFilter;
      const matchesSearch = !colSearch || col.label.toLowerCase().includes(colSearch.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [columns, colTypeFilter, colSearch]);

  // Filter & sort preview rows
  const processedRows = useMemo(() => {
    let result = rows;

    if (tableSearch.trim()) {
      const q = tableSearch.toLowerCase();
      result = result.filter((r) =>
        Object.values(r).some((v) => v !== null && v !== undefined && String(v).toLowerCase().includes(q))
      );
    }

    if (sortKey) {
      result = [...result].sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];
        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDir === 'asc' ? valA - valB : valB - valA;
        }
        return sortDir === 'asc'
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
    }

    return result;
  }, [rows, tableSearch, sortKey, sortDir]);

  const previewRows = processedRows.slice(0, pageSize);

  const handleHeaderSort = (key: string) => {
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc');
      else {
        setSortKey(null);
        setSortDir('asc');
      }
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const copyCellValue = (val: unknown, cellId: string) => {
    const text = val === null || val === undefined ? '' : String(val);
    navigator.clipboard.writeText(text);
    setCopiedCell(cellId);
    showToast(`Copied "${text.slice(0, 20)}" to clipboard`);
    setTimeout(() => setCopiedCell(null), 1500);
  };

  const downloadCleanCsv = () => {
    if (!rows.length || !columns.length) return;
    const headerRow = columns.map((c) => `"${c.label.replace(/"/g, '""')}"`).join(',');
    const bodyRows = rows.map((r) =>
      columns.map((c) => {
        const v = r[c.key];
        if (v === null || v === undefined) return '';
        if (typeof v === 'number') return v;
        return `"${String(v).replace(/"/g, '""')}"`;
      }).join(',')
    );
    const csvContent = [headerRow, ...bodyRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dataset.name.replace(/\.[^/.]+$/, '')}-cleaned.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Cleaned CSV downloaded');
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-200">
      {/* 1. Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-card border border-line">
        <div className="flex flex-col">
          <span className="font-mono text-xs text-ink-subtle uppercase">Total Rows</span>
          <span className="font-mono font-bold text-xl sm:text-2xl text-ink">
            {rows.length.toLocaleString()}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="font-mono text-xs text-ink-subtle uppercase">Columns</span>
          <span className="font-mono font-bold text-xl sm:text-2xl text-ink">
            {columns.length}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="font-mono text-xs text-ink-subtle uppercase">Missing Cells</span>
          <span className="font-mono font-bold text-xl sm:text-2xl text-ink">
            {report.missingValueCells.toLocaleString()}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="font-mono text-xs text-ink-subtle uppercase">Duplicate Rows</span>
          <span className="font-mono font-bold text-xl sm:text-2xl text-ink">
            {report.removedDuplicateRows.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 2. Column Profiles List with interactive filters */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <h4 className="font-mono font-bold text-base text-ink">Column Profiles</h4>
            <span className="font-mono text-xs text-ink-subtle">
              ({filteredColumns.length} of {columns.length})
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter by type */}
            <div className="flex items-center p-0.5 rounded-lg bg-bg border border-line text-[11px] font-mono">
              {(['all', 'number', 'date', 'category', 'text'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setColTypeFilter(t)}
                  className={`px-2 py-1 rounded capitalize transition-colors ${
                    colTypeFilter === t
                      ? 'bg-ink text-bg font-semibold'
                      : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Column search input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-ink-subtle" />
              <input
                type="text"
                placeholder="Find column..."
                value={colSearch}
                onChange={(e) => setColSearch(e.target.value)}
                className="pl-8 pr-3 py-1 bg-bg border border-line rounded-lg text-xs font-mono text-ink placeholder:text-ink-subtle outline-none focus:border-ink w-32 sm:w-40"
              />
            </div>
          </div>
        </div>

        <div className="border border-line rounded-2xl overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="bg-bg border-b border-line text-ink-muted">
                  <th className="py-2.5 px-4 font-semibold">Column</th>
                  <th className="py-2.5 px-4 font-semibold">Type</th>
                  <th className="py-2.5 px-4 font-semibold">Missing %</th>
                  <th className="py-2.5 px-4 font-semibold">Unique</th>
                  <th className="py-2.5 px-4 font-semibold">Distribution / Stats (Min / Mean / Max)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredColumns.map((col) => {
                  const missingPercent =
                    rows.length > 0 ? ((col.missingCount / rows.length) * 100).toFixed(1) : '0';

                  let statsDisplay = '—';
                  let distributionPercent: number | null = null;
                  if (col.type === 'number' && col.min !== undefined && col.max !== undefined && col.mean !== undefined) {
                    const minStr = col.min.toLocaleString();
                    const meanStr = col.mean.toFixed(2);
                    const maxStr = col.max.toLocaleString();
                    statsDisplay = `${minStr} / ${meanStr} / ${maxStr}`;
                    const range = col.max - col.min;
                    distributionPercent = range > 0 ? Math.min(100, Math.max(0, ((col.mean - col.min) / range) * 100)) : 50;
                  }

                  return (
                    <tr key={col.key} className="hover:bg-bg/50 transition-colors">
                      <td className="py-2.5 px-4 font-semibold text-ink">{col.label}</td>
                      <td className="py-2.5 px-4">
                        <Badge variant={col.type}>{col.type}</Badge>
                      </td>
                      <td className="py-2.5 px-4 text-ink-muted">
                        {missingPercent}% ({col.missingCount})
                      </td>
                      <td className="py-2.5 px-4 text-ink-muted">
                        {col.uniqueCount.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 text-ink-muted">
                        <div className="flex items-center gap-2">
                          <span className="truncate max-w-[180px]">{statsDisplay}</span>
                          {distributionPercent !== null && (
                            <div className="hidden sm:flex items-center gap-1 w-20 shrink-0">
                              <div className="w-full bg-line rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-accent-orange h-1.5 rounded-full"
                                  style={{ width: `${distributionPercent}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 3. Interactive Data Preview Table with search, sorting & cell copying */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h4 className="font-mono font-bold text-base text-ink">Data Preview</h4>
            <span className="font-mono text-xs text-ink-subtle">
              Showing {previewRows.length} of {processedRows.length.toLocaleString()} rows
              {tableSearch && ' (filtered)'} · Click headers to sort, click cells to copy
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search within preview */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-ink-subtle" />
              <input
                type="text"
                placeholder="Search rows..."
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                className="pl-8 pr-3 py-1 bg-bg border border-line rounded-lg text-xs font-mono text-ink placeholder:text-ink-subtle outline-none focus:border-ink w-36 sm:w-48"
              />
            </div>

            {/* Page size toggle */}
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-bg border border-line rounded-lg text-xs font-mono text-ink px-2 py-1 outline-none"
              aria-label="Rows per page"
            >
              <option value={25}>25 rows</option>
              <option value={50}>50 rows</option>
              <option value={100}>100 rows</option>
            </select>

            {/* Quick Export Clean CSV button */}
            <Button
              variant="outline"
              size="sm"
              onClick={downloadCleanCsv}
              className="gap-1.5 text-xs py-1"
              title="Download cleaned CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </Button>
          </div>
        </div>

        <div className="border border-line rounded-2xl overflow-hidden bg-card max-h-[360px] overflow-y-auto">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead className="sticky top-0 z-10 bg-bg border-b border-line shadow-sm">
                <tr className="text-ink-muted">
                  <th className="py-2.5 px-3 font-semibold text-ink-subtle w-12 text-center">#</th>
                  {columns.map((c) => {
                    const isSorted = sortKey === c.key;
                    return (
                      <th
                        key={c.key}
                        onClick={() => handleHeaderSort(c.key)}
                        className="py-2.5 px-4 font-semibold truncate max-w-[200px] cursor-pointer hover:text-ink select-none transition-colors"
                        title="Click to sort by this column"
                      >
                        <div className="inline-flex items-center gap-1.5">
                          <span>{c.label}</span>
                          {isSorted ? (
                            sortDir === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-accent-orange" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-accent-orange" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-ink-subtle opacity-50" />
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {previewRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-bg/40 transition-colors">
                    <td className="py-2 px-3 text-ink-subtle text-center select-none">{idx + 1}</td>
                    {columns.map((c) => {
                      const val = row[c.key];
                      const cellId = `${idx}-${c.key}`;
                      const isCopied = copiedCell === cellId;

                      return (
                        <td
                          key={c.key}
                          onClick={() => copyCellValue(val, cellId)}
                          className={`py-2 px-4 truncate max-w-[200px] cursor-pointer hover:bg-line/40 transition-colors group relative ${
                            val === null || val === undefined ? 'text-ink-subtle italic' : 'text-ink'
                          }`}
                          title="Click to copy value"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="truncate">{val === null || val === undefined ? '—' : String(val)}</span>
                            {isCopied ? (
                              <Check className="w-3 h-3 text-success shrink-0" />
                            ) : (
                              <Copy className="w-3 h-3 text-ink-subtle opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. Cleaning Report Section */}
      <div className="p-4 sm:p-5 rounded-2xl bg-card border border-line text-left">
        <h4 className="font-mono font-bold text-sm text-ink mb-2 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-accent-orange" />
          <span>Cleaning & Transformation Log</span>
        </h4>
        <ul className="list-disc list-inside space-y-1 font-mono text-xs text-ink-muted">
          <li>Removed {report.removedDuplicateRows} duplicate row(s).</li>
          <li>Dropped {report.removedEmptyRows} empty row(s) and {report.removedEmptyColumns} empty column(s).</li>
          {report.renamedHeaders.length > 0 ? (
            <li>Renamed headers: {report.renamedHeaders.map((r) => `"${r.from}" → "${r.to}"`).join(', ')}.</li>
          ) : (
            <li>No column headers required renaming.</li>
          )}
          {report.normalizedNumericColumns.length > 0 ? (
            <li>Cleaned formatted numeric tokens in: {report.normalizedNumericColumns.join(', ')}.</li>
          ) : (
            <li>Numeric columns were already cleanly formatted.</li>
          )}
          <li>Total missing or invalid values converted to null: {report.missingValueCells}.</li>
          {report.truncated && <li className="text-warning">Dataset capped at 100,000 rows.</li>}
        </ul>
      </div>

      {/* 5. Navigation Footer to Visualization */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          size="md"
          onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', tab: 'ingestion' })}
        >
          ← Ingestion
        </Button>

        <Button
          variant="primary"
          size="lg"
          onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', tab: 'visualization' })}
          className="gap-2 shadow-sm"
        >
          <span>Build a chart</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
