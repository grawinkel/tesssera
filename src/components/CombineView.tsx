import { useState, useCallback } from 'react';
import { Scanner } from './Scanner';
import { ImageScanner } from './ImageScanner';
import { combineShares, decodeShare, isValidShare } from '../utils/crypto';
import { decodeQRFromPDF, isPDFFile } from '../utils/pdfParse';

type InputMode = 'scan' | 'type' | 'upload';

export function CombineView() {
  const [shares, setShares] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>('scan');
  const [manualInput, setManualInput] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  const threshold = shares.length > 0
    ? decodeShare(shares[0]).threshold
    : null;

  const addShare = useCallback((data: string) => {
    const trimmed = data.trim();

    if (!isValidShare(trimmed)) {
      setError('Invalid share format. A valid share starts with "eyJ" (base64-encoded JSON). Check that you copied the full share text.');
      return false;
    }

    if (shares.includes(trimmed)) {
      setError('This share was already added');
      return false;
    }

    if (shares.length > 0) {
      const existingMeta = decodeShare(shares[0]);
      const newMeta = decodeShare(trimmed);
      if (existingMeta.total !== newMeta.total || existingMeta.threshold !== newMeta.threshold) {
        setError('This share belongs to a different secret (different threshold or total count)');
        return false;
      }
    }

    setError(null);
    setShares((prev) => [...prev, trimmed]);
    return true;
  }, [shares]);

  const handleScan = useCallback((data: string) => {
    addShare(data);
  }, [addShare]);

  const handleManualAdd = () => {
    if (addShare(manualInput)) {
      setManualInput('');
    }
  };

  const handleRemoveShare = (index: number) => {
    setShares((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCombine = async () => {
    setError(null);
    try {
      const secret = await combineShares(shares);
      setRevealedSecret(secret);
      setIsScanning(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to combine shares');
    }
  };

  const handleReset = () => {
    if (shares.length > 0 && !revealedSecret) {
      if (!window.confirm('Discard all collected shares?')) {
        return;
      }
    }
    setShares([]);
    setRevealedSecret(null);
    setError(null);
    setIsScanning(false);
    setManualInput('');
    setCopiedSecret(false);
  };

  const handleCopySecret = async () => {
    if (!revealedSecret) return;
    try {
      await navigator.clipboard.writeText(revealedSecret);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } catch {
      setError('Failed to copy — clipboard requires HTTPS or localhost');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const text = e.dataTransfer.getData('text/plain');
    if (text) {
      addShare(text);
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    for (const file of files) {
      if (isPDFFile(file)) {
        try {
          const decoded = await decodeQRFromPDF(file);
          for (const share of decoded) {
            addShare(share);
          }
        } catch {
          setError('Could not read QR code from dropped PDF');
        }
      } else if (file.type.startsWith('image/')) {
        try {
          const { decodeQRFromFile } = await import('../utils/qrDecode');
          const data = await decodeQRFromFile(file);
          addShare(data);
        } catch {
          setError('Could not read QR code from dropped image');
        }
      } else if (file.type === 'text/plain') {
        const fileText = await file.text();
        const lines = fileText.split('\n').map((l) => l.trim()).filter(Boolean);
        for (const line of lines) {
          addShare(line);
        }
      }
    }
  };

  const canCombine = threshold !== null && shares.length >= threshold;
  const sharesRemaining = threshold !== null ? threshold - shares.length : null;

  return (
    <div
      className={`combine-view ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {revealedSecret ? (
        <>
          <div className="success-banner">Secret Revealed</div>
          <div className="revealed-secret">
            <pre>{revealedSecret}</pre>
            <button
              className="btn primary"
              onClick={handleCopySecret}
              aria-label="Copy revealed secret to clipboard"
              style={{ marginTop: '0.75rem' }}
            >
              {copiedSecret ? 'Copied' : 'Copy Secret'}
            </button>
          </div>
          <button className="btn secondary" onClick={handleReset}>
            Start Over
          </button>
        </>
      ) : (
        <>
          <div className="progress-info">
            {threshold ? (
              <p>
                {canCombine
                  ? `Ready! ${shares.length} shares collected — enough to reveal the secret.`
                  : `Added: ${shares.length} / ${threshold} required${sharesRemaining !== null && sharesRemaining > 0 ? ` — ${sharesRemaining} more ${sharesRemaining === 1 ? 'share' : 'shares'} needed` : ''}`
                }
              </p>
            ) : (
              <p>Add your first share to begin</p>
            )}
          </div>

          <p className="hint" style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
            Drop images, PDFs, or text files anywhere on this page to add shares.
          </p>

          <div className="mode-toggle">
            <button
              className={`mode-btn ${inputMode === 'scan' ? 'active' : ''}`}
              onClick={() => { setInputMode('scan'); setIsScanning(false); }}
            >
              Scan QR
            </button>
            <button
              className={`mode-btn ${inputMode === 'upload' ? 'active' : ''}`}
              onClick={() => { setInputMode('upload'); setIsScanning(false); }}
            >
              Upload File
            </button>
            <button
              className={`mode-btn ${inputMode === 'type' ? 'active' : ''}`}
              onClick={() => { setInputMode('type'); setIsScanning(false); }}
            >
              Paste Share Text
            </button>
          </div>

          {shares.length > 0 && (
            <div className="shares-list">
              {shares.map((shareItem, i) => {
                const meta = decodeShare(shareItem);
                return (
                  <div key={i} className="share-item">
                    <span>Share {meta.index} of {meta.total}</span>
                    <button
                      className="btn-remove"
                      onClick={() => handleRemoveShare(i)}
                      title="Remove"
                      aria-label={`Remove share ${meta.index}`}
                    >
                      x
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          {inputMode === 'scan' && (
            <>
              <Scanner
                isActive={isScanning}
                onScan={handleScan}
                onError={setError}
              />
              <div className="actions">
                {!isScanning ? (
                  <button
                    className="btn primary"
                    onClick={() => setIsScanning(true)}
                  >
                    {shares.length > 0 ? 'Scan Next Share' : 'Start Scanning'}
                  </button>
                ) : (
                  <button
                    className="btn secondary"
                    onClick={() => setIsScanning(false)}
                  >
                    Stop Scanning
                  </button>
                )}
              </div>
            </>
          )}

          {inputMode === 'upload' && (
            <ImageScanner
              onScan={handleScan}
              onError={setError}
            />
          )}

          {inputMode === 'type' && (
            <div className="manual-input">
              <div className="form-group">
                <label htmlFor="shareInput">Paste Share Text</label>
                <textarea
                  id="shareInput"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Paste the share text here (starts with 'eyJ...')"
                  rows={3}
                />
              </div>
              <button
                className="btn primary"
                onClick={handleManualAdd}
                disabled={!manualInput.trim()}
              >
                Add Share
              </button>
            </div>
          )}

          <div className="actions">
            {canCombine && (
              <button className="btn primary" onClick={handleCombine}>
                Reveal Secret
              </button>
            )}

            {shares.length > 0 && (
              <button className="btn danger" onClick={handleReset}>
                Reset
              </button>
            )}
          </div>

          {isDragOver && (
            <div className="drop-overlay">
              Drop images or text files here
            </div>
          )}
        </>
      )}
    </div>
  );
}
