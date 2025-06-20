// Playwright: API-Test
// Verschoben nach e2e/ für Playwright
const { test, expect } = require('@playwright/test');

test('Preis-Widget lädt Daten und zeigt Fallback bei Ausfall', async ({ page }) => {
  await page.goto('http://localhost:3000');
  // Simuliere API-Ausfall
  await page.route('**/api/prices', (route) => route.abort());
  await page.reload();
  await expect(page.locator('.price-widget .fallback')).toBeVisible();
});
