# TESSSERA

**"Dark magic for digital secrets."**

Free, open-source Shamir Secret Sharing with QR codes. Split secrets into shares, scan to reconstruct. Fully static, fully client-side, fully auditable.

## Core Philosophy: Maximum Trust

- **No Server:** Static GitHub Pages site. No backend, no API, no database.
- **No Tracking:** Zero analytics, zero cookies, zero localStorage, zero network requests after load.
- **No Commercial Features:** Completely free and open. No licensing, no tiers, no paywalls.
- **Auditable:** Crypto libraries vendored in-repo. CSP blocks all outbound connections. Builds are reproducible.

## Tech Stack

- React 19 + TypeScript + Vite
- `shamir-secret-sharing` v0.0.4 by Privy - Shamir secret sharing (vendored, audited by Cure53 & Zellic)
- `qrcode.react` v4.2.0 - QR code generation (vendored in `src/vendor/qrcode/`)
- `jsqr` v1.4.0 - QR code scanning fallback (npm dep)
- Native `BarcodeDetector` API - primary QR scanner (Chrome, Edge, Safari 17.2+)
- `vite-plugin-singlefile` - Escape Pod builder
- GitHub Pages (deployment)

## Architecture

```
src/
├── components/
│   ├── SplitView.tsx       # Secret/file → QR codes + PDF export
│   ├── CombineView.tsx     # QR codes → Secret/file (scan, upload, paste, drag-drop)
│   ├── Scanner.tsx         # Camera QR scanner
│   ├── ImageScanner.tsx    # File-upload QR decoder
│   ├── ShareDisplay.tsx    # QR code grid
│   ├── AuditView.tsx       # Build verification + dependency audit
│   ├── OfflineRecovery.tsx # Text-only recovery (Escape Pod)
│   └── OfflineIndicator.tsx
├── utils/
│   ├── crypto.ts           # Shamir split/combine
│   ├── pdfExport.ts        # Minimal PDF 1.4 serializer (no deps)
│   ├── fileSplit.ts        # File → shares and shares → file
│   └── qrDecode.ts         # BarcodeDetector + jsQR fallback
├── vendor/
│   ├── secrets/            # Vendored shamir-secret-sharing (Privy, audited)
│   ├── qrcode/             # Vendored qrcode.react
│   └── VENDORS.md          # Provenance documentation
├── hooks/
│   └── useOffline.ts       # Network status
├── styles/
│   ├── index.css           # Main app styles + print layout
│   └── offline.css         # Escape Pod styles
├── App.tsx                 # Main app (Split / Combine / Audit tabs)
├── main.tsx                # Entry + service worker registration
└── offline.tsx             # Escape Pod entry
```

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build → dist/ + BUILD_MANIFEST.json
npm run build:offline # Escape Pod build → dist-offline/
npm run build:all    # Both builds + copy Escape Pod into dist/
npm run preview      # Preview production build
npm test             # Unit tests (vitest)
npm run test:e2e     # E2E tests (playwright)
```

## Features

- **Split text secrets** into M-of-N Shamir shares with QR codes
- **Split files** (up to 5MB) into text-based shares
- **Combine shares** via camera scan, image upload, text paste, or drag-and-drop
- **PDF export** of all shares (one per page, QR + text, from-scratch serializer)
- **Escape Pod** — single HTML file recovery tool, works offline forever
- **Audit tab** — build commit, vendored file hashes, reproduction instructions
- **PWA** — installable, works offline via service worker
- **Print layout** — CSS @media print for paper backup

## Trust Infrastructure

- **CSP:** `connect-src 'none'` blocks all network requests post-load
- **Vendored crypto:** Shamir implementation auditable at `src/vendor/secrets/shamir.ts` (audited by Cure53 & Zellic)
- **Build manifest:** `dist/BUILD_MANIFEST.json` with SHA-256 hashes of all files
- **Reproducible builds:** `npm ci && npm run build` should produce identical output
- **SECURITY.md:** Threat model documented

## Guidelines

1. **Security First:** All crypto happens client-side. No secrets touch any server.
2. **Offline First:** Core split/combine must work fully offline.
3. **Boring Code:** No cleverness. Obvious control flow. Easy to audit.
4. **Minimal Dependencies:** Vendor crypto. Use browser APIs. Avoid npm bloat.
5. **No Storage:** Zero cookies, localStorage, sessionStorage, IndexedDB.
