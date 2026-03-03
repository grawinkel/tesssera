import { test, expect } from '@playwright/test'

test.describe('Text Secret Splitting', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./tool.html')
  })

  test('empty secret: Generate button is disabled', async ({ page }) => {
    await expect(page.locator('button:has-text("Generate Shares")')).toBeDisabled()
  })

  test('enter text secret: Generate button enables', async ({ page }) => {
    await page.fill('#secret', 'my secret')
    await expect(page.locator('button:has-text("Generate Shares")')).toBeEnabled()
  })

  test('split with defaults shows success banner and 5 QR codes', async ({ page }) => {
    await page.fill('#secret', 'test secret for splitting')
    await page.click('button:has-text("Generate Shares")')

    await expect(page.locator('.success-banner')).toBeVisible()
    await expect(page.locator('.success-banner')).toContainText('5 shares')
    await expect(page.locator('.success-banner')).toContainText('3 required')
    await expect(page.locator('.share-card')).toHaveCount(5)
  })

  test('each share card shows correct share info and threshold', async ({ page }) => {
    await page.fill('#secret', 'test secret')
    await page.click('button:has-text("Generate Shares")')

    const firstCard = page.locator('.share-card').first()
    await expect(firstCard.locator('.share-header')).toContainText('Share 1 of 5')
    await expect(firstCard.locator('.share-footer')).toContainText('Threshold: 3 required')

    const lastCard = page.locator('.share-card').last()
    await expect(lastCard.locator('.share-header')).toContainText('Share 5 of 5')
  })

  test('copy button copies share to clipboard', async ({ context, page }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    await page.fill('#secret', 'clipboard test')
    await page.click('button:has-text("Generate Shares")')

    const firstCard = page.locator('.share-card').first()
    // Copy button is the last .btn-copy in each card
    const copyBtn = firstCard.locator('.btn-copy').last()
    await copyBtn.click()

    // Button text changes to checkmark on copy
    await expect(copyBtn).toHaveText('✓')

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText())
    expect(clipboardText).toBeTruthy()
    // Share is base64 encoded JSON — starts with eyJ
    expect(clipboardText).toMatch(/^eyJ/)
  })

  test('Start Over resets to input form', async ({ page }) => {
    await page.fill('#secret', 'test secret')
    await page.click('button:has-text("Generate Shares")')
    await expect(page.locator('.success-banner')).toBeVisible()

    page.on('dialog', d => d.accept())
    await page.click('button:has-text("Start Over")')
    await expect(page.locator('.success-banner')).not.toBeVisible()
    await expect(page.locator('#secret')).toBeVisible()
    await expect(page.locator('#secret')).toHaveValue('')
  })

  test('custom shares and threshold: 3 shares, 2 threshold', async ({ page }) => {
    await page.fill('#secret', 'custom config test')
    await page.fill('#totalShares', '3')
    await page.fill('#threshold', '2')
    await page.click('button:has-text("Generate Shares")')

    await expect(page.locator('.share-card')).toHaveCount(3)
    await expect(page.locator('.success-banner')).toContainText('3 shares')
    await expect(page.locator('.success-banner')).toContainText('2 required')
  })

  test('threshold input max is clamped to total shares', async ({ page }) => {
    await page.fill('#totalShares', '3')
    const thresholdInput = page.locator('#threshold')
    await expect(thresholdInput).toHaveAttribute('max', '3')
  })

  test('optional description shows in success banner', async ({ page }) => {
    await page.fill('#description', 'Bitcoin Seed')
    await page.fill('#secret', 'my bitcoin seed phrase')
    await page.click('button:has-text("Generate Shares")')

    await expect(page.locator('.success-banner')).toContainText('Bitcoin Seed:')
  })

  test('empty description: no prefix in banner', async ({ page }) => {
    await page.fill('#secret', 'no label secret')
    await page.click('button:has-text("Generate Shares")')

    const bannerText = await page.locator('.success-banner').textContent()
    expect(bannerText).toContain('Secret split into')
  })
})
