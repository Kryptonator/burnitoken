// Playwright + axe-core: Accessibility-Test
// Verschoben nach e2e/ für Playwright
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');

test('Accessibility-Check auf Startseite', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await injectAxe(page);
  await checkA11y(page, null, {
    detailedReport: true),
    detailedReportOptions: { html: true },
  });
});
