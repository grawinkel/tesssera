import { useOffline } from '../hooks/useOffline';

export function OfflineIndicator() {
  const isOffline = useOffline();

  if (!isOffline) {
    return null;
  }

  return (
    <div className="offline-indicator">
      <span className="offline-dot" />
      Offline Mode - Safe to proceed
    </div>
  );
}
