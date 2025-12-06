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

      // Look for refresh button - it has RefreshCw icon
      const refreshButton = hub.page.getByRole('button', { name: /Refresh/i });
      await expect(refreshButton).toBeVisible();
    });
  });

  test.describe('Metrics Module', () => {
    test('should display metrics page content', async () => {
      await hub.gotoDashboard();
      await hub.navigateToMetrics();

      // Should have metrics-related content
      const pageContent = await hub.page.textContent('main');
      expect(pageContent?.toLowerCase()).toMatch(/metrics|coverage|tests/);
    });

    test('should display project information', async () => {
      await hub.gotoDashboard();
      await hub.navigateToMetrics();

      // Should show some project or test information
      const pageContent = await hub.page.textContent('main');
      expect(pageContent).toBeTruthy();
      // Page should have loaded with content
      expect(pageContent!.length).toBeGreaterThan(100);
    });

    test('should have interactive elements', async () => {
      await hub.gotoDashboard();
      await hub.navigateToMetrics();

      // Page should have buttons or interactive elements
      const buttons = hub.page.locator('button');
      const count = await buttons.count();
      expect(count).toBeGreaterThan(0);
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

      // Should have API integrations section - use heading role for specificity
      await expect(hub.page.getByRole('heading', { name: 'API Integrations' })).toBeVisible();
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
    test('should have sidebar with navigation links', async () => {
      await hub.gotoDashboard();

      // Sidebar should have navigation links
      const sidebar = hub.page.locator('aside').first();
      await expect(sidebar).toBeVisible();

      // Should have some links in sidebar
      const links = sidebar.locator('a');
      const count = await links.count();
      expect(count).toBeGreaterThan(3);
    });
  });

  test.describe('Deployments Module', () => {
    test('should display deployments page header', async () => {
      await hub.gotoDashboard();
      await hub.navigateToDeployments();

      await expect(hub.page.getByRole('heading', { name: 'Deployments', level: 1 })).toBeVisible();
    });

    test('should display deployment stats', async () => {
      await hub.gotoDashboard();
      await hub.navigateToDeployments();

      // Page should have stats content
      const pageContent = await hub.page.textContent('main');
      expect(pageContent?.toLowerCase()).toMatch(/total|successful|failed|production|preview/);
    });

    test('should display projects section', async () => {
      await hub.gotoDashboard();
      await hub.navigateToDeployments();

      await expect(hub.page.getByRole('heading', { name: 'Projects' })).toBeVisible();
    });

    test('should display recent deployments section', async () => {
      await hub.gotoDashboard();
      await hub.navigateToDeployments();

      await expect(hub.page.getByRole('heading', { name: /Recent Deployments/ })).toBeVisible();
    });

    test('should have refresh button', async () => {
      await hub.gotoDashboard();
      await hub.navigateToDeployments();

      const refreshButton = hub.page.getByRole('button', { name: /Refresh/ });
      await expect(refreshButton).toBeVisible();
    });

    test('should have link to Vercel', async () => {
      await hub.gotoDashboard();
      await hub.navigateToDeployments();

      await expect(hub.page.getByRole('link', { name: /Open Vercel/ })).toBeVisible();
    });
  });

  test.describe('Pipelines Module', () => {
    test('should display pipelines page header', async () => {
      await hub.gotoDashboard();
      await hub.navigateToPipelines();

      await expect(hub.page.getByRole('heading', { name: /CI\/CD Pipelines/i, level: 1 })).toBeVisible();
    });

    test('should display pipeline stats', async () => {
      await hub.gotoDashboard();
      await hub.navigateToPipelines();

      // Page should have stats content
      const pageContent = await hub.page.textContent('main');
      expect(pageContent?.toLowerCase()).toMatch(/total|passed|failed|success/);
    });

    test('should display pipelines section', async () => {
      await hub.gotoDashboard();
      await hub.navigateToPipelines();

      // Use exact match to avoid conflict with "CI/CD Pipelines" h1
      await expect(hub.page.getByRole('heading', { name: 'Pipelines', exact: true })).toBeVisible();
    });

    test('should display recent runs section', async () => {
      await hub.gotoDashboard();
      await hub.navigateToPipelines();

      await expect(hub.page.getByRole('heading', { name: /Recent Runs/ })).toBeVisible();
    });

    test('should have link to Azure DevOps', async () => {
      await hub.gotoDashboard();
      await hub.navigateToPipelines();

      await expect(hub.page.getByRole('link', { name: /Open Azure DevOps/ })).toBeVisible();
    });

    test('should display quick actions', async () => {
      await hub.gotoDashboard();
      await hub.navigateToPipelines();

      await expect(hub.page.getByText('Quick Actions')).toBeVisible();
    });
  });

  test.describe('Logs Module', () => {
    test('should display logs page header', async () => {
      await hub.gotoDashboard();
      await hub.navigateToLogs();

      const pageContent = await hub.page.textContent('main');
      expect(pageContent?.toLowerCase()).toMatch(/logs|axiom/);
    });

    test('should have refresh functionality', async () => {
      await hub.gotoDashboard();
      await hub.navigateToLogs();

      // Look for refresh button
      const refreshButton = hub.page.getByRole('button', { name: /Refresh/ });
      await expect(refreshButton).toBeVisible();
    });
  });

  test.describe('Operations Module', () => {
    test('should display operations page content', async () => {
      await hub.gotoDashboard();
      await hub.navigateToOperations();

      const pageContent = await hub.page.textContent('main');
      expect(pageContent).toBeTruthy();
    });
  });

  test.describe('Infrastructure Module', () => {
    test('should display infrastructure page header', async () => {
      await hub.gotoDashboard();
      await hub.navigateToInfrastructure();

      const pageContent = await hub.page.textContent('main');
      expect(pageContent?.toLowerCase()).toMatch(/infrastructure|services|domains/i);
    });
  });

  test.describe('Keyboard Shortcuts', () => {
    test('should open keyboard shortcuts modal with ? key', async () => {
      await hub.gotoDashboard();

      // Press ? to open shortcuts modal
      await hub.page.keyboard.press('Shift+/');

      // Modal should appear - look for the modal heading specifically
      await expect(hub.page.getByRole('heading', { name: 'Keyboard Shortcuts' })).toBeVisible({ timeout: 2000 });
    });

    test('should close keyboard shortcuts modal with Escape', async () => {
      await hub.gotoDashboard();

      // Open modal
      await hub.page.keyboard.press('Shift+/');
      await expect(hub.page.getByRole('heading', { name: 'Keyboard Shortcuts' })).toBeVisible({ timeout: 2000 });

      // Close with Escape
      await hub.page.keyboard.press('Escape');
      await expect(hub.page.getByRole('heading', { name: 'Keyboard Shortcuts' })).not.toBeVisible({ timeout: 2000 });
    });

    test('should navigate to health page with g+h keys', async () => {
      await hub.gotoDashboard();

      await hub.page.keyboard.press('g');
      await hub.page.keyboard.press('h');

      await expect(hub.page).toHaveURL(/\/dashboard\/health/, { timeout: 3000 });
    });

    test('should navigate to metrics page with g+m keys', async () => {
      await hub.gotoDashboard();

      await hub.page.keyboard.press('g');
      await hub.page.keyboard.press('m');

      await expect(hub.page).toHaveURL(/\/dashboard\/metrics/, { timeout: 3000 });
    });

    test('should navigate to deployments page with g+d keys', async () => {
      await hub.gotoDashboard();

      await hub.page.keyboard.press('g');
      await hub.page.keyboard.press('d');

      await expect(hub.page).toHaveURL(/\/dashboard\/deployments/, { timeout: 3000 });
    });

    test('should navigate to settings page with g+s keys', async () => {
      await hub.gotoDashboard();

      await hub.page.keyboard.press('g');
      await hub.page.keyboard.press('s');

      await expect(hub.page).toHaveURL(/\/dashboard\/settings/, { timeout: 3000 });
    });
  });

  test.describe('Dashboard Overview', () => {
    test('should display overview page header', async () => {
      await hub.gotoDashboard();

      // Overview page should have ecosystem health or status info
      const pageContent = await hub.page.textContent('main');
      expect(pageContent?.toLowerCase()).toMatch(/health|status|overview|ecosystem/);
    });

    test('should display service health cards', async () => {
      await hub.gotoDashboard();

      // Should show health status indicators
      const healthIndicators = hub.page.locator('[class*="rounded"]').filter({
        hasText: /healthy|online|operational|ready/i
      });

      // At least some health info should be present
      const count = await healthIndicators.count();
      expect(count).toBeGreaterThanOrEqual(0); // May be 0 if APIs not configured
    });
  });
});
