import { GITHUB_URL, TOOL_PATH } from './constants';

const BASE = import.meta.env.BASE_URL;

export function BottomCTA() {
  return (
    <section className="bottom-cta">
      <h2>Ready to split a secret?</h2>
      <p>Free. Open source. No account needed. Works offline.</p>
      <div className="cta-links">
        <a className="hero-cta" href={`${BASE}${TOOL_PATH}`}>
          Launch Tool
        </a>
        <a
          className="cta-secondary"
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          View Source
        </a>
      </div>
    </section>
  );
}
