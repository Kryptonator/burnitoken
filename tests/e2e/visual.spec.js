const { test, expect } = require('@playwright/test');

const seiten = [
  '/',
  '/index.html',
  '/404.html',
  // Weitere Seiten hier ergänzen, z.B. '/token/', '/community/', '/docs/'
];

seiten.forEach((pfad) => {
  test(`Visual Regression: $${pfad}`, async ({ page }) => {
    await page.goto(`http://localhost:8080$${pfad}`);
    await expect(page).toHaveScreenshot(`${pfad.replace(/[\/.]/g, '_')}.png`, {
      fullPage: true,
      threshold: 0.02,
    });
  });
});

// Visual Regression für die Startseite
test('Visual Regression: Startseite', async ({ page }) => {
  await page.goto('http://localhost:8080');
  await expect(page).toHaveScreenshot('homepage.png', { fullPage: true, threshold: 0.02 });
});

// Visual Regression für Token-Seite
test('Visual Regression: Token-Sektion', async ({ page }) => {
  await page.goto('http://localhost:8080');
  const tokenSection = page.locator('#token');
  await expect(tokenSection).toHaveScreenshot('token-section.png', { threshold: 0.02 });
});

// Visual Regression für Community-Seite
test('Visual Regression: Community-Sektion', async ({ page }) => {
  await page.goto('http://localhost:8080');
  const communitySection = page.locator('#community');
  await expect(communitySection).toHaveScreenshot('community-section.png', { threshold: 0.02 });
});
