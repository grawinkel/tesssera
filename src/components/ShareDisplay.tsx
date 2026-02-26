import { useState } from 'react';
import { QRCodeSVG } from '../vendor/qrcode';
import { decodeShare } from '../utils/crypto';
import { exportSingleSharePDF } from '../utils/pdfExport';

interface ShareDisplayProps {
  readonly shares: readonly string[];
  readonly threshold: number;
  readonly total: number;
  readonly description?: string;
  readonly onDownloadPod?: (share: string, index: number) => void;
}

export function ShareDisplay({ shares, threshold, total, description, onDownloadPod }: ShareDisplayProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [exportingIndex, setExportingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (shares.length === 0) {
    return null;
  }

  const handleCopy = async (share: string, index: number) => {
    try {
      await navigator.clipboard.writeText(share);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      setError('Failed to copy — clipboard requires HTTPS or localhost');
    }
  };

  const handleDownloadPDF = async (share: string, shareIndex: number) => {
    setExportingIndex(shareIndex);
    setError(null);
    try {
      await exportSingleSharePDF(share, shareIndex, threshold, total, description);
    } catch {
      setError(`Failed to generate PDF for Share ${shareIndex}`);
    } finally {
      setExportingIndex(null);
    }
  };

  return (
    <div className="share-display">
      {error && <div className="error-message">{error}</div>}
      <div className="share-grid">
        {shares.map((share, index) => {
          const metadata = decodeShare(share);
          return (
            <div key={index} className="share-card">
              <div className="share-header">
                Share {metadata.index} of {metadata.total}
              </div>
              <div className="qr-container">
                {share.length <= 2331 ? (
                  <QRCodeSVG
                    value={share}
                    size={200}
                    level="M"
                    includeMargin
                    bgColor="#13161d"
                    fgColor="#e8e4df"
                  />
                ) : (
                  <div className="qr-too-large">Share too large for QR code</div>
                )}
              </div>
              <div className="share-text">
                <code>{share.slice(0, 20)}...{share.slice(-10)}</code>
                <button
                  className="btn-copy"
                  onClick={() => handleDownloadPDF(share, metadata.index)}
                  disabled={exportingIndex === metadata.index}
                  aria-label={`Download PDF for Share ${metadata.index}`}
                  title="Download PDF with QR code and text"
                >
                  {exportingIndex === metadata.index ? '...' : 'PDF'}
                </button>
                {onDownloadPod && (
                  <button
                    className="btn-copy"
                    onClick={() => onDownloadPod(share, metadata.index)}
                    aria-label={`Download self-contained HTML recovery file for Share ${metadata.index}`}
                    title="Download self-contained HTML file that works offline forever"
                  >
                    Pod
                  </button>
                )}
                <button
                  className="btn-copy"
                  onClick={() => handleCopy(share, index)}
                  aria-label={`Copy share ${metadata.index} text to clipboard`}
                  title="Copy full share text"
                >
                  {copiedIndex === index ? '\u2713' : 'Copy'}
                </button>
              </div>
              <div className="share-footer">
                Threshold: {metadata.threshold} required
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
