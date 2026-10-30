import React from 'react';
import { Share2, Copy, Check, ShieldCheck, Download, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { encodeShareLink } from '../../lib/share/share';
import { useApp } from '../../state/store';
import { downloadChart } from '../../lib/export/exporter';

interface SharePopoverProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

export const SharePopover: React.FC<SharePopoverProps> = ({ containerRef }) => {
  const { state, showToast } = useApp();
  const [open, setOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!state.dataset || !state.config) return null;
  const currentConfig = state.config;

  const shareInfo = encodeShareLink({
    name: state.dataset.name,
    rows: state.dataset.rows,
    config: currentConfig,
  });

  const handleCopyLink = () => {
    if (shareInfo.tooLarge || !shareInfo.url) return;
    navigator.clipboard.writeText(shareInfo.url);
    setCopied(true);
    showToast('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (!containerRef.current) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: currentConfig.title,
          text: `Check out this chart created on iqplotter: ${currentConfig.title}`,
          url: !shareInfo.tooLarge ? shareInfo.url : window.location.href,
        });
      }
    } catch {
      // User cancelled
    }
  };

  return (
    <div className="relative inline-flex" ref={popoverRef}>
      <Button
        variant="outline"
        size="md"
        onClick={() => setOpen(!open)}
        className="gap-2"
      >
        <Share2 className="w-4 h-4" />
        <span>Share</span>
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-line rounded-2xl shadow-xl p-4 z-50 animate-in fade-in zoom-in-95 font-mono text-xs">
          <h4 className="font-bold text-sm text-ink mb-2 flex items-center gap-1.5">
            <Share2 className="w-4 h-4 text-[#F26B21]" />
            <span>Share this chart</span>
          </h4>

          {/* Privacy Note */}
          <div className="bg-bg p-2.5 rounded-xl border border-line mb-3 flex items-start gap-2 text-[11px] text-ink-muted">
            <ShieldCheck className="w-4 h-4 text-[#067647] shrink-0 mt-0.5" />
            <span>Links contain your data. Nothing is stored on a server.</span>
          </div>

          {/* Link Sharing Option */}
          <div className="space-y-2 mb-3">
            <label className="text-[11px] text-ink-subtle font-semibold uppercase">Direct URL Link</label>
            {shareInfo.tooLarge ? (
              <div className="p-2.5 rounded-xl bg-[#FFFAEB] dark:bg-[#7A271A]/20 border border-[#FEDF89] dark:border-[#B54708]/30 text-[#B54708] dark:text-[#F79009] flex items-start gap-2 text-[11px]">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Dataset too large for URL sharing ({shareInfo.charCount.toLocaleString()} chars &gt; 8,000 limit). Export as image instead.
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareInfo.url}
                  className="w-full bg-bg border border-line rounded-xl px-2.5 py-1.5 text-xs truncate select-all outline-none text-ink"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="shrink-0 p-2 rounded-xl bg-ink text-bg hover:opacity-90 transition-opacity"
                  title="Copy link"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="pt-2 border-t border-line flex flex-col gap-1.5">
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="w-full text-left py-2 px-3 rounded-xl hover:bg-bg text-ink flex items-center gap-2 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5 text-ink-subtle" />
                <span>System share dialog</span>
              </button>
            )}

            <button
              type="button"
              onClick={async () => {
                if (containerRef.current) {
                  await downloadChart({
                    containerEl: containerRef.current,
                    title: state.config!.title,
                    format: 'png2x',
                    onToast: showToast,
                  });
                  setOpen(false);
                }
              }}
              className="w-full text-left py-2 px-3 rounded-xl hover:bg-bg text-ink flex items-center gap-2 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-ink-subtle" />
              <span>Download image file</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
