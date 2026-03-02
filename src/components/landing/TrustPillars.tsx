import { useScrollReveal } from './useScrollReveal';

const pillars = [
  {
    title: 'No Server',
    desc: 'Static site on GitHub Pages. No backend, no API, no database.',
    icon: (
      <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="8" rx="2" />
        <rect x="2" y="14" width="20" height="8" rx="2" />
        <line x1="6" y1="6" x2="6.01" y2="6" />
        <line x1="6" y1="18" x2="6.01" y2="18" />
        <line x1="2" y1="6" x2="22" y2="18" stroke="var(--danger)" strokeWidth="2" />
      </svg>
    ),
  },
  {
    title: 'No Network',
    desc: 'CSP blocks all connections after load. Your secrets never leave the browser.',
    icon: (
      <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        <line x1="4" y1="4" x2="20" y2="20" stroke="var(--danger)" strokeWidth="2" />
      </svg>
    ),
  },
  {
    title: 'No Tracking',
    desc: 'Zero analytics, cookies, localStorage, or telemetry. Nothing.',
    icon: (
      <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
        <line x1="4" y1="4" x2="20" y2="20" stroke="var(--danger)" strokeWidth="2" />
      </svg>
    ),
  },
  {
    title: 'Auditable',
    desc: 'Crypto vendored in-repo. Build manifest with SHA-256 hashes. Reproducible.',
    icon: (
      <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" stroke="var(--success)" strokeWidth="2" />
      </svg>
    ),
  },
];

export function TrustPillars() {
  const { ref, visible } = useScrollReveal();

  return (
    <section className={`landing-section reveal ${visible ? 'visible' : ''}`} ref={ref}>
      <h2>Maximum trust, minimum faith</h2>
      <div className="trust-grid">
        {pillars.map((p) => (
          <div key={p.title} className="trust-card">
            <div className="trust-icon">{p.icon}</div>
            <div>
              <div className="trust-title">{p.title}</div>
              <p>{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
