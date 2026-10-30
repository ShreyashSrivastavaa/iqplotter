# iqplotter

> **Convert your CSV and Excel data into powerful visual insights instantly.**
> Privacy-first · Runs entirely in your browser · No account needed

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built with React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-Bundler-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)

---

## Overview

**iqplotter** is an editorial, privacy-first web application that transforms raw tabular data (`.csv`, `.tsv`, `.txt`, and `.xlsx`) into presentation-ready charts with zero server dependencies. All data sanitization, type inference, downsampling, and rendering happens 100% client-side in the browser.

### Key Highlights
- 🔒 **Zero Data Transmission**: Raw data never leaves your browser.
- 🎨 **Warm Editorial Design + Dark Mode**: Warm cream paper background (`#FAF7E9`) with an obsidian dark theme (`#12110F`) and glowing sunrise gradients.
- ⚡ **Three Integrated Workflow Stages**:
  1. **Data Ingestion**: Drag & drop dropzone, raw CSV paste tab, and 1-click sample loaders.
  2. **Data Inspection**: Column type profiling, missing value counts, min/max/mean metrics, searchable 50-row preview with cell copy, and clean CSV export.
  3. **Data Visualization**: Bar, Line, Scatter, and Pie charts powered by Recharts with LTTB downsampling, custom palettes (*Classic*, *Warm*, *Cool*, *Sunset*, *Cyberpunk*), and Fullscreen expand mode.
- 📸 **High-Resolution Exports**: 2x and 3x PNG exports via HTML5 Canvas with custom typography support, plus clean vector SVG export.
- 🔗 **Serverless Sharing**: Share charts via `#s=` compressed URL hashes powered by `lz-string`.
- 💾 **Local History**: Local persistence via IndexedDB (`idb-keyval`) with optional Google Sign-in namespacing.
- ⌨️ **Keyboard Accessibility**: Arrow-key roving tab navigation, global shortcuts (<kbd>1</kbd>, <kbd>2</kbd>, <kbd>3</kbd>, <kbd>T</kbd>, <kbd>?</kbd>), and ARIA live announcements.

---

## Tech Stack

- **Framework**: React 18 with TypeScript (Strict mode)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v3 with CSS custom properties
- **Chart Engine**: Recharts with Largest-Triangle-Three-Buckets (LTTB) downsampling
- **Parsing**: PapaParse (CSV/TSV/TXT) & read-excel-file (.xlsx)
- **Local Storage**: idb-keyval (IndexedDB)
- **Compression**: lz-string
- **Icons**: lucide-react
- **Fonts**: `@fontsource/plus-jakarta-sans` & `@fontsource/ibm-plex-mono`
- **Testing**: Vitest & React Testing Library

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/ShreyashSrivastavaa/iqplotter.git
cd iqplotter

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## Build & Test

```bash
# Run automated tests
npm test

# Type-check TypeScript codebase
npx tsc --noEmit

# Build production bundle
npm run build
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| <kbd>1</kbd> | Jump to **Data Ingestion** stage |
| <kbd>2</kbd> | Jump to **Data Inspection** stage |
| <kbd>3</kbd> | Jump to **Data Visualization** stage |
| <kbd>T</kbd> / <kbd>D</kbd> | Toggle **Dark / Light theme** |
| <kbd>?</kbd> | Open **Keyboard Shortcuts** guide |
| <kbd>Esc</kbd> | Close active modal or drawer |

---

## Optional Google Authentication

Sign-in is 100% optional. To enable Firebase Authentication with Google Sign-in:
1. Create a Firebase project at [firebase.google.com](https://firebase.google.com).
2. Enable Google Sign-In under **Authentication > Sign-in method**.
3. Create a `.env` file in the project root:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

---

## License

MIT © [iqplotter](https://github.com/ShreyashSrivastavaa/iqplotter)
