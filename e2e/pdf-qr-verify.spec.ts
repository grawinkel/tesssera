import { test, expect } from '@playwright/test'
import fs from 'node:fs/promises'
import { splitSecret, getShares } from './helpers'
import { extractQrRgbStreams, decodeQrFromRgb } from './pdf-helpers'

test.describe('PDF QR Code Verification', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.goto('./tool.html')
  })

  test('QR codes in individual PDFs contain the exact share strings', async ({ page }) => {
    await splitSecret(page, 'verify qr content', { totalShares: 3, threshold: 2 })

    const shares = await getShares(page)
    expect(shares).toHaveLength(3)

    const cards = page.locator('.share-card')

    for (let i = 0; i < shares.length; i++) {
      const downloadPromise = page.waitForEvent('download')
      // PDF button is the first .btn-copy in each card
      await cards.nth(i).locator('.btn-copy').first().click()
      const download = await downloadPromise

      const tmpPath = await download.path()
      expect(tmpPath).toBeTruthy()
      const pdfBytes = await fs.readFile(tmpPath!)

      const rgbStreams = extractQrRgbStreams(pdfBytes)
      expect(rgbStreams).toHaveLength(1)

      const decoded = decodeQrFromRgb(rgbStreams[0])
      expect(decoded).toBe(shares[i])
    }
  })

  test('Decoded shares contain valid Shamir metadata', async ({ page }) => {
    await splitSecret(page, 'verify shamir fields', { totalShares: 3, threshold: 2 })

    const cards = page.locator('.share-card')
    const count = await cards.count()

    for (let i = 0; i < count; i++) {
      const downloadPromise = page.waitForEvent('download')
      await cards.nth(i).locator('.btn-copy').first().click()
      const download = await downloadPromise

      const tmpPath = await download.path()
      const pdfBytes = await fs.readFile(tmpPath!)

      const rgbStreams = extractQrRgbStreams(pdfBytes)
      expect(rgbStreams).toHaveLength(1)

      const decoded = decodeQrFromRgb(rgbStreams[0])
      expect(decoded).toBeTruthy()

      const json = JSON.parse(atob(decoded!))
      expect(json).toHaveProperty('index', i + 1)
      expect(json).toHaveProperty('threshold', 2)
      expect(json).toHaveProperty('total', 3)
      expect(json).toHaveProperty('data')
      expect(typeof json.data).toBe('string')
      expect(json.data.length).toBeGreaterThan(0)
    }
  })
})
