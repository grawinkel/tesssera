import { test, expect } from '@playwright/test'
import { splitSecret, getShares, switchToCombine, switchToPasteMode } from './helpers'

test.describe('Combine via Text Paste', () => {
  test('full paste workflow: add shares, detect duplicate, reveal secret', async ({
    context,
    page,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.goto('./tool.html')

    // Split a secret first
    await splitSecret(page, 'pasta sauce recipe', {
      totalShares: 3,
      threshold: 3,
    })

    const shares = await getShares(page)
    expect(shares).toHaveLength(3)

    // Switch to Combine tab
    await switchToCombine(page)
    await switchToPasteMode(page)

    // Add first share
    await page.fill('#shareInput', shares[0])
    await page.click('button:has-text("Add Share")')
    await expect(page.locator('.progress-info')).toContainText('1 / 3 required')

    // Add second share
    await page.fill('#shareInput', shares[1])
    await page.click('button:has-text("Add Share")')
    await expect(page.locator('.progress-info')).toContainText('2 / 3 required')

    // Try duplicate share
    await page.fill('#shareInput', shares[0])
    await page.click('button:has-text("Add Share")')
    await expect(page.locator('.error-message')).toContainText('already added')

    // Add third share — Reveal button should appear
    await page.fill('#shareInput', shares[2])
    await page.click('button:has-text("Add Share")')
    await expect(page.locator('button:has-text("Reveal Secret")')).toBeVisible()

    // Reveal the secret
    await page.click('button:has-text("Reveal Secret")')
    await expect(page.locator('.success-banner')).toContainText('Secret Revealed')
    await expect(page.locator('.revealed-secret pre')).toHaveText('pasta sauce recipe')

    // Start Over resets
    await page.click('button:has-text("Start Over")')
    await expect(page.locator('.progress-info')).toContainText('Add your first share')
  })
})
