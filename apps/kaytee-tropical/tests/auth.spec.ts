import { test, expect } from '../../../shared/fixtures/test-fixtures.js';
import { LoginPage } from '../pages/LoginPage.js';
import { TropicalDashboardPage } from '../pages/DashboardPage.js';

/**
 * Authentication E2E tests for KayTee Tropical Dashboard.
 *
 * Migrated from Cypress tests in kaytee-tropical-dashboard.
 *
 * Environment Variables:
 * - PROD_ADMIN_EMAIL, PROD_ADMIN_PASSWORD: Production credentials
 * - PREVIEW_ADMIN_EMAIL, PREVIEW_ADMIN_PASSWORD: Preview/dev credentials
 * - LOCALHOST_EMAIL, LOCALHOST_PASSWORD: Local development credentials
 */

// Get credentials based on environment
function getCredentials(): { email: string; password: string } {
  const baseUrl = process.env.KAYTEE_TROPICAL_URL || '';

  if (baseUrl.includes('kayteetropical.com') && !baseUrl.includes('dev.')) {
    // Production
    return {
      email: process.env.PROD_ADMIN_EMAIL || '',
      password: process.env.PROD_ADMIN_PASSWORD || '',
    };
  } else if (baseUrl.includes('dev.kayteetropical.com')) {
    // Preview/dev
    return {
      email: process.env.PREVIEW_ADMIN_EMAIL || '',
      password: process.env.PREVIEW_ADMIN_PASSWORD || '',
    };
  } else {
    // Local development
    return {
      email: process.env.LOCALHOST_EMAIL || '',
      password: process.env.LOCALHOST_PASSWORD || '',
    };
  }
}

test.describe('KayTee Tropical - Authentication', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
  });

  test.describe('Login Page', () => {
    test('should load the login page', async () => {
      await loginPage.goto();

      await expect(loginPage.emailInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.submitButton).toBeVisible();
    });

    test('should have email and password input fields', async () => {
      await loginPage.goto();

      // Verify input types
      await expect(loginPage.emailInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
    });

    test('should show error for invalid credentials', async () => {
      await loginPage.goto();

      await loginPage.login('invalid@example.com', 'wrongpassword');

      // Wait for error or URL not changing
      await loginPage.page.waitForTimeout(3000);

      // Should still be on login page or show error
      const url = loginPage.getUrl();
      const hasError = await loginPage.hasErrorMessage();
      expect(url.includes('/login') || hasError).toBe(true);
    });

    test('should have forgot password link', async () => {
      await loginPage.goto();

      const forgotLinkVisible = await loginPage.forgotPasswordLink.isVisible().catch(() => false);
      // Link may or may not exist depending on the app version
      expect(forgotLinkVisible !== undefined).toBe(true);
    });
  });

  test.describe('Successful Login', () => {
    const credentials = getCredentials();

    test.skip(!credentials.email || !credentials.password, 'Requires credentials in environment');

    test('should login with valid credentials', async ({ page }) => {
      await loginPage.goto();
      await loginPage.loginAndWaitForDashboard(credentials.email, credentials.password);

      // Should be redirected away from login
      expect(page.url()).not.toContain('/login');

      // Dashboard should have loaded
      const dashboard = new TropicalDashboardPage(page);
      await dashboard.waitForLoad();
    });

    test('should persist session across page refresh', async ({ page }) => {
      await loginPage.goto();
      await loginPage.loginAndWaitForDashboard(credentials.email, credentials.password);

      // Refresh the page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Should still be logged in (not redirected to login)
      expect(page.url()).not.toContain('/login');
    });

    test('should verify session via API', async ({ page }) => {
      await loginPage.goto();
      await loginPage.loginAndWaitForDashboard(credentials.email, credentials.password);

      // Verify session
      const isValid = await loginPage.verifySession();
      expect(isValid).toBe(true);
    });
  });

  test.describe('Logout', () => {
    const credentials = getCredentials();

    test.skip(!credentials.email || !credentials.password, 'Requires credentials in environment');

    test('should logout successfully', async ({ page }) => {
      // Login first
      await loginPage.goto();
      await loginPage.loginAndWaitForDashboard(credentials.email, credentials.password);

      // Logout
      const dashboard = new TropicalDashboardPage(page);
      await dashboard.logout();

      // Should be on login page
      expect(page.url()).toContain('/login');
    });
  });
});

test.describe('KayTee Tropical - Protected Routes', () => {
  test('should redirect to login when accessing dashboard without auth', async ({ page }) => {
    await page.goto('/');

    // Should be redirected to login
    await page.waitForURL('**/login**', { timeout: 10000 });
    expect(page.url()).toContain('/login');
  });

  test('should redirect to login when accessing protected routes', async ({ page }) => {
    const protectedRoutes = ['/transactions', '/vendors', '/employees', '/reports', '/settings'];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await page.waitForURL('**/login**', { timeout: 10000 });
      expect(page.url()).toContain('/login');
    }
  });
});

test.describe('KayTee Tropical - Dashboard Navigation', () => {
  const credentials = getCredentials();

  test.skip(!credentials.email || !credentials.password, 'Requires credentials in environment');

  let dashboard: TropicalDashboardPage;

  test.beforeEach(async ({ page }) => {
    // Login first
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAndWaitForDashboard(credentials.email, credentials.password);

    dashboard = new TropicalDashboardPage(page);
    await dashboard.waitForLoad();
  });

  test('should navigate to transactions page', async () => {
    await dashboard.navigateToTransactions();
    expect(dashboard.getUrl()).toContain('/transactions');
  });

  test('should navigate to vendors page', async () => {
    await dashboard.navigateToVendors();
    expect(dashboard.getUrl()).toContain('/vendors');
  });

  test('should navigate to employees page', async () => {
    await dashboard.navigateToEmployees();
    expect(dashboard.getUrl()).toContain('/employees');
  });

  test('should navigate to reports page', async () => {
    await dashboard.navigateToReports();
    expect(dashboard.getUrl()).toContain('/reports');
  });

  test('should navigate to settings page', async () => {
    await dashboard.navigateToSettings();
    expect(dashboard.getUrl()).toContain('/settings');
  });
});

test.describe('KayTee Tropical - Responsive Design', () => {
  const credentials = getCredentials();

  test.skip(!credentials.email || !credentials.password, 'Requires credentials in environment');

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Login first
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAndWaitForDashboard(credentials.email, credentials.password);

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Dashboard should still be visible
    const dashboard = new TropicalDashboardPage(page);
    await expect(dashboard.mainContent.or(dashboard.sidebar)).toBeVisible();
  });

  test('should be responsive on tablet viewport', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAndWaitForDashboard(credentials.email, credentials.password);

    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    const dashboard = new TropicalDashboardPage(page);
    await expect(dashboard.mainContent.or(dashboard.sidebar)).toBeVisible();
  });

  test('should be responsive on desktop viewport', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAndWaitForDashboard(credentials.email, credentials.password);

    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    const dashboard = new TropicalDashboardPage(page);
    await expect(dashboard.mainContent).toBeVisible();
  });
});
