import { useState, useRef } from 'react';
import { decodeQRFromFile } from '../utils/qrDecode';
import { decodeQRFromPDF, isPDFFile } from '../utils/pdfParse';

interface ImageScannerProps {
  readonly onScan: (data: string) => void;
  readonly onError?: (error: string) => void;
}

export function ImageScanner({ onScan, onError }: ImageScannerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setIsProcessing(true);
    try {
      for (const file of files) {
        if (isPDFFile(file)) {
          const shares = await decodeQRFromPDF(file);
          for (const share of shares) {
            onScan(share);
          }
        } else {
          const result = await decodeQRFromFile(file);
          onScan(result);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to read QR code from file';
      onError?.(message);
    } finally {
      setIsProcessing(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return (
    <div className="image-scanner">
      <label className="btn primary file-upload-btn">
        {isProcessing ? 'Reading...' : 'Upload QR Image or PDF'}
        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf,.pdf"
          multiple
          onChange={handleFileChange}
          disabled={isProcessing}
          style={{ display: 'none' }}
        />
      </label>
      <p className="hint">
        Upload a photo, screenshot of a QR code, or a TESSSERA share PDF.
      </p>
    </div>
  );
}
