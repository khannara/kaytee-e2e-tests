import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../../shared/page-objects/BasePage.js';

/**
 * Page object for the KayTee Tropical Dashboard login page.
 *
 * URL: https://kayteetropical.com/auth/signin
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

  // Logo
  readonly logo: Locator;

  constructor(page: Page) {
    super(page);

    // Form
    this.emailInput = page.locator('input[name="email"], input[type="email"]');
    this.passwordInput = page.locator('input[name="password"], input[type="password"]');
    this.submitButton = page.locator('button[type="submit"]');

    // Error
    this.errorMessage = page.locator('[data-testid="error-message"], .error, [role="alert"]');

    // Links
    this.forgotPasswordLink = page.locator('a[href*="forgot"], a:has-text("Forgot")');
    this.registerLink = page.locator('a[href*="register"], a:has-text("Register")');

    // Logo
    this.logo = page.locator('img[alt*="logo"], [data-testid="logo"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/auth/signin');
    await this.waitForLoad();
  }

  async waitForLoad(): Promise<void> {
    await expect(this.emailInput).toBeVisible({ timeout: 10000 });
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async loginAndWaitForDashboard(email: string, password: string): Promise<void> {
    await this.login(email, password);
    // Wait for redirect to dashboard
    await this.page.waitForURL('**/dashboard/**', { timeout: 15000 });
  }

  async getErrorMessage(): Promise<string> {
    await expect(this.errorMessage).toBeVisible({ timeout: 5000 });
    return (await this.errorMessage.textContent()) || '';
  }

  async hasErrorMessage(): Promise<boolean> {
    return this.errorMessage.isVisible();
  }

  async clickForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
  }

  async clickRegister(): Promise<void> {
    await this.registerLink.click();
  }
}
