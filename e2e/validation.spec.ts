import { test, expect } from '@playwright/test'
import { splitSecret, getShares, switchToCombine, switchToPasteMode } from './helpers'

test.describe('Input Validation & Errors', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./tool.html')
  })

  test('paste invalid text shows "Invalid share format"', async ({ page }) => {
    await page.click('button.tab:has-text("Combine")')
    await page.click('.mode-btn:has-text("Paste Key")')
    await page.fill('#shareInput', 'this is not a valid share')
    await page.click('button:has-text("Add Share")')

    await expect(page.locator('.error-message')).toContainText('Invalid share format')
  })

  test('paste shares from different secrets shows error', async ({ context, page }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    // Generate first set of shares
    await splitSecret(page, 'secret A', { totalShares: 3, threshold: 2 })
    const sharesA = await getShares(page)

    // Generate second set of shares
    await page.click('button:has-text("Start Over")')
    await splitSecret(page, 'secret B', { totalShares: 5, threshold: 3 })
    const sharesB = await getShares(page)

    // Try to combine shares from different secrets
    await switchToCombine(page)
    await switchToPasteMode(page)

    await page.fill('#shareInput', sharesA[0])
    await page.click('button:has-text("Add Share")')

    await page.fill('#shareInput', sharesB[0])
    await page.click('button:has-text("Add Share")')

    await expect(page.locator('.error-message')).toContainText('different secret')
  })

  test('total shares min is 2', async ({ page }) => {
    const totalInput = page.locator('#totalShares')
    await expect(totalInput).toHaveAttribute('min', '2')
  })

  test('threshold min is 2', async ({ page }) => {
    const thresholdInput = page.locator('#threshold')
    await expect(thresholdInput).toHaveAttribute('min', '2')
  })
})
