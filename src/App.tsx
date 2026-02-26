import { useState } from 'react';
import { SecretsView } from './components/SecretsView';
import { FilesView } from './components/FilesView';
import { AuditView } from './components/AuditView';
import { OfflineIndicator } from './components/OfflineIndicator';
import './styles/index.css';

type Tab = 'secrets' | 'files' | 'audit';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('secrets');
  const [bannerDismissed, setBannerDismissed] = useState(false);

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-logo">TE<span className="triple-s">SSS</span>ERA</h1>
        <p className="tagline">Shamir Secret Sharing with QR Codes</p>
        <OfflineIndicator />
      </header>

      {!bannerDismissed && (
        <div className="intro-banner" role="banner">
          <p>
            Split a secret into pieces. No single piece reveals anything.
            Combine enough pieces and the secret reappears.
          </p>
          <div className="intro-banner-actions">
            <a href="./" className="intro-link">Learn more</a>
            <button
              className="intro-dismiss"
              onClick={() => setBannerDismissed(true)}
              aria-label="Dismiss introduction"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <nav className="tab-nav">
        <button
          className={`tab ${activeTab === 'secrets' ? 'active' : ''}`}
          onClick={() => setActiveTab('secrets')}
        >
          Secrets
        </button>
        <button
          className={`tab ${activeTab === 'files' ? 'active' : ''}`}
          onClick={() => setActiveTab('files')}
        >
          Files
        </button>
        <button
          className={`tab ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          Audit
        </button>
      </nav>

      <main id="main-content" className="main-content">
        {activeTab === 'secrets' && <SecretsView />}
        {activeTab === 'files' && <FilesView />}
        {activeTab === 'audit' && <AuditView />}
      </main>

      <footer className="app-footer">
        <p>All processing happens locally. Your secrets never leave this device.</p>
      </footer>
    </div>
  );
}

export default App;
