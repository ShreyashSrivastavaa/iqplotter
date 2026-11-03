import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const base = "https://iqplotter.web.app";
const template = readFileSync("dist/index.html", "utf8");

const pages = [
  {
    slug: "csv-to-chart",
    title: "CSV to Chart Generator – Free & Private | iqplotter",
    desc: "Convert CSV to chart online in seconds. Free in-browser CSV visualizer supporting bar, line, scatter & pie charts with zero uploads and complete privacy.",
    h1: "Convert CSV to Chart Online",
    breadcrumb: "CSV to Chart",
    intro: `
      <p class="text-ink-muted leading-relaxed text-sm sm:text-base mb-4">
        Transforming raw comma-separated value (CSV) files into visual representations is one of the most common tasks in data analysis, reporting, and dashboard development. With iqplotter's free online CSV to chart generator, you can upload or drop any standard CSV or delimiter-separated text file directly into your browser window and produce presentation-ready graphs in seconds.
      </p>
      <p class="text-ink-muted leading-relaxed text-sm sm:text-base mb-4">
        Unlike traditional spreadsheet tools that require steep learning curves or cloud platforms that force you to upload sensitive company figures, customer records, or financial metrics to external servers, iqplotter operates entirely on the client side. Your records are parsed in local memory using Web Workers and modern JavaScript engines, guaranteeing that your data remains strictly confidential and never leaves your computer.
      </p>
      <p class="text-ink-muted leading-relaxed text-sm sm:text-base mb-4">
        Whether you need to generate high-resolution bar charts for executive meetings, line charts to monitor time-series trends, or scatter plots for exploratory correlation analysis, simply select your columns from the intuitive interface above and customize titles, colors, and formatting with zero setup.
      </p>
      <p class="text-ink-muted leading-relaxed text-sm sm:text-base mb-4">
        Our built-in data health inspector automatically cleans common formatting errors: it strips excess whitespace, converts formatted numbers (e.g. $1,420.00 or 85.4%) into clean numerical values, detects ISO-8601 date strings, and warns you about missing rows or corrupted columns.
      </p>
      <p class="text-xs text-ink-subtle pt-2 border-t border-line">
        Related chart types: 
        <a href="/csv-to-bar-chart" class="underline hover:text-ink">Bar Chart</a> · 
        <a href="/csv-to-line-chart" class="underline hover:text-ink">Line Chart</a> · 
        <a href="/csv-to-pie-chart" class="underline hover:text-ink">Pie Chart</a> · 
        <a href="/csv-to-scatter-plot" class="underline hover:text-ink">Scatter Plot</a> · 
        <a href="/excel-to-chart" class="underline hover:text-ink">Excel to Chart</a>
      </p>
    `
  },
  {
    slug: "excel-to-chart",
    title: "Excel to Chart Online – Free .XLSX Plotter | iqplotter",
    desc: "Create beautiful charts from Excel .xlsx files instantly. Bar, line, scatter and pie graphs generated 100% inside your browser with complete privacy.",
    h1: "Turn Excel Data Into Charts Online",
    breadcrumb: "Excel to Chart",
    intro: `
      <p class="text-ink-muted leading-relaxed text-sm sm:text-base mb-4">
        Microsoft Excel (.xlsx and .xls) files are the bedrock of workplace accounting, scientific measurement, inventory logging, and project estimation. However, configuring native spreadsheet charting engines often feels tedious, cluttered with dialog menus, or rigid when you need to quickly inspect new worksheets without launching bloated desktop suites.
      </p>
      <p class="text-ink-muted leading-relaxed text-sm sm:text-base mb-4">
        iqplotter provides an effortless, modern alternative designed for speed, beauty, and security. Drop any workbook directly into our workspace: our in-browser reader automatically detects headers, recognizes date and numerical values, cleans anomalous empty records, and lets you toggle between chart types with a single click.
      </p>
      <p class="text-ink-muted leading-relaxed text-sm sm:text-base mb-4">
        Because every calculation runs directly inside your browser's runtime, confidential balance sheets, proprietary client listings, and internal operating expenses remain safe from third-party interception. Export crisp PNG or vector SVG visuals instantly to paste directly into slides, reports, or team wikis.
      </p>
      <p class="text-ink-muted leading-relaxed text-sm sm:text-base mb-4">
        You can also copy tabular ranges directly from Microsoft Excel or Google Sheets and paste them as raw text into our ingestion panel for immediate visualization without needing to save separate files.
      </p>
      <p class="text-xs text-ink-subtle pt-2 border-t border-line">
        Related chart types: 
        <a href="/csv-to-chart" class="underline hover:text-ink">CSV to Chart</a> · 
        <a href="/csv-to-bar-chart" class="underline hover:text-ink">Bar Chart</a> · 
        <a href="/csv-to-line-chart" class="underline hover:text-ink">Line Chart</a> · 
        <a href="/csv-to-pie-chart" class="underline hover:text-ink">Pie Chart</a>
      </p>
    `
  },
  {
    slug: "csv-to-bar-chart",
    title: "CSV to Bar Chart Maker – Fast & Free | iqplotter",
    desc: "Make a high-resolution bar chart from a CSV file in seconds. Compare categories, highlight discrepancies, and export SVG or PNG with total privacy.",
    h1: "CSV to Bar Chart Maker",
    breadcrumb: "CSV to Bar Chart",
    intro: `
      <p class="text-ink-muted leading-relaxed text-sm sm:text-base mb-4">
        Bar charts remain the undisputed gold standard for categorizing discrete variables, comparing quarterly performances, ranking product sales, and highlighting metric distributions across diverse groups. When you need to turn raw columns of numbers into clear, impactful visual comparisons, iqplotter provides an instant solution.
      </p>
      <p class="text-ink-muted leading-relaxed text-sm sm:text-base mb-4">
        Simply drag your CSV table into the generator above. Our system automatically identifies categorical labels for your horizontal X-axis and continuous numerical metrics for your vertical Y-axis. You can quickly inspect the parsed data table, identify missing entries with our built-in data health inspector, and adjust chart parameters on the fly.
      </p>
      <p class="text-ink-muted leading-relaxed text-sm sm:text-base mb-4">
        Bar plots created with iqplotter are optimized for both light and dark backgrounds, offering modern contrast palettes, legible typography, and seamless high-DPI image exports. Best of all, no account registration or cloud transfer is ever required.
      </p>
      <p class="text-ink-muted leading-relaxed text-sm sm:text-base mb-4">
        Customize bar corner radius, toggle subtle gridlines, and inspect individual data bars using interactive tooltips with automatic thousand and million abbreviations (e.g. 24k, 1.8M).
      </p>
      <p class="text-xs text-ink-subtle pt-2 border-t border-line">
        Related chart types: 
        <a href="/csv-to-line-chart" class="underline hover:text-ink">Line Chart</a> · 
        <a href="/csv-to-pie-chart" class="underline hover:text-ink">Pie Chart</a> · 
        <a href="/csv-to-scatter-plot" class="underline hover:text-ink">Scatter Plot</a> · 
        <a href="/excel-to-chart" class="underline hover:text-ink">Excel to Chart</a>
      </p>
    `
  },
  {
    slug: "csv-to-line-chart",
    title: "CSV to Line Chart Maker – Plot Trends Online | iqplotter",
    desc: "Plot time-series trends from a CSV file as a line chart. Free, instant, and private in-browser tool for tracking changes over time with high precision.",
    h1: "CSV to Line Chart Maker",
    breadcrumb: "CSV to Line Chart",
    intro: `
      <p class="text-ink-muted leading-relaxed text-sm sm:text-base mb-4">
        Observing temporal progressions, cyclic stock fluctuations, server telemetry, or monthly growth rates requires clean, responsive line charts. When analyzing chronologically ordered data points, visual clarity and accurate interpolation are paramount for deriving meaningful conclusions.
      </p>
      <p class="text-ink-muted leading-relaxed text-sm sm:text-base mb-4">
        iqplotter allows you to feed raw CSV time-series data directly into our charting canvas. The parser handles timestamp formats, linear numeric sequences, and multi-record measurements without reformatting or manual spreadsheet cleaning. Toggle between smoothed lines, sharp transitions, or dot markers to suit your presentation needs.
      </p>
      <p class="text-ink-muted leading-relaxed text-sm sm:text-base mb-4">
        Experience zero lag with our hardware-accelerated charting engine. Since all data parsing and rendering executes locally within your client session, your telemetry, health records, or market analyses stay securely on your device.
      </p>
      <p class="text-ink-muted leading-relaxed text-sm sm:text-base mb-4">
        For datasets with thousands of observations, iqplotter uses the Largest-Triangle-Three-Buckets (LTTB) algorithm to preserve visual peaks and troughs while keeping browser rendering smooth and lightweight.
      </p>
      <p class="text-xs text-ink-subtle pt-2 border-t border-line">
        Related chart types: 
        <a href="/csv-to-line-graph" class="underline hover:text-ink">Line Graph</a> · 
        <a href="/csv-to-bar-chart" class="underline hover:text-ink">Bar Chart</a> · 
        <a href="/csv-to-scatter-plot" class="underline hover:text-ink">Scatter Plot</a> · 
        <a href="/csv-to-pie-chart" class="underline hover:text-ink">Pie Chart</a>
      </p>
    `
  },
  {
    slug: "csv-to-line-graph",
    title: "CSV to Line Graph Maker – Free Plotter Online | iqplotter",
    desc: "Convert CSV data into clean, interactive line graphs online. Free, 100% private in-browser tool for tracking changes over time with high precision.",
    h1: "CSV to Line Graph Maker",
    breadcrumb: "CSV to Line Graph",
    intro: `
      <p class="text-ink-muted leading-relaxed text-sm sm:text-base mb-4">
        Line graphs are vital tools for visual storytelling across science, finance, engineering, and digital analytics. Whether you are illustrating historical climate patterns, monitoring weekly active user growth, or analyzing sensor readings, a well-plotted line graph reveals trajectories and rate of change at a single glance.
      </p>
      <p class="text-ink-muted leading-relaxed text-sm sm:text-base mb-4">
        With iqplotter's line graph generator, creating charts from CSV files takes seconds. Simply drag and drop your data file, assign your time or date column to the X-axis, and select one or more numeric metrics for the Y-axis. The tool automatically sorts and spaces data points accurately along continuous dimensions.
      </p>
      <p class="text-ink-muted leading-relaxed text-sm sm:text-base mb-4">
        All operations run strictly inside your browser. No files are transferred to remote servers, making iqplotter ideal for processing confidential metrics, proprietary performance logs, and academic research. Once your line graph is configured, export it as a high-resolution PNG or vector SVG with a single click.
      </p>
      <p class="text-ink-muted leading-relaxed text-sm sm:text-base mb-4">
        Choose from multiple curve interpolation styles including monotone cubic smoothing, linear segments, or step transitions, with full support for light and dark themes.
      </p>
      <p class="text-xs text-ink-subtle pt-2 border-t border-line">
        Related chart types: 
        <a href="/csv-to-line-chart" class="underline hover:text-ink">Line Chart</a> · 
        <a href="/csv-to-bar-chart" class="underline hover:text-ink">Bar Chart</a> · 
        <a href="/csv-to-scatter-plot" class="underline hover:text-ink">Scatter Plot</a> · 
        <a href="/excel-to-chart" class="underline hover:text-ink">Excel to Chart</a>
      </p>
    `
  },
  {
    slug: "csv-to-pie-chart",
    title: "CSV to Pie Chart Maker – Quick Proportions | iqplotter",
    desc: "Generate clear pie charts from CSV data with no account needed. Visualize market share, budget splits, and categorical breakdowns in your browser.",
    h1: "CSV to Pie Chart Maker",
    breadcrumb: "CSV to Pie Chart",
    intro: `
      <p class="text-ink-muted leading-relaxed text-sm sm:text-base mb-4">
        Pie charts excel at displaying composition, proportion, and part-to-whole relationships across categories. Whether you are mapping municipal budget allocations, survey response breakdowns, website traffic sources, or demographic distributions, a well-balanced circular diagram tells an immediate story.
      </p>
      <p class="text-ink-muted leading-relaxed text-sm sm:text-base mb-4">
        Using iqplotter, generating a pie or donut visualization from a CSV file requires only selecting the category label column and the corresponding numerical value column. The algorithm aggregates slices, calculates percentage proportions automatically, and assigns distinct, aesthetically pleasing color gradients that remain legible in both light and dark presentation slides.
      </p>
      <p class="text-ink-muted leading-relaxed text-sm sm:text-base mb-4">
        Say goodbye to bloated office suites and mandatory logins. Your dataset is evaluated strictly inside your browser window, keeping sensitive internal operational summaries private and safeguarded.
      </p>
      <p class="text-ink-muted leading-relaxed text-sm sm:text-base mb-4">
        Hover over individual slices to view precise counts and exact percentages, and download clean SVG or PNG exports ready for inclusion in boardroom slides and research papers.
      </p>
      <p class="text-xs text-ink-subtle pt-2 border-t border-line">
        Related chart types: 
        <a href="/csv-to-bar-chart" class="underline hover:text-ink">Bar Chart</a> · 
        <a href="/csv-to-chart" class="underline hover:text-ink">CSV to Chart</a> · 
        <a href="/excel-to-chart" class="underline hover:text-ink">Excel to Chart</a> · 
        <a href="/csv-to-scatter-plot" class="underline hover:text-ink">Scatter Plot</a>
      </p>
    `
  },
  {
    slug: "csv-to-scatter-plot",
    title: "CSV to Scatter Plot Maker – Free Correlation Tool | iqplotter",
    desc: "Create interactive scatter plots from CSV columns online. Explore two-variable correlations and distributions freely, privately, and in seconds.",
    h1: "CSV to Scatter Plot Maker",
    breadcrumb: "CSV to Scatter Plot",
    intro: `
      <p class="text-ink-muted leading-relaxed text-sm sm:text-base mb-4">
        Scatter plots are indispensable for statistical inquiry, scientific investigations, machine learning feature inspection, and quality assurance. By plotting independent and dependent continuous numeric variables along Cartesian coordinates, scatter diagrams quickly uncover clustering, non-linear relationships, and outliers.
      </p>
      <p class="text-ink-muted leading-relaxed text-sm sm:text-base mb-4">
        With iqplotter's scatter plot maker, exploring correlations in your CSV datasets is effortless. Simply upload your raw dataset, map two numerical columns to the X and Y axes, and let the tool render the points in real time. Hover over individual observations to inspect precise coordinates and detect anomalous readings without writing Python or R scripts.
      </p>
      <p class="text-ink-muted leading-relaxed text-sm sm:text-base mb-4">
        All calculations take place client-side in your web browser. Confidential experimental trials, academic datasets, and financial forecasts are processed with absolute privacy and speed.
      </p>
      <p class="text-ink-muted leading-relaxed text-sm sm:text-base mb-4">
        Support for multi-series scattering with distinct marker glyphs (circles, triangles, squares, diamonds, and crosses) makes comparing separate experiment conditions seamless.
      </p>
      <p class="text-xs text-ink-subtle pt-2 border-t border-line">
        Related chart types: 
        <a href="/csv-to-line-chart" class="underline hover:text-ink">Line Chart</a> · 
        <a href="/csv-to-bar-chart" class="underline hover:text-ink">Bar Chart</a> · 
        <a href="/csv-to-pie-chart" class="underline hover:text-ink">Pie Chart</a> · 
        <a href="/excel-to-chart" class="underline hover:text-ink">Excel to Chart</a>
      </p>
    `
  },
  {
    slug: "privacy",
    title: "Privacy Policy – 100% Client-Side Processing | iqplotter",
    desc: "Learn about iqplotter's privacy architecture. We process all CSV and Excel files locally in your browser — no server uploads, no data retention, zero tracking.",
    h1: "Privacy Policy & Data Security",
    breadcrumb: "Privacy",
    intro: `
      <p class="text-ink-muted leading-relaxed text-sm sm:text-base mb-4">
        At iqplotter, data privacy is not an afterthought or marketing talking point — it is the core architecture upon which our application is built. When you drop a CSV, TSV, or Excel spreadsheet into our workspace, your file is read into your browser's local memory using HTML5 FileReader and Web Workers.
      </p>
      <p class="text-ink-muted leading-relaxed text-sm sm:text-base mb-4">
        <strong>Zero Server Ingestion:</strong> Your tabular data, column names, numerical measurements, and generated chart graphics are NEVER uploaded, stored, or transmitted to any remote backend server, cloud bucket, or AI model. If you disconnect your internet connection after loading the page, iqplotter continues to parse files, clean data, and render charts seamlessly.
      </p>
      <p class="text-ink-muted leading-relaxed text-sm sm:text-base mb-4">
        <strong>Local Storage & Preferences:</strong> Your color theme preference (dark/light mode) and optional chart history are saved exclusively in your browser's local IndexedDB and localStorage storage mechanisms. You retain complete ownership and can clear local data at any time via your browser settings.
      </p>
      <p class="text-ink-muted leading-relaxed text-sm sm:text-base mb-4">
        <strong>Authentication & Cloud Sync (Optional):</strong> If you choose to log in using Google Authentication to save charts across devices, only your explicitly selected saved chart configurations are synchronized to your authenticated Firebase Firestore profile. Unauthenticated sessions remain 100% local.
      </p>
      <p class="text-ink-muted leading-relaxed text-sm sm:text-base">
        <strong>Security Disclosures:</strong> For security queries or vulnerabilities, please review our RFC 9116 security policy at <a href="/.well-known/security.txt" class="underline hover:text-ink">/.well-known/security.txt</a>.
      </p>
    `
  }
];

console.log("Generating landing pages...");

for (const p of pages) {
  const url = `${base}/${p.slug}`;

  // Build breadcrumb item
  const breadcrumbJson = JSON.stringify({
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `${base}/`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": p.breadcrumb,
        "item": url
      }
    ]
  });

  let html = template
    .replace(/<title>.*?<\/title>/s, `<title>${p.title}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${p.desc}" />`)
    .replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${url}" />`)
    .replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${url}" />`)
    .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${p.title}" />`)
    .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${p.desc}" />`)
    .replace(/<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${p.title}" />`)
    .replace(/<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${p.desc}" />`)
    // Replace H1 and intro paragraph in visible #seo-content
    .replace(
      /<h1 class="font-sans font-extrabold text-2xl sm:text-3xl tracking-tight text-ink mb-3">.*?<\/h1>\s*<p class="text-ink-muted leading-relaxed text-sm sm:text-base">.*?<\/p>/s,
      `<h1 class="font-sans font-extrabold text-2xl sm:text-3xl tracking-tight text-ink mb-3">${p.h1}</h1>\n${p.intro}`
    )
    // Update breadcrumb in JSON-LD
    .replace(
      /\{\s*"@type":\s*"BreadcrumbList",\s*"@id":\s*"https:\/\/iqplotter\.web\.app\/#breadcrumb",\s*"itemListElement":\s*\[\s*\{\s*"@type":\s*"ListItem",\s*"position":\s*1,\s*"name":\s*"Home",\s*"item":\s*"https:\/\/iqplotter\.web\.app\/"\s*\}\s*\]\s*\}/s,
      breadcrumbJson
    );

  mkdirSync(`dist/${p.slug}`, { recursive: true });
  writeFileSync(`dist/${p.slug}/index.html`, html);
  console.log(`Generated dist/${p.slug}/index.html`);
}

// Generate sitemap.xml
const today = new Date().toISOString().split("T")[0];
const sitemapPages = [
  { path: "", priority: "1.0", changefreq: "weekly" },
  { path: "csv-to-chart", priority: "0.9", changefreq: "weekly" },
  { path: "excel-to-chart", priority: "0.9", changefreq: "weekly" },
  { path: "csv-to-bar-chart", priority: "0.8", changefreq: "weekly" },
  { path: "csv-to-line-chart", priority: "0.8", changefreq: "weekly" },
  { path: "csv-to-line-graph", priority: "0.8", changefreq: "weekly" },
  { path: "csv-to-pie-chart", priority: "0.8", changefreq: "weekly" },
  { path: "csv-to-scatter-plot", priority: "0.8", changefreq: "weekly" },
  { path: "privacy", priority: "0.4", changefreq: "monthly" }
];

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapPages
  .map(
    (page) =>
      `  <url><loc>${base}/${page.path ? page.path : ""}</loc><lastmod>${today}</lastmod><changefreq>${page.changefreq}</changefreq><priority>${page.priority}</priority></url>`
  )
  .join("\n")}
</urlset>
`;

writeFileSync("public/sitemap.xml", sitemapXml);
writeFileSync("dist/sitemap.xml", sitemapXml);
console.log("Updated public/sitemap.xml and dist/sitemap.xml");
console.log("All landing pages generated successfully!");
