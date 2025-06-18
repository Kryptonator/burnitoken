// Playwright: i18n-Test
// Verschoben nach e2e/ für Playwright

// Playwright-Test: Internationalisierung & RTL
const { test, expect } = require('@playwright/test');

test.describe('Sprachumschaltung & RTL', () => {
  const languages = [
    { code: 'en', dir: 'ltr', text: 'Burni Token - Creating Value Through Scarcity' },
    { code: 'de', dir: 'ltr', text: 'Burni Token - Wert durch Knappheit' },
    { code: 'ar', dir: 'rtl', text: 'بيرني توكن - خلق القيمة من خلال الندرة' }
  ];

  for (const lang of languages) {
    test(`Sprache ${lang.code} wird korrekt angezeigt`, async ({ page }) => {
      await page.goto('http://localhost:3000');
      await page.selectOption('#lang-select', lang.code);
      await expect(page.locator('h1')).toContainText(lang.text);
      await expect(page.locator('html')).toHaveAttribute('dir', lang.dir);
      await page.screenshot({ path: `screenshots/i18n-${lang.code}.png` });
    });
  }
});
