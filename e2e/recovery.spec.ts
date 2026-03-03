import { test, expect, Page } from '@playwright/test'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const recoveryPath = path.resolve(currentDir, '..', 'dist-offline', 'offline.html')

/**
 * Helper: split a secret via the main app UI and return the full share strings.
 * Uses page.evaluate to call the crypto module directly since the UI truncates shares.
 */
async function splitSecretViaUI(
  page: Page,
  secret: string,
  total: number = 3,
  threshold: number = 2,
): Promise<string[]> {
  await page.goto('./tool.html')
  await expect(page.locator('.split-view')).toBeVisible()

  await page.fill('#secret', secret)
  await page.fill('#totalShares', String(total))
  await page.fill('#threshold', String(threshold))
  await page.click('button:has-text("Generate Shares")')

  await expect(page.locator('.success-banner')).toBeVisible()

  // Use clipboard to copy each share since the UI truncates the display text
  const shareCards = page.locator('.share-card')
  const count = await shareCards.count()
  const shares: string[] = []

  for (let i = 0; i < count; i++) {
    // Grant clipboard permission
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
    await shareCards.nth(i).locator('.btn-copy').last().click()
    const clipText = await page.evaluate(() => navigator.clipboard.readText())
    shares.push(clipText)
  }

  return shares
}

test.describe('Split and Combine Round-Trip (Main App)', () => {
  test('split a secret and recombine via paste', async ({ page }) => {
    const secret = 'my-super-secret-password-123'
    const shares = await splitSecretViaUI(page, secret, 3, 2)

    expect(shares.length).toBe(3)

    // Switch to Combine sub-tab
    await page.click('button.sub-tab:has-text("Combine")')
    await expect(page.locator('.combine-view')).toBeVisible()

    // Switch to paste mode
    await page.click('button.mode-btn:has-text("Paste Share Text")')

    // Paste first share
    await page.fill('#shareInput', shares[0])
    await page.click('button:has-text("Add Share")')

    // Paste second share
    await page.fill('#shareInput', shares[1])
    await page.click('button:has-text("Add Share")')

    // Reveal the secret
    await page.click('button:has-text("Reveal Secret")')
    await expect(page.locator('.success-banner')).toBeVisible()
    await expect(page.locator('.revealed-secret pre')).toHaveText(secret)
  })

  test('split with 5 shares, threshold 3, combine 3 of them', async ({
    page,
  }) => {
    const secret = 'five-share-secret'
    const shares = await splitSecretViaUI(page, secret, 5, 3)

    expect(shares.length).toBe(5)

    await page.click('button.sub-tab:has-text("Combine")')
    await page.click('button.mode-btn:has-text("Paste Share Text")')

    // Use shares 0, 2, 4 (non-consecutive)
    for (const share of [shares[0], shares[2], shares[4]]) {
      await page.fill('#shareInput', share)
      await page.click('button:has-text("Add Share")')
    }

    await page.click('button:has-text("Reveal Secret")')
    await expect(page.locator('.revealed-secret pre')).toHaveText(secret)
  })

  test('refuses to reveal with fewer shares than threshold', async ({
    page,
  }) => {
    const secret = 'threshold-test'
    const shares = await splitSecretViaUI(page, secret, 3, 3)

    await page.click('button.sub-tab:has-text("Combine")')
    await page.click('button.mode-btn:has-text("Paste Share Text")')

    // Add only 2 of 3 required shares
    await page.fill('#shareInput', shares[0])
    await page.click('button:has-text("Add Share")')
    await page.fill('#shareInput', shares[1])
    await page.click('button:has-text("Add Share")')

    // Reveal button should not be visible (conditionally rendered)
    const revealBtn = page.locator('button:has-text("Reveal Secret")')
    await expect(revealBtn).toHaveCount(0)
  })
})

test.describe('Offline Recovery Tool (Escape Pod)', () => {
  test.beforeAll(() => {
    if (!fs.existsSync(recoveryPath)) {
      throw new Error(
        `Recovery HTML not found at ${recoveryPath}. Run "npm run build:offline" first.`,
      )
    }
  })

  test('recovery page renders (not blank)', async ({ page }) => {
    await page.goto(`file://${recoveryPath}`)

    await expect(page.locator('h1')).toHaveText('TESSSERA')
    await expect(page.locator('.tagline')).toHaveText('Recovery Tool')
    await expect(page.locator('h2')).toHaveText('Recover Your Secret')
  })

  test('recovery page has share input fields', async ({ page }) => {
    await page.goto(`file://${recoveryPath}`)

    await expect(page.locator('h2')).toHaveText('Recover Your Secret')
    await expect(page.locator('textarea')).toHaveCount(3)
  })

  test('can add and remove share fields', async ({ page }) => {
    await page.goto(`file://${recoveryPath}`)

    await expect(page.locator('textarea')).toHaveCount(3)

    await page.click('button:has-text("Add Another Share")')
    await expect(page.locator('textarea')).toHaveCount(4)

    const removeButtons = page.locator('.btn-icon.danger')
    await removeButtons.last().click()
    await expect(page.locator('textarea')).toHaveCount(3)
  })

  test('shows validation for invalid share text', async ({ page }) => {
    await page.goto(`file://${recoveryPath}`)

    await page.locator('textarea').first().fill('not-a-valid-share')
    await expect(page.locator('textarea').first()).toHaveClass(/invalid/)
  })

  test('recover button is disabled with no shares entered', async ({
    page,
  }) => {
    await page.goto(`file://${recoveryPath}`)

    const recoverBtn = page.locator('button:has-text("Recover Secret")')
    await expect(recoverBtn).toBeDisabled()
  })

  test('full recovery: split in main app, recover in escape pod', async ({
    page,
  }) => {
    const secret = 'escape-pod-recovery-test-secret'
    const shares = await splitSecretViaUI(page, secret, 3, 2)

    expect(shares.length).toBe(3)

    await page.goto(`file://${recoveryPath}`)
    await expect(page.locator('h1')).toHaveText('TESSSERA')

    const textareas = page.locator('textarea')
    await textareas.nth(0).fill(shares[0])
    await textareas.nth(1).fill(shares[1])

    await page.click('button:has-text("Recover Secret")')

    await expect(page.locator('.success-banner')).toContainText(
      'Secret Recovered Successfully',
    )
    await expect(page.locator('.revealed-secret pre')).toHaveText(secret)
  })

  test('recovery with all 3 shares works', async ({ page }) => {
    const secret = 'all-shares-test'
    const shares = await splitSecretViaUI(page, secret, 3, 2)

    await page.goto(`file://${recoveryPath}`)

    const textareas = page.locator('textarea')
    await textareas.nth(0).fill(shares[0])
    await textareas.nth(1).fill(shares[1])
    await textareas.nth(2).fill(shares[2])

    await page.click('button:has-text("Recover Secret")')
    await expect(page.locator('.revealed-secret pre')).toHaveText(secret)
  })

  test('can reset after recovery and recover another secret', async ({
    page,
  }) => {
    const secret = 'reset-test-secret'
    const shares = await splitSecretViaUI(page, secret, 3, 2)

    await page.goto(`file://${recoveryPath}`)

    const textareas = page.locator('textarea')
    await textareas.nth(0).fill(shares[0])
    await textareas.nth(1).fill(shares[1])

    await page.click('button:has-text("Recover Secret")')
    await expect(page.locator('.revealed-secret pre')).toHaveText(secret)

    await page.click('button:has-text("Recover Another Secret")')

    await expect(page.locator('h2')).toHaveText('Recover Your Secret')
    await expect(page.locator('textarea')).toHaveCount(3)
  })

  test('detects threshold from valid share', async ({ page }) => {
    const secret = 'threshold-detect-test'
    const shares = await splitSecretViaUI(page, secret, 5, 3)

    await page.goto(`file://${recoveryPath}`)

    await page.locator('textarea').first().fill(shares[0])

    await expect(page.locator('.threshold-info')).toContainText('3')
    await expect(page.locator('.valid-indicator')).toBeVisible()
  })

  test('recover button is disabled with insufficient shares', async ({ page }) => {
    const secret = 'error-test-secret'
    const shares = await splitSecretViaUI(page, secret, 3, 3)

    await page.goto(`file://${recoveryPath}`)

    const textareas = page.locator('textarea')
    await textareas.nth(0).fill(shares[0])
    await textareas.nth(1).fill(shares[1])

    // Button should be disabled because we need 3 shares but only have 2
    await expect(page.locator('button:has-text("Recover Secret")')).toBeDisabled()
  })

  test('handles unicode secrets', async ({ page }) => {
    const secret = 'Ünïcödé 日本語 тест'
    const shares = await splitSecretViaUI(page, secret, 3, 2)

    await page.goto(`file://${recoveryPath}`)

    const textareas = page.locator('textarea')
    await textareas.nth(0).fill(shares[0])
    await textareas.nth(1).fill(shares[1])

    await page.click('button:has-text("Recover Secret")')
    await expect(page.locator('.revealed-secret pre')).toHaveText(secret)
  })
})
