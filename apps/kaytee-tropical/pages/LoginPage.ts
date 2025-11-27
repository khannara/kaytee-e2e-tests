import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../../shared/page-objects/BasePage.js';

/**
 * Page object for the KayTee Tropical Dashboard login page.
 *
 * Supports multiple environments:
 * - Production: https://kayteetropical.com
 * - Preview: https://dev.kayteetropical.com
 * - Local: http://localhost:3000
 */
export class LoginPage extends BasePage {
  // Form elements
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  // Error messages
  readonly errorMessage: Locator;

  // Links
  readonly forgotPasswordLink: Locator;
  readonly registerLink: Locator;

  // Page elements
  readonly pageTitle: Locator;

  constructor(page: Page) {
    super(page);

    // Form - matching Cypress selectors
    this.emailInput = page.locator('input#email, input[name="email"], input[type="email"]');
    this.passwordInput = page.locator('input#password, input[name="password"], input[type="password"]');
    this.submitButton = page.locator('button[type="submit"]');

    // Error
    this.errorMessage = page.locator('[data-testid="error-message"], .error, [role="alert"], .text-red-500');

    // Links
    this.forgotPasswordLink = page.locator('a[href*="forgot"], a:has-text("Forgot")');
    this.registerLink = page.locator('a[href*="register"], a:has-text("Register"), a:has-text("Sign up")');

    // Page
    this.pageTitle = page.locator('h1, h2').first();
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
    await this.waitForLoad();
  }

  async waitForLoad(): Promise<void> {
    await expect(this.emailInput).toBeVisible({ timeout: 15000 });
  }

  /**
   * Fill in login credentials
   */
  async fillCredentials(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  /**
   * Submit the login form
   */
  async submit(): Promise<void> {
    // Close any overlays/cookie banners that might block the button
    await this.dismissOverlays();
    await this.submitButton.click({ force: true });
  }

  /**
   * Dismiss any cookie banners or overlays that might block interactions
   */
  async dismissOverlays(): Promise<void> {
    // Try to close common overlay patterns
    const overlayCloseButtons = [
      this.page.locator('button:has-text("Accept")'),
      this.page.locator('button:has-text("Close")'),
      this.page.locator('button:has-text("Got it")'),
      this.page.locator('[aria-label="Close"]'),
      this.page.locator('.cookie-banner button'),
    ];

    for (const button of overlayCloseButtons) {
      const isVisible = await button.isVisible().catch(() => false);
      if (isVisible) {
        await button.click().catch(() => {});
        await this.page.waitForTimeout(300);
      }
    }
  }

  /**
   * Perform full login flow
   */
  async login(email: string, password: string): Promise<void> {
    await this.fillCredentials(email, password);
    await this.submit();
  }

  /**
   * Login and wait for successful redirect to dashboard
   */
  async loginAndWaitForDashboard(email: string, password: string): Promise<void> {
    await this.login(email, password);
    // Wait for redirect away from login page
    await this.page.waitForURL((url) => !url.pathname.includes('/login'), {
      timeout: 20000,
    });
  }

  /**
   * Get error message text if visible
   */
  async getErrorMessage(): Promise<string | null> {
    try {
      await expect(this.errorMessage).toBeVisible({ timeout: 5000 });
      return await this.errorMessage.textContent();
    } catch {
      return null;
    }
  }

  /**
   * Check if error message is displayed
   */
  async hasErrorMessage(): Promise<boolean> {
    return this.errorMessage.isVisible();
  }

  /**
   * Navigate to forgot password page
   */
  async clickForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
  }

  /**
   * Navigate to registration page
   */
  async clickRegister(): Promise<void> {
    await this.registerLink.click();
  }

  /**
   * Verify session is valid by checking API
   */
  async verifySession(): Promise<boolean> {
    const response = await this.page.request.get('/api/auth/session');
    if (response.ok()) {
      const body = await response.json();
      return !!body.user;
    }
    return false;
  }
}
