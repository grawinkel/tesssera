import { test, expect } from '@playwright/test'
import { splitSecret, getShares, switchToCombine, switchToPasteMode } from './helpers'

test.describe('Combine Input Modes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./tool.html')
    await page.click('button.tab:has-text("Secrets")')
    await page.click('button.sub-tab:has-text("Combine")')
  })

  test('default mode is Scan QR with Start Scanning button', async ({ page }) => {
    await expect(page.locator('.mode-btn.active')).toHaveText('Scan QR')
    await expect(page.locator('button:has-text("Start Scanning")')).toBeVisible()
  })

  test('Upload File mode shows upload button', async ({ page }) => {
    await page.click('.mode-btn:has-text("Upload File")')
    await expect(page.locator('.image-scanner')).toBeVisible()
    await expect(page.locator('text=Upload QR Image or PDF')).toBeVisible()
  })

  test('Paste Share Text mode shows textarea', async ({ page }) => {
    await page.click('.mode-btn:has-text("Paste Share Text")')
    await expect(page.locator('#shareInput')).toBeVisible()
  })

  test('mode toggle preserves already-added shares', async ({ context, page }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    // Generate shares first
    await page.click('button.sub-tab:has-text("Split")')
    await splitSecret(page, 'mode test secret', { totalShares: 3, threshold: 2 })
    const shares = await getShares(page)

    // Go to combine, add a share via paste
    await switchToCombine(page)
    await switchToPasteMode(page)
    await page.fill('#shareInput', shares[0])
    await page.click('button:has-text("Add Share")')
    await expect(page.locator('.share-item')).toHaveCount(1)

    // Switch to Scan QR mode
    await page.click('.mode-btn:has-text("Scan QR")')
    await expect(page.locator('.share-item')).toHaveCount(1)

    // Switch to Upload File mode
    await page.click('.mode-btn:has-text("Upload File")')
    await expect(page.locator('.share-item')).toHaveCount(1)
  })

  test('remove button removes a specific share', async ({ context, page }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    await page.click('button.sub-tab:has-text("Split")')
    await splitSecret(page, 'remove test', { totalShares: 3, threshold: 2 })
    const shares = await getShares(page)

    await switchToCombine(page)
    await switchToPasteMode(page)

    await page.fill('#shareInput', shares[0])
    await page.click('button:has-text("Add Share")')
    await page.fill('#shareInput', shares[1])
    await page.click('button:has-text("Add Share")')
    await expect(page.locator('.share-item')).toHaveCount(2)

    // Remove first share
    await page.locator('.btn-remove').first().click()
    await expect(page.locator('.share-item')).toHaveCount(1)
  })

  test('reset button clears all shares', async ({ context, page }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    await page.click('button.sub-tab:has-text("Split")')
    await splitSecret(page, 'reset test', { totalShares: 3, threshold: 2 })
    const shares = await getShares(page)

    await switchToCombine(page)
    await switchToPasteMode(page)

    await page.fill('#shareInput', shares[0])
    await page.click('button:has-text("Add Share")')
    await expect(page.locator('.share-item')).toHaveCount(1)

    page.on('dialog', d => d.accept())
    await page.click('button:has-text("Reset")')
    await expect(page.locator('.share-item')).toHaveCount(0)
    await expect(page.locator('.progress-info')).toContainText('Add your first share')
  })
})
