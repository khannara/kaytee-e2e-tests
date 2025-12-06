import { test, expect } from '../../../shared/fixtures/test-fixtures.js';
import { HubPage } from '../pages/HubPage.js';

/**
 * E2E tests for KayTee Tropical Hub (Operations Control Plane).
 *
 * URL: https://hub.khannara.dev
 *
 * Hub provides centralized operations monitoring for the KayTee ecosystem:
 * - Health monitoring for all services
 * - Metrics aggregation from kaytee-metrics-api
 * - Deployment status from Vercel
 * - Pipeline status from Azure DevOps
 * - Log aggregation from Axiom
 */

test.describe('KayTee Hub - Operations Control Plane', () => {
  let hub: HubPage;

  test.beforeEach(async ({ page }) => {
    hub = new HubPage(page);
  });

  test.describe('Landing Page', () => {
    test('should redirect to dashboard', async () => {
      await hub.goto();

      // Root should redirect to dashboard or show landing page
      await expect(hub.page).toHaveURL(/\/(dashboard)?$/);
    });

    test('should load without errors', async () => {
      await hub.gotoDashboard();

      // Page should have loaded successfully
      const pageTitle = await hub.getPageTitleText();
      expect(pageTitle).toBeTruthy();
    });

    test('should have correct page title', async () => {
      await hub.gotoDashboard();

      const title = await hub.getTitle();
      expect(title.toLowerCase()).toMatch(/hub|kaytee|operations/);
    });
  });

  test.describe('Navigation', () => {
    test('should have sidebar navigation on desktop', async () => {
      await hub.gotoDashboard();

      await expect(hub.sidebar).toBeVisible();
    });

    test('should navigate to health page', async () => {
      await hub.gotoDashboard();

      await hub.navigateToHealth();
      await expect(hub.page).toHaveURL(/\/dashboard\/health/);

      const title = await hub.getPageTitleText();
      expect(title.toLowerCase()).toContain('health');
    });

    test('should navigate to metrics page', async () => {
      await hub.gotoDashboard();

      await hub.navigateToMetrics();
      await expect(hub.page).toHaveURL(/\/dashboard\/metrics/);

      const title = await hub.getPageTitleText();
      expect(title.toLowerCase()).toContain('metrics');
    });

    test('should navigate to operations page', async () => {
      await hub.gotoDashboard();

      await hub.navigateToOperations();
      await expect(hub.page).toHaveURL(/\/dashboard\/operations/);
    });

    test('should navigate to logs page', async () => {
      await hub.gotoDashboard();

      await hub.navigateToLogs();
      await expect(hub.page).toHaveURL(/\/dashboard\/logs/);
    });

    test('should navigate to deployments page', async () => {
      await hub.gotoDashboard();

      await hub.navigateToDeployments();
      await expect(hub.page).toHaveURL(/\/dashboard\/deployments/);
    });

    test('should navigate to pipelines page', async () => {
      await hub.gotoDashboard();

      await hub.navigateToPipelines();
      await expect(hub.page).toHaveURL(/\/dashboard\/pipelines/);
    });

    test('should navigate to settings page', async () => {
      await hub.gotoDashboard();

      await hub.navigateToSettings();
      await expect(hub.page).toHaveURL(/\/dashboard\/settings/);

      const title = await hub.getPageTitleText();
      expect(title.toLowerCase()).toContain('settings');
    });

    test('should navigate to infrastructure page', async () => {
      await hub.gotoDashboard();

      await hub.navigateToInfrastructure();
      await expect(hub.page).toHaveURL(/\/dashboard\/infrastructure/);
    });
  });

  test.describe('Health Module', () => {
    test('should display health page content', async () => {
      await hub.gotoDashboard();
      await hub.navigateToHealth();

      // Should have health-related content
      const pageContent = await hub.page.textContent('main');
      expect(pageContent).toBeTruthy();
    });

    test('should have refresh functionality', async () => {
      await hub.gotoDashboard();
      await hub.navigateToHealth();

      // Look for refresh button
      const refreshButton = hub.page.locator('button').filter({ has: hub.page.locator('svg') }).first();
      await expect(refreshButton).toBeVisible();
    });
  });

  test.describe('Metrics Module', () => {
    test('should display unit test coverage section', async () => {
      await hub.gotoDashboard();
      await hub.navigateToMetrics();

      // Should show unit test coverage
      await expect(hub.page.getByText('Unit Test Coverage')).toBeVisible();
    });

    test('should display ecosystem project stats', async () => {
      await hub.gotoDashboard();
      await hub.navigateToMetrics();

      // Should show project cards (KTD, QMD, next-rbac)
      await expect(hub.page.getByText('KTD')).toBeVisible();
      await expect(hub.page.getByText('QMD')).toBeVisible();
      await expect(hub.page.getByText('next-rbac')).toBeVisible();
    });

    test('should display NPM package info', async () => {
      await hub.gotoDashboard();
      await hub.navigateToMetrics();

      // Should show NPM package section
      await expect(hub.page.getByText('@khannara/next-rbac')).toBeVisible();
    });
  });

  test.describe('Settings Module', () => {
    test('should display notification settings', async () => {
      await hub.gotoDashboard();
      await hub.navigateToSettings();

      // Should have notification section
      await expect(hub.page.getByText('Notifications')).toBeVisible();
      await expect(hub.page.getByText('Health Alerts')).toBeVisible();
    });

    test('should display dashboard preferences', async () => {
      await hub.gotoDashboard();
      await hub.navigateToSettings();

      // Should have dashboard preferences section
      await expect(hub.page.getByText('Dashboard Preferences')).toBeVisible();
      await expect(hub.page.getByText('Auto Refresh')).toBeVisible();
    });

    test('should display API integrations status', async () => {
      await hub.gotoDashboard();
      await hub.navigateToSettings();

      // Should have API integrations section
      await expect(hub.page.getByText('API Integrations')).toBeVisible();
      await expect(hub.page.getByText('Vercel')).toBeVisible();
    });

    test('should toggle notification settings', async () => {
      await hub.gotoDashboard();
      await hub.navigateToSettings();

      // Find and click a toggle
      const toggles = hub.page.locator('button').filter({ has: hub.page.locator('span.inline-block') });
      const firstToggle = toggles.first();

      if (await firstToggle.isVisible()) {
        await firstToggle.click();
        // Toggle should have changed state
        await expect(firstToggle).toBeVisible();
      }
    });
  });

  test.describe('Theme System', () => {
    test('should display theme options in sidebar', async () => {
      await hub.gotoDashboard();

      // Look for theme-related elements in sidebar
      const sidebar = hub.sidebar;
      await expect(sidebar).toBeVisible();
    });
  });

  test.describe('Performance @performance', () => {
    test('should load dashboard within acceptable time', async () => {
      const startTime = Date.now();

      await hub.gotoDashboard();

      const loadTime = Date.now() - startTime;

      // Hub should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    test('should navigate between pages quickly', async () => {
      await hub.gotoDashboard();

      const startTime = Date.now();
      await hub.navigateToMetrics();
      const navTime = Date.now() - startTime;

      // Navigation should be under 2 seconds
      expect(navTime).toBeLessThan(2000);
    });
  });

  test.describe('Mobile Responsiveness @mobile', () => {
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

    test('should show mobile menu button', async () => {
      await hub.gotoDashboard();

      // Mobile menu button should be visible
      await expect(hub.mobileMenuButton).toBeVisible();
    });

    test('should hide desktop sidebar on mobile', async () => {
      await hub.gotoDashboard();

      // Desktop sidebar should be hidden
      const desktopSidebar = hub.page.locator('aside.hidden.lg\\:flex');
      // On mobile, the sidebar with lg:flex should not be visible
      await expect(desktopSidebar).not.toBeVisible();
    });

    test('should open mobile menu when button clicked', async () => {
      await hub.gotoDashboard();

      // Click mobile menu
      await hub.openMobileMenu();

      // Mobile sidebar should be visible
      const mobileSidebar = hub.page.locator('aside.lg\\:hidden');
      await expect(mobileSidebar).toBeVisible();
    });
  });

  test.describe('External Links', () => {
    test('should have ecosystem links in sidebar', async () => {
      await hub.gotoDashboard();

      // Check for ecosystem link section
      await expect(hub.page.getByText('Ecosystem')).toBeVisible();

      // Check for external links
      await expect(hub.page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
      await expect(hub.page.getByRole('link', { name: 'QA Metrics' })).toBeVisible();
      await expect(hub.page.getByRole('link', { name: 'Portfolio' })).toBeVisible();
    });
  });
});
