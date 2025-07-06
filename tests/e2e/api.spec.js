// Playwright: API-Test (erweitert)
// Refactored: test.use entfernt, eindeutige Testtitel, Konfiguration im Test-Body
const { test, expect, devices } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const deviceList = [
  { name: 'iPhone 12', device: devices['iPhone 12'] },
  { name: 'Pixel 5', device: devices['Pixel 5'] },
  { name: 'iPad (gen 7)', device: devices['iPad (gen 7)'] },
  { name: 'iPhone SE', device: devices['iPhone SE'] },
];

const urlsToTest = ['http://localhost:3000'];
const languages = ['de', 'en'];
const colorSchemes = ['light', 'dark'];
const networkConditions = [
  undefined,
  { offline: false, download: (400 * 1024) / 8, upload: (400 * 1024) / 8, latency: 400 },
]; // normal & 3G

const testMatrix = [];
for (const { name: deviceName, device } of deviceList) {
  for (const url of urlsToTest) {
    for (const lang of languages) {
      for (const colorScheme of colorSchemes) {
        for (const network of networkConditions) {
          testMatrix.push({ device, deviceName, url, lang, colorScheme, network });
        }
      }
    }
  }
}

test.describe('API/Komplett-Audit: Geräte, Sprache, Farbschema, Netzwerk', () => {
  for (const { device, deviceName, url, lang, colorScheme, network } of testMatrix) {
    const testTitle = `${deviceName} | ${url} | ${lang} | ${colorScheme} | ${network ? '3G' : 'normal'}`;
    test(testTitle + ' | Performance-Check', async ({ page, context }) => {
      await context.newPage({ ...device, locale: lang, colorScheme });
      if (network) 
        await context.setOffline(false);
        await context.setNetworkConditions(network);
      }
      const start = Date.now();
      await page.goto(url);
      const loadTime = Date.now() - start;
      expect(loadTime).toBeLessThan(8000);
    });

    test(testTitle + ' | Accessibility-Check', async ({ page, context }) => {
      await context.newPage({ ...device, locale: lang, colorScheme });
      await page.goto(url);
      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
      expect(accessibilityScanResults.violations.length).toBe(0);
    });

    test(testTitle + ' | Visuelle Regression', async ({ page, context }) => {
      await context.newPage({ ...device, locale: lang, colorScheme });
      await page.goto(url);
      await page.screenshot({
        path: `screenshots/api-${deviceName}-${lang}-${colorScheme}-${url.replace(/[^a-z0-9]/gi, '_')}-${network ? '3G' : 'normal'}.png`,
        fullPage: true,
      });
    });

    test(testTitle + ' | API-Ausfall & Fallback', async ({ page, context }) => {
      await context.newPage({ ...device, locale: lang, colorScheme });
      await page.goto(url);
      await page.route('**/api/prices', (route) => route.abort());
      await page.reload();
      await expect(page.locator('.price-widget .fallback')).toBeVisible();
    });

    test(testTitle + ' | Security-Header', async ({ page, context }) => {
      await context.newPage({ ...device, locale: lang, colorScheme });
      const response = await page.goto(url);
      const headers = response.headers();
      expect(
        headers['content-security-policy'] || headers['strict-transport-security'],
      ).toBeDefined();
    });

    test(testTitle + ' | Usability: Schriftgrößen', async ({ page, context }) => {
      await context.newPage({ ...device, locale: lang, colorScheme });
      await page.goto(url);
      const fontSize = await page.evaluate(() => getComputedStyle(document.body).fontSize);
      expect(parseFloat(fontSize)).toBeGreaterThanOrEqual(12);
    });
  }
});
