import { useState, useCallback } from 'react';
import { decodeShare, isValidShare } from '../utils/crypto';
import { combineFileShares, downloadBlob } from '../utils/fileSplit';

type InputMode = 'type' | 'upload';

export function FileCombineView() {
  const [shares, setShares] = useState<string[]>([]);
  const [revealedFile, setRevealedFile] = useState<{ fileName: string; mimeType: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>('type');
  const [manualInput, setManualInput] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const threshold = shares.length > 0
    ? decodeShare(shares[0]).threshold
    : null;

  const addShare = useCallback((data: string) => {
    const trimmed = data.trim();

    if (!isValidShare(trimmed)) {
      setError('Invalid share format. A valid share starts with "eyJ" (base64-encoded JSON). Check that you pasted the full share text.');
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
        setError('This share belongs to a different file (different threshold or total count)');
        return false;
      }
    }

    setError(null);
    setShares((prev) => [...prev, trimmed]);
    return true;
  }, [shares]);

  const handleManualAdd = () => {
    if (addShare(manualInput)) {
      setManualInput('');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      try {
        const text = await file.text();
        const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
        for (const line of lines) {
          addShare(line);
        }
      } catch {
        setError(`Could not read file: ${file.name}`);
      }
    }

    e.target.value = '';
  };

  const handleRemoveShare = (index: number) => {
    setShares((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCombine = async () => {
    setError(null);
    try {
      const fileResult = await combineFileShares(shares);
      if (fileResult) {
        downloadBlob(fileResult.blob, fileResult.fileName);
        setRevealedFile({ fileName: fileResult.fileName, mimeType: fileResult.mimeType });
      } else {
        setError('These shares do not contain a file. If you split a text secret, use the Secrets tab to combine.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to combine shares');
    }
  };

  const handleReset = () => {
    if (shares.length > 0 && !revealedFile) {
      if (!window.confirm('Discard all collected shares?')) {
        return;
      }
    }
    setShares([]);
    setRevealedFile(null);
    setError(null);
    setManualInput('');
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
      try {
        const fileText = await file.text();
        const lines = fileText.split('\n').map((l) => l.trim()).filter(Boolean);
        for (const line of lines) {
          addShare(line);
        }
      } catch {
        setError(`Could not read dropped file: ${file.name}`);
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
      {revealedFile ? (
        <>
          <div className="success-banner">File Reconstructed</div>
          <div className="revealed-file">
            <p>
              Downloaded: <strong>{revealedFile.fileName}</strong>
            </p>
            <p className="hint">Type: {revealedFile.mimeType}</p>
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
                  ? `Ready! ${shares.length} shares collected — enough to reconstruct the file.`
                  : `Added: ${shares.length} / ${threshold} required${sharesRemaining !== null && sharesRemaining > 0 ? ` — ${sharesRemaining} more ${sharesRemaining === 1 ? 'share' : 'shares'} needed` : ''}`
                }
              </p>
            ) : (
              <p>Add your first share to begin</p>
            )}
          </div>

          <p className="hint" style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
            Drop .txt share files anywhere on this page, or use the inputs below.
          </p>

          <div className="mode-toggle">
            <button
              className={`mode-btn ${inputMode === 'type' ? 'active' : ''}`}
              onClick={() => setInputMode('type')}
            >
              Paste Share Text
            </button>
            <button
              className={`mode-btn ${inputMode === 'upload' ? 'active' : ''}`}
              onClick={() => setInputMode('upload')}
            >
              Upload .txt Files
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

          {inputMode === 'type' && (
            <div className="manual-input">
              <div className="form-group">
                <label htmlFor="fileShareInput">Paste Share Text</label>
                <textarea
                  id="fileShareInput"
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

          {inputMode === 'upload' && (
            <div className="form-group">
              <label htmlFor="txtUpload">Select .txt Share Files</label>
              <input
                id="txtUpload"
                type="file"
                accept=".txt,text/plain"
                multiple
                onChange={handleFileUpload}
                className="file-input"
              />
              <p className="hint">
                Upload one or more .txt files containing share text.
              </p>
            </div>
          )}

          <div className="actions">
            {canCombine && (
              <button className="btn primary" onClick={handleCombine}>
                Reconstruct File
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
              Drop .txt share files here
            </div>
          )}
        </>
      )}
    </div>
  );
}
