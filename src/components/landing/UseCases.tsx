import { useScrollReveal } from './useScrollReveal';

const cases = [
  {
    title: 'Crypto Recovery',
    desc: 'Split your seed phrase among family members. No single person can access funds, but any 3 of 5 can recover them.',
    icon: (
      <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        <circle cx="12" cy="14" r="2" />
      </svg>
    ),
  },
  {
    title: 'Business Continuity',
    desc: 'Master passwords split among executives. The company recovers access even if some people are unavailable.',
    icon: (
      <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="18" rx="2" />
        <line x1="9" y1="3" x2="9" y2="21" />
        <path d="M13 8h4" />
        <path d="M13 12h4" />
        <path d="M13 16h4" />
      </svg>
    ),
  },
  {
    title: 'Estate Planning',
    desc: 'Leave shares with your lawyer, spouse, and trusted friend. They combine shares to access critical accounts if needed.',
    icon: (
      <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

export function UseCases() {
  const { ref, visible } = useScrollReveal();

  return (
    <section className={`landing-section reveal ${visible ? 'visible' : ''}`} ref={ref}>
      <h2>What people use it for</h2>
      <div className="usecase-grid">
        {cases.map((c) => (
          <div key={c.title} className="usecase-card">
            <div className="usecase-icon">{c.icon}</div>
            <div className="usecase-title">{c.title}</div>
            <p>{c.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
