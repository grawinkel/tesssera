import { test, expect } from '@playwright/test'
import { getShares, switchToCombine, switchToPasteMode } from './helpers'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

test.describe('File Split+Combine Roundtrip', () => {
  test('split a file, combine shares, triggers download with correct filename', async ({
    context,
    page,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.goto('./tool.html')

    // Switch to file mode and split
    await page.click('.mode-btn:has-text("File")')
    await page.locator('#fileInput').setInputFiles(
      path.join(__dirname, 'fixtures', 'test-file.txt'),
    )
    await page.fill('#totalShares', '3')
    await page.fill('#threshold', '2')
    await page.click('button:has-text("Generate Shares")')

    await expect(page.locator('.success-banner')).toContainText('test-file.txt')

    const shares = await getShares(page)
    expect(shares).toHaveLength(3)

    // Switch to Combine, paste shares
    await switchToCombine(page)
    await switchToPasteMode(page)

    await page.fill('#shareInput', shares[0])
    await page.click('button:has-text("Add Share")')
    await page.fill('#shareInput', shares[1])
    await page.click('button:has-text("Add Share")')

    // Listen for download event before clicking reveal
    const downloadPromise = page.waitForEvent('download')
    await page.click('button:has-text("Reveal Secret")')
    const download = await downloadPromise

    expect(download.suggestedFilename()).toBe('test-file.txt')

    // Banner shows File Reconstructed
    await expect(page.locator('.success-banner')).toContainText('File Reconstructed')
    await expect(page.locator('.revealed-file')).toContainText('test-file.txt')
  })
})
