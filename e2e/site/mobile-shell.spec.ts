import { expect, test } from '@playwright/test'

test.use({ viewport: { width: 390, height: 844 } })

test.describe('mobile shell', () => {
  test('bottom tab nav is visible; header and footer hidden on small viewports', async ({ page }) => {
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: 'Asosiy navigatsiya' })
    await expect(nav).toBeVisible()
    await expect(page.locator('header').first()).toBeHidden()
    await expect(page.getByRole('contentinfo')).toBeHidden()
  })

  test('Qidiruv tab navigates to search', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('navigation', { name: 'Asosiy navigatsiya' }).getByRole('link', { name: 'Qidiruv' }).click()
    await expect(page).toHaveURL(/\/search$/)
  })
})
