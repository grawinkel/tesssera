declare const __BUILD_COMMIT__: string;
declare const __VENDOR_HASHES__: Record<string, string>;

interface VendorInfo {
  readonly name: string;
  readonly version: string;
  readonly license: string;
  readonly source: string;
  readonly file: string;
}

const VENDORS: readonly VendorInfo[] = [
  {
    name: 'shamir-secret-sharing',
    version: '0.0.4',
    license: 'Apache-2.0',
    source: 'https://github.com/privy-io/shamir-secret-sharing',
    file: 'secrets/shamir.ts',
  },
  {
    name: 'qrcode.react',
    version: '4.2.0',
    license: 'MIT',
    source: 'https://github.com/zpao/qrcode.react',
    file: 'qrcode/qrcode-esm.js',
  },
];

export function AuditView() {
  return (
    <div className="audit-view">
      <h2>Build Verification</h2>

      <section className="audit-section trust-summary">
        <ul>
          <li><strong>No server:</strong> all processing happens in your browser</li>
          <li><strong>No network after load:</strong> CSP enforces <code>connect-src 'none'</code></li>
          <li><strong>No tracking or storage:</strong> zero cookies, analytics, or persistence</li>
          <li><strong>Audited crypto:</strong> Shamir implementation reviewed by Cure53 &amp; Zellic</li>
          <li><strong>Open source:</strong> build from source and verify byte-for-byte</li>
        </ul>
      </section>

      <section className="audit-section">
        <h3>Build Info</h3>
        <table className="audit-table">
          <tbody>
            <tr>
              <td>Git Commit</td>
              <td><code>{__BUILD_COMMIT__}</code></td>
            </tr>
            <tr>
              <td>Source Code</td>
              <td>
                <code>github.com/grawinkel/tesssera</code>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="audit-section">
        <h3>Vendored Libraries</h3>
        <p className="audit-description">
          These libraries are copied into the repository and bundled directly.
          No code is fetched from CDNs or external sources at runtime.
        </p>
        <table className="audit-table">
          <thead>
            <tr>
              <th>Library</th>
              <th>Version</th>
              <th>License</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {VENDORS.map((v) => (
              <tr key={v.name}>
                <td><code>{v.name}</code></td>
                <td>{v.version}</td>
                <td>{v.license}</td>
                <td><code>{v.source}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="audit-section">
        <h3>Vendor File Hashes (SHA-256)</h3>
        <p className="audit-description">
          Pre-computed at build time from the vendored source files.
        </p>
        <table className="audit-table">
          <thead>
            <tr>
              <th>File</th>
              <th>SHA-256</th>
            </tr>
          </thead>
          <tbody>
            {VENDORS.map((v) => (
              <tr key={v.file}>
                <td><code>{v.file}</code></td>
                <td><code className="hash">{__VENDOR_HASHES__[v.file] ?? 'unknown'}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="audit-section">
        <h3>How to Verify</h3>
        <ol className="verify-steps">
          <li>
            Clone the repository:
            <pre><code>git clone https://github.com/grawinkel/tesssera.git</code></pre>
          </li>
          <li>
            Check out the exact commit:
            <pre><code>git checkout {__BUILD_COMMIT__}</code></pre>
          </li>
          <li>
            Build locally:
            <pre><code>npm ci && npm run build</code></pre>
          </li>
          <li>
            Compare <code>dist/BUILD_MANIFEST.json</code> hashes against the deployed version.
          </li>
        </ol>
      </section>

      <section className="audit-section">
        <h3>Escape Pod</h3>
        <p className="audit-description">
          A single HTML file containing the complete recovery tool.
          Works offline forever from any device — no internet required.
        </p>
        <a className="btn primary" href="./tesssera_recovery.html" download="tesssera_recovery.html">
          Download Escape Pod
        </a>
      </section>
    </div>
  );
}
