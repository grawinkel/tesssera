import { test, expect } from '@playwright/test'
import { splitSecret, getShares, combineShares } from './helpers'

test.describe('Full Split+Combine Roundtrip', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.goto('./tool.html')
  })

  test('split 3-of-5 and combine with 3 shares recovers original', async ({ page }) => {
    const secret = 'the quick brown fox jumps over the lazy dog'

    await splitSecret(page, secret, { totalShares: 5, threshold: 3 })
    const shares = await getShares(page)
    expect(shares).toHaveLength(5)

    // Use only 3 of 5 shares
    await combineShares(page, [shares[0], shares[2], shares[4]])

    await expect(page.locator('.revealed-secret pre')).toHaveText(secret)
  })

  test('roundtrip with unicode characters', async ({ page }) => {
    const secret = 'Hello 世界! Ñoño 🔐🗝️'

    await splitSecret(page, secret, { totalShares: 3, threshold: 2 })
    const shares = await getShares(page)

    await combineShares(page, [shares[0], shares[1]])

    await expect(page.locator('.revealed-secret pre')).toHaveText(secret)
  })

  test('roundtrip with newlines and special chars', async ({ page }) => {
    const secret = 'line1\nline2\nline3\ttab\n"quotes" & <angles>'

    await splitSecret(page, secret, { totalShares: 3, threshold: 2 })
    const shares = await getShares(page)

    await combineShares(page, [shares[1], shares[2]])

    await expect(page.locator('.revealed-secret pre')).toHaveText(secret)
  })

  test('roundtrip with long text', async ({ page }) => {
    const secret = 'The quick brown fox jumps over the lazy dog. '.repeat(5)

    await splitSecret(page, secret, { totalShares: 3, threshold: 2 })
    const shares = await getShares(page)

    await combineShares(page, [shares[0], shares[2]])

    await expect(page.locator('.revealed-secret pre')).toHaveText(secret)
  })
})
