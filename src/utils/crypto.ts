import { split, combine } from '../vendor/secrets';

export interface SplitResult {
  shares: string[];
  threshold: number;
  total: number;
}

export interface ShareMetadata {
  index: number;
  threshold: number;
  total: number;
  data: string;
}

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

function base64ToUint8(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Splits a secret into N shares using Shamir's Secret Sharing.
 * Requires `threshold` shares to reconstruct.
 */
export async function splitSecret(
  secret: string,
  totalShares: number = 5,
  threshold: number = 3
): Promise<SplitResult> {
  if (totalShares < 2 || totalShares > 255) {
    throw new Error('Total shares must be between 2 and 255');
  }
  if (threshold < 2 || threshold > totalShares) {
    throw new Error('Threshold must be between 2 and total shares');
  }
  if (!secret || secret.length === 0) {
    throw new Error('Secret cannot be empty');
  }

  const secretBytes = new TextEncoder().encode(secret);
  const rawShares = await split(secretBytes, totalShares, threshold);

  const shares = rawShares.map((shareBytes, i) => {
    const metadata: ShareMetadata = {
      index: i + 1,
      threshold,
      total: totalShares,
      data: uint8ToBase64(shareBytes),
    };
    return encodeShare(metadata);
  });

  return { shares, threshold, total: totalShares };
}

/**
 * Combines shares to reconstruct the original secret.
 * Requires at least `threshold` valid shares.
 */
export async function combineShares(encodedShares: string[]): Promise<string> {
  if (encodedShares.length === 0) {
    throw new Error('No shares provided');
  }

  const metadata = encodedShares.map(decodeShare);
  const threshold = metadata[0]!.threshold;

  if (encodedShares.length < threshold) {
    throw new Error(
      `Need at least ${threshold} shares, but only ${encodedShares.length} provided`
    );
  }

  const rawShares = metadata.map((m) => base64ToUint8(m.data));
  const secretBytes = await combine(rawShares);
  return new TextDecoder().decode(secretBytes);
}

/**
 * Encodes share metadata into a base64 string for QR code.
 */
function encodeShare(metadata: ShareMetadata): string {
  const json = JSON.stringify(metadata);
  return btoa(json);
}

/**
 * Decodes a base64 share string back to metadata.
 */
export function decodeShare(encoded: string): ShareMetadata {
  try {
    const json = atob(encoded);
    return JSON.parse(json) as ShareMetadata;
  } catch {
    throw new Error('Invalid share format');
  }
}

/**
 * Validates if a string is a valid encoded share.
 */
export function isValidShare(encoded: string): boolean {
  try {
    const metadata = decodeShare(encoded);
    return (
      typeof metadata.index === 'number' &&
      typeof metadata.threshold === 'number' &&
      typeof metadata.total === 'number' &&
      typeof metadata.data === 'string' &&
      metadata.data.length > 0 &&
      metadata.index >= 1 &&
      metadata.index <= metadata.total &&
      metadata.threshold >= 2 &&
      metadata.threshold <= metadata.total &&
      metadata.total <= 255
    );
  } catch {
    return false;
  }
}
