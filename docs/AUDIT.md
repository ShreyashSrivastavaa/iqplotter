# IQPlotter Technical Audit & Upgrade Strategy (Phase 0)

**Date**: 2026-10-31  
**Repository**: `iqplotter`  
**Live Site**: [https://iqplotter.web.app/](https://iqplotter.web.app/)  
**Firebase Project**: `iqplotter` (Web App: `iqplotter-web`)  

---

## 1. Stack & Architecture Overview

| Component | Current Implementation |
|---|---|
| **Framework** | React 18.3.1 (Strict Mode) |
| **Language** | TypeScript 5.7.2 |
| **Bundler / Build Tool** | Vite 6.0.3 / 6.4.5 with `@vitejs/plugin-react` |
| **Router** | None (Single-Page Application driven by state tabs and URL hash `#s=...` for compressed sharing via `lz-string`) |
| **Rendering Mode** | Pure Client-Side Rendering (CSR). Standard SPA architecture served as static HTML/JS/CSS bundle. |
| **Styling** | Tailwind CSS v3.4.16 with PostCSS and custom CSS design tokens (`index.css`) |
| **Typography** | Self-hosted `@fontsource/plus-jakarta-sans` and `@fontsource/ibm-plex-mono` |
| **Local Persistence** | Browser IndexedDB via `idb-keyval` (6.2.1), namespaced by optional user UID |

---

## 2. Firebase Initialization & SDK Analysis

- **Firebase SDK Version**: `^10.14.1` (Modular v10).
- **Initialization Location**: [src/lib/auth/firebase.ts](file:///d:/iqplotter/src/lib/auth/firebase.ts).
- **Style**: Modular SDK (`import('firebase/app')`, `import('firebase/auth')`).
- **Initialization State**:
  - Lazily initialized via dynamic `import(...)` on first invocation of `getFirebaseAuth()`.
  - Guarded by `isFirebaseConfigured()`, checking `VITE_FIREBASE_API_KEY` and `VITE_FIREBASE_PROJECT_ID`.
  - Singleton app instance cached in `firebaseAppInstance` and `authInstance`.
- **Database / Backend Services**:
  - **Firestore / Realtime Database**: Not used anywhere in the client codebase. All data analysis and history storage are 100% browser-local (IndexedDB).
  - **Cloud Storage**: Not used.
  - **Cloud Functions / Backend**: No server backend or Cloud Functions exist in this project.
  - **Firebase Hosting**: Active and configured.

---

## 3. Existing Auth, i18n, & SEO State

### Authentication
- Implemented in [src/lib/auth/firebase.ts](file:///d:/iqplotter/src/lib/auth/firebase.ts), [AuthModal.tsx](file:///d:/iqplotter/src/components/auth/AuthModal.tsx), and [Header.tsx](file:///d:/iqplotter/src/components/layout/Header.tsx).
- Google Sign-In with popup fallback to redirect.
- Gaps identified:
  - Missing centralized `getRedirectResult` resolution on app boot for mobile browsers returning from redirect.
  - Missing granular error mapping (popup closed by user, popup blocked, network failures, domain unauth) with i18n support.
  - Session state persists via Firebase Auth internal persistence, but loading state while checking initial auth status is implicit rather than explicitly communicated via auth context.
  - `authDomain` caveat: In third-party cookie/storage partitioned browsers, `iqplotter.firebaseapp.com` can block redirect auth. Setting/supporting `iqplotter.web.app` as `authDomain` or configuring hosting rewrites resolves this.

### Internationalization (i18n)
- **Current State**: None. All copy is currently hardcoded in English.
- **Language Selector**: None currently exists in the UI.

### SEO Tags & Metadata
- **Current State**: Static tags inside [index.html](file:///d:/iqplotter/index.html).
- Includes basic `<title>`, description, open graph, and twitter tags in English.
- **Missing**:
  - Canonical URL tag (`rel="canonical"`).
  - Multilingual metadata and language alternate tags (`rel="alternate" hreflang="..."`).
  - Structured data (`application/ld+json`).
  - `robots.txt` and `sitemap.xml` in `public/`.
  - Manifest file (`manifest.json`) and standard favicon asset files in `public/`.
  - Cache control headers in `firebase.json`.

---

## 4. Routes, Tools, & Access Control

- **Public Routes / Stages**:
  - `/` (Home / Hero / Instant preview)
  - Workflow Stages inside single route:
    1. **Data Ingestion** (dropzone, raw CSV/TSV/TXT/XLSX parser, sample loaders)
    2. **Data Inspection** (column profiling, stats, searchable 50-row preview, CSV export, cleaning log)
    3. **Data Visualization** (Bar, Line, Scatter, Pie charts via Recharts, custom palettes, LTTB downsampling, PNG/SVG exports)
  - Compressed URL hash routes: `/#s=<compressed-payload>` (decompress and load shared chart automatically)
- **Protected / Private Routes**: None. The tool operates 100% in-browser without an account. Auth is strictly optional for profile persistence labeling.

---

## 5. Firebase Hosting & Environment Configuration

- **`firebase.json`**:
  - Specifies `"public": "dist"`.
  - Basic SPA rewrite: all paths rewrite to `/index.html`.
  - Missing explicit cache headers (e.g. `Cache-Control` long-lived for immutable hashed assets in `dist/assets/**`, short-lived/no-cache for `index.html`).
- **`.firebaserc`**:
  - Configured with `"default": "iqplotter"`.
- **Environment Variables**:
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - `VITE_FIREBASE_APP_ID`
  - All properly gitignored via `.gitignore` (`.env`, `.env.*`, `!.env.example`).

---

## 6. Key Decisions & Architecture Strategy

### Phase 1: Authentication Architecture
- Centralize auth in a dedicated `AuthContext` with single Firebase initialization and clean lifecycle management.
- Add `getRedirectResult` listener on startup to handle mobile redirects cleanly.
- Keep user state strictly constrained to non-sensitive profile attributes (`uid`, `displayName`, `email`, `photoURL`, `emailVerified`, `providerId`). Never store tokens in localStorage.
- Recommend setting `authDomain: "iqplotter.web.app"` in production to eliminate third-party cross-site storage issues on iOS Safari and Chrome.

### Phase 2: i18n Library Selection
- **Selected Library**: `i18next` + `react-i18next` + `i18next-browser-languagedetector`.
- **Justification**:
  - Industry standard for React, highly battle-tested, robust key fallback to `en`, zero-re-render optimization hooks (`useTranslation`), supports namespaces and RTL detection.
  - Native support for pluralization, nested keys, and HTML attribute bindings (`dir="rtl"`, `<html lang="...">`).
- Supported Locales: `en` (default), `hi` (Hindi), `es` (Spanish), `fr` (French), `de` (German), `pt` (Portuguese), `ja` (Japanese), `zh-CN` (Simplified Chinese), `ar` (Arabic, with RTL layout).
- Language Selector: Add a minimal, discreet language switch dropdown in `Header.tsx` styled strictly with existing design tokens (`rounded-full`, `border-line`, `text-ink-muted hover:text-ink`).

### Phase 3: SEO Rendering Decision
**Decision: Option (b) - Client-Rendered Architecture with Single Canonical Base and Dynamic Document Head Synchronization**
- **Rationale**:
  - IQPlotter is a single-page interactive utility tool with zero server-side infrastructure on Firebase Hosting.
  - All URLs on Firebase Hosting serve the single `/index.html` file.
  - Generating pre-rendered static HTML routes for an app whose entire content is a client-side CSV parser/plotter introduces unnecessary build complexity and can deceive search engines if the static HTML lacks true multi-route content.
  - Therefore, we:
    1. Set the canonical URL strictly to `https://iqplotter.web.app/`.
    2. Provide full Open Graph, Twitter Cards, comprehensive JSON-LD (`WebApplication`, `Organization`, `WebSite`).
    3. Update document `<title>`, meta description, `<html lang>`, and `dir` dynamically on client language switch.
    4. Provide valid `robots.txt` referencing `sitemap.xml`.
    5. State plainly that because Firebase Hosting serves a single `index.html` for all paths without server-side localized HTML forks, hreflang links point only to true served endpoints (root `/` with canonical English base).

---

## 7. Implementation Plan

- **Phase 0**: Audit completed, baseline screenshot captured and logged.
- **Phase 1**: Robust modular Firebase Auth provider with popup/redirect fallback, error translation, and redirect resolution.
- **Phase 2**: Full internationalization with `i18next`, complete locale dictionaries (en, hi, es, fr, de, pt, ja, zh-CN, ar), RTL support, parity validation script.
- **Phase 3**: Comprehensive metadata-only SEO: canonical tags, JSON-LD schemas, Open Graph, `robots.txt`, `sitemap.xml`, manifest, favicon assets.
- **Phase 4**: Hosting cache headers in `firebase.json`, 404 view, offline detection toast/notice.
- **Phase 5**: Verification (tests, build, parity check, sitemap & JSON-LD validation, visual check, console instructions).
