import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const outDir = path.resolve('public');

// 1. Generate og-image.png (1200x630)
const ogSvg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#141210" />
      <stop offset="100%" stop-color="#1F1C18" />
    </linearGradient>
    <linearGradient id="barGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FF8A3D" />
      <stop offset="100%" stop-color="#F26B21" />
    </linearGradient>
    <linearGradient id="barGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FCDDC2" />
      <stop offset="100%" stop-color="#F7CDA6" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bgGrad)" />

  <!-- Subtle grid lines in chart area -->
  <g stroke="#2C2824" stroke-width="2" stroke-dasharray="4 6">
    <line x1="680" y1="160" x2="1100" y2="160" />
    <line x1="680" y1="240" x2="1100" y2="240" />
    <line x1="680" y1="320" x2="1100" y2="320" />
    <line x1="680" y1="400" x2="1100" y2="400" />
    <line x1="680" y1="480" x2="1100" y2="480" />
  </g>

  <!-- Left Side: Brand & Messaging -->
  <!-- Brand logo mark -->
  <g transform="translate(100, 120)">
    <rect width="64" height="64" rx="16" fill="#1A1714" stroke="#332D27" stroke-width="2" />
    <rect x="12" y="36" width="10" height="16" rx="2" fill="#F26B21" />
    <rect x="26" y="24" width="10" height="28" rx="2" fill="#F7CDA6" />
    <rect x="40" y="14" width="10" height="38" rx="2" fill="#FAF7E9" />
  </g>

  <!-- Wordmark -->
  <text x="180" y="165" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="900" font-size="44" fill="#FAF7E9" letter-spacing="-1">iqplotter</text>
  <circle cx="340" cy="158" r="5" fill="#F26B21" />

  <!-- Tagline / Headline -->
  <text x="100" y="270" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="800" font-size="52" fill="#FAF7E9" letter-spacing="-1.5">
    Turn CSV into charts
  </text>
  <text x="100" y="335" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="800" font-size="52" fill="#F26B21" letter-spacing="-1.5">
    instantly in browser.
  </text>

  <!-- Feature badges -->
  <g transform="translate(100, 390)">
    <!-- Badge 1 -->
    <rect x="0" y="0" width="130" height="38" rx="19" fill="#26221D" stroke="#38322B" stroke-width="1.5" />
    <text x="65" y="24" font-family="'Courier New', Courier, monospace" font-weight="600" font-size="15" fill="#FAF7E9" text-anchor="middle">100% PRIVATE</text>

    <!-- Badge 2 -->
    <rect x="145" y="0" width="120" height="38" rx="19" fill="#26221D" stroke="#38322B" stroke-width="1.5" />
    <text x="205" y="24" font-family="'Courier New', Courier, monospace" font-weight="600" font-size="15" fill="#FAF7E9" text-anchor="middle">NO UPLOAD</text>

    <!-- Badge 3 -->
    <rect x="280" y="0" width="115" height="38" rx="19" fill="#26221D" stroke="#38322B" stroke-width="1.5" />
    <text x="337" y="24" font-family="'Courier New', Courier, monospace" font-weight="600" font-size="15" fill="#FAF7E9" text-anchor="middle">FREE FOREVER</text>
  </g>

  <text x="100" y="490" font-family="'Courier New', Courier, monospace" font-weight="500" font-size="18" fill="#A89F91">
    Bar · Line · Scatter · Pie Charts · Auto Data Cleaning
  </text>

  <!-- Right Side: Beautiful Chart Window Card -->
  <g transform="translate(660, 100)">
    <!-- Card Frame -->
    <rect width="450" height="420" rx="20" fill="#1C1916" stroke="#332D27" stroke-width="2" />
    
    <!-- Window header -->
    <circle cx="30" cy="28" r="6" fill="#F26B21" />
    <circle cx="50" cy="28" r="6" fill="#F7CDA6" opacity="0.6" />
    <circle cx="70" cy="28" r="6" fill="#3D362F" />
    <text x="225" y="32" font-family="'Courier New', Courier, monospace" font-size="13" fill="#8C8477" text-anchor="middle">monthly-revenue.csv</text>
    <line x1="0" y1="56" x2="450" y2="56" stroke="#2C2824" stroke-width="1.5" />

    <!-- Chart Bars -->
    <!-- Bar 1 -->
    <rect x="50" y="260" width="46" height="110" rx="6" fill="url(#barGrad1)" />
    <text x="73" y="390" font-family="'Courier New', Courier, monospace" font-size="12" fill="#8C8477" text-anchor="middle">Jan</text>
    
    <!-- Bar 2 -->
    <rect x="115" y="190" width="46" height="180" rx="6" fill="url(#barGrad2)" />
    <text x="138" y="390" font-family="'Courier New', Courier, monospace" font-size="12" fill="#8C8477" text-anchor="middle">Feb</text>

    <!-- Bar 3 -->
    <rect x="180" y="220" width="46" height="150" rx="6" fill="url(#barGrad1)" />
    <text x="203" y="390" font-family="'Courier New', Courier, monospace" font-size="12" fill="#8C8477" text-anchor="middle">Mar</text>

    <!-- Bar 4 -->
    <rect x="245" y="140" width="46" height="230" rx="6" fill="url(#barGrad2)" />
    <text x="268" y="390" font-family="'Courier New', Courier, monospace" font-size="12" fill="#8C8477" text-anchor="middle">Apr</text>

    <!-- Bar 5 -->
    <rect x="310" y="100" width="46" height="270" rx="6" fill="url(#barGrad1)" />
    <text x="333" y="390" font-family="'Courier New', Courier, monospace" font-size="12" fill="#8C8477" text-anchor="middle">May</text>

    <!-- Bar 6 -->
    <rect x="375" y="125" width="46" height="245" rx="6" fill="url(#barGrad2)" />
    <text x="398" y="390" font-family="'Courier New', Courier, monospace" font-size="12" fill="#8C8477" text-anchor="middle">Jun</text>

    <!-- Trend line overlay -->
    <polyline points="73,250 138,180 203,210 268,130 333,90 398,115" fill="none" stroke="#FAF7E9" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="73" cy="250" r="4" fill="#FAF7E9" />
    <circle cx="138" cy="180" r="4" fill="#FAF7E9" />
    <circle cx="203" cy="210" r="4" fill="#FAF7E9" />
    <circle cx="268" cy="130" r="4" fill="#FAF7E9" />
    <circle cx="333" cy="90" r="4" fill="#FAF7E9" />
    <circle cx="398" cy="115" r="4" fill="#FAF7E9" />
  </g>
</svg>
`;

// Favicon SVG base
const faviconSvg = fs.readFileSync(path.resolve('public/favicon.svg'), 'utf8');

async function main() {
  // 1. Write OG Image
  console.log('Generating public/og-image.png...');
  await sharp(Buffer.from(ogSvg))
    .png({ quality: 90, compressionLevel: 8 })
    .toFile(path.join(outDir, 'og-image.png'));
  const ogStats = fs.statSync(path.join(outDir, 'og-image.png'));
  console.log(`og-image.png generated: ${(ogStats.size / 1024).toFixed(1)} KB (target < 300KB)`);

  // 2. Generate icons from favicon.svg
  // favicon-16x16.png (16x16)
  console.log('Generating favicon-16x16.png (16x16)...');
  await sharp(Buffer.from(faviconSvg))
    .resize(16, 16)
    .png()
    .toFile(path.join(outDir, 'favicon-16x16.png'));

  // favicon-32x32.png (32x32)
  console.log('Generating favicon-32x32.png (32x32)...');
  await sharp(Buffer.from(faviconSvg))
    .resize(32, 32)
    .png()
    .toFile(path.join(outDir, 'favicon-32x32.png'));

  // apple-touch-icon.png (180x180)
  console.log('Generating apple-touch-icon.png (180x180)...');
  await sharp(Buffer.from(faviconSvg))
    .resize(180, 180)
    .png()
    .toFile(path.join(outDir, 'apple-touch-icon.png'));

  // icon-192.png (192x192)
  console.log('Generating icon-192.png (192x192)...');
  await sharp(Buffer.from(faviconSvg))
    .resize(192, 192)
    .png()
    .toFile(path.join(outDir, 'icon-192.png'));

  // icon-512.png (512x512)
  console.log('Generating icon-512.png (512x512)...');
  await sharp(Buffer.from(faviconSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(outDir, 'icon-512.png'));

  // icon-512-maskable.png (512x512 with safe area padding)
  console.log('Generating icon-512-maskable.png (512x512 maskable)...');
  // Maskable icon needs ~20% safe zone padding around center
  const innerSize = Math.round(512 * 0.7);
  const padding = Math.round((512 - innerSize) / 2);
  const innerBuffer = await sharp(Buffer.from(faviconSvg))
    .resize(innerSize, innerSize)
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 26, g: 23, b: 20, alpha: 1 } // #1A1714 brand background
    }
  })
    .composite([{ input: innerBuffer, top: padding, left: padding }])
    .png()
    .toFile(path.join(outDir, 'icon-512-maskable.png'));

  console.log('All image assets generated successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
