import { test, expect } from '@playwright/test'
import { getFileShares, switchToFileCombine } from './helpers'
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

    // Switch to Files tab and split
    await page.click('button.tab:has-text("Files")')
    await page.locator('#fileInput').setInputFiles(
      path.join(__dirname, 'fixtures', 'test-file.txt'),
    )
    await page.fill('#fileTotalShares', '3')
    await page.fill('#fileThreshold', '2')
    await page.click('button:has-text("Split File")')

    await expect(page.locator('.success-banner')).toContainText('test-file.txt')

    const shares = await getFileShares(page)
    expect(shares).toHaveLength(3)

    // Switch to File Combine, paste shares
    await switchToFileCombine(page)
    await page.click('.mode-btn:has-text("Paste Share Text")')

    await page.fill('#fileShareInput', shares[0])
    await page.click('button:has-text("Add Share")')
    await page.fill('#fileShareInput', shares[1])
    await page.click('button:has-text("Add Share")')

    // Listen for download event before clicking reveal
    const downloadPromise = page.waitForEvent('download')
    await page.click('button:has-text("Reconstruct File")')
    const download = await downloadPromise

    expect(download.suggestedFilename()).toBe('test-file.txt')

    // Banner shows File Reconstructed
    await expect(page.locator('.success-banner')).toContainText('File Reconstructed')
    await expect(page.locator('.revealed-file')).toContainText('test-file.txt')
  })
})
