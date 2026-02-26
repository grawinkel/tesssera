import { test, expect } from '@playwright/test'

test.describe('Tab Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./tool.html')
  })

  test('app loads with Split tab active', async ({ page }) => {
    await expect(page.locator('button.tab.active')).toHaveText('Split')
    await expect(page.locator('.split-view')).toBeVisible()
  })

  test('click Combine tab switches view', async ({ page }) => {
    await page.click('button.tab:has-text("Combine")')
    await expect(page.locator('button.tab.active')).toHaveText('Combine')
    await expect(page.locator('.combine-view')).toBeVisible()
  })

  test('click Audit tab switches view', async ({ page }) => {
    await page.click('button.tab:has-text("Audit")')
    await expect(page.locator('button.tab.active')).toHaveText('Audit')
    await expect(page.locator('.audit-view')).toBeVisible()
  })

  test('click Split tab returns to split view', async ({ page }) => {
    await page.click('button.tab:has-text("Combine")')
    await page.click('button.tab:has-text("Split")')
    await expect(page.locator('button.tab.active')).toHaveText('Split')
    await expect(page.locator('.split-view')).toBeVisible()
  })

  test('header shows TESSSERA and tagline', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('TESSSERA')
    await expect(page.locator('.tagline')).toHaveText('Shamir Secret Sharing with QR Codes')
  })

  test('footer shows privacy message', async ({ page }) => {
    await expect(page.locator('.app-footer')).toContainText(
      'All processing happens locally',
    )
  })
})
