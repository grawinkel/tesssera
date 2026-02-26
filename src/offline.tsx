import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { OfflineRecovery } from './components/OfflineRecovery';
import './styles/offline.css';

/**
 * Escape Pod Entry Point
 *
 * A minimal, self-contained recovery tool that works forever offline.
 * No analytics, no licensing, no external dependencies at runtime.
 *
 * When generated as a per-share escape pod, window.__TESSSERA_PRELOADED_SHARE__
 * is set to the share string, and this pod opens pre-loaded with that share.
 */

declare global {
  interface Window {
    __TESSSERA_PRELOADED_SHARE__?: string;
  }
}

const preloadedShare = window.__TESSSERA_PRELOADED_SHARE__;

function OfflineApp() {
  return (
    <div className="offline-app">
      <header className="offline-header">
        <h1>TESSSERA</h1>
        <p className="tagline">Recovery Tool</p>
        <div className="offline-badge">Offline Mode</div>
      </header>

      <main className="offline-main">
        <OfflineRecovery preloadedShare={preloadedShare} />
      </main>

      <footer className="offline-footer">
        <p>This is a standalone recovery tool. It works without internet.</p>
        <p>All processing happens locally on this device.</p>
        <p><a href="https://tesssera.z0id.net">tesssera.z0id.net</a></p>
      </footer>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <OfflineApp />
  </StrictMode>,
);
