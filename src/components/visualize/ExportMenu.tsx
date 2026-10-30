import React from 'react';
import { Download, ChevronDown, Image as ImageIcon, FileCode } from 'lucide-react';
import { Button } from '../ui/Button';
import { downloadChart } from '../../lib/export/exporter';
import { useApp } from '../../state/store';

interface ExportMenuProps {
  containerRef: React.RefObject<HTMLDivElement>;
  title: string;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({ containerRef, title }) => {
  const { showToast } = useApp();
  const [open, setOpen] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async (format: 'png2x' | 'png3x' | 'svg') => {
    if (!containerRef.current) return;
    setExporting(true);
    setOpen(false);
    try {
      await downloadChart({
        containerEl: containerRef.current,
        title,
        format,
        onToast: showToast,
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="relative inline-flex" ref={menuRef}>
      {/* Primary 2x PNG button */}
      <Button
        variant="primary"
        size="md"
        disabled={exporting}
        onClick={() => handleExport('png2x')}
        className="rounded-r-none border-r border-black/20 dark:border-white/20 gap-2"
      >
        <Download className="w-4 h-4" />
        <span>{exporting ? 'Exporting...' : 'Download PNG'}</span>
      </Button>

      {/* Dropdown toggle for 3x and SVG */}
      <button
        type="button"
        disabled={exporting}
        onClick={() => setOpen(!open)}
        className="bg-ink text-bg hover:opacity-90 px-2.5 rounded-r-full transition-opacity flex items-center justify-center border-l border-black/20 dark:border-white/20"
        aria-label="More export options"
      >
        <ChevronDown className="w-4 h-4" />
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-card border border-line rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 font-mono text-xs">
          <button
            type="button"
            onClick={() => handleExport('png2x')}
            className="w-full text-left px-4 py-2 hover:bg-bg flex items-center gap-2.5 text-ink transition-colors"
          >
            <ImageIcon className="w-3.5 h-3.5 text-ink-subtle" />
            <span>PNG standard (2x)</span>
          </button>
          <button
            type="button"
            onClick={() => handleExport('png3x')}
            className="w-full text-left px-4 py-2 hover:bg-bg flex items-center gap-2.5 text-ink transition-colors"
          >
            <ImageIcon className="w-3.5 h-3.5 text-ink-subtle" />
            <span>PNG high-res (3x)</span>
          </button>
          <button
            type="button"
            onClick={() => handleExport('svg')}
            className="w-full text-left px-4 py-2 hover:bg-bg flex items-center gap-2.5 text-ink transition-colors"
          >
            <FileCode className="w-3.5 h-3.5 text-ink-subtle" />
            <span>Vector SVG</span>
          </button>
        </div>
      )}
    </div>
  );
};
