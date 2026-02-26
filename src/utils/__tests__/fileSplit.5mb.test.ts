import { describe, it, expect } from 'vitest';
import { splitSecret, combineShares } from '../crypto';

const FILE_SIZE = 5 * 1024 * 1024; // exactly 5MB

async function sha256(data: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', new Uint8Array(data));
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

describe('file split round-trip with 5MB file', () => {
  const originalBytes = new Uint8Array(FILE_SIZE);
  for (let offset = 0; offset < FILE_SIZE; offset += 65536) {
    crypto.getRandomValues(new Uint8Array(originalBytes.buffer, offset, Math.min(65536, FILE_SIZE - offset)));
  }

  // Encode as base64 and wrap in file payload format (same as fileSplit.ts)
  let binary = '';
  for (let i = 0; i < originalBytes.length; i++) {
    binary += String.fromCharCode(originalBytes[i]!);
  }
  const base64Data = btoa(binary);

  const payload = JSON.stringify({
    _tesssera_file: true,
    fileName: 'random-5mb.bin',
    mimeType: 'application/octet-stream',
    data: base64Data,
  });

  let shares: string[] = [];
  let originalHash: string;

  it('splits a 5MB file into 2-of-3 shares', async () => {
    originalHash = await sha256(originalBytes);
    const result = await splitSecret(payload, 3, 2);

    expect(result.shares).toHaveLength(3);
    expect(result.threshold).toBe(2);
    expect(result.total).toBe(3);

    shares = result.shares;
  }, 300_000);

  it('combines shares [1, 2] and hash matches', async () => {
    const recovered = await combineShares([shares[0]!, shares[1]!]);
    const parsed = JSON.parse(recovered);

    expect(parsed._tesssera_file).toBe(true);
    expect(parsed.fileName).toBe('random-5mb.bin');

    const recoveredBinary = atob(parsed.data);
    const recoveredBytes = new Uint8Array(recoveredBinary.length);
    for (let i = 0; i < recoveredBinary.length; i++) {
      recoveredBytes[i] = recoveredBinary.charCodeAt(i);
    }

    expect(recoveredBytes.length).toBe(FILE_SIZE);
    expect(await sha256(recoveredBytes)).toBe(originalHash);
  }, 300_000);

  it('combines shares [1, 3] and hash matches', async () => {
    const recovered = await combineShares([shares[0]!, shares[2]!]);
    const parsed = JSON.parse(recovered);

    const recoveredBinary = atob(parsed.data);
    const recoveredBytes = new Uint8Array(recoveredBinary.length);
    for (let i = 0; i < recoveredBinary.length; i++) {
      recoveredBytes[i] = recoveredBinary.charCodeAt(i);
    }

    expect(recoveredBytes.length).toBe(FILE_SIZE);
    expect(await sha256(recoveredBytes)).toBe(originalHash);
  }, 300_000);

  it('combines shares [2, 3] and hash matches', async () => {
    const recovered = await combineShares([shares[1]!, shares[2]!]);
    const parsed = JSON.parse(recovered);

    const recoveredBinary = atob(parsed.data);
    const recoveredBytes = new Uint8Array(recoveredBinary.length);
    for (let i = 0; i < recoveredBinary.length; i++) {
      recoveredBytes[i] = recoveredBinary.charCodeAt(i);
    }

    expect(recoveredBytes.length).toBe(FILE_SIZE);
    expect(await sha256(recoveredBytes)).toBe(originalHash);
  }, 300_000);
});
