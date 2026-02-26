import { test, expect } from '@playwright/test'

test.describe('Audit Tab', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./tool.html')
    await page.click('button.tab:has-text("Audit")')
  })

  test('shows Build Verification heading', async ({ page }) => {
    await expect(page.locator('h2')).toHaveText('Build Verification')
  })

  test('shows build commit', async ({ page }) => {
    // In dev mode it may be "unknown" or a real commit hash
    const commitCell = page.locator('td:has-text("Git Commit") + td code')
    await expect(commitCell).toBeVisible()
    const text = await commitCell.textContent()
    expect(text).toBeTruthy()
  })

  test('shows vendored libraries table', async ({ page }) => {
    await expect(page.getByText('shamir-secret-sharing', { exact: true })).toBeVisible()
    await expect(page.getByText('qrcode.react', { exact: true })).toBeVisible()
  })

  test('shows How to Verify section', async ({ page }) => {
    await expect(page.locator('h3:has-text("How to Verify")')).toBeVisible()
    await expect(page.locator('.verify-steps')).toBeVisible()
  })

  test('shows Escape Pod section with download button', async ({ page }) => {
    await expect(page.locator('h3:has-text("Escape Pod")')).toBeVisible()
    await expect(
      page.locator('button:has-text("Download Escape Pod")'),
    ).toBeVisible()
  })
})
