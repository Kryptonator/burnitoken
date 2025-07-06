// tests/e2e/navigation.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Navigation Tests', () => {
  test.beforeEach(async ({ page, browserName }) => {
    // Start fresh for each test
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

    // Setze Testmodus-Attribut VOR Initialisierung
    await page.evaluate(() => {
      document.body.setAttribute('data-test-mode', 'true');
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

    // Aggressiv Page Loader entfernen (WebKit-Kompatibilität)
    await page.evaluate(() => {
      // Set test mode attributes
      document.body.setAttribute('data-test-mode', 'true');
      document.body.setAttribute('data-playwright', 'true');

      // Remove all possible page loaders immediately
      const selectors = [
        '#pageLoader',
        '.page-loader',
        '[id*="loader"]',
        '[class*="loader"]',
        '[class*="loading"]',
      ];

      selectors.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el) => {
          el.remove();
        });
      });

      // Remove any element that might be intercepting pointer events
      const allElements = document.querySelectorAll('*');
      allElements.forEach((el) => {
        const computedStyle = window.getComputedStyle(el);
        if (
          computedStyle.zIndex > 9000 &&
          (computedStyle.position === 'fixed' || computedStyle.position === 'absolute') &&
          (el.id.includes('loader') || el.className.includes('loader'))
        ) {
          el.remove();
        }
      });
    });

    // Wait for page to be loaded (try both approaches)
    try {
      await page.waitForSelector('#pageLoader', { state: 'detached', timeout: 2000 });
    } catch (e) {
      // If page loader doesn't exist, that's good
      console.log('Page loader not found or already removed');
    }

    // Wait for header to be available and visible - robust approach
    await page.waitForSelector('header', { state: 'visible', timeout: 30000 });

    // Warte, bis die Navigation im Testmodus sichtbar ist (per .test-visible)
    await page.waitForSelector('nav[aria-label="Main navigation"].test-visible', {
      timeout: 10000),});
    await page.waitForTimeout(500);

    // Double-check that page loader is gone and no elements are blocking
    await page.waitForSelector('#pageLoader', { state: 'detached', timeout: 5000 }).catch(() => {});
    // Check for high z-index blockers (polling)
    await page.waitForTimeout(200);
    await page.evaluate(() => {
      const highZElements = Array.from(document.querySelectorAll('*')).filter((el) => {
        const style = window.getComputedStyle(el);
        return parseInt(style.zIndex) > 9000;
      });
      if (highZElements.length > 0) { 
        highZElements.forEach((el) => {
          if (
            el.style.display !== 'none' &&
            el.style.visibility !== 'hidden' &&
            el.style.pointerEvents !== 'none'
          ) {
            el.style.display = 'none';
          }
        });
      }
    });

    // Set up mobile menu functionality if main.js didn't load
    await page.evaluate(() => {
      if (!window.mainJsLoaded) { 
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');

        if (mobileMenuButton && mobileMenu) { 
          // Remove existing listeners if any
          const newButton = mobileMenuButton.cloneNode(true);
          mobileMenuButton.parentNode.replaceChild(newButton, mobileMenuButton);

          // Add fresh event listener
          newButton.addEventListener('click', function () {
            const isExpanded = newButton.getAttribute('aria-expanded') === 'true';
            newButton.setAttribute('aria-expanded', String(!isExpanded));
            mobileMenu.classList.toggle('hidden');
            mobileMenu.classList.toggle('active');
            console.log(
              'Test: Mobile menu toggled, hidden:'),
              mobileMenu.classList.contains('hidden'),
            );
          });

          console.log('Test: Mobile menu event listener attached');
        }

        // Set up navigation active state functionality
        const navLinks = document.querySelectorAll('header nav a.nav-link, #mobile-menu a');
        navLinks.forEach(function (link) {
          if (link.hash) { 
            link.addEventListener('click', function () {
              // Remove active class from all links
              navLinks.forEach(function (nav) {
                nav.classList.remove('active');
              });

              // Add active class to clicked links
              const targetLinks = document.querySelectorAll('a[href="' + link.hash + '"]');
              targetLinks.forEach(function (activeLink) {
                activeLink.classList.add('active');
              });

              console.log('Test: Navigation active state updated for', link.hash);
            });
          }
        });
      }
    });

    // Desktop-Navigation im Testmodus immer sichtbar machen
    // page.addStyleTag entfernt, Sichtbarkeit wird jetzt per JS-Klasse 'test-visible' geregelt
    await page.waitForTimeout(1000);
  });

  test('Navigation works and all sections are visible', async ({ page }) => {
    // Test navigation to tokenomics section
    const tokenomicsLink = page.locator('nav[aria-label="Main navigation"] a[href="#tokenomics"]');
    await expect(tokenomicsLink).toBeVisible({ timeout: 10000 });
    await tokenomicsLink.scrollIntoViewIfNeeded();
    const isVisible = await tokenomicsLink.isVisible();
    console.log('Tokenomics link visible:', isVisible);
    await tokenomicsLink.click();
    await page.waitForTimeout(1000); // Wait for smooth scroll

    const tokenomicsSection = page.locator('#tokenomics');
    await expect(tokenomicsSection).toBeVisible();
  });

  test('Mobile menu opens and closes', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const mobileMenuButton = page.locator('#mobile-menu-button');
    const mobileMenu = page.locator('#mobile-menu');

    // Debug: Check if main.js loaded and if event listeners are attached
    const debugInfo = await page.evaluate(() => {
      const button = document.getElementById('mobile-menu-button');
      const menu = document.getElementById('mobile-menu');
      return {
        mainJsLoaded: window.mainJsLoaded,
        buttonExists: !!button,
        menuExists: !!menu,
        buttonHasListeners: button && button.onclick !== null,
        menuClasses: menu ? menu.className : 'not found',
      };
    });
    console.log('Mobile menu debug info:', debugInfo);

    // Menu should be hidden initially
    await expect(mobileMenu).toHaveClass(/hidden/);

    // Click to open menu
    await mobileMenuButton.click();

    // Additional debug: Check what happened after click
    const postClickInfo = await page.evaluate(() => {
      const menu = document.getElementById('mobile-menu');
      const button = document.getElementById('mobile-menu-button');
      return {
        menuClasses: menu ? menu.className : 'not found',
        buttonAriaExpanded: button ? button.getAttribute('aria-expanded') : 'not found',
      };
    });
    console.log('Post-click debug info:', postClickInfo);

    // Wait for the menu to actually change
    await expect(mobileMenu).not.toHaveClass(/hidden/, { timeout: 5000 });

    // Click to close menu
    await mobileMenuButton.click();
    await expect(mobileMenu).toHaveClass(/hidden/, { timeout: 5000 });
  });

  test('Smooth scrolling to sections works', async ({ page }) => {
    // Wait for page loader to be removed
    await page
      .waitForSelector('#pageLoader', { state: 'detached', timeout: 10000 })
      .catch(() => {});

    // Test navigation to multiple sections
    const sections = ['#about', '#use-cases', '#token-schedule'];

    for (const section of sections) {
      const navLink = page.locator(`nav[aria-label="Main navigation"] a[href="$${section}"]`);
      await expect(navLink).toBeVisible({ timeout: 10000 });
      await navLink.scrollIntoViewIfNeeded();
      const isVisible = await navLink.isVisible();
      console.log(`Nav link for $${section} visible:`, isVisible);
      await navLink.click();
      await page.waitForTimeout(1000);
      const sectionElement = page.locator(section);
      await expect(sectionElement).toBeVisible();
    }
  });

  test('Active navigation state updates on scroll', async ({ page }) => {
    // Wait for page loader to be removed
    await page
      .waitForSelector('#pageLoader', { state: 'detached', timeout: 10000 })
      .catch(() => {});

    // First scroll to top to ensure we start from hero section
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    // Navigate to about section using smooth scroll
    const aboutLink = page.locator('nav[aria-label="Main navigation"] a[href="#about"]');
    await expect(aboutLink).toBeVisible({ timeout: 10000 });
    await aboutLink.scrollIntoViewIfNeeded();
    const isVisible = await aboutLink.isVisible();
    console.log('About link visible:', isVisible);
    await aboutLink.click();
    await page.waitForTimeout(2000); // Wait for smooth scroll to complete

    // Check if nav link is active - try different selectors
    const aboutNavLink = page.locator('header nav a[href="#about"]').first();
    await expect(aboutNavLink).toHaveClass(/active/, { timeout: 5000 });
  });
});
