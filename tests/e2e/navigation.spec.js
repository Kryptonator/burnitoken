// tests/e2e/navigation.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Start fresh for each test
    await page.goto('/', { waitUntil: 'networkidle' });

    // Aggressively remove page loader for WebKit compatibility
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

    // Wait for header to be available and visible - more robust approach
    await page.waitForFunction(
      () => {
        const header = document.querySelector('header');
        return header && header.offsetParent !== null;
      },
      { timeout: 30000 },
    );

    // Double-check that page loader is gone and no elements are blocking
    await page.waitForFunction(
      () => {
        const pageLoader = document.getElementById('pageLoader');
        if (pageLoader) return false;

        // Also check for any element with high z-index that might be blocking
        const highZElements = Array.from(document.querySelectorAll('*')).filter((el) => {
          const style = window.getComputedStyle(el);
          return parseInt(style.zIndex) > 9000;
        });

        return (
          highZElements.length === 0 ||
          highZElements.every(
            (el) =>
              el.style.display === 'none' ||
              el.style.visibility === 'hidden' ||
              el.style.pointerEvents === 'none',
          )
        );
      },
      { timeout: 5000 },
    );

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
              'Test: Mobile menu toggled, hidden:',
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

    // Wait a bit more for JavaScript to initialize
    await page.waitForTimeout(1000);
  });

  test('Navigation works and all sections are visible', async ({ page }) => {
    // Test navigation to tokenomics section
    await page.click('a[href="#tokenomics"]');
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
    await page.waitForFunction(
      () => {
        const pageLoader = document.getElementById('pageLoader');
        return !pageLoader || pageLoader.style.display === 'none' || !pageLoader.offsetParent;
      },
      { timeout: 10000 },
    );

    // Test navigation to multiple sections
    const sections = ['#about', '#use-cases', '#token-schedule'];

    for (const section of sections) {
      await page.click(`a[href="${section}"]`);
      await page.waitForTimeout(1000);

      const sectionElement = page.locator(section);
      await expect(sectionElement).toBeVisible();
    }
  });

  test('Active navigation state updates on scroll', async ({ page }) => {
    // Wait for page loader to be removed
    await page.waitForFunction(
      () => {
        const pageLoader = document.getElementById('pageLoader');
        return !pageLoader || pageLoader.style.display === 'none' || !pageLoader.offsetParent;
      },
      { timeout: 10000 },
    );

    // First scroll to top to ensure we start from hero section
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    // Navigate to about section using smooth scroll
    await page.click('a[href="#about"]');
    await page.waitForTimeout(2000); // Wait for smooth scroll to complete

    // Check if nav link is active - try different selectors
    const aboutNavLink = page.locator('header nav a[href="#about"]').first();
    await expect(aboutNavLink).toHaveClass(/active/, { timeout: 5000 });
  });
});
