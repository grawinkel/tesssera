import { useState, useRef } from 'react';
import { combineShares, isValidShare, decodeShare } from '../utils/crypto';
import { QRCodeSVG } from '../vendor/qrcode';
import { decodeQRFromFile } from '../utils/qrDecode';
import { decodeQRFromPDF, isPDFFile } from '../utils/pdfParse';

interface OfflineRecoveryProps {
  readonly preloadedShare?: string;
}

/**
 * Offline Recovery Component
 *
 * Text-based recovery interface for the Escape Pod.
 * When a preloadedShare is provided, it displays the QR code for that share
 * and lets the user import the remaining shares to combine.
 */
export function OfflineRecovery({ preloadedShare }: OfflineRecoveryProps) {
  const preloadedMeta = preloadedShare && isValidShare(preloadedShare)
    ? decodeShare(preloadedShare)
    : null;

  const initialFieldCount = preloadedMeta
    ? preloadedMeta.threshold - 1
    : 3;

  const [shares, setShares] = useState<string[]>(
    Array.from({ length: Math.max(initialFieldCount, 2) }, () => ''),
  );
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [threshold, setThreshold] = useState<number | null>(
    preloadedMeta?.threshold ?? null,
  );
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleShareChange = (index: number, value: string) => {
    const updated = shares.map((s, i) => (i === index ? value.trim() : s));
    setShares(updated);
    setError(null);

    const firstValid = updated.find(s => s && isValidShare(s));
    if (firstValid) {
      setThreshold(decodeShare(firstValid).threshold);
    }
  };

  const addShareField = () => {
    setShares([...shares, '']);
  };

  const removeShareField = (index: number) => {
    if (shares.length > 2) {
      setShares(shares.filter((_, i) => i !== index));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setUploadError(null);
    try {
      for (const file of files) {
        if (isPDFFile(file)) {
          const decoded = await decodeQRFromPDF(file);
          for (const shareData of decoded) {
            addShareFromUpload(shareData);
          }
        } else {
          const shareData = await decodeQRFromFile(file);
          addShareFromUpload(shareData);
        }
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to read QR code from file');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const addShareFromUpload = (shareData: string) => {
    const emptyIndex = shares.findIndex(s => s === '');
    if (emptyIndex >= 0) {
      const updated = shares.map((s, i) => (i === emptyIndex ? shareData : s));
      setShares(updated);
    } else {
      setShares([...shares, shareData]);
    }

    if (isValidShare(shareData)) {
      setThreshold(decodeShare(shareData).threshold);
    }
  };

  const getAllShares = (): string[] => {
    const manual = shares.filter(s => s.trim() !== '');
    return preloadedShare ? [preloadedShare, ...manual] : manual;
  };

  const handleCombine = async () => {
    setError(null);
    const allShares = getAllShares();

    if (allShares.length === 0) {
      setError('Please enter at least one share');
      return;
    }

    for (let i = 0; i < allShares.length; i++) {
      if (!isValidShare(allShares[i])) {
        setError(`Share ${i + 1} is invalid. Make sure you copied the complete text.`);
        return;
      }
    }

    try {
      const secret = await combineShares(allShares);
      setRevealedSecret(secret);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to combine shares');
    }
  };

  const handleReset = () => {
    setShares(Array.from({ length: Math.max(initialFieldCount, 2) }, () => ''));
    setRevealedSecret(null);
    setError(null);
    setUploadError(null);
    setThreshold(preloadedMeta?.threshold ?? null);
  };

  const validManualCount = shares.filter(s => s.trim() && isValidShare(s)).length;
  const totalValidCount = validManualCount + (preloadedMeta ? 1 : 0);
  const effectiveThreshold = threshold ?? preloadedMeta?.threshold;
  const canCombine = effectiveThreshold ? totalValidCount >= effectiveThreshold : totalValidCount >= 2;

  if (revealedSecret) {
    return (
      <div className="offline-recovery">
        <div className="success-banner">Secret Recovered Successfully</div>
        <div className="revealed-secret">
          <pre>{revealedSecret}</pre>
        </div>
        <button className="btn secondary" onClick={handleReset}>
          Recover Another Secret
        </button>
      </div>
    );
  }

  return (
    <div className="offline-recovery">
      {preloadedMeta && preloadedShare && (
        <div className="preloaded-banner">
          <h3>This pod contains Share {preloadedMeta.index} of {preloadedMeta.total}</h3>
          <p>
            You need {preloadedMeta.threshold - 1} more
            {preloadedMeta.threshold - 1 === 1 ? ' share' : ' shares'} to reveal the secret.
          </p>
          <div className="preloaded-qr">
            <QRCodeSVG
              value={preloadedShare}
              size={160}
              level="M"
              includeMargin
              bgColor="#191d27"
              fgColor="#e8e4df"
            />
          </div>
        </div>
      )}

      <div className="recovery-header">
        <h2>{preloadedMeta ? 'Add Remaining Shares' : 'Recover Your Secret'}</h2>
        <p>Paste share text, or upload QR images / TESSSERA PDFs.</p>
        {effectiveThreshold && (
          <p className="threshold-info">
            {preloadedMeta
              ? <>Added: <strong>{totalValidCount}</strong> / {effectiveThreshold} required</>
              : <>This secret requires <strong>{effectiveThreshold}</strong> shares to recover.</>
            }
          </p>
        )}
      </div>

      <div className="file-upload-section">
        <label className="btn secondary file-upload-btn">
          Upload QR Image or PDF
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf,.pdf"
            multiple
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </label>
        {uploadError && <div className="error-message">{uploadError}</div>}
      </div>

      <div className="share-inputs">
        {shares.map((share, index) => (
          <div key={index} className="share-input-group">
            <label htmlFor={`share-${index}`}>
              Share {preloadedMeta ? index + 2 : index + 1}
            </label>
            <div className="input-row">
              <textarea
                id={`share-${index}`}
                value={share}
                onChange={(e) => handleShareChange(index, e.target.value)}
                placeholder="Paste the share text here (starts with 'eyJ...')"
                rows={3}
                className={share && !isValidShare(share) ? 'invalid' : ''}
              />
              {shares.length > 2 && (
                <button
                  className="btn-icon danger"
                  onClick={() => removeShareField(index)}
                  title="Remove this share"
                >
                  x
                </button>
              )}
            </div>
            {share && isValidShare(share) && (
              <span className="valid-indicator">Valid share</span>
            )}
          </div>
        ))}
      </div>

      <button className="btn secondary" onClick={addShareField}>
        + Add Another Share
      </button>

      {error && <div className="error-message">{error}</div>}

      <div className="actions">
        <button
          className="btn primary"
          onClick={handleCombine}
          disabled={!canCombine}
        >
          Recover Secret
        </button>
      </div>

      <div className="offline-note">
        <p>
          <strong>Note:</strong> This recovery tool works completely offline.
          No internet connection is required. Your secret never leaves this device.
        </p>
      </div>
    </div>
  );
}
