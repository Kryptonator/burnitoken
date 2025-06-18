// Playwright-Test: Mobile & Responsive
const { test, expect, devices } = require('@playwright/test');

test.use({ ...devices['iPhone 12'] });

test('Mobile-Layout und Navigation', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page.locator('nav')).toBeVisible();
  await expect(page.locator('#mobile-menu')).toBeHidden();
  await page.locator('button.menu-toggle').click();
  await expect(page.locator('#mobile-menu')).toBeVisible();
  await page.screenshot({ path: 'screenshots/mobile-menu.png' });
});
