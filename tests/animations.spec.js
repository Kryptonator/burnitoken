// Playwright-Test: Animationen & Interaktivität
const { test, expect } = require('@playwright/test');

test('FAQ-Akkordeon Animation', async ({ page }) => {
  await page.goto('http://localhost:3000');
  const faq = page.locator('.faq-question').first();
  await faq.click();
  await expect(page.locator('.faq-answer').first()).toBeVisible();
  await page.screenshot({ path: 'screenshots/faq-accordion.png' });
});

test('Button Hover Animation', async ({ page }) => {
  await page.goto('http://localhost:3000');
  const button = page.locator('button').first();
  await button.hover();
  await page.screenshot({ path: 'screenshots/button-hover.png' });
});
