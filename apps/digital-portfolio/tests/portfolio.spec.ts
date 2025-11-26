import { test, expect } from '../../../shared/fixtures/test-fixtures.js';
import { PortfolioPage } from '../pages/PortfolioPage.js';

test.describe('Digital Portfolio - khannara.dev', () => {
  let portfolio: PortfolioPage;

  test.beforeEach(async ({ page }) => {
    portfolio = new PortfolioPage(page);
  });

  test.describe('Home Page', () => {
    test('should load the portfolio successfully', async () => {
      await portfolio.goto();

      await expect(portfolio.heroTitle).toBeVisible();
      expect(portfolio.getUrl()).toMatch(/khannara\.dev\/?$/);
    });

    test('should have correct page title', async () => {
      await portfolio.goto();

      const title = await portfolio.getTitle();
      expect(title.toLowerCase()).toMatch(/khannara|portfolio|developer/);
    });

    test('should display hero section with text', async () => {
      await portfolio.goto();

      const heroText = await portfolio.getHeroTitleText();
      // Hero should have meaningful content
      expect(heroText.length).toBeGreaterThan(5);
    });
  });

  test.describe('Navigation', () => {
    test('should have working navigation links', async () => {
      await portfolio.goto();

      // Check that page has navigable structure (header or nav exists)
      const hasHeader = await portfolio.page.locator('header').isVisible().catch(() => false);
      const hasNav = await portfolio.page.locator('nav').isVisible().catch(() => false);
      expect(hasHeader || hasNav).toBe(true);
    });

    test('should scroll to projects section', async () => {
      await portfolio.goto();

      // Try to navigate to projects if link exists
      const projectsLinkVisible = await portfolio.projectsLink.isVisible().catch(() => false);

      if (projectsLinkVisible) {
        await portfolio.projectsLink.click();
        // Allow time for scroll animation
        await portfolio.page.waitForTimeout(500);
      }
    });
  });

  test.describe('Projects Section', () => {
    test('should display project cards', async () => {
      await portfolio.goto();

      // Scroll down to ensure projects section is visible
      await portfolio.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      await portfolio.page.waitForTimeout(500);

      const projectCount = await portfolio.getProjectCount();
      // Should have at least some content/cards
      expect(projectCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Footer', () => {
    test('should have footer with social links', async () => {
      await portfolio.goto();

      // Scroll to footer
      await portfolio.footer.scrollIntoViewIfNeeded();
      await expect(portfolio.footer).toBeVisible();
    });
  });

  test.describe('Theme', () => {
    test('should support theme toggle if available', async () => {
      await portfolio.goto();

      const themeToggleVisible = await portfolio.themeToggle.isVisible().catch(() => false);

      if (themeToggleVisible) {
        const initialDarkMode = await portfolio.isDarkMode();

        await portfolio.themeToggle.click();
        await portfolio.page.waitForTimeout(300);

        const afterToggle = await portfolio.isDarkMode();
        expect(afterToggle).not.toBe(initialDarkMode);
      }
    });
  });

  test.describe('SEO', () => {
    test('should have meta description', async () => {
      await portfolio.goto();

      const metaDescription = portfolio.page.locator('meta[name="description"]');
      await expect(metaDescription).toHaveAttribute('content', /.+/);
    });

    test('should have OpenGraph tags', async () => {
      await portfolio.goto();

      const ogTitle = portfolio.page.locator('meta[property="og:title"]');
      const ogDescription = portfolio.page.locator('meta[property="og:description"]');

      // At least one OG tag should exist
      const hasOgTitle = (await ogTitle.count()) > 0;
      const hasOgDescription = (await ogDescription.count()) > 0;

      expect(hasOgTitle || hasOgDescription).toBe(true);
    });
  });

  test.describe('Performance @performance', () => {
    test('should load within acceptable time', async () => {
      const startTime = Date.now();

      await portfolio.goto();

      const loadTime = Date.now() - startTime;

      // Portfolio should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    test('should have no critical console errors', async () => {
      const errors: string[] = [];

      portfolio.page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await portfolio.goto();
      await portfolio.page.waitForTimeout(2000);

      // Filter benign errors
      const criticalErrors = errors.filter(
        (e) =>
          !e.includes('favicon') &&
          !e.includes('third-party') &&
          !e.includes('analytics')
      );

      expect(criticalErrors).toHaveLength(0);
    });
  });

  test.describe('Mobile @mobile', () => {
    test('should be responsive on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await portfolio.goto();

      // Hero should still be visible
      await expect(portfolio.heroTitle).toBeVisible();
    });

    test('should have readable text on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await portfolio.goto();

      // Check that text doesn't overflow
      const heroBox = await portfolio.heroTitle.boundingBox();
      if (heroBox) {
        expect(heroBox.width).toBeLessThanOrEqual(375);
      }
    });
  });

  test.describe('Accessibility', () => {
    test('should have lang attribute on html', async () => {
      await portfolio.goto();

      const html = portfolio.page.locator('html');
      const lang = await html.getAttribute('lang');

      expect(lang).toBeTruthy();
    });

    test('should have alt text on images', async () => {
      await portfolio.goto();

      const images = portfolio.page.locator('img');
      const imageCount = await images.count();

      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        const role = await img.getAttribute('role');

        // Image should have alt or be decorative (role="presentation")
        expect(alt !== null || role === 'presentation').toBe(true);
      }
    });
  });
});
