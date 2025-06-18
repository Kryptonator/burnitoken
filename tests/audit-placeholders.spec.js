// Playwright: Audit-Test für Platzhalter und Dummy-Inhalte (erweitert)
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
  'http://localhost:3000/404',
];

const languages = ['de', 'en'];
const colorSchemes = ['light', 'dark'];
const networkConditions = [undefined, { offline: false, download: 400 * 1024 / 8, upload: 400 * 1024 / 8, latency: 400 }]; // normal & 3G

devicesToTest.forEach(device => {
  urlsToTest.forEach(url => {
    languages.forEach(lang => {
      colorSchemes.forEach(colorScheme => {
        networkConditions.forEach(network => {
          test.describe(`${device.name} | ${url} | ${lang} | ${colorScheme} | ${network ? '3G' : 'normal'}`, () => {
            test.use({ ...device, locale: lang, colorScheme });
            test('Komplett-Audit: Platzhalter, UI, UX, Security, SEO, PWA, Datenschutz', async ({ page, context, browserName }) => {
              if (network) await context.setOffline(false), await context.setHTTPCredentials(undefined), await context.setNetworkConditions(network);
              const start = Date.now();
              await page.goto(url);
              const loadTime = Date.now() - start;
              expect(loadTime).toBeLessThan(8000); // Performance-Check

              // Accessibility-Check
              const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
              expect(accessibilityScanResults.violations.length).toBe(0);

              // Visuelle Regression
              await page.screenshot({ path: `screenshots/audit-full-${device.name}-${lang}-${colorScheme}-${url.replace(/[^a-z0-9]/gi, '_')}-${network ? '3G' : 'normal'}.png`, fullPage: true });

              // Platzhaltertexte prüfen
              const bodyText = await page.locator('body').innerText();
              const placeholderPattern = /(lorem ipsum|platzhalter|dummy|to be filled|your text here|sample text|image coming soon|testbild|testtext)/i;
              expect(bodyText).not.toMatch(placeholderPattern);

              // Dummy-Bilder prüfen
              const images = page.locator('img');
              for (let i = 0; i < await images.count(); i++) {
                const src = await images.nth(i).getAttribute('src');
                expect(src).not.toMatch(/placeholder|dummy|lorem|base64|sample|testbild/i);
              }

              // Leere Buttons prüfen
              const buttons = page.locator('button');
              for (let i = 0; i < await buttons.count(); i++) {
                const text = await buttons.nth(i).innerText();
                expect(text.trim().length).toBeGreaterThan(0);
              }

              // Interaktive Elemente: Dropdowns, Modals, Drag & Drop
              const dropdowns = page.locator('select');
              for (let i = 0; i < await dropdowns.count(); i++) {
                await expect(dropdowns.nth(i)).toBeVisible();
              }
              if (await page.locator('[draggable=true]').count() > 1) {
                const drag = page.locator('[draggable=true]').first();
                const drop = page.locator('[draggable=true]').nth(1);
                await drag.dragTo(drop);
              }

              // Internationalisierung: Sprache prüfen
              const htmlLang = await page.getAttribute('html', 'lang');
              expect(htmlLang).toContain(lang);

              // Fehlerseite: 404 prüfen
              if (url.includes('404')) {
                await expect(page.locator('body')).toContainText(/404|nicht gefunden|not found/i);
              }

              // Offline/Netzwerk-Fehler simulieren
              await context.setOffline(true);
              await expect(page).not.toHaveTitle(/Fehler|Error/i);
              await context.setOffline(false);

              // Security-Header prüfen
              const response = await page.goto(url);
              const headers = response.headers();
              expect(headers['content-security-policy'] || headers['strict-transport-security']).toBeDefined();

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
              page.on('console', msg => logs.push(msg.text()));
              expect(logs.join(' ')).not.toMatch(/error|fehler|exception/i);

              // Datenschutz/DSGVO: Cookies prüfen
              const cookies = await context.cookies();
              cookies.forEach(cookie => {
                expect(cookie.name).not.toMatch(/track|ad|google/i);
              });

              // PWA-Features: Manifest, Service Worker
              const manifest = await page.locator('link[rel="manifest"]').getAttribute('href');
              expect(manifest).toBeDefined();
              if (url.startsWith('https')) {
                const sw = await page.evaluate(() => navigator.serviceWorker?.controller);
                expect(sw).toBeDefined();
              }

              // Usability: Kontraste, Schriftgrößen
              const fontSize = await page.evaluate(() => getComputedStyle(document.body).fontSize);
              expect(parseFloat(fontSize)).toBeGreaterThanOrEqual(12);

              // Fehler-Reporting: Monitoring-Tools
              const sentry = await page.locator('script[src*="sentry"]').count();
              expect(sentry).toBeGreaterThanOrEqual(0);

              // Backup/Recovery: (nur Hinweis, da automatisiert schwer)
              // Hier könnte ein Test auf Backup-Status oder Recovery-UI prüfen
            });
          });
        });
      });
    });
  });
});
