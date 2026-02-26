import '../styles/landing.css';

const BASE = import.meta.env.BASE_URL;

export function LandingPage() {
  return (
    <div className="landing">
      {/* Hero */}
      <section className="hero">
        <h1 className="hero-title">
          TE<span className="triple-s">SSS</span>ERA
        </h1>
        <p className="hero-subtitle">Ancient trust for digital secrets.</p>
        <p className="hero-pitch">
          Split any secret into pieces. No single piece reveals anything.
          Bring enough pieces together and the secret reappears &mdash;
          mathematically guaranteed.
        </p>
        <a className="hero-cta" href={`${BASE}tool.html`}>
          Launch Tool
        </a>
      </section>

      <hr className="section-divider" />

      {/* Origin Story */}
      <section className="landing-section">
        <h2>An ancient idea, reborn</h2>
        <p>
          In ancient Rome, a{' '}
          <a
            href="https://en.wikipedia.org/wiki/Hospitium"
            target="_blank"
            rel="noopener noreferrer"
          >
            tessera hospitalis
          </a>{' '}
          was a token of mutual trust. The host would break it in two and give one
          half to the guest. Years or generations later, reuniting the pieces proved
          the bond between families &mdash; no paperwork, no authority, just the
          fitting of broken halves.
        </p>
        <p>
          TESSSERA does the same thing with math. The three S&apos;s stand for{' '}
          <strong>
            <a
              href="https://en.wikipedia.org/wiki/Shamir%27s_secret_sharing"
              target="_blank"
              rel="noopener noreferrer"
            >
              Shamir Secret Sharing
            </a>
          </strong>
          , a cryptographic technique invented in 1979 that splits a secret into pieces
          with a threshold: only enough pieces together reveal anything. Fewer than
          the threshold reveal absolutely nothing &mdash; not a character, not a hint.
        </p>

        <div className="origin-grid">
          <div className="origin-card">
            <div className="origin-era">Ancient Rome</div>
            <div className="origin-title">Tessera Hospitalis</div>
            <p>
              A clay or bone token stamped with the head of Jupiter Hospitalis,
              broken between host and guest. Each half was kept as proof of a
              sacred bond. Descendants could reunite pieces generations later to
              renew the pact.
            </p>
            <a
              className="origin-link"
              href="https://en.wikipedia.org/wiki/Tessera"
              target="_blank"
              rel="noopener noreferrer"
            >
              Tessera on Wikipedia &rarr;
            </a>
          </div>
          <div className="origin-card">
            <div className="origin-era">1979 &ndash; Present</div>
            <div className="origin-title">Shamir&apos;s Secret Sharing</div>
            <p>
              Adi Shamir (the &quot;S&quot; in RSA) proved that a polynomial of
              degree k-1 can encode a secret recoverable only with k points.
              Fewer points reveal zero information &mdash; not computationally
              hard, but mathematically impossible to break.
            </p>
            <a
              className="origin-link"
              href="https://en.wikipedia.org/wiki/Shamir%27s_secret_sharing"
              target="_blank"
              rel="noopener noreferrer"
            >
              Shamir&apos;s Secret Sharing on Wikipedia &rarr;
            </a>
          </div>
        </div>

        <div className="parallel-grid">
          <div className="parallel-col">
            <div className="parallel-label">Ancient tessera</div>
            <div className="parallel-item">Token broken between parties</div>
            <div className="parallel-item">Reassemble to prove identity</div>
            <div className="parallel-item">Hereditary across generations</div>
            <div className="parallel-item">Sacred bond of mutual trust</div>
          </div>
          <div className="parallel-col">
            <div className="parallel-label">Digital TESSSERA</div>
            <div className="parallel-item">Secret split into shares</div>
            <div className="parallel-item">Combine shares to recover</div>
            <div className="parallel-item">QR on paper lasts decades</div>
            <div className="parallel-item">Math guarantees the trust</div>
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* The Simple Version */}
      <section className="landing-section">
        <span className="depth-indicator depth-beginner">No math required</span>
        <h2>What is this?</h2>
        <p>
          Imagine you have a password, a recovery phrase, or a private key that&apos;s too important
          to store in one place. If someone finds it, it&apos;s game over. If you lose it, it&apos;s
          also game over.
        </p>
        <p>
          TESSSERA lets you <strong>split that secret into multiple shares</strong> &mdash; say, 5 pieces.
          You decide how many are needed to reconstruct it &mdash; say, 3 out of 5. Then you hand out the
          shares to different people, put them in different safes, different cities, different continents.
        </p>
        <p>
          Any 3 of those 5 shares will perfectly reconstruct your secret. Any 2 or fewer reveal
          <strong> absolutely nothing</strong> &mdash; not a single character, not a hint, not a pattern.
          This isn&apos;t encryption where a partial key gives a partial clue. It&apos;s all or nothing.
        </p>
      </section>

      <hr className="section-divider" />

      {/* Use Cases */}
      <section className="landing-section">
        <h2>What people use it for</h2>
        <div className="scenario-grid">
          <div className="scenario-card">
            <div className="scenario-title">Crypto wallet recovery</div>
            <p>
              Split your seed phrase into shares held by family members. No single
              person can access your funds, but any 3 of 5 can recover them.
            </p>
          </div>
          <div className="scenario-card">
            <div className="scenario-title">Business continuity</div>
            <p>
              Master passwords for company infrastructure split among executives.
              The company can recover access even if some people are unavailable.
            </p>
          </div>
          <div className="scenario-card">
            <div className="scenario-title">Dead man&apos;s switch</div>
            <p>
              Leave shares with your lawyer, spouse, and trusted friend. If something
              happens to you, they can combine shares to access critical accounts.
            </p>
          </div>
          <div className="scenario-card">
            <div className="scenario-title">Geographic redundancy</div>
            <p>
              Store shares in different physical locations. A fire, flood, or theft
              at one location doesn&apos;t compromise or destroy the secret.
            </p>
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* How It Works */}
      <section className="landing-section">
        <h2>How it works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Split</h3>
              <p>
                Type your secret and choose how many shares to create and how many are
                needed to reconstruct. TESSSERA generates QR codes &mdash; one per share.
              </p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Distribute</h3>
              <p>
                Print or photograph each QR code. Give them to different people or store
                them in different locations. Export as PDF for paper backup.
              </p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Reconstruct</h3>
              <p>
                When you need the secret back, scan enough QR codes with your camera,
                upload images, or paste the share text. The secret reappears instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* The Intuition */}
      <section className="landing-section">
        <span className="depth-indicator depth-intermediate">Some math ahead</span>
        <h2>Why it actually works</h2>
        <p>
          The technique is called{' '}
          <strong>
            <a
              href="https://en.wikipedia.org/wiki/Shamir%27s_secret_sharing"
              target="_blank"
              rel="noopener noreferrer"
            >
              Shamir&apos;s Secret Sharing
            </a>
          </strong>
          , invented by Adi Shamir (the &quot;S&quot; in RSA) in 1979. The core idea
          is beautiful in its simplicity:
        </p>
        <p>
          Two points define a line. Three points define a parabola. In general,
          <strong> k points define a unique polynomial of degree k-1</strong>.
        </p>

        <div className="example-box">
          <div className="example-title">Intuition: the line</div>
          <p>
            Say your secret is the number <strong>42</strong>, and you want a 2-of-3 split.
            Pick a random line that passes through <strong>(0, 42)</strong> on the y-axis &mdash;
            for example, <strong>y = 42 + 7x</strong>.
          </p>
          <p>
            Now evaluate the line at three points: x=1 gives 49, x=2 gives 56, x=3 gives 63.
            Hand out the points (1, 49), (2, 56), and (3, 63).
          </p>
          <p>
            Any two of those points uniquely define the line, which reveals the
            y-intercept: 42. But one point alone could lie on infinitely many
            different lines, each with a different y-intercept. <strong>One share tells you nothing.</strong>
          </p>
        </div>

        <p>
          For a 3-of-5 scheme, you use a parabola (degree-2 polynomial) instead of a line.
          For k-of-n, you use a degree-(k-1) polynomial. The secret is always the constant term.
        </p>
      </section>

      <hr className="section-divider" />

      {/* Trust & Security */}
      <section className="landing-section">
        <span className="depth-indicator depth-advanced">Trust architecture</span>
        <h2>Maximum trust, minimum faith</h2>
        <p>
          Most security tools ask you to trust them. TESSSERA is designed so you don&apos;t have to.
          Every aspect of the tool is built around verifiability.
        </p>

        <div className="trust-grid">
          <div className="trust-card">
            <div className="trust-title">No server</div>
            <p>
              Static site on GitHub Pages. No backend, no API, no database, no server-side code.
              There is nothing to hack because there is nothing running.
            </p>
          </div>
          <div className="trust-card">
            <div className="trust-title">No network after load</div>
            <p>
              Content Security Policy enforces <code>connect-src &apos;none&apos;</code>.
              After the page loads, it cannot make network requests &mdash; not even to its own origin.
            </p>
          </div>
          <div className="trust-card">
            <div className="trust-title">No tracking</div>
            <p>
              Zero analytics. Zero cookies. Zero localStorage. Zero sessionStorage.
              Zero IndexedDB. Zero telemetry. Not even error reporting.
            </p>
          </div>
          <div className="trust-card">
            <div className="trust-title">No storage</div>
            <p>
              Nothing persists between sessions. Close the tab and every trace vanishes.
              There is no state to leak.
            </p>
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* Auditability */}
      <section className="landing-section">
        <h2>Fully auditable</h2>
        <p>
          The Shamir implementation is vendored directly into the repository &mdash; not loaded from
          a CDN, not fetched at runtime. You can read every line that touches your secret.
        </p>

        <div className="code-snippet">
          <code>
            src/vendor/secrets/shamir.ts     &mdash; Shamir implementation (audited by Cure53 &amp; Zellic){'\n'}
            src/utils/crypto.ts              &mdash; Split/combine wrapper{'\n'}
            dist/BUILD_MANIFEST.json         &mdash; SHA-256 hashes of all built files
          </code>
        </div>

        <p>
          The <strong>Audit tab</strong> inside the tool shows the exact build commit, hashes of
          every vendored file, and step-by-step instructions to reproduce the build and verify
          nothing was tampered with.
        </p>

        <h3>Escape Pod</h3>
        <p>
          TESSSERA ships a single self-contained HTML file &mdash; the <strong>Escape Pod</strong> &mdash;
          that works offline forever. No dependencies, no CDN, no server. Download it, put it on a USB
          drive, and you can reconstruct shares in 20 years even if every website on the internet is gone.
        </p>
        <p>
          <a
            className="cta-secondary"
            href={`${BASE}tesssera_recovery.html`}
            style={{ display: 'inline-flex', marginTop: '0.5rem' }}
          >
            Open Escape Pod
          </a>
        </p>

        <h3>Reproducible builds</h3>

        <div className="code-snippet">
          <code>
            git clone https://github.com/gwkline/TESSSERA.git{'\n'}
            cd TESSSERA{'\n'}
            npm ci{'\n'}
            npm run build{'\n'}
            # Compare dist/ against BUILD_MANIFEST.json hashes
          </code>
        </div>

        <p>
          Same source, same dependencies, same output. You can verify that the deployed site
          matches the open-source code, byte for byte.
        </p>
      </section>

      <hr className="section-divider" />

      {/* File Splitting */}
      <section className="landing-section">
        <h2>Beyond text</h2>
        <p>
          TESSSERA also splits <strong>files up to 10 MB</strong> into shares. The file is
          base64-encoded and split using the same Shamir scheme. Each share is a text string
          that can be printed, stored in a QR code, or pasted into the combine view.
        </p>
        <p>
          Use it for key files, small documents, password databases, or anything that
          fits. The same threshold logic applies: k-of-n shares to reconstruct, fewer than k
          reveals nothing.
        </p>
      </section>

      <hr className="section-divider" />

      {/* Bottom CTA */}
      <section className="bottom-cta">
        <h2>Ready to split a secret?</h2>
        <p>Free. Open source. No account needed. Works offline.</p>
        <div className="cta-links">
          <a className="hero-cta" href={`${BASE}tool.html`}>
            Launch Tool
          </a>
          <a
            className="cta-secondary"
            href="https://github.com/gwkline/TESSSERA"
            target="_blank"
            rel="noopener noreferrer"
          >
            View Source
          </a>
        </div>
      </section>
    </div>
  );
}
