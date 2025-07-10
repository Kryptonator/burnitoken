// tests/e2e/language-switcher.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Language Switcher E2E Tests', () => {
  test.beforeEach(async ({ page, browserName }) => {
    // Listen to console logs for debugging
    page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', (error) => console.log('PAGE ERROR:', error.message));

    await page.goto('http://localhost:3000/');
    // Setze Testmodus-Attribut VOR Initialisierung
    await page.evaluate(() => {
      document.body.setAttribute('data-playwright', 'true');
    });
    // Initialisierung der Navigation und Language Switcher für Teststabilität
    await page.evaluate(
      () => window.initNavigationAndLanguage && window.initNavigationAndLanguage(),
    );
    // Warte für WebKit explizit länger, damit das JS garantiert initialisiert ist
    if (browserName === 'webkit') {
      await page.waitForTimeout(1000);
    }
    // Wait for page to be fully loaded
    await page.waitForSelector('#lang-select');
    await page.waitForTimeout(2000); // Wait for JavaScript to initialize
  });
  test('Language switcher updates all translatable elements', async ({ page }) => {
    // Check if main.js loaded
    const mainJsLoaded = await page.evaluate(() => window.mainJsLoaded);
    console.log(`Main.js loaded: ${mainJsLoaded}`);

    // Check if inline script loaded
    const inlineScriptLoaded = await page.evaluate(() => window.inlineScriptLoaded);
    console.log(`Inline script loaded: ${inlineScriptLoaded}`);

    // Check if the language select works
    const langSelect = page.locator('#lang-select');
    await expect(langSelect).toBeVisible();

    // Check initial state
    const homeNavElement = page.locator('[data-i18n="nav_home"]').first();
    const initialText = await homeNavElement.textContent();
    console.log(`Initial text: "${initialText}"`);

    // Check current language selector value
    const currentValue = await langSelect.inputValue();
    console.log(`Current language selector value: "${currentValue}"`);

    // Test German translation
    console.log('Selecting German language...');
    await langSelect.selectOption('de');
    // Polling auf <html lang="de"> ohne Funktions-String
    await expect.poll(async () => await page.locator('html').getAttribute('lang')).toBe('de');
    await expect(homeNavElement).toHaveText('Startseite', { timeout: 15000 });
  });

  test('Language switcher works for multiple languages', async ({ page }) => {
    await page.selectOption('#lang-select', 'es');
    await expect.poll(async () => await page.locator('html').getAttribute('lang')).toBe('es');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es', { timeout: 10000 });
    const homeNavElement = page.locator('[data-i18n="nav_home"]').first();
    await expect(homeNavElement).toHaveText('Inicio', { timeout: 15000 });
    await page.selectOption('#lang-select', 'fr');
    await expect.poll(async () => await page.locator('html').getAttribute('lang')).toBe('fr');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr', { timeout: 10000 });
    await expect(homeNavElement).toHaveText('Accueil', { timeout: 15000 });
  });

  test('Page title updates with language change', async ({ page }) => {
    await page.selectOption('#lang-select', 'de');
    await expect.poll(async () => await page.locator('html').getAttribute('lang')).toBe('de');
    await expect(page.locator('html')).toHaveAttribute('lang', 'de', { timeout: 10000 });
    const title = await page.title();
    expect(title).toMatch(/Burni Token/i);
  });
});
