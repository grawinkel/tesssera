import { describe, it, expect } from 'vitest';
import { splitSecret, combineShares } from '../crypto';

describe('fileSplit round-trip via crypto', () => {
  it('handles file-like JSON payloads', async () => {
    // Simulate the file payload that fileSplit.ts creates
    const payload = JSON.stringify({
      _tesssera_file: true,
      fileName: 'test.txt',
      mimeType: 'text/plain',
      data: btoa('Hello, this is file content!'),
    });

    const result = await splitSecret(payload, 3, 2);
    const recovered = await combineShares(result.shares.slice(0, 2));
    const parsed = JSON.parse(recovered);

    expect(parsed._tesssera_file).toBe(true);
    expect(parsed.fileName).toBe('test.txt');
    expect(parsed.mimeType).toBe('text/plain');
    expect(atob(parsed.data)).toBe('Hello, this is file content!');
  });

  it('handles binary-like base64 payloads', async () => {
    // Simulate binary content (random bytes encoded as base64)
    const binaryData = new Uint8Array(256);
    for (let i = 0; i < 256; i++) binaryData[i] = i;
    let binary = '';
    for (let i = 0; i < binaryData.length; i++) {
      binary += String.fromCharCode(binaryData[i]!);
    }
    const base64 = btoa(binary);

    const payload = JSON.stringify({
      _tesssera_file: true,
      fileName: 'binary.bin',
      mimeType: 'application/octet-stream',
      data: base64,
    });

    const result = await splitSecret(payload, 4, 3);
    const recovered = await combineShares(result.shares.slice(0, 3));
    const parsed = JSON.parse(recovered);

    const recoveredBinary = atob(parsed.data);
    expect(recoveredBinary.length).toBe(256);
    for (let i = 0; i < 256; i++) {
      expect(recoveredBinary.charCodeAt(i)).toBe(i);
    }
  });
});
