import fs from 'node:fs';

const html = fs.readFileSync('dist/index.html', 'utf8');

// 1. JSON-LD check
const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
if (!match) {
  console.error('FAIL: No JSON-LD found');
  process.exit(1);
}

try {
  const jsonLd = JSON.parse(match[1]);
  console.log('PASS: JSON-LD is valid JSON');
  console.log('Graph entities count:', jsonLd['@graph'].length);
  for (const item of jsonLd['@graph']) {
    console.log(` - ${item['@type']}: ${item['@id'] || item.name || 'unnamed'}`);
  }
} catch (err) {
  console.error('FAIL: JSON-LD parse error:', err.message);
  process.exit(1);
}

// 2. Head tags check
const checks = [
  { name: 'title', regex: /<title>(.*?)<\/title>/ },
  { name: 'meta description', regex: /<meta\s+name="description"\s+content="(.*?)"/ },
  { name: 'author', regex: /<meta\s+name="author"\s+content="iqplotter"/ },
  { name: 'generator', regex: /<meta\s+name="generator"/ },
  { name: 'robots', regex: /<meta\s+name="robots"/ },
  { name: 'googlebot', regex: /<meta\s+name="googlebot"/ },
  { name: 'bingbot', regex: /<meta\s+name="bingbot"/ },
  { name: 'canonical', regex: /<link\s+rel="canonical"\s+href="https:\/\/iqplotter\.web\.app\/"/ },
  { name: 'alternate en', regex: /<link\s+rel="alternate"\s+hreflang="en"/ },
  { name: 'alternate x-default', regex: /<link\s+rel="alternate"\s+hreflang="x-default"/ },
  { name: 'og:image 1200x630', regex: /<meta\s+property="og:image:width"\s+content="1200"/ },
  { name: 'twitter:card', regex: /<meta\s+name="twitter:card"\s+content="summary_large_image"/ },
  { name: 'manifest link', regex: /<link\s+rel="manifest"\s+href="\/site\.webmanifest"/ },
  { name: 'preconnect fonts', regex: /<link\s+rel="preconnect"\s+href="https:\/\/fonts\.gstatic\.com"/ },
  { name: 'noscript fallback', regex: /<noscript>[\s\S]*?<\/noscript>/ }
];

let allOk = true;
for (const c of checks) {
  const found = c.regex.test(html);
  if (!found) {
    console.error(`FAIL: ${c.name} not found`);
    allOk = false;
  } else {
    console.log(`PASS: ${c.name}`);
  }
}

if (!allOk) {
  process.exit(1);
}

// 3. Length checks
const titleMatch = html.match(/<title>(.*?)<\/title>/);
const descMatch = html.match(/<meta\s+name="description"\s+content="(.*?)"/);

if (titleMatch) {
  console.log(`Title length: ${titleMatch[1].length} chars ("${titleMatch[1]}")`);
}
if (descMatch) {
  console.log(`Meta description length: ${descMatch[1].length} chars ("${descMatch[1]}")`);
}

console.log('\nAll SEO & GEO verification checks PASSED!');
