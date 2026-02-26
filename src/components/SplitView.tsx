import { useState } from 'react';
import { splitSecret, decodeShare, type SplitResult } from '../utils/crypto';
import { exportAllSharesPDF } from '../utils/pdfExport';
import { ShareDisplay } from './ShareDisplay';

const DESCRIPTION_MAX_LENGTH = 250;

export function SplitView() {
  const [description, setDescription] = useState('');
  const [secret, setSecret] = useState('');
  const [totalShares, setTotalShares] = useState(5);
  const [threshold, setThreshold] = useState(3);
  const [result, setResult] = useState<SplitResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleSplit = async () => {
    setError(null);
    try {
      const splitResult = await splitSecret(secret, totalShares, threshold);
      setResult(splitResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Split failed');
      setResult(null);
    }
  };

  const handleExportPDF = async () => {
    if (!result) return;
    setIsExporting(true);
    try {
      await exportAllSharesPDF(
        result.shares,
        result.threshold,
        result.total,
        description.trim() || undefined,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PDF export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPod = async (share: string, index: number) => {
    if (!result) return;
    try {
      const { downloadShareEscapePod } = await import('../utils/escapePodExport');
      await downloadShareEscapePod(share, index, result.total, description.trim() || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Escape pod export failed');
    }
  };

  const handleDownloadAllPods = async () => {
    if (!result) return;
    setIsExporting(true);
    try {
      const { downloadShareEscapePod } = await import('../utils/escapePodExport');
      for (const shareStr of result.shares) {
        const meta = decodeShare(shareStr);
        await downloadShareEscapePod(shareStr, meta.index, result.total, description.trim() || undefined);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Escape pod export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClear = () => {
    setDescription('');
    setSecret('');
    setResult(null);
    setError(null);
  };

  const canSplit = secret.trim().length > 0;

  return (
    <div className="split-view">
      {!result ? (
        <>
          <div className="form-group">
            <label htmlFor="description">Description (optional)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, DESCRIPTION_MAX_LENGTH))}
              placeholder="Describe this secret — shown on PDF backup cards..."
              rows={3}
              maxLength={DESCRIPTION_MAX_LENGTH}
            />
            <span className="char-count">{description.length}/{DESCRIPTION_MAX_LENGTH}</span>
          </div>

          <div className="form-group">
            <label htmlFor="secret">Your Secret</label>
            <textarea
              id="secret"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Enter the text you want to protect..."
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="totalShares">Total Shares</label>
              <input
                id="totalShares"
                type="number"
                min={2}
                max={10}
                value={totalShares}
                onChange={(e) => setTotalShares(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label htmlFor="threshold">Required to Unlock</label>
              <input
                id="threshold"
                type="number"
                min={2}
                max={totalShares}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
              />
            </div>
          </div>

          <p className="hint">
            Split into {totalShares} shares. Any {threshold} can reconstruct.
          </p>

          {error && <div className="error-message">{error}</div>}

          <button
            className="btn primary"
            onClick={handleSplit}
            disabled={!canSplit}
          >
            Generate Shares
          </button>
        </>
      ) : (
        <>
          <div className="success-banner">
            {description.trim() && <strong>{description.trim()}: </strong>}
            Secret split into {result.total} shares. {result.threshold} required to reconstruct.
          </div>

          <ShareDisplay
            shares={result.shares}
            threshold={result.threshold}
            total={result.total}
            description={description.trim() || undefined}
            onDownloadPod={handleDownloadPod}
          />

          <div className="export-section">
            <div className="export-group">
              <div className="export-group-header">Paper Backup</div>
              <p className="export-group-desc">
                One page per share with QR code and full text. Print and store in separate locations.
              </p>
              <button
                className="btn primary"
                onClick={handleExportPDF}
                disabled={isExporting}
                aria-label="Download all shares as PDF files"
              >
                {isExporting ? 'Generating...' : 'Download All PDFs'}
              </button>
            </div>

            <div className="export-group">
              <div className="export-group-header">Digital Recovery Tools</div>
              <p className="export-group-desc">
                Self-contained HTML files. Each includes one share plus the complete recovery tool.
                Works offline forever — save to USB drives or cloud storage.
              </p>
              <button
                className="btn primary"
                onClick={handleDownloadAllPods}
                disabled={isExporting}
                aria-label="Download all shares as self-contained HTML recovery files"
              >
                {isExporting ? 'Generating...' : 'Download All Escape Pods'}
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
