# TESSSERA

**Dark magic for digital secrets.**

Free, open-source [Shamir Secret Sharing](https://en.wikipedia.org/wiki/Shamir%27s_secret_sharing) with QR codes. Split secrets into shares, scan to reconstruct. Fully static, fully client-side, fully auditable.

- **No server.** Static site on GitHub Pages. No backend, no API, no database.
- **No tracking.** Zero analytics, cookies, localStorage, or network requests after load.
- **No cost.** Completely free and open. No licensing, no tiers, no paywalls.
- **Auditable.** Crypto vendored in-repo. CSP blocks all outbound connections.

## Features

- Split text secrets into M-of-N Shamir shares with QR codes
- Split files (up to 10 MB) into text-based shares
- Combine shares via camera scan, image upload, text paste, or drag-and-drop
- PDF export of shares (per-share or all-at-once, zero-dependency PDF 1.4 serializer)
- **Escape Pod** — single self-contained HTML file for offline recovery, works forever
- **Audit tab** — build commit, vendored library hashes, reproduction instructions
- Print layout for paper backup

## Quick Start

```bash
git clone https://github.com/grawinkel/tesssera.git
cd tesssera
npm ci
npm run dev
```

Open http://localhost:5173/

## Build

```bash
npm run build          # Production build → dist/
npm run build:offline  # Escape Pod → dist-offline/offline.html
npm run build:all      # Both builds + copies Escape Pod into dist/
npm run preview        # Preview production build
npm test               # Unit tests (vitest)
npm run test:e2e       # E2E tests (playwright)
npm run lint           # ESLint
```

`npm run build` runs TypeScript checking, then Vite production build, then generates `dist/BUILD_MANIFEST.json` with the git commit hash and SHA-256 hashes of every file in `dist/`.

## Verify a Build

Every production build generates `dist/BUILD_MANIFEST.json`:

```json
{
  "commit": "74cd48c",
  "commitFull": "74cd48c83a9767d0c733c0f0e4bb44d7095cc820",
  "buildDate": "2026-02-25T23:03:14.292Z",
  "files": {
    "assets/index-CDYxi4Mz.css": "0af2c761...",
    "fonts/inter-400.woff2": "dd05e326...",
    ...
  }
}
```

To verify a deployed build matches source:

1. Note the commit hash shown in the app's **Audit** tab (or from the deployed `BUILD_MANIFEST.json`)
2. Clone and check out that exact commit:
   ```bash
   git clone https://github.com/grawinkel/tesssera.git
   cd tesssera
   git checkout <commit-hash>
   ```
3. Build:
   ```bash
   npm ci && npm run build
   ```
4. Compare your `dist/BUILD_MANIFEST.json` file hashes against the deployed version. They should match.

## Audit

### Vendored crypto

The Shamir implementation is vendored at `src/vendor/secrets/shamir.ts` (~1,060 lines). It comes from [shamir-secret-sharing](https://github.com/privy-io/shamir-secret-sharing) v0.0.4 by Privy, independently audited by **Cure53** and **Zellic**. The QR renderer is vendored at `src/vendor/qrcode/qrcode-esm.js` (~1,137 lines). Provenance is documented in `src/vendor/VENDORS.md`.

The Audit tab in the app computes SHA-256 hashes of vendored files at runtime using `crypto.subtle.digest`, so you can compare them against the source.

### Check network activity

Open the app with DevTools Network tab open. After the initial page load, there should be zero network requests. The Content Security Policy (`connect-src 'none'`) enforces this at the browser level.

### Review the source

The entire application logic (excluding vendored libraries) is under 1,000 lines. The app is intentionally simple to make auditing practical.

See [SECURITY.md](SECURITY.md) for the full threat model, CSP details, and cryptographic properties.

## Escape Pod

The Escape Pod is a single self-contained HTML file (`tesssera_recovery.html`) that can reconstruct secrets from shares without any server or internet connection. It is built with `vite-plugin-singlefile` which inlines all JS, CSS, and assets.

Build it:

```bash
npm run build:offline
# Output: dist-offline/offline.html

# Or build everything (main app + Escape Pod):
npm run build:all
# Escape Pod copied to: dist/tesssera_recovery.html
```

Save it to a USB drive, print the URL as a QR code on your share PDFs, or just keep it alongside your shares. It will work on any device with a browser, forever.

## Architecture

```
src/
├── components/
│   ├── SplitView.tsx        # Secret/file → QR codes + PDF export
│   ├── CombineView.tsx      # QR codes → Secret/file
│   ├── Scanner.tsx          # Camera QR scanner
│   ├── ImageScanner.tsx     # File-upload QR decoder
│   ├── ShareDisplay.tsx     # QR code grid
│   ├── AuditView.tsx        # Build verification + dependency audit
│   ├── OfflineRecovery.tsx  # Escape Pod recovery UI
│   └── OfflineIndicator.tsx
├── utils/
│   ├── crypto.ts            # Shamir split/combine
│   ├── pdfExport.ts         # PDF 1.4 serializer (no dependencies)
│   ├── fileSplit.ts         # File → shares and shares → file
│   └── qrDecode.ts          # BarcodeDetector + jsQR fallback
├── vendor/
│   ├── secrets/             # Vendored shamir-secret-sharing (audited)
│   ├── qrcode/              # Vendored qrcode.react
│   └── VENDORS.md           # Provenance documentation
├── hooks/
│   └── useOffline.ts
├── styles/
│   ├── index.css
│   └── offline.css
├── App.tsx                  # Split / Combine / Audit tabs
├── main.tsx                 # Entry point
└── offline.tsx              # Escape Pod entry
```

## Security

Shamir's Secret Sharing is information-theoretically secure — fewer than the threshold number of shares reveal zero information about the secret, regardless of computing power. This makes it post-quantum by nature.

See [SECURITY.md](SECURITY.md) for:
- Full threat model (what it protects against and what it doesn't)
- Content Security Policy details
- Share metadata visibility
- Memory considerations
- How to report vulnerabilities
