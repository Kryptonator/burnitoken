// Playwright: Advanced Features Test (CommonJS)
const { test, expect } = require('@playwright/test');

test('Advanced Feature Beispiel', async ({ page }) => {
  await page.goto('http://localhost:3000/irgendeine-seite');
  // Hier weitere Prüfungen für Advanced Features ergänzen
  await expect(page).toHaveURL(/irgendeine-seite/);
});
