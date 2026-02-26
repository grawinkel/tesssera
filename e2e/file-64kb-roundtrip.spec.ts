import { test, expect } from '@playwright/test'
import { getShares, switchToCombine, switchToPasteMode } from './helpers'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FIXTURE_PATH = path.join(__dirname, 'fixtures', 'random-64kb.bin')
const FILE_SIZE = 65536
const ORIGINAL_HASH = createHash('sha256').update(readFileSync(FIXTURE_PATH)).digest('hex')

test.describe('64KB file split + combine roundtrip', () => {
  test.setTimeout(120_000)

  test('split 64KB random file into 2-of-3, combine each pair, verify SHA-256', async ({
    context,
    page,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.goto('./tool.html')

    // --- SPLIT ---
    await page.click('.mode-btn:has-text("File")')
    await page.locator('#fileInput').setInputFiles(FIXTURE_PATH)
    await page.fill('#totalShares', '3')
    await page.fill('#threshold', '2')

    await page.click('button:has-text("Generate Shares")')
    await expect(page.locator('.success-banner')).toBeVisible({ timeout: 60_000 })
    await expect(page.locator('.success-banner')).toContainText('random-64kb.bin')

    const shares = await getShares(page)
    expect(shares).toHaveLength(3)

    // --- COMBINE each 2-share pair and verify hash ---
    const pairs: [number, number][] = [[0, 1], [0, 2], [1, 2]]

    for (const [a, b] of pairs) {
      await switchToCombine(page)

      // Reset any previous combine state
      const startOverBtn = page.locator('button:has-text("Start Over")')
      const resetBtn = page.locator('button:has-text("Reset")')
      if (await startOverBtn.isVisible({ timeout: 500 }).catch(() => false)) {
        await startOverBtn.click()
      } else if (await resetBtn.isVisible({ timeout: 500 }).catch(() => false)) {
        await resetBtn.click()
      }

      // Wait for reset to complete — share list should be empty
      await expect(page.locator('.share-item')).toHaveCount(0, { timeout: 5_000 })

      await switchToPasteMode(page)

      // Wait for textarea to be ready
      await expect(page.locator('#shareInput')).toBeVisible({ timeout: 5_000 })

      await page.fill('#shareInput', shares[a]!)
      await page.click('button:has-text("Add Share")')
      await expect(page.locator('.share-item')).toHaveCount(1, { timeout: 5_000 })

      // Wait for textarea to be cleared before filling next share
      await expect(page.locator('#shareInput')).toHaveValue('', { timeout: 5_000 })

      await page.fill('#shareInput', shares[b]!)
      await page.click('button:has-text("Add Share")')
      await expect(page.locator('.share-item')).toHaveCount(2, { timeout: 5_000 })

      const downloadPromise = page.waitForEvent('download', { timeout: 60_000 })
      await page.click('button:has-text("Reveal Secret")')
      const download = await downloadPromise

      expect(download.suggestedFilename()).toBe('random-64kb.bin')

      const downloadPath = await download.path()
      expect(downloadPath).toBeTruthy()
      const downloadedBytes = readFileSync(downloadPath!)
      expect(downloadedBytes.length).toBe(FILE_SIZE)

      const downloadedHash = createHash('sha256').update(downloadedBytes).digest('hex')
      expect(downloadedHash).toBe(ORIGINAL_HASH)
    }
  })
})
