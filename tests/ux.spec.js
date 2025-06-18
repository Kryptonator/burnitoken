// Playwright: UX-Test
// Verschoben nach e2e/ für Playwright

const { test, expect } = require('@playwright/test');

test('Alle Links funktionieren', async ({ page }) => {
  await page.goto('http://localhost:3000');
  const links = await page.$$eval('a[href]', as => as.map(a => a.href));
  for (const link of links) {
    if (!link.startsWith('mailto:') && !link.startsWith('tel:')) {
      const res = await page.request.get(link);
      expect(res.status()).toBeLessThan(400);
    }
  }
});

test('Newsletter-Formular gibt Feedback', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.fill('input[type=email]', 'test@example.com');
  await page.click('button[type=submit]');
  await expect(page.locator('.newsletter-success, .newsletter-error')).toBeVisible();
});

// Die umfassende Teststruktur wie in mobile.spec.js und audit-placeholders.spec.js wird hier übernommen.
