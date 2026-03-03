import { test, expect } from '@playwright/test'
import { getFileShares, switchToFileCombine } from './helpers'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FIXTURE_PATH = path.join(__dirname, 'fixtures', 'random-64kb.bin')
const FILE_SIZE = 65536
const ORIGINAL_HASH = createHash('sha256').update(readFileSync(FIXTURE_PATH)).digest('hex')

test.describe('file split + combine roundtrip via web UI', () => {
  test.setTimeout(300_000)

  test('split 64KB random file into 2-of-3, combine shares [1,2], verify SHA-256', async ({
    context,
    page,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    const errors: string[] = []
    page.on('pageerror', err => errors.push(err.message))
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    await page.goto('./tool.html')

    // --- SPLIT ---
    await page.click('button.tab:has-text("Files")')
    await page.locator('#fileInput').setInputFiles(FIXTURE_PATH)
    await page.fill('#fileTotalShares', '3')
    await page.fill('#fileThreshold', '2')

    await page.click('button:has-text("Split File")')
    await expect(page.locator('.success-banner')).toBeVisible({ timeout: 120_000 })

    const shares = await getFileShares(page)
    expect(shares).toHaveLength(3)
    console.log('Share lengths:', shares.map(s => s.length))

    // --- COMBINE shares[0] + shares[1] ---
    await switchToFileCombine(page)
    await page.click('.mode-btn:has-text("Paste Share Text")')

    // Use page.fill — Playwright handles large text correctly
    await page.fill('#fileShareInput', shares[0]!)
    await page.click('button:has-text("Add Share")')

    // Verify first share was added
    await expect(page.locator('.share-item')).toHaveCount(1, { timeout: 5_000 })

    await page.fill('#fileShareInput', shares[1]!)
    await page.click('button:has-text("Add Share")')

    // Verify second share was added
    await expect(page.locator('.share-item')).toHaveCount(2, { timeout: 5_000 })

    // Take screenshot before reveal
    await page.screenshot({ path: 'e2e/debug-before-reveal.png' })
    console.log('Errors so far:', errors)

    const downloadPromise = page.waitForEvent('download', { timeout: 180_000 })
    await page.click('button:has-text("Reconstruct File")')

    // Take screenshot 5s after click to see state
    await page.waitForTimeout(5000)
    await page.screenshot({ path: 'e2e/debug-after-reveal.png' })
    console.log('Errors after reveal:', errors)

    const download = await downloadPromise

    expect(download.suggestedFilename()).toBe('random-64kb.bin')

    const downloadPath = await download.path()
    expect(downloadPath).toBeTruthy()
    const downloadedBytes = readFileSync(downloadPath!)
    expect(downloadedBytes.length).toBe(FILE_SIZE)

    const downloadedHash = createHash('sha256').update(downloadedBytes).digest('hex')
    expect(downloadedHash).toBe(ORIGINAL_HASH)
  })
})
