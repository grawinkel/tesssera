import { test, expect } from '@playwright/test'
import { splitSecret } from './helpers'

test.describe('PDF Download', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./tool.html')
  })

  test('Download All PDFs triggers a download', async ({ page }) => {
    await splitSecret(page, 'pdf export test', { totalShares: 3, threshold: 2 })

    const downloadPromise = page.waitForEvent('download')
    await page.click('button:has-text("Download All PDFs")')
    const download = await downloadPromise

    expect(download.suggestedFilename()).toMatch(/\.pdf$/)
  })

  test('PDF filename includes description when provided', async ({ page }) => {
    await splitSecret(page, 'labeled pdf test', {
      totalShares: 3,
      threshold: 2,
      description: 'My Wallet',
    })

    const downloadPromise = page.waitForEvent('download')
    await page.click('button:has-text("Download All PDFs")')
    const download = await downloadPromise

    expect(download.suggestedFilename().toLowerCase()).toContain('my_wallet')
  })

  test('PDF filename uses "share" when no description', async ({ page }) => {
    await splitSecret(page, 'no label pdf test', { totalShares: 3, threshold: 2 })

    const downloadPromise = page.waitForEvent('download')
    await page.click('button:has-text("Download All PDFs")')
    const download = await downloadPromise

    expect(download.suggestedFilename().toLowerCase()).toContain('share')
  })
})
