import { useEffect, useRef } from 'react';

interface FeatureCard {
  readonly title: string;
  readonly description: string;
  readonly limit: string;
  readonly icon: React.ReactNode;
}

const FEATURES: readonly FeatureCard[] = [
  {
    title: 'QR Codes',
    description: 'Each share becomes a scannable QR code for easy mobile recovery.',
    limit: '\u2264 2,300 chars',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="3" height="3" />
        <line x1="21" y1="14" x2="21" y2="14.01" />
        <line x1="21" y1="21" x2="21" y2="21.01" />
        <line x1="17" y1="21" x2="17" y2="21.01" />
      </svg>
    ),
  },
  {
    title: 'PDF Export',
    description: 'Print-ready page per share with QR code and text backup.',
    limit: 'A4, one per share',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    title: 'Text Shares',
    description: 'Copy to clipboard or download as .txt files for flexible storage.',
    limit: 'No limit',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" />
      </svg>
    ),
  },
  {
    title: 'Escape Pod',
    description: 'Self-contained HTML recovery tool per share \u2014 works offline forever.',
    limit: '~500 KB each',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    title: 'File Splitting',
    description: 'Split files (not just text) into Shamir shares with full reconstruction.',
    limit: 'Up to 10 MB',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
        <polyline points="13 2 13 9 20 9" />
      </svg>
    ),
  },
];

export function Features() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible');
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="landing-section reveal">
      <h2>What you get</h2>
      <p>
        Split text or files. Export as QR codes, PDFs, text, or self-contained HTML recovery tools.
        Configure 2&ndash;10 shares, threshold from 2 to total, with an optional 250-character description.
      </p>
      <div className="feature-grid">
        {FEATURES.map((f) => (
          <div key={f.title} className="feature-card">
            <div className="feature-icon">{f.icon}</div>
            <div className="feature-body">
              <div className="feature-title">{f.title}</div>
              <p>{f.description}</p>
              <span className="feature-limit">{f.limit}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
