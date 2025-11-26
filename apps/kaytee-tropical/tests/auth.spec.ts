import { test, expect } from '../../../shared/fixtures/test-fixtures.js';
import { LoginPage } from '../pages/LoginPage.js';
import { TropicalDashboardPage } from '../pages/DashboardPage.js';

/**
 * Authentication E2E tests for KayTee Tropical Dashboard.
 *
 * Note: These tests require valid test credentials.
 * Set TEST_USER_EMAIL and TEST_USER_PASSWORD in .env.local
 */

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

    test('should show error for invalid credentials', async () => {
      await loginPage.goto();

      await loginPage.login('invalid@example.com', 'wrongpassword');

      // Wait for and verify error message
      const hasError = await loginPage.hasErrorMessage();
      expect(hasError).toBe(true);
    });

    test('should have forgot password link', async () => {
      await loginPage.goto();

      await expect(loginPage.forgotPasswordLink).toBeVisible();
    });
  });

  test.describe('Successful Login', () => {
    test.skip(
      !process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD,
      'Requires TEST_USER_EMAIL and TEST_USER_PASSWORD environment variables'
    );

    test('should login with valid credentials', async ({ page }) => {
      const email = process.env.TEST_USER_EMAIL!;
      const password = process.env.TEST_USER_PASSWORD!;

      await loginPage.goto();
      await loginPage.loginAndWaitForDashboard(email, password);

      // Should be on dashboard
      expect(page.url()).toContain('/dashboard');

      // Dashboard should have loaded
      const dashboard = new TropicalDashboardPage(page);
      await expect(dashboard.sidebar).toBeVisible();
    });

    test('should persist session across page refresh', async ({ page }) => {
      const email = process.env.TEST_USER_EMAIL!;
      const password = process.env.TEST_USER_PASSWORD!;

      await loginPage.goto();
      await loginPage.loginAndWaitForDashboard(email, password);

      // Refresh the page
      await page.reload();

      // Should still be on dashboard (not redirected to login)
      expect(page.url()).toContain('/dashboard');
    });

    test('should logout successfully', async ({ page }) => {
      const email = process.env.TEST_USER_EMAIL!;
      const password = process.env.TEST_USER_PASSWORD!;

      await loginPage.goto();
      await loginPage.loginAndWaitForDashboard(email, password);

      const dashboard = new TropicalDashboardPage(page);
      await dashboard.logout();

      // Should be on login page
      expect(page.url()).toContain('/auth');
    });
  });
});

test.describe('KayTee Tropical - Dashboard Navigation', () => {
  test.skip(
    !process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD,
    'Requires TEST_USER_EMAIL and TEST_USER_PASSWORD environment variables'
  );

  let dashboard: TropicalDashboardPage;

  test.beforeEach(async ({ page }) => {
    // Login first
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAndWaitForDashboard(
      process.env.TEST_USER_EMAIL!,
      process.env.TEST_USER_PASSWORD!
    );

    dashboard = new TropicalDashboardPage(page);
  });

  test('should navigate to transactions page', async () => {
    await dashboard.navigateToTransactions();

    expect(dashboard.getUrl()).toContain('/transactions');
  });

  test('should navigate to vendors page', async () => {
    await dashboard.navigateToVendors();

    expect(dashboard.getUrl()).toContain('/vendors');
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

test.describe('KayTee Tropical - Unauthenticated Access', () => {
  test('should redirect to login when accessing dashboard without auth', async ({ page }) => {
    await page.goto('/dashboard');

    // Should be redirected to login
    await page.waitForURL('**/auth/**', { timeout: 10000 });
    expect(page.url()).toContain('/auth');
  });

  test('should redirect to login when accessing protected routes', async ({ page }) => {
    const protectedRoutes = ['/dashboard', '/transactions', '/vendors', '/reports', '/settings'];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await page.waitForURL('**/auth/**', { timeout: 10000 });
      expect(page.url()).toContain('/auth');
    }
  });
});
