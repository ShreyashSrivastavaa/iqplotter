import { slugify } from './slugify';

export interface ExportOptions {
  containerEl: HTMLElement;
  title: string;
  format: 'png2x' | 'png3x' | 'svg';
  onToast?: (msg: string, isError?: boolean) => void;
}

/**
 * Creates a standalone SVG string containing white background, title and embedded chart SVG
 */
export async function generateExportSvg(
  containerEl: HTMLElement,
  titleText: string
): Promise<{ svgString: string; width: number; height: number }> {
  const svgEl = containerEl.querySelector('svg');
  if (!svgEl) {
    throw new Error('Chart SVG element not found in container');
  }

  // Clone SVG
  const clonedSvg = svgEl.cloneNode(true) as SVGSVGElement;

  // Inline computed fonts/styles on text elements
  const originalTexts = svgEl.querySelectorAll('text, tspan');
  const clonedTexts = clonedSvg.querySelectorAll('text, tspan');

  for (let i = 0; i < originalTexts.length; i++) {
    const orig = originalTexts[i];
    const clone = clonedTexts[i];
    if (orig && clone) {
      const computed = window.getComputedStyle(orig);
      clone.setAttribute('fill', computed.fill);
      clone.setAttribute('font-family', computed.fontFamily);
      clone.setAttribute('font-size', computed.fontSize);
      clone.setAttribute('font-weight', computed.fontWeight);
    }
  }

  const svgRect = svgEl.getBoundingClientRect();
  const chartWidth = Math.round(svgRect.width) || 800;
  const chartHeight = Math.round(svgRect.height) || 450;

  const padding = 24;
  const titleHeight = 36;
  const totalWidth = chartWidth + padding * 2;
  const totalHeight = chartHeight + padding * 2 + titleHeight;

  clonedSvg.setAttribute('x', String(padding));
  clonedSvg.setAttribute('y', String(padding + titleHeight));
  clonedSvg.setAttribute('width', String(chartWidth));
  clonedSvg.setAttribute('height', String(chartHeight));

  const wrapperSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  wrapperSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  wrapperSvg.setAttribute('viewBox', `0 0 ${totalWidth} ${totalHeight}`);
  wrapperSvg.setAttribute('width', String(totalWidth));
  wrapperSvg.setAttribute('height', String(totalHeight));

  // Solid white background rect
  const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bgRect.setAttribute('width', '100%');
  bgRect.setAttribute('height', '100%');
  bgRect.setAttribute('fill', '#FFFFFF');
  wrapperSvg.appendChild(bgRect);

  // Title text element
  if (titleText) {
    const textNode = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textNode.setAttribute('x', String(padding));
    textNode.setAttribute('y', String(padding + 20));
    textNode.setAttribute('fill', '#1A1714');
    textNode.setAttribute('font-family', '"Plus Jakarta Sans", "IBM Plex Mono", sans-serif');
    textNode.setAttribute('font-size', '18px');
    textNode.setAttribute('font-weight', '700');
    textNode.textContent = titleText;
    wrapperSvg.appendChild(textNode);
  }

  wrapperSvg.appendChild(clonedSvg);

  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(wrapperSvg);

  if (!svgString.startsWith('<?xml')) {
    svgString = '<?xml version="1.0" standalone="no"?>\r\n' + svgString;
  }

  return { svgString, width: totalWidth, height: totalHeight };
}

export async function downloadChart({
  containerEl,
  title,
  format,
  onToast,
}: ExportOptions): Promise<void> {
  try {
    const { svgString, width, height } = await generateExportSvg(containerEl, title);
    const baseSlug = slugify(title);

    if (format === 'svg') {
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      if (blob.size < 100) {
        onToast?.('Export failed. Try again or check chart.', true);
        return;
      }
      triggerDownload(blob, `${baseSlug}.svg`);
      onToast?.('SVG exported successfully');
      return;
    }

    // PNG export (2x or 3x)
    const scale = format === 'png3x' ? 3 : 2;
    const filename = format === 'png3x' ? `${baseSlug}@3x.png` : `${baseSlug}.png`;

    await (document as unknown as { fonts?: { ready?: Promise<unknown> } }).fonts?.ready;

    // Create canvas capped at 8000px longest side
    let canvasWidth = width * scale;
    let canvasHeight = height * scale;
    const maxSide = 8000;

    if (canvasWidth > maxSide || canvasHeight > maxSide) {
      const ratio = Math.min(maxSide / canvasWidth, maxSide / canvasHeight);
      canvasWidth = Math.round(canvasWidth * ratio);
      canvasHeight = Math.round(canvasHeight * ratio);
    }

    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas 2D context not available');
    }

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const blobUrl = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.crossOrigin = 'anonymous';

    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        try {
          ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
          URL.revokeObjectURL(blobUrl);
          resolve();
        } catch (e) {
          URL.revokeObjectURL(blobUrl);
          reject(e);
        }
      };
      img.onerror = (e) => {
        URL.revokeObjectURL(blobUrl);
        reject(e);
      };
      img.src = blobUrl;
    });

    const pngBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/png');
    });

    if (!pngBlob || pngBlob.size < 1024) {
      onToast?.('Export failed. Try SVG instead.', true);
      return;
    }

    triggerDownload(pngBlob, filename);
    onToast?.(`PNG ${scale}x exported successfully`);
  } catch (err) {
    console.error('Export error:', err);
    onToast?.('Export failed. Try SVG instead.', true);
  }
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
