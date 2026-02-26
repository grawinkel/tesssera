# Vendored Dependencies

These files are copied verbatim from their upstream sources. They are committed
to this repository so that the crypto-critical code can be audited alongside
the application code.

## shamir-secret-sharing (by Privy)

- **File:** `secrets/shamir.ts`
- **Version:** 0.0.4
- **License:** Apache-2.0
- **Source:** https://github.com/privy-io/shamir-secret-sharing
- **npm:** https://www.npmjs.com/package/shamir-secret-sharing
- **Purpose:** Shamir Secret Sharing over GF(2^8)
- **API used:** `split`, `combine`
- **Audits:** Cure53, Zellic (independent security audits)

## qrcode.react

- **File:** `qrcode/qrcode-esm.js`
- **Version:** 4.2.0
- **License:** MIT
- **Source:** https://github.com/zpao/qrcode.react
- **npm:** https://www.npmjs.com/package/qrcode.react
- **Purpose:** QR code rendering as SVG React components
- **API used:** `QRCodeSVG`
