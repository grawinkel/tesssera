# Security Model

## What TESSSERA Protects Against

- **Secret compromise from partial share leakage.** If fewer than the threshold
  number of shares are exposed, the secret remains mathematically unrecoverable.
  This is a property of Shamir's Secret Sharing over GF(2^8).

- **Server-side data breaches.** There is no server. All processing happens in
  the browser. No secrets, shares, or metadata are transmitted over the network.

- **Tracking and fingerprinting.** No analytics, no cookies, no localStorage,
  no network requests after initial page load. Content Security Policy enforces
  `connect-src 'none'`.

## What TESSSERA Does NOT Protect Against

- **Compromised browser or device.** If the device running the app has malware,
  a keylogger, or a malicious browser extension, the secret can be captured
  before splitting or after reconstruction.

- **Shoulder surfing.** If someone is watching the screen when the secret is
  entered or reconstructed, no cryptography can help.

- **Share storage security.** TESSSERA splits the secret, but how you store
  and distribute the resulting shares is your responsibility. If all shares end
  up in the same place, the threshold scheme provides no protection.

- **Quantum computing.** See [Quantum Resistance](#quantum-resistance) below.

## Algorithms

- **Shamir's Secret Sharing** over GF(2^8) — splits a secret into N shares
  where any K (threshold) can reconstruct. Implementation: shamir-secret-sharing
  v0.0.4 by Privy (audited by Cure53 and Zellic), vendored in `src/vendor/secrets/`.

- **QR Code encoding** — shares are base64-encoded JSON containing the share
  data, index, threshold, and total count. QR codes use error correction level M.

## Quantum Resistance

Shamir's Secret Sharing is **information-theoretically secure** — its safety
comes from mathematical impossibility, not computational hardness. Shor's and
Grover's algorithms (the quantum attacks that break RSA, ECC, and weaken AES)
simply don't apply. With fewer than the threshold number of shares, there is
zero information about the secret regardless of computing power.

This makes SSS **post-quantum by nature**. Industry agrees: Vault12 ships SSS
as their core "quantum-safe data storage" primitive, battle-tested on ~1M
devices over a decade.

TESSSERA has no passphrase layer or symmetric encryption on top of SSS, so
there is no AES/symmetric component that a quantum computer could weaken.

**Further reading:**

- [Shamir Secret Sharing and Quantum-Resilient Crypto Keys](https://www.openware.com/news/articles/shamir-secret-sharing-and-quantum-resilient-crypto) — Openware
- [Quantum-Safe Data Storage with SSS](https://vault12.com/learn/advanced-crypto-security/cryptography/quantum-safe-data/) — Vault12
- [Vault12 Open-Source SSS Plugin for Capacitor](https://www.businesswire.com/news/home/20251202376125/en/Vault12-Releases-Open-Source-Capacitor-Plugin-for-Quantum-Safe-Data-Storage) — BusinessWire, Dec 2025

## Share Metadata

Each share is a base64-encoded JSON object containing the share data, its index,
the threshold, and the total number of shares. This metadata is visible to anyone
holding a share. An attacker with one share can see that it is, for example,
"share 2 of 5, requiring 3 to reconstruct."

This is **not a cryptographic weakness** — Shamir's scheme guarantees that fewer
than threshold shares reveal zero information about the secret itself. However,
it does reveal the scheme's parameters. If this is a concern, distribute shares
through secure channels.

## Memory

JavaScript does not provide direct memory control. Secret values stored in React
state are released to garbage collection when the component unmounts or the state
is cleared, but they cannot be cryptographically zeroed. Close the browser tab
after use to ensure the JavaScript heap is reclaimed by the operating system.

## Content Security Policy

The app sets the following CSP via `<meta>` tag:

```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob: mediastream:;
media-src 'self' mediastream:;
connect-src 'none';
object-src 'none';
base-uri 'self';
```

Key points:
- `connect-src 'none'` — blocks all XHR, fetch, WebSocket, and EventSource
- `script-src 'self'` — no inline scripts, no eval, no external scripts
- `object-src 'none'` — no plugins (Flash, Java, etc.)

## No Persistent Storage

The app does not use:
- localStorage
- sessionStorage
- IndexedDB
- Cookies
- Any form of persistent client-side storage

When you close the tab, all data is gone. This is by design.

## How to Audit

1. **Read the vendored crypto code.** The Shamir implementation is ~1,060 lines
   in `src/vendor/secrets/secrets.js`. The QR code renderer is ~1,137 lines in
   `src/vendor/qrcode/qrcode-esm.js`.

2. **Verify the build.** Clone the repo, run `npm ci && npm run build`, and
   compare `dist/BUILD_MANIFEST.json` against the deployed version. File hashes
   should match.

3. **Check network activity.** Open the app with DevTools Network tab. After
   the initial page load, there should be zero network requests. The CSP will
   block any attempts.

4. **Review the source.** The app is intentionally simple. The entire
   application logic (excluding vendored libraries) is under 1,000 lines.

## Reporting Vulnerabilities

If you find a security issue, please open a GitHub issue or contact the
maintainer directly. This is a client-side-only tool with no user accounts
or server infrastructure, so the attack surface is limited to the code itself.
