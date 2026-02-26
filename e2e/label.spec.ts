import { test, expect } from '@playwright/test'
import { splitSecret } from './helpers'

test.describe('Label Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./tool.html')
  })

  test('description shows in success banner', async ({ page }) => {
    await splitSecret(page, 'my bitcoin seed phrase words here', {
      totalShares: 3,
      threshold: 2,
      description: 'Bitcoin Seed',
    })

    await expect(page.locator('.success-banner')).toContainText('Bitcoin Seed:')
    await expect(page.locator('.success-banner')).toContainText('Secret split')
  })

  test('PDF download filename includes sanitized description', async ({ page }) => {
    await splitSecret(page, 'labeled secret', {
      totalShares: 3,
      threshold: 2,
      description: 'Master Password',
    })

    const downloadPromise = page.waitForEvent('download')
    await page.click('button:has-text("Download All PDFs")')
    const download = await downloadPromise

    const filename = download.suggestedFilename().toLowerCase()
    expect(filename).toContain('master')
    expect(filename).toContain('password')
  })

  test('empty description: no prefix in banner, generic PDF filename', async ({ page }) => {
    await splitSecret(page, 'no label secret', { totalShares: 3, threshold: 2 })

    const bannerText = await page.locator('.success-banner').textContent()
    // No colon prefix means no description
    expect(bannerText).toMatch(/^Secret split/)

    const downloadPromise = page.waitForEvent('download')
    await page.click('button:has-text("Download All PDFs")')
    const download = await downloadPromise

    expect(download.suggestedFilename().toLowerCase()).toContain('share')
  })
})
