import { test, expect } from '@playwright/test'
import { splitSecret, getShares, switchToCombine } from './helpers'

test.describe('Drag and Drop', () => {
  test('drag a text file containing a share onto Combine view adds the share', async ({
    context,
    page,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.goto('./tool.html')

    // Generate shares
    await splitSecret(page, 'drag drop test', { totalShares: 3, threshold: 2 })
    const shares = await getShares(page)

    await switchToCombine(page)

    // Simulate dropping a text file containing a share
    const dataTransfer = await page.evaluateHandle((shareText) => {
      const dt = new DataTransfer()
      const file = new File([shareText], 'share.txt', { type: 'text/plain' })
      dt.items.add(file)
      return dt
    }, shares[0])

    const combineView = page.locator('.combine-view')

    await combineView.dispatchEvent('dragover', { dataTransfer })
    // Drag-over class should appear
    await expect(combineView).toHaveClass(/drag-over/)

    await combineView.dispatchEvent('drop', { dataTransfer })

    // Share should be added
    await expect(page.locator('.share-item')).toHaveCount(1, { timeout: 5000 })
  })
})
