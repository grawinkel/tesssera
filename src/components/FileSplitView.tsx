import { useState, useRef } from 'react';
import { splitFile, isFileTooLarge, isFileLarge, downloadShareAsText, downloadAllSharesAsText, type FileSplitResult } from '../utils/fileSplit';
import { decodeShare } from '../utils/crypto';

const DESCRIPTION_MAX_LENGTH = 250;

export function FileSplitView() {
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [totalShares, setTotalShares] = useState(5);
  const [threshold, setThreshold] = useState(3);
  const [result, setResult] = useState<FileSplitResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSplit = async () => {
    if (!selectedFile) return;
    setError(null);
    try {
      const splitResult = await splitFile(selectedFile, totalShares, threshold);
      setResult(splitResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'File split failed');
      setResult(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    setError(null);

    if (file && isFileTooLarge(file.size)) {
      setError('File too large. Maximum size is 10MB.');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCopy = async (share: string, index: number) => {
    try {
      await navigator.clipboard.writeText(share);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      setError('Failed to copy — clipboard requires HTTPS or localhost');
    }
  };

  const handleDownloadAll = () => {
    if (!result) return;
    setIsExporting(true);
    try {
      downloadAllSharesAsText(result.shares, result.total, description.trim() || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClear = () => {
    setDescription('');
    setSelectedFile(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const canSplit = selectedFile !== null && !isFileTooLarge(selectedFile.size);

  return (
    <div className="split-view">
      {!result ? (
        <>
          <div className="form-group">
            <label htmlFor="file-description">Description (optional)</label>
            <textarea
              id="file-description"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, DESCRIPTION_MAX_LENGTH))}
              placeholder="Describe this file — used in share filenames..."
              rows={2}
              maxLength={DESCRIPTION_MAX_LENGTH}
            />
            <span className="char-count">{description.length}/{DESCRIPTION_MAX_LENGTH}</span>
          </div>

          <div className="form-group">
            <label htmlFor="fileInput">Select File</label>
            <input
              ref={fileInputRef}
              id="fileInput"
              type="file"
              onChange={handleFileSelect}
              className="file-input"
            />
            {selectedFile && (
              <p className="hint">
                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                {isFileLarge(selectedFile.size) && (
                  <span className="warning"> — Large file, splitting may take a moment</span>
                )}
              </p>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fileTotalShares">Total Shares</label>
              <input
                id="fileTotalShares"
                type="number"
                min={2}
                max={10}
                value={totalShares}
                onChange={(e) => setTotalShares(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label htmlFor="fileThreshold">Required to Unlock</label>
              <input
                id="fileThreshold"
                type="number"
                min={2}
                max={totalShares}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
              />
            </div>
          </div>

          <p className="hint">
            Split into {totalShares} shares. Any {threshold} can reconstruct the file.
          </p>

          {error && <div className="error-message">{error}</div>}

          <button
            className="btn primary"
            onClick={handleSplit}
            disabled={!canSplit}
          >
            Split File
          </button>
        </>
      ) : (
        <>
          <div className="success-banner">
            {description.trim() && <strong>{description.trim()}: </strong>}
            File &ldquo;{result.fileName}&rdquo; ({(result.originalSize / 1024).toFixed(1)} KB) split into {result.total} shares. {result.threshold} required to reconstruct.
          </div>

          <div className="share-display">
            <div className="file-share-list">
              {result.shares.map((share) => {
                const meta = decodeShare(share);
                return (
                  <div key={meta.index} className="share-item">
                    <span>Share {meta.index} of {meta.total}</span>
                    <div className="share-item-actions">
                      <button
                        className="btn-copy"
                        onClick={() => downloadShareAsText(share, meta.index, result.total, description.trim() || undefined)}
                        title="Download as .txt file"
                      >
                        .txt
                      </button>
                      <button
                        className="btn-copy"
                        onClick={() => handleCopy(share, meta.index)}
                        title="Copy full share text"
                      >
                        {copiedIndex === meta.index ? '\u2713' : 'Copy'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="export-section">
            <div className="export-group">
              <div className="export-group-header">Download All Shares</div>
              <p className="export-group-desc">
                Each share is a text file. Store them in separate locations — any {result.threshold} can reconstruct the original file.
              </p>
              <button
                className="btn primary"
                onClick={handleDownloadAll}
                disabled={isExporting}
              >
                {isExporting ? 'Downloading...' : 'Download All .txt Files'}
              </button>
            </div>
          </div>

          <div className="actions">
            <button
              className="btn secondary"
              onClick={() => {
                if (window.confirm('Discard all shares and start over?')) {
                  handleClear();
                }
              }}
            >
              Start Over
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}
        </>
      )}
    </div>
  );
}
