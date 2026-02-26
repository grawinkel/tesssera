import { type Page, expect } from '@playwright/test'

interface SplitOptions {
  readonly totalShares?: number
  readonly threshold?: number
  readonly description?: string
}

export async function splitSecret(
  page: Page,
  secret: string,
  opts: SplitOptions = {},
): Promise<void> {
  const { totalShares = 5, threshold = 3, description } = opts

  await page.click('button.tab:has-text("Split")')
  await page.click('.mode-btn:has-text("Text")')

  if (description) {
    await page.fill('#description', description)
  }

  await page.fill('#secret', secret)
  await page.fill('#totalShares', String(totalShares))
  await page.fill('#threshold', String(threshold))

  await page.click('button:has-text("Generate Shares")')
  await expect(page.locator('.success-banner')).toBeVisible()
}

export async function getShares(page: Page): Promise<string[]> {
  const shares: string[] = []
  const cards = page.locator('.share-card')
  const count = await cards.count()

  for (let i = 0; i < count; i++) {
    // Copy button is always the last .btn-copy in each share card
    await cards.nth(i).locator('.btn-copy').last().click()
    const text = await page.evaluate(() => navigator.clipboard.readText())
    shares.push(text)
  }

  return shares
}

export async function switchToCombine(page: Page): Promise<void> {
  await page.click('button.tab:has-text("Combine")')
}

export async function switchToPasteMode(page: Page): Promise<void> {
  await page.click('.mode-btn:has-text("Paste Key")')
}

export async function pasteShare(page: Page, share: string): Promise<void> {
  await switchToPasteMode(page)
  await page.fill('#shareInput', share)
  await page.click('button:has-text("Add Share")')
  await expect(page.locator('#shareInput')).toHaveValue('')
}

export async function combineShares(
  page: Page,
  shares: readonly string[],
): Promise<void> {
  await switchToCombine(page)
  await switchToPasteMode(page)

  for (const share of shares) {
    await page.fill('#shareInput', share)
    await page.click('button:has-text("Add Share")')
  }

  await page.click('button:has-text("Reveal Secret")')
}
