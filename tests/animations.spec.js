// Playwright: Animation-Test
// Verschoben nach e2e/ für Playwright

const { test, expect } = require('@playwright/test');

// Die umfassende Teststruktur wie in mobile.spec.js und audit-placeholders.spec.js wird hier übernommen.

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
