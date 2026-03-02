import { useScrollReveal } from './useScrollReveal';
import { GITHUB_URL, TOOL_PATH } from './constants';

const BASE = import.meta.env.BASE_URL;

export function Hero() {
  const { ref, visible } = useScrollReveal();

  return (
    <section className={`hero ${visible ? 'visible' : ''}`} ref={ref}>
      <h1 className="hero-title">
        TE<span className="triple-s">SSS</span>ERA
      </h1>
      <p className="hero-subtitle">Dark magic for digital secrets.</p>
      <p className="hero-pitch">
        Split any secret into shares using Shamir&apos;s threshold scheme.
        No single share reveals anything. Bring enough together and the
        secret reappears &mdash; mathematically guaranteed.
      </p>
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
