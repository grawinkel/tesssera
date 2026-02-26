import { test, expect } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

test.describe('File Splitting', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./tool.html')
  })

  test('switch to File mode via toggle', async ({ page }) => {
    await page.click('.mode-btn:has-text("File")')
    await expect(page.locator('#fileInput')).toBeVisible()
    await expect(page.locator('#secret')).not.toBeVisible()
  })

  test('select a small test file shows filename and size', async ({ page }) => {
    await page.click('.mode-btn:has-text("File")')
    const fileInput = page.locator('#fileInput')
    await fileInput.setInputFiles(
      path.join(__dirname, 'fixtures', 'test-file.txt'),
    )

    await expect(page.getByText('test-file.txt')).toBeVisible()
  })

  test('split file shows success banner with filename', async ({ page }) => {
    await page.click('.mode-btn:has-text("File")')
    await page.locator('#fileInput').setInputFiles(
      path.join(__dirname, 'fixtures', 'test-file.txt'),
    )
    await page.fill('#totalShares', '3')
    await page.fill('#threshold', '2')
    await page.click('button:has-text("Generate Shares")')

    await expect(page.locator('.success-banner')).toContainText('test-file.txt')
    await expect(page.locator('.success-banner')).toContainText('3 shares')
    await expect(page.locator('.share-card')).toHaveCount(3)
  })

  test('Start Over resets file input', async ({ page }) => {
    await page.click('.mode-btn:has-text("File")')
    await page.locator('#fileInput').setInputFiles(
      path.join(__dirname, 'fixtures', 'test-file.txt'),
    )
    await page.fill('#totalShares', '3')
    await page.fill('#threshold', '2')
    await page.click('button:has-text("Generate Shares")')
    await expect(page.locator('.success-banner')).toBeVisible()

    await page.click('button:has-text("Start Over")')
    // Start Over resets result but keeps file mode
    await expect(page.locator('#fileInput')).toBeVisible()
    await expect(page.locator('.success-banner')).not.toBeVisible()
  })

  test('file over 10MB shows error', async ({ page }) => {
    await page.click('.mode-btn:has-text("File")')

    // Create a >10MB buffer
    const largeBuffer = Buffer.alloc(11 * 1024 * 1024, 'x')
    await page.locator('#fileInput').setInputFiles({
      name: 'huge.bin',
      mimeType: 'application/octet-stream',
      buffer: largeBuffer,
    })

    await expect(page.locator('.error-message')).toContainText('File too large')
    await expect(page.locator('button:has-text("Generate Shares")')).toBeDisabled()
  })
})
