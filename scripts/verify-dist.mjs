import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.js': 'text/javascript',
  '.css': 'text/css'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';

  let filePath = path.join(distDir, reqPath);

  // If path doesn't have an extension, try directory index.html (cleanUrls)
  if (!path.extname(filePath)) {
    const dirIndex = path.join(filePath, 'index.html');
    if (fs.existsSync(dirIndex)) {
      filePath = dirIndex;
    }
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    // 404
    const err404Path = path.join(distDir, '404.html');
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    if (fs.existsSync(err404Path)) {
      fs.createReadStream(err404Path).pipe(res);
    } else {
      res.end('404 Not Found');
    }
  }
});

const PORT = 4173;
server.listen(PORT, async () => {
  console.log(`Test server running at http://localhost:${PORT}`);

  const endpoints = [
    '/',
    '/csv-to-chart',
    '/excel-to-chart',
    '/csv-to-bar-chart',
    '/csv-to-line-chart',
    '/csv-to-line-graph',
    '/csv-to-pie-chart',
    '/csv-to-scatter-plot',
    '/privacy',
    '/og-image.png',
    '/sitemap.xml',
    '/robots.txt',
    '/llms.txt',
    '/llms-full.txt',
    '/humans.txt',
    '/.well-known/security.txt',
    '/site.webmanifest',
    '/non-existent-route-for-testing'
  ];

  let allPassed = true;

  for (const ep of endpoints) {
    try {
      const resp = await fetch(`http://localhost:${PORT}${ep}`);
      const contentType = resp.headers.get('content-type');
      const text = await resp.text();

      if (ep === '/non-existent-route-for-testing') {
        const is404 = resp.status === 404;
        const has404Text = text.includes('Page Not Found');
        console.log(`CHECK ${ep} => Status: ${resp.status} (Expected 404), has404Content: ${has404Text}`);
        if (!is404 || !has404Text) allPassed = false;
      } else if (ep === '/og-image.png') {
        const is200 = resp.status === 200;
        const isPng = contentType.includes('image/png');
        console.log(`CHECK ${ep} => Status: ${resp.status}, Content-Type: ${contentType} (Expected image/png)`);
        if (!is200 || !isPng) allPassed = false;
      } else {
        const is200 = resp.status === 200;
        const hasH1 = text.includes('<h1');
        const hasContent = text.includes('id="seo-content"');
        console.log(`CHECK ${ep} => Status: ${resp.status}, Content-Type: ${contentType}, hasH1: ${hasH1 || ep.endsWith('.xml') || ep.endsWith('.txt')}`);
        if (!is200) allPassed = false;
      }
    } catch (e) {
      console.error(`ERROR fetching ${ep}:`, e);
      allPassed = false;
    }
  }

  console.log(`\nOverall Verification: ${allPassed ? 'ALL PASSED ✓' : 'FAILED ✗'}`);
  server.close();
  process.exit(allPassed ? 0 : 1);
});
