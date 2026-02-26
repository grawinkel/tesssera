import { splitSecret, combineShares, decodeShare, type SplitResult } from './crypto';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const WARN_FILE_SIZE = 1 * 1024 * 1024; // 1MB

export interface FileSplitResult extends SplitResult {
  readonly fileName: string;
  readonly mimeType: string;
  readonly originalSize: number;
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the data URL prefix to get pure base64
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function isFileTooLarge(size: number): boolean {
  return size > MAX_FILE_SIZE;
}

export function isFileLarge(size: number): boolean {
  return size > WARN_FILE_SIZE;
}

export async function splitFile(
  file: File,
  totalShares: number,
  threshold: number,
): Promise<FileSplitResult> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
  }

  if (file.size === 0) {
    throw new Error('File is empty');
  }

  const base64 = await readFileAsBase64(file);

  // Prefix the secret with file metadata so it survives reconstruction
  const payload = JSON.stringify({
    _tesssera_file: true,
    fileName: file.name,
    mimeType: file.type || 'application/octet-stream',
    data: base64,
  });

  const result = await splitSecret(payload, totalShares, threshold);

  return {
    ...result,
    fileName: file.name,
    mimeType: file.type || 'application/octet-stream',
    originalSize: file.size,
  };
}

interface FilePayload {
  readonly _tesssera_file: true;
  readonly fileName: string;
  readonly mimeType: string;
  readonly data: string;
}

function isFilePayload(obj: unknown): obj is FilePayload {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    '_tesssera_file' in obj &&
    (obj as FilePayload)._tesssera_file === true
  );
}

export interface ReconstructedFile {
  readonly blob: Blob;
  readonly fileName: string;
  readonly mimeType: string;
}

export async function combineFileShares(encodedShares: readonly string[]): Promise<ReconstructedFile | null> {
  const secret = await combineShares([...encodedShares]);

  // Try to parse as file payload
  try {
    const parsed: unknown = JSON.parse(secret);
    if (!isFilePayload(parsed)) {
      return null;
    }

    const binary = atob(parsed.data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    return {
      blob: new Blob([bytes], { type: parsed.mimeType }),
      fileName: parsed.fileName,
      mimeType: parsed.mimeType,
    };
  } catch {
    return null;
  }
}

export function isFileShare(encodedShare: string): boolean {
  try {
    const meta = decodeShare(encodedShare);
    // File shares are much larger than typical text shares
    return meta.data.length > 1000;
  } catch {
    return false;
  }
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function sanitizeDescription(description: string): string {
  return description
    .slice(0, 30)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .toLowerCase();
}

function getShareTextFilename(index: number, total: number, description?: string): string {
  const base = description ? sanitizeDescription(description) : 'share';
  return `tesssera-${base}-share-${index}-of-${total}.txt`;
}

export function downloadShareAsText(share: string, index: number, total: number, description?: string): void {
  const filename = getShareTextFilename(index, total, description);
  const blob = new Blob([share], { type: 'text/plain' });
  downloadBlob(blob, filename);
}

export function downloadAllSharesAsText(
  shares: readonly string[],
  total: number,
  description?: string,
): void {
  for (const share of shares) {
    const meta = decodeShare(share);
    downloadShareAsText(share, meta.index, total, description);
  }
}
