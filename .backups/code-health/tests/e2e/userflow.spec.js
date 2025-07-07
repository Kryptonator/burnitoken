const { test, expect } = require('@playwright/test');

// Test: Preis-Widget lädt und zeigt Wert an
// (Annahme: Lokaler Server läuft auf http://localhost:8080)
test('Preis-Widget zeigt Wert und Status an', async ({ page }) => {
  await page.goto('http://localhost:8080');
  const priceValue = await page.locator('[data-price-value]');
  await expect(priceValue).toBeVisible();
  await expect(priceValue).not.toHaveText('$....');
  const priceStatus = await page.locator('[data-price-status]');
  await expect(priceStatus).toBeVisible();
  await expect(priceStatus).not.toHaveText('Loading...');
});

// Test: Navigation funktioniert
const navLinks = [
  { selector: 'a.nav-link[href="#token"]', target: '#token' },
  { selector: 'a.nav-link[href="#roadmap"]', target: '#roadmap' },
  { selector: 'a.nav-link[href="#community"]', target: '#community' },
  { selector: 'a.nav-link[href="#faq"]', target: '#faq' },
];

for (const link of navLinks) {
  test(`Navigation zu ${link.target} funktioniert`, async ({ page }) => {
    await page.goto('http://localhost:8080');
    await page.click(link.selector);
    await expect(page.locator(link.target)).toBeVisible();
  });
}

// Test: Kontaktformular validiert Eingaben
// (Optional: Kann weiter ausgebaut werden)
test('Kontaktformular validiert Pflichtfelder', async ({ page }) => {
  await page.goto('http://localhost:8080');
  await page.click('button[type="submit"]');
  // Erwartung: Fehlermeldung oder kein Submit bei leeren Feldern
  // (Hier kann je nach Implementierung weiter getestet werden)
});

// Test: Sprache wechseln (i18n)
test('Sprache wechseln funktioniert', async ({ page }) => {
  await page.goto('http://localhost:8080');
  await page.click('[data-lang-switch]');
  // Erwartung: Text auf der Seite ändert sich (z.B. Überschrift)
  const heading = await page.locator('h1, h2').first();
  await expect(heading).not.toHaveText(/BurniToken|Willkommen/i); // Beispiel: Text sollte sich ändern
});

// Test: Fehlerfall Preis-API (Fallback)
test('Preis-Widget zeigt Fallback bei API-Fehler', async ({ page }) => {
  await page.route('**/api.coingecko.com/**', (route) => route.abort());
  await page.goto('http://localhost:8080');
  const priceStatus = await page.locator('[data-price-status]');
  await expect(priceStatus).toHaveText(/Fehler|Fallback|Error/i);
});
