import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../../shared/page-objects/BasePage.js';

/**
 * Page object for the Digital Portfolio.
 *
 * URL: https://khannara.dev
 */
export class PortfolioPage extends BasePage {
  // Navigation elements
  readonly navLogo: Locator;
  readonly aboutLink: Locator;
  readonly projectsLink: Locator;
  readonly contactLink: Locator;

  // Hero section
  readonly heroSection: Locator;
  readonly heroTitle: Locator;
  readonly heroSubtitle: Locator;
  readonly ctaButton: Locator;

  // Projects section
  readonly projectsSection: Locator;
  readonly projectCards: Locator;

  // Theme toggle
  readonly themeToggle: Locator;

  // Footer
  readonly footer: Locator;
  readonly socialLinks: Locator;

  constructor(page: Page) {
    super(page);

    // Navigation
    this.navLogo = page.locator('nav a[href="/"]').first();
    this.aboutLink = page.locator('nav a[href="#about"], nav a[href="/about"]');
    this.projectsLink = page.locator('nav a[href="#projects"], nav a[href="/projects"]');
    this.contactLink = page.locator('nav a[href="#contact"], nav a[href="/contact"]');

    // Hero
    this.heroSection = page.locator('section').first();
    this.heroTitle = page.locator('h1').first();
    this.heroSubtitle = page.locator('h1 + p, h1 ~ p').first();
    this.ctaButton = page.locator('a[href="#projects"], a[href="/projects"], button').first();

    // Projects
    this.projectsSection = page.locator('#projects, section:has(h2:text("Projects"))');
    this.projectCards = page.locator('[data-testid="project-card"], .project-card, article');

    // Theme
    this.themeToggle = page.locator('[data-testid="theme-toggle"], button:has-text("theme"), button[aria-label*="theme"]');

    // Footer
    this.footer = page.locator('footer');
    this.socialLinks = page.locator('footer a[href*="github"], footer a[href*="linkedin"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.waitForLoad();
  }

  async waitForLoad(): Promise<void> {
    // Wait for the hero section or main content to be visible
    await expect(this.heroTitle).toBeVisible({ timeout: 10000 });
    await this.page.waitForLoadState('networkidle');
  }

  async getHeroTitleText(): Promise<string> {
    return (await this.heroTitle.textContent()) || '';
  }

  async getProjectCount(): Promise<number> {
    return this.projectCards.count();
  }

  async scrollToProjects(): Promise<void> {
    await this.projectsSection.scrollIntoViewIfNeeded();
  }

  async scrollToContact(): Promise<void> {
    await this.contactLink.click();
  }

  async clickProject(index: number): Promise<void> {
    const project = this.projectCards.nth(index);
    await project.click();
  }

  async hasSocialLinks(): Promise<boolean> {
    const count = await this.socialLinks.count();
    return count > 0;
  }

  async isDarkMode(): Promise<boolean> {
    const html = this.page.locator('html');
    const className = await html.getAttribute('class');
    return className?.includes('dark') ?? false;
  }
}
