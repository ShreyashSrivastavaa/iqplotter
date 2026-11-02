import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const base = "https://iqplotter.web.app";
const template = readFileSync("dist/index.html", "utf8");

const pages = [
  {
    slug: "csv-to-chart",
    title: "CSV to Chart Generator – Free & Private | iqplotter",
    desc: "Turn any CSV file into an interactive chart online. Free, no account needed, and 100% in-browser processing keeps your sensitive data private.",
    h1: "Convert CSV to Chart Online",
    breadcrumb: "CSV to Chart",
    intro: `
      <p class="text-ink-muted leading-relaxed text-sm sm:text-base mb-4">
        Transforming raw comma-separated value (CSV) files into visual representations is one of the most common tasks in data analysis, reporting, and dashboard development. With iqplotter's free online CSV to chart generator, you can upload or drop any standard CSV or delimiter-separated text file directly into your browser window and produce presentation-ready graphs in seconds.
      </p>
      <p class="text-ink-muted leading-relaxed text-sm sm:text-base mb-4">
        Unlike traditional spreadsheet tools that require steep learning curves or cloud platforms that force you to upload sensitive company figures, customer records, or financial metrics to external servers, iqplotter operates entirely on the client side. Your records are parsed in local memory using Web Workers and modern JavaScript engines, guaranteeing that your data remains strictly confidential and never leaves your computer.
      </p>
      <p class="text-ink-muted leading-relaxed text-sm sm:text-base">
        Whether you need to generate high-resolution bar charts for executive meetings, line charts to monitor time-series trends, or scatter plots for exploratory correlation analysis, simply select your columns from the intuitive interface above and customize titles, colors, and formatting with zero setup.
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
        Microsoft Excel (.xlsx and .xls) files are the bedrock of workplace accounting, scientific measurement, inventory logging, and project estimation. However, configuring native spreadsheet charting engines often feels tedious, cluttered with dialog menus, or rigid when you need to quickly inspect new worksheets.
      </p>
      <p class="text-ink-muted leading-relaxed text-sm sm:text-base mb-4">
        iqplotter provides an effortless, modern alternative designed for speed, beauty, and security. Drop any workbook directly into our workspace: our in-browser reader automatically detects headers, recognizes date and numerical values, cleans anomalous empty records, and lets you toggle between chart types with a single click.
      </p>
      <p class="text-ink-muted leading-relaxed text-sm sm:text-base">
        Because every calculation runs directly inside your browser's runtime, confidential balance sheets, proprietary client listings, and internal operating expenses remain safe from third-party interception. Export crisp PNG or vector SVG visuals instantly to paste directly into slides, reports, or team wikis.
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
      <p class="text-ink-muted leading-relaxed text-sm sm:text-base">
        Bar plots created with iqplotter are optimized for both light and dark backgrounds, offering modern contrast palettes, legible typography, and seamless high-DPI image exports. Best of all, no account registration or cloud transfer is ever required.
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
      <p class="text-ink-muted leading-relaxed text-sm sm:text-base">
        Experience zero lag with our hardware-accelerated charting engine. Since all data parsing and rendering executes locally within your client session, your telemetry, health records, or market analyses stay securely on your device.
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
      <p class="text-ink-muted leading-relaxed text-sm sm:text-base">
        Say goodbye to bloated office suites and mandatory logins. Your dataset is evaluated strictly inside your browser window, keeping sensitive internal operational summaries private and safeguarded.
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
      <p class="text-ink-muted leading-relaxed text-sm sm:text-base">
        All calculations take place client-side in your web browser. Confidential experimental trials, academic datasets, and financial forecasts are processed with absolute privacy and speed.
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
      <p class="text-ink-muted leading-relaxed text-sm sm:text-base">
        <strong>Authentication & Cloud Sync (Optional):</strong> If you choose to log in using Google Authentication to save charts across devices, only your explicitly selected saved chart configurations are synchronized to your authenticated Firebase Firestore profile. Unauthenticated sessions remain 100% local.
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
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${p.desc}">`)
    .replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${url}">`)
    .replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${url}">`)
    .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${p.title}">`)
    .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${p.desc}">`)
    .replace(/<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${p.title}">`)
    .replace(/<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${p.desc}">`)
    // Replace H1 and intro paragraph in visible #seo-content
    .replace(
      /<h1 class="font-sans font-extrabold text-2xl sm:text-3xl tracking-tight text-ink mb-3">.*?<\/h1>\s*<p class="text-ink-muted leading-relaxed text-sm sm:text-base">.*?<\/p>/s,
      `<h1 class="font-sans font-extrabold text-2xl sm:text-3xl tracking-tight text-ink mb-3">${p.h1}</h1>\n${p.intro}`
    )
    // Update breadcrumb in JSON-LD
    .replace(
      /\{\s*"@type":\s*"BreadcrumbList",\s*"itemListElement":\s*\[\s*\{\s*"@type":\s*"ListItem",\s*"position":\s*1,\s*"name":\s*"Home",\s*"item":\s*"https:\/\/iqplotter\.web\.app\/"\s*\}\s*\]\s*\}/s,
      breadcrumbJson
    );

  mkdirSync(`dist/${p.slug}`, { recursive: true });
  writeFileSync(`dist/${p.slug}/index.html`, html);
  console.log(`Generated dist/${p.slug}/index.html`);
}

// Generate sitemap.xml
const today = new Date().toISOString().split("T")[0];
const sitemapPages = [
  { path: "", priority: "1.0" },
  { path: "csv-to-chart", priority: "0.9" },
  { path: "excel-to-chart", priority: "0.9" },
  { path: "csv-to-bar-chart", priority: "0.8" },
  { path: "csv-to-line-chart", priority: "0.8" },
  { path: "csv-to-pie-chart", priority: "0.8" },
  { path: "csv-to-scatter-plot", priority: "0.8" },
  { path: "privacy", priority: "0.3" }
];

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapPages
  .map(
    (page) =>
      `  <url><loc>${base}/${page.path ? page.path : ""}</loc><lastmod>${today}</lastmod><priority>${page.priority}</priority></url>`
  )
  .join("\n")}
</urlset>
`;

writeFileSync("public/sitemap.xml", sitemapXml);
writeFileSync("dist/sitemap.xml", sitemapXml);
console.log("Updated public/sitemap.xml and dist/sitemap.xml");
console.log("All landing pages generated successfully!");
