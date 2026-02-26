import { describe, it, expect } from 'vitest';
import { splitSecret, combineShares, decodeShare, isValidShare } from '../crypto';

describe('splitSecret', () => {
  it('splits and combines a simple text secret', async () => {
    const secret = 'hello world';
    const result = await splitSecret(secret, 5, 3);

    expect(result.shares).toHaveLength(5);
    expect(result.threshold).toBe(3);
    expect(result.total).toBe(5);

    const recovered = await combineShares(result.shares.slice(0, 3));
    expect(recovered).toBe(secret);
  });

  it('works with minimum threshold of 2', async () => {
    const secret = 'min threshold';
    const result = await splitSecret(secret, 3, 2);

    expect(result.shares).toHaveLength(3);
    const recovered = await combineShares(result.shares.slice(0, 2));
    expect(recovered).toBe(secret);
  });

  it('works when threshold equals total', async () => {
    const secret = 'all shares needed';
    const result = await splitSecret(secret, 3, 3);

    const recovered = await combineShares(result.shares);
    expect(recovered).toBe(secret);
  });

  it('works with unicode characters', async () => {
    const secret = 'emoji: \u{1F512}\u{1F511} and accents: \u00E9\u00E0\u00FC';
    const result = await splitSecret(secret, 3, 2);

    const recovered = await combineShares(result.shares.slice(0, 2));
    expect(recovered).toBe(secret);
  });

  it('works with long secrets', async () => {
    const secret = 'a'.repeat(1000);
    const result = await splitSecret(secret, 3, 2);

    const recovered = await combineShares(result.shares.slice(0, 2));
    expect(recovered).toBe(secret);
  });

  it('works with any subset of sufficient shares', async () => {
    const secret = 'subset test';
    const result = await splitSecret(secret, 5, 3);

    // Try different combinations of 3 shares
    const combos = [
      [0, 1, 2],
      [0, 2, 4],
      [1, 3, 4],
      [2, 3, 4],
    ];

    for (const combo of combos) {
      const subset = combo.map((i) => result.shares[i]!);
      const recovered = await combineShares(subset);
      expect(recovered).toBe(secret);
    }
  });

  it('rejects empty secret', async () => {
    await expect(splitSecret('', 3, 2)).rejects.toThrow('Secret cannot be empty');
  });

  it('rejects invalid share counts', async () => {
    await expect(splitSecret('test', 1, 1)).rejects.toThrow();
    await expect(splitSecret('test', 256, 2)).rejects.toThrow();
  });

  it('rejects threshold > total', async () => {
    await expect(splitSecret('test', 3, 4)).rejects.toThrow();
  });

  it('rejects threshold < 2', async () => {
    await expect(splitSecret('test', 3, 1)).rejects.toThrow();
  });
});

describe('combineShares', () => {
  it('rejects empty array', async () => {
    await expect(combineShares([])).rejects.toThrow('No shares provided');
  });

  it('rejects insufficient shares', async () => {
    const result = await splitSecret('test', 5, 3);
    await expect(combineShares(result.shares.slice(0, 2))).rejects.toThrow(
      'Need at least 3 shares'
    );
  });
});

describe('decodeShare', () => {
  it('decodes a valid share', async () => {
    const result = await splitSecret('test', 3, 2);
    const meta = decodeShare(result.shares[0]!);

    expect(meta.index).toBe(1);
    expect(meta.threshold).toBe(2);
    expect(meta.total).toBe(3);
    expect(meta.data).toBeTruthy();
  });

  it('rejects invalid base64', () => {
    expect(() => decodeShare('not-valid-base64!!!')).toThrow('Invalid share format');
  });

  it('rejects non-JSON base64', () => {
    expect(() => decodeShare(btoa('not json'))).toThrow('Invalid share format');
  });
});

describe('isValidShare', () => {
  it('validates correct shares', async () => {
    const result = await splitSecret('test', 3, 2);
    for (const share of result.shares) {
      expect(isValidShare(share)).toBe(true);
    }
  });

  it('rejects garbage', () => {
    expect(isValidShare('')).toBe(false);
    expect(isValidShare('not a share')).toBe(false);
    expect(isValidShare('eyJub3QiOiJ2YWxpZCJ9')).toBe(false); // {"not":"valid"}
  });

  it('rejects shares with out-of-range metadata', () => {
    // threshold=1 (too low)
    const bad1 = btoa(JSON.stringify({ index: 1, threshold: 1, total: 3, data: 'abc' }));
    expect(isValidShare(bad1)).toBe(false);

    // index=0 (too low)
    const bad2 = btoa(JSON.stringify({ index: 0, threshold: 2, total: 3, data: 'abc' }));
    expect(isValidShare(bad2)).toBe(false);

    // index > total
    const bad3 = btoa(JSON.stringify({ index: 5, threshold: 2, total: 3, data: 'abc' }));
    expect(isValidShare(bad3)).toBe(false);

    // total > 255
    const bad4 = btoa(JSON.stringify({ index: 1, threshold: 2, total: 256, data: 'abc' }));
    expect(isValidShare(bad4)).toBe(false);
  });
});
