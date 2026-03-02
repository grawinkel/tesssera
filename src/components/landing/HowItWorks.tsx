import { useScrollReveal } from './useScrollReveal';

const SHARES = [1, 2, 3, 4, 5] as const;
const ACTIVE_SHARES = new Set([1, 3, 5]);

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function UnlockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  );
}

function SplitPanel() {
  return (
    <div className="hiw-panel">
      <div className="hiw-label">Split</div>

      <div className="hiw-card hiw-card--secret hiw-anim hiw-anim--1">
        <LockIcon />
        <span>Your Secret</span>
      </div>

      <div className="hiw-connector hiw-anim hiw-anim--2">
        <svg viewBox="0 0 2 24" className="hiw-line-v">
          <line x1="1" y1="0" x2="1" y2="24" pathLength="100" />
        </svg>
      </div>

      <div className="hiw-card hiw-card--brand hiw-anim hiw-anim--3">
        TESSSERA
      </div>

      <div className="hiw-connector hiw-anim hiw-anim--4">
        <svg viewBox="0 0 200 40" className="hiw-line-fan" preserveAspectRatio="none">
          <line x1="100" y1="0" x2="20" y2="40" pathLength="100" />
          <line x1="100" y1="0" x2="60" y2="40" pathLength="100" />
          <line x1="100" y1="0" x2="100" y2="40" pathLength="100" />
          <line x1="100" y1="0" x2="140" y2="40" pathLength="100" />
          <line x1="100" y1="0" x2="180" y2="40" pathLength="100" />
        </svg>
      </div>

      <div className="hiw-shares">
        {SHARES.map((n, i) => (
          <div
            key={n}
            className={`hiw-badge hiw-badge--active hiw-anim hiw-anim--${5 + i}`}
          >
            S-{n}
          </div>
        ))}
      </div>

      <p className="hiw-caption hiw-anim hiw-anim--10">split into 5 shares</p>
    </div>
  );
}

function CombinePanel() {
  return (
    <div className="hiw-panel">
      <div className="hiw-label">Combine</div>

      <div className="hiw-shares">
        {SHARES.map((n, i) => {
          const active = ACTIVE_SHARES.has(n);
          return (
            <div
              key={n}
              className={`hiw-badge ${active ? 'hiw-badge--active' : 'hiw-badge--dim'} hiw-anim hiw-anim--${1 + i}`}
            >
              S-{n}
            </div>
          );
        })}
      </div>

      <div className="hiw-connector hiw-anim hiw-anim--6">
        <svg viewBox="0 0 200 40" className="hiw-line-fan hiw-line-fan--converge" preserveAspectRatio="none">
          <line x1="20" y1="0" x2="100" y2="40" pathLength="100" className="hiw-line--active" />
          <line x1="60" y1="0" x2="100" y2="40" pathLength="100" className="hiw-line--dim" />
          <line x1="100" y1="0" x2="100" y2="40" pathLength="100" className="hiw-line--active" />
          <line x1="140" y1="0" x2="100" y2="40" pathLength="100" className="hiw-line--dim" />
          <line x1="180" y1="0" x2="100" y2="40" pathLength="100" className="hiw-line--active" />
        </svg>
      </div>

      <div className="hiw-card hiw-card--brand hiw-anim hiw-anim--7">
        TESSSERA
      </div>

      <div className="hiw-connector hiw-anim hiw-anim--8">
        <svg viewBox="0 0 2 24" className="hiw-line-v">
          <line x1="1" y1="0" x2="1" y2="24" pathLength="100" />
        </svg>
      </div>

      <div className="hiw-card hiw-card--recovered hiw-anim hiw-anim--9">
        <UnlockIcon />
        <span>Recovered!</span>
      </div>

      <p className="hiw-caption hiw-anim hiw-anim--10">any 3 of 5 is enough</p>
    </div>
  );
}

export function HowItWorks() {
  const { ref, visible } = useScrollReveal();

  return (
    <section
      className={`landing-section hiw ${visible ? 'hiw--visible' : ''}`}
      ref={ref}
    >
      <h2>How it works</h2>
      <p className="hiw-intro">
        Choose any threshold scheme from 2&#8209;of&#8209;2 up to 10&#8209;of&#8209;10.
        Text secrets up to 2,300 characters, files up to 10&nbsp;MB.
      </p>
      <div className="hiw-diptych">
        <SplitPanel />
        <div className="hiw-divider" />
        <CombinePanel />
      </div>
    </section>
  );
}
