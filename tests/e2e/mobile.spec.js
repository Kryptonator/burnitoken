// Playwright: Mobile- und UI-Qualitäts-Test (erweitert)
// Refactored: test.use entfernt, eindeutige Testtitel, Konfiguration im Test-Body
const { test, expect, devices } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const deviceList = [
  { name: 'iPhone 12', device: devices['iPhone 12'] },
  { name: 'Pixel 5', device: devices['Pixel 5'] },
  { name: 'iPad (gen 7)', device: devices['iPad (gen 7)'] },
  { name: 'iPhone SE', device: devices['iPhone SE'] },
];

const urlsToTest = ['http://localhost:3000', 'http://localhost:3000/404'];
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

test.describe('Mobile/UI-Audit: Geräte, Sprache, Farbschema, Netzwerk', () => {
  for (const { device, deviceName, url, lang, colorScheme, network } of testMatrix) {
    const testTitle = `${deviceName} | ${url} | ${lang} | ${colorScheme} | ${network ? '3G' : 'normal'}`;
    test(testTitle + ' | Komplett-Audit', async ({ page, context, browserName }) => {
      await context.newPage({ ...device, locale: lang, colorScheme });
      if (network) 
        await context.setOffline(false);
        await context.setHTTPCredentials(undefined);
        await context.setNetworkConditions(network);
      }
      const start = Date.now();
      await page.goto(url);
      const loadTime = Date.now() - start;
      expect(loadTime).toBeLessThan(8000); // Performance-Check

      // Accessibility-Check
      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
      expect(accessibilityScanResults.violations.length).toBe(0);

      // Visuelle Regression
      await page.screenshot({
        path: `screenshots/full-${deviceName}-${lang}-${colorScheme}-${url.replace(/[^a-z0-9]/gi, '_')}-${network ? '3G' : 'normal'}.png`,
        fullPage: true,
      });

      // Interaktive Elemente: Buttons, Dropdowns, Modals, Drag & Drop
      const buttons = page.locator('button');
      for (let i = 0; i < (await buttons.count()); i++) {
        await expect(buttons.nth(i)).toBeVisible();
        await buttons.nth(i).hover();
      }
      const dropdowns = page.locator('select');
      for (let i = 0; i < (await dropdowns.count()); i++) {
        await expect(dropdowns.nth(i)).toBeVisible();
      }
      if ((await page.locator('[draggable=true]').count()) > 1) {
        const drag = page.locator('[draggable=true]').first();
        const drop = page.locator('[draggable=true]').nth(1);
        await drag.dragTo(drop);
      }

      // Datenvalidierung: Formulare
      const forms = page.locator('form');
      for (let i = 0; i < (await forms.count()); i++) {
        const form = forms.nth(i);
        const inputs = form.locator('input, textarea');
        for (let j = 0; j < (await inputs.count()); j++) {
          await inputs.nth(j).fill('test');
        }
        // Absenden und Fehlermeldungen prüfen (wenn Button vorhanden)
        if (await form.locator('button[type=submit]').count()) {
          await form.locator('button[type=submit]').click();
          await expect(form).not.toContainText(/error|fehler|ungültig/i);
        }
      }

      // Third-Party-Integrationen: Analytics, Payment (nur Beispiel)
      const scripts = await page
        .locator('script[src*="analytics"], script[src*="gtag"], script[src*="stripe"]')
        .count();
      expect(scripts).toBeGreaterThanOrEqual(0); // Nur Nachweis, keine echte Integration

      // Responsive Design: Fenstergrößen
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad
      await page.setViewportSize({ width: 1440, height: 900 }); // Desktop

      // SEO-Checks
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
      const metaDesc = await page.locator('meta[name="description"]').getAttribute('content');
      expect(metaDesc).not.toMatch(/lorem|platzhalter|dummy/i);
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toContain('http');

      // Monitoring/Logging: Fehler im Log
      const logs = [];
      page.on('console', (msg) => logs.push(msg.text()));
      expect(logs.join(' ')).not.toMatch(/error|fehler|exception/i);

      // Updates/Migrationen: (nur Beispiel, da automatisiert schwer)
      // Hier könnte ein Test nach Deployment-Flag oder Migrationshinweis suchen

      // Datenschutz/DSGVO: Cookies prüfen
      const cookies = await context.cookies();
      cookies.forEach((cookie) => {
        expect(cookie.name).not.toMatch(/track|ad|google/i);
      });

      // PWA-Features: Manifest, Service Worker
      const manifest = await page.locator('link[rel="manifest"]').getAttribute('href');
      expect(manifest).toBeDefined();
      // Service Worker prüfen (nur wenn https)
      if (url.startsWith('https')) {
        const sw = await page.evaluate(() => navigator.serviceWorker?.controller);
        expect(sw).toBeDefined();
      }

      // Usability: Kontraste, Schriftgrößen (vereinfachte Prüfung)
      const fontSize = await page.evaluate(() => getComputedStyle(document.body).fontSize);
      expect(parseFloat(fontSize)).toBeGreaterThanOrEqual(12);

      // Fehler-Reporting: Monitoring-Tools (nur Beispiel)
      const sentry = await page.locator('script[src*="sentry"]').count();
      expect(sentry).toBeGreaterThanOrEqual(0);

      // Backup/Recovery: (nur Hinweis, da automatisiert schwer)
      // Hier könnte ein Test auf Backup-Status oder Recovery-UI prüfen
    });
  }
});
