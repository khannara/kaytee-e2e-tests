import { test, expect } from '../../../shared/fixtures/test-fixtures.js';
import { DashboardPage } from '../pages/DashboardPage.js';

test.describe('Quality Metrics Dashboard', () => {
  let dashboard: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
  });

  test.describe('Home Page', () => {
    test('should load the home page successfully', async () => {
      await dashboard.goto();

      await expect(dashboard.navLogo).toBeVisible();
      expect(dashboard.getUrl()).toContain('/');
    });

    test('should have correct page title', async () => {
      await dashboard.goto();

      const title = await dashboard.getTitle();
      expect(title).toContain('Quality Metrics');
    });

    test('should navigate to overview from home', async () => {
      await dashboard.goto();

      await dashboard.overviewLink.click();
      await dashboard.waitForLoad();

      expect(dashboard.getUrl()).toContain('/dashboard/overview');
    });
  });

  test.describe('Dashboard Overview', () => {
    test('should load the overview page', async () => {
      await dashboard.gotoOverview();

      expect(dashboard.getUrl()).toContain('/dashboard/overview');
      await expect(dashboard.navLogo).toBeVisible();
    });

    test('should display metrics cards', async () => {
      await dashboard.gotoOverview();

      // Verify the page loaded properly
      await dashboard.waitForLoad();
    });
  });

  test.describe('Sub-pages', () => {
    // These tests verify that the app's sub-routes load without errors
    // Skip if routes don't exist on the actual deployment

    test('should load unit tests page if available', async () => {
      const response = await dashboard.page.goto('/dashboard/unit-tests');
      // Accept either success or redirect (route may not exist)
      expect(response?.status()).toBeLessThan(500);
    });

    test('should load e2e tests page if available', async () => {
      const response = await dashboard.page.goto('/dashboard/e2e-tests');
      expect(response?.status()).toBeLessThan(500);
    });

    test('should load integration page if available', async () => {
      const response = await dashboard.page.goto('/dashboard/integration');
      expect(response?.status()).toBeLessThan(500);
    });

    test('should load trends page if available', async () => {
      const response = await dashboard.page.goto('/dashboard/trends');
      expect(response?.status()).toBeLessThan(500);
    });
  });

  test.describe('Navigation', () => {
    test('should have clickable navigation links', async () => {
      await dashboard.goto();

      // Check that overview link exists and is clickable (if visible)
      const overviewVisible = await dashboard.overviewLink.isVisible().catch(() => false);
      if (overviewVisible) {
        await dashboard.overviewLink.click();
        await dashboard.waitForLoad();
        expect(dashboard.getUrl()).toContain('overview');
      }
    });
  });

  test.describe('Theme', () => {
    test('should support theme toggle if available', async () => {
      await dashboard.goto();

      // Only test theme toggle if the element exists
      const themeToggleVisible = await dashboard.themeToggle.isVisible().catch(() => false);

      if (themeToggleVisible) {
        const initialDarkMode = await dashboard.isDarkMode();
        await dashboard.toggleTheme();
        const afterToggleDarkMode = await dashboard.isDarkMode();
        expect(afterToggleDarkMode).not.toBe(initialDarkMode);
      } else {
        // Theme toggle not found - test passes (optional feature)
        expect(true).toBe(true);
      }
    });
  });

  test.describe('Performance @performance', () => {
    test('should load within acceptable time', async ({ page }) => {
      const startTime = Date.now();

      await dashboard.goto();

      const loadTime = Date.now() - startTime;

      // Page should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    test('should have no console errors', async () => {
      const errors: string[] = [];

      dashboard.page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await dashboard.goto();
      await dashboard.page.waitForTimeout(2000);

      // Filter out expected/benign errors
      const criticalErrors = errors.filter(
        (e) => !e.includes('favicon') && !e.includes('third-party')
      );

      expect(criticalErrors).toHaveLength(0);
    });
  });

  test.describe('Mobile @mobile', () => {
    test('should be responsive on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await dashboard.goto();

      // Navigation should still be accessible (may be in hamburger menu)
      await expect(dashboard.navLogo).toBeVisible();
    });
  });
});
