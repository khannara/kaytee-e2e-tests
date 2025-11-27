import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../../shared/page-objects/BasePage.js';

/**
 * Page object for the KayTee Tropical Dashboard main dashboard.
 *
 * URL: https://kayteetropical.com/dashboard
 */
export class TropicalDashboardPage extends BasePage {
  // Sidebar Navigation
  readonly sidebar: Locator;
  readonly dashboardLink: Locator;
  readonly transactionsLink: Locator;
  readonly vendorsLink: Locator;
  readonly employeesLink: Locator;
  readonly productsLink: Locator;
  readonly reportsLink: Locator;
  readonly settingsLink: Locator;

  // Header
  readonly header: Locator;
  readonly userMenu: Locator;
  readonly logoutButton: Locator;

  // Dashboard content
  readonly pageTitle: Locator;
  readonly mainContent: Locator;

  constructor(page: Page) {
    super(page);

    // Sidebar - using flexible selectors
    this.sidebar = page.locator('aside, nav[role="navigation"], [data-testid="sidebar"]');
    this.dashboardLink = page.locator('a[href="/"], a[href="/dashboard"], a:has-text("Dashboard")').first();
    this.transactionsLink = page.locator('a[href*="transactions"], a:has-text("Transactions")');
    this.vendorsLink = page.locator('a[href*="vendors"], a:has-text("Vendors")');
    this.employeesLink = page.locator('a[href*="employees"], a:has-text("Employees")');
    this.productsLink = page.locator('a[href*="products"], a:has-text("Products")');
    this.reportsLink = page.locator('a[href*="reports"], a:has-text("Reports")');
    this.settingsLink = page.locator('a[href*="settings"], a:has-text("Settings")');

    // Header
    this.header = page.locator('header');
    this.userMenu = page.locator('[data-testid="user-menu"], button:has-text("Account"), [aria-label="User menu"]');
    this.logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign out"), a:has-text("Logout")');

    // Content
    this.pageTitle = page.locator('h1, h2').first();
    this.mainContent = page.locator('main, [role="main"], .main-content');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.waitForLoad();
  }

  async waitForLoad(): Promise<void> {
    // Wait for sidebar or main content to be visible
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.mainContent.or(this.sidebar)).toBeVisible({ timeout: 15000 });
  }

  // Navigation methods
  async navigateToTransactions(): Promise<void> {
    await this.transactionsLink.click();
    await this.page.waitForURL('**/transactions**');
  }

  async navigateToVendors(): Promise<void> {
    await this.vendorsLink.click();
    await this.page.waitForURL('**/vendors**');
  }

  async navigateToEmployees(): Promise<void> {
    await this.employeesLink.click();
    await this.page.waitForURL('**/employees**');
  }

  async navigateToProducts(): Promise<void> {
    await this.productsLink.click();
    await this.page.waitForURL('**/products**');
  }

  async navigateToReports(): Promise<void> {
    await this.reportsLink.click();
    await this.page.waitForURL('**/reports**');
  }

  async navigateToSettings(): Promise<void> {
    await this.settingsLink.click();
    await this.page.waitForURL('**/settings**');
  }

  async logout(): Promise<void> {
    // Try clicking user menu first if visible
    const userMenuVisible = await this.userMenu.isVisible().catch(() => false);
    if (userMenuVisible) {
      await this.userMenu.click();
      await this.page.waitForTimeout(300);
    }
    await this.logoutButton.click();
    await this.page.waitForURL('**/login**');
  }

  async getPageTitleText(): Promise<string> {
    return (await this.pageTitle.textContent()) || '';
  }
}
