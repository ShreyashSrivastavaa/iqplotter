import React, { useRef, useState } from 'react';
import { Upload, Lock, FileSpreadsheet, ArrowRight, Trash2, RotateCw, FileText, Sparkles, BarChart3 } from 'lucide-react';
import { useApp } from '../../state/store';
import { parseCsvFile } from '../../lib/csv/parser';
import { Button } from '../ui/Button';
import { Spinner, ProgressBar } from '../ui/Spinner';
import { ParseErrorCard } from './ParseErrorCard';
import { CleaningNotice } from './CleaningNotice';
import { loadHistory } from '../../lib/storage/history';
import { HistoryItem } from '../../lib/storage/history';
import { useTranslation } from 'react-i18next';

export const IngestionPanel: React.FC = () => {
  const { t } = useTranslation();
  const { state, dispatch, showToast, loadSampleByName } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [ingestMode, setIngestMode] = useState<'upload' | 'paste'>('upload');
  const [pastedText, setPastedText] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [parsingProgress, setParsingProgress] = useState<number | null>(null);
  const [currentFilename, setCurrentFilename] = useState<string>('');
  const [recentFiles, setRecentFiles] = useState<HistoryItem[]>([]);

  // Load recent files on mount
  React.useEffect(() => {
    loadHistory(state.user?.uid).then((items) => {
      setRecentFiles(items.slice(0, 3));
    });
  }, [state.dataset, state.user?.uid]);

  const processFile = async (file: File) => {
    setCurrentFilename(file.name);
    setParsingProgress(file.size > 2 * 1024 * 1024 ? 1 : null);
    dispatch({ type: 'START_PARSING', filename: file.name });

    try {
      const result = await parseCsvFile(file, (percent) => {
        setParsingProgress(percent);
      });

      dispatch({
        type: 'PARSE_SUCCESS',
        dataset: result.dataset,
        config: result.config!,
        notices: result.notices,
      });

      showToast(`Loaded ${file.name}`);
    } catch (err: unknown) {
      console.error('File parsing error:', err);
      if (err && typeof err === 'object' && 'code' in err) {
        dispatch({ type: 'PARSE_ERROR', error: err as import('../../state/types').AppError });
      } else {
        dispatch({
          type: 'PARSE_ERROR',
          error: {
            code: 'PARSE_FAILED',
            message: (err as Error)?.message || "We couldn't read this file.",
          },
        });
      }
    } finally {
      setParsingProgress(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (e.target.files && e.target.files.length > 1) {
        dispatch({ type: 'ADD_NOTICE', notice: 'Multiple files dropped; processing the first one.' });
      }
      processFile(file);
    }
    // reset input
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (e.dataTransfer.files.length > 1) {
        dispatch({ type: 'ADD_NOTICE', notice: 'Multiple files dropped; processing the first one.' });
      }
      processFile(file);
    }
  };

  const handlePasteSubmit = () => {
    const trimmed = pastedText.trim();
    if (!trimmed) {
      showToast('Please paste some CSV or tabular data first.', true);
      return;
    }
    const virtualFile = new File([trimmed], 'pasted-data.csv', { type: 'text/csv' });
    processFile(virtualFile);
  };

  const loadExampleIntoPaste = (exampleType: 'sales' | 'grades') => {
    if (exampleType === 'sales') {
      setPastedText(`Month,Product,Revenue,Units\n2024-01,Alpha,12500,42\n2024-02,Alpha,14200,48\n2024-03,Beta,9800,31\n2024-04,Beta,16400,55\n2024-05,Gamma,18900,62`);
    } else {
      setPastedText(`Student,Math,Physics,Chemistry,Attendance\nAlice,92,88,95,98%\nBob,74,80,69,85%\nCharlie,88,91,84,92%\nDiana,95,96,98,99%\nEvan,68,72,70,81%`);
    }
    showToast('Sample copied into editor');
  };

  // If there is an active error
  if (state.status === 'error' && state.error) {
    return (
      <ParseErrorCard
        error={state.error}
        onReset={() => dispatch({ type: 'CLEAR_DATASET' })}
      />
    );
  }

  // If currently parsing
  if (state.status === 'parsing') {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <Spinner size="lg" className="mb-4" />
        <p className="font-mono font-semibold text-base text-ink mb-1">
          {t('ingestion.parsingFile', { filename: currentFilename || 'file' })}
        </p>
        <p className="font-mono text-xs text-ink-muted mb-4">{t('ingestion.cleaningInferring')}</p>
        {parsingProgress !== null && (
          <div className="w-full max-w-xs mt-2">
            <ProgressBar progress={parsingProgress} label="Reading file" />
          </div>
        )}
      </div>
    );
  }

  // Loaded State: file summary, replace/clear and Continue to inspection
  if (state.dataset) {
    const rowCount = state.dataset.rows.length;
    const colCount = state.dataset.columns.length;
    const sizeStr = state.dataset.rawSizeBytes
      ? `${(state.dataset.rawSizeBytes / 1024).toFixed(1)} KB`
      : 'In-memory';

    return (
      <div className="w-full max-w-3xl mx-auto py-4 text-center">
        {state.dataset.report && <CleaningNotice report={state.dataset.report} />}

        <div className="p-6 sm:p-8 rounded-2xl border border-line bg-card shadow-sm flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-bg border border-line flex items-center justify-center text-ink mb-4 shadow-xs">
            <FileSpreadsheet className="w-7 h-7 text-ink" />
          </div>

          <h3 className="font-mono font-bold text-lg sm:text-xl text-ink mb-1 truncate max-w-full">
            {state.dataset.name}
          </h3>

          <p className="font-mono text-xs sm:text-sm text-ink-muted mb-6">
            {rowCount.toLocaleString()} {t('ingestion.rows')} · {colCount} {t('ingestion.columns')} · {sizeStr}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', tab: 'inspection' })}
              className="gap-2"
            >
              <span>{t('ingestion.continueInspection')}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="md"
              onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', tab: 'visualization' })}
              className="gap-2 text-accent-orange border-accent-orange/40 hover:bg-bg"
            >
              <BarChart3 className="w-4 h-4 text-accent-orange" />
              <span>{t('ingestion.jumpToChart')}</span>
            </Button>

            <Button
              variant="outline"
              size="md"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>{t('ingestion.replaceFile')}</span>
            </Button>

            <Button
              variant="ghost"
              size="md"
              onClick={() => dispatch({ type: 'CLEAR_DATASET' })}
              className="gap-2 text-danger hover:text-danger/80"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t('ingestion.clear')}</span>
            </Button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.tsv,.txt,.xlsx"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    );
  }

  // Empty State: Ingestion mode switch + Dropzone or Paste tab
  return (
    <div className="w-full max-w-3xl mx-auto py-2">
      {/* Mode switcher tabs (Dropzone vs Paste) */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <button
          type="button"
          onClick={() => setIngestMode('upload')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xs sm:text-sm transition-all ${
            ingestMode === 'upload'
              ? 'bg-ink text-bg font-semibold shadow-xs'
              : 'text-ink-muted hover:text-ink hover:bg-card border border-transparent'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>{t('ingestion.uploadTab')}</span>
        </button>
        <button
          type="button"
          onClick={() => setIngestMode('paste')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xs sm:text-sm transition-all ${
            ingestMode === 'paste'
              ? 'bg-ink text-bg font-semibold shadow-xs'
              : 'text-ink-muted hover:text-ink hover:bg-card border border-transparent'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{t('ingestion.pasteTab')}</span>
        </button>
      </div>

      {ingestMode === 'upload' ? (
        /* Large dashed dropzone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`w-full min-h-[300px] sm:min-h-[340px] rounded-[20px] p-8 sm:p-12 flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer ${
            isDragOver
              ? 'border-2 border-ink bg-bg/90 scale-[0.99] ring-4 ring-accent-orange/20'
              : 'border-2 border-dashed border-outline bg-transparent hover:bg-bg/60'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-14 h-14 rounded-full bg-bg border border-line flex items-center justify-center text-ink mb-4 shadow-xs">
            <Upload className="w-6 h-6 text-ink" />
          </div>

          <h3 className="font-mono font-bold text-lg sm:text-xl text-ink mb-3">
            {isDragOver ? t('ingestion.dropzoneRelease') : t('ingestion.dropzoneTitle')}
          </h3>

          <Button
            id="browse-files-btn"
            variant="primary"
            size="md"
            className="mb-4 pointer-events-auto shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            {t('ingestion.browseFiles')}
          </Button>

          <p className="font-mono text-xs sm:text-sm text-ink-subtle mb-3">
            {t('ingestion.fileLimits')}
          </p>

          <div className="inline-flex items-center gap-1.5 font-mono text-xs text-ink-muted">
            <Lock className="w-3.5 h-3.5 text-success" />
            <span>{t('app.privacyNotice')}</span>
          </div>
        </div>
      ) : (
        /* Interactive Paste Data Box */
        <div className="w-full rounded-[20px] p-5 sm:p-6 border border-line bg-card shadow-sm flex flex-col gap-3 font-mono">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-ink flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-accent-orange" />
              <span>{t('ingestion.pasteTitle')}</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-ink-subtle text-[11px]">{t('ingestion.loadExample')}</span>
              <button
                type="button"
                onClick={() => loadExampleIntoPaste('sales')}
                className="px-2 py-0.5 rounded bg-bg hover:bg-line text-ink text-[11px] transition-colors"
              >
                {t('ingestion.exampleSales')}
              </button>
              <button
                type="button"
                onClick={() => loadExampleIntoPaste('grades')}
                className="px-2 py-0.5 rounded bg-bg hover:bg-line text-ink text-[11px] transition-colors"
              >
                {t('ingestion.exampleGrades')}
              </button>
            </div>
          </div>

          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Paste your CSV or TSV data here...&#10;e.g.&#10;Product,Price,Quantity&#10;Widget A,19.99,120&#10;Widget B,34.50,85"
            rows={8}
            className="w-full p-3.5 rounded-xl border border-line bg-bg text-ink font-mono text-xs focus:outline-none focus:border-ink resize-y leading-relaxed"
          />

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-ink-subtle text-[11px]">
              {pastedText ? `${pastedText.split('\n').filter(Boolean).length} lines · ${pastedText.length} chars` : '0 lines'}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPastedText('')}
                disabled={!pastedText}
              >
                {t('ingestion.clearText')}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handlePasteSubmit}
                disabled={!pastedText.trim()}
                className="gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-accent-orange" />
                <span>{t('ingestion.loadPasted')}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.tsv,.txt,.xlsx"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Sample Data Chips */}
      <div className="mt-8 text-center">
        <p className="font-mono text-xs sm:text-sm text-ink-muted mb-3">{t('ingestion.orExploreSamples')}</p>
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={() => loadSampleByName('monthly-sales.csv')}
            className="px-4 py-2 rounded-full border border-outline bg-transparent font-mono text-xs sm:text-sm text-ink hover:bg-card transition-colors flex items-center gap-2 group"
          >
            <span>{t('hero.sampleSales')}</span>
            <span className="text-[10px] text-ink-subtle px-1.5 py-0.5 rounded-full bg-bg border border-line group-hover:border-outline">{t('hero.rowsCount', { count: 96 })}</span>
          </button>
          <button
            type="button"
            onClick={() => loadSampleByName('daily-temperature.csv')}
            className="px-4 py-2 rounded-full border border-outline bg-transparent font-mono text-xs sm:text-sm text-ink hover:bg-card transition-colors flex items-center gap-2 group"
          >
            <span>{t('hero.sampleWeather')}</span>
            <span className="text-[10px] text-ink-subtle px-1.5 py-0.5 rounded-full bg-bg border border-line group-hover:border-outline">{t('hero.rowsCount', { count: 180 })}</span>
          </button>
          <button
            type="button"
            onClick={() => loadSampleByName('exam-scores.csv')}
            className="px-4 py-2 rounded-full border border-outline bg-transparent font-mono text-xs sm:text-sm text-ink hover:bg-card transition-colors flex items-center gap-2 group"
          >
            <span>{t('hero.sampleScores')}</span>
            <span className="text-[10px] text-ink-subtle px-1.5 py-0.5 rounded-full bg-bg border border-line group-hover:border-outline">{t('hero.rowsCount', { count: 150 })}</span>
          </button>
        </div>
      </div>

      {/* Recent Files from History if available */}
      {recentFiles.length > 0 && (
        <div className="mt-8 pt-6 border-t border-line text-left">
          <p className="font-mono text-xs text-ink-subtle mb-2 uppercase tracking-wider">{t('ingestion.recentFiles')}</p>
          <div className="flex flex-col gap-1.5">
            {recentFiles.map((item) => (
              <div
                key={item.id}
                onClick={() =>
                  dispatch({
                    type: 'RESTORE_DATASET_AND_CONFIG',
                    dataset: item.dataset,
                    config: item.config,
                  })
                }
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-bg border border-transparent hover:border-line cursor-pointer transition-colors"
              >
                <div className="truncate font-mono text-xs">
                  <span className="font-semibold text-ink">{item.name}</span>
                  <span className="text-ink-subtle ml-2">
                    {item.rowCount} rows · {item.colCount} cols
                  </span>
                </div>
                <span className="text-[11px] font-mono text-ink-subtle">Open →</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
