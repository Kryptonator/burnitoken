// Playwright: API-Test (erweitert)
// Verschoben nach e2e/ für Playwright
const { test, expect, devices, request } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const devicesToTest = [
  devices['iPhone 12'],
  devices['Pixel 5'],
  devices['iPad (gen 7)'],
  devices['iPhone SE'],
];

const urlsToTest = [
  'http://localhost:3000',
];

const languages = ['de', 'en'];
const colorSchemes = ['light', 'dark'];
const networkConditions = [undefined, { offline: false, download: 400 * 1024 / 8, upload: 400 * 1024 / 8, latency: 400 }]; // normal & 3G

// Testmatrix außerhalb erzeugen
const testMatrix = [];
for (const device of devicesToTest) {
  for (const url of urlsToTest) {
    for (const lang of languages) {
      for (const colorScheme of colorSchemes) {
        for (const network of networkConditions) {
          testMatrix.push({ device, url, lang, colorScheme, network });
        }
      }
    }
  }
}

test.describe('API/Komplett-Audit: Geräte, Sprache, Farbschema, Netzwerk', () => {
  for (const { device, url, lang, colorScheme, network } of testMatrix) {
    test.describe(`${device.name} | ${url} | ${lang} | ${colorScheme} | ${network ? '3G' : 'normal'}`,
      () => {
        test.use({ ...device, locale: lang, colorScheme });

        test('Performance-Check', async ({ page, context }) => {
          if (network) {
            await context.setOffline(false);
            await context.setNetworkConditions(network);
          }
          const start = Date.now();
          await page.goto(url);
          const loadTime = Date.now() - start;
          expect(loadTime).toBeLessThan(8000);
        });

        test('Accessibility-Check', async ({ page }) => {
          await page.goto(url);
          const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
          expect(accessibilityScanResults.violations.length).toBe(0);
        });

        test('Visuelle Regression', async ({ page }) => {
          await page.goto(url);
          await page.screenshot({ path: `screenshots/api-${device.name}-${lang}-${colorScheme}-${url.replace(/[^a-z0-9]/gi, '_')}-${network ? '3G' : 'normal'}.png`, fullPage: true });
        });

        test('API-Ausfall & Fallback', async ({ page }) => {
          await page.goto(url);
          await page.route('**/api/prices', route => route.abort());
          await page.reload();
          await expect(page.locator('.price-widget .fallback')).toBeVisible();
        });

        test('Security-Header', async ({ page }) => {
          const response = await page.goto(url);
          const headers = response.headers();
          expect(headers['content-security-policy'] || headers['strict-transport-security']).toBeDefined();
        });

        test('Usability: Schriftgrößen', async ({ page }) => {
          await page.goto(url);
          const fontSize = await page.evaluate(() => getComputedStyle(document.body).fontSize);
          expect(parseFloat(fontSize)).toBeGreaterThanOrEqual(12);
        });
      }
    );
  }
});
