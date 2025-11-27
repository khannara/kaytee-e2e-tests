import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../../../shared/page-objects/BasePage.js';

/**
 * Page object for the Vendors page.
 *
 * Migrated from Cypress vendor-crud.cy.ts tests.
 */
export class VendorsPage extends BasePage {
  // Page elements
  readonly pageTitle: Locator;
  readonly addVendorButton: Locator;

  // Table elements
  readonly vendorTable: Locator;
  readonly tableRows: Locator;
  readonly tableHeaders: Locator;

  // Filter/Search elements
  readonly searchInput: Locator;
  readonly typeFilter: Locator;
  readonly statusFilter: Locator;

  // Pagination
  readonly nextButton: Locator;
  readonly previousButton: Locator;
  readonly firstButton: Locator;
  readonly lastButton: Locator;
  readonly pageSizeSelect: Locator;

  // Modal elements
  readonly modal: Locator;
  readonly modalTitle: Locator;
  readonly closeModalButton: Locator;

  // Form elements (for create/edit modals)
  readonly vendorNameInput: Locator;
  readonly vendorTypeSelect: Locator;
  readonly vendorStatusSelect: Locator;
  readonly contactPersonInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly paymentTermsInput: Locator;
  readonly addressInput: Locator;
  readonly notesInput: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;

  // Bulk actions
  readonly selectAllCheckbox: Locator;

  constructor(page: Page) {
    super(page);

    // Page elements
    this.pageTitle = page.getByRole('heading', { name: /vendors/i });
    this.addVendorButton = page.getByRole('link', { name: /add vendor/i });

    // Table
    this.vendorTable = page.locator('table');
    this.tableRows = page.locator('tbody tr');
    this.tableHeaders = page.locator('thead th');

    // Filters
    this.searchInput = page.getByPlaceholder(/search/i);
    this.typeFilter = page.getByRole('combobox', { name: /type/i });
    this.statusFilter = page.getByRole('combobox', { name: /status/i });

    // Pagination
    this.nextButton = page.getByRole('button', { name: /next/i });
    this.previousButton = page.getByRole('button', { name: /previous/i });
    this.firstButton = page.getByRole('button', { name: /first/i });
    this.lastButton = page.getByRole('button', { name: /last/i });
    this.pageSizeSelect = page.getByRole('combobox', { name: /per page/i });

    // Modal
    this.modal = page.getByRole('dialog');
    this.modalTitle = page.getByRole('dialog').getByRole('heading');
    this.closeModalButton = page.getByRole('dialog').getByRole('button', { name: /close/i });

    // Form elements
    this.vendorNameInput = page.getByLabel(/vendor name/i);
    this.vendorTypeSelect = page.getByLabel(/^type/i);
    this.vendorStatusSelect = page.getByLabel(/status/i);
    this.contactPersonInput = page.getByLabel(/contact person/i);
    this.emailInput = page.getByLabel(/email/i);
    this.phoneInput = page.getByLabel(/phone/i);
    this.paymentTermsInput = page.getByLabel(/payment terms/i);
    this.addressInput = page.getByLabel(/address/i);
    this.notesInput = page.getByLabel(/notes/i);
    this.submitButton = page.getByRole('button', { name: /create vendor|save changes/i });
    this.cancelButton = page.getByRole('button', { name: /cancel/i });

    // Bulk actions
    this.selectAllCheckbox = page.locator('thead input[type="checkbox"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/vendors');
    await this.waitForLoad();
  }

  async waitForLoad(): Promise<void> {
    await expect(this.vendorTable).toBeVisible({ timeout: 15000 });
  }

  // Search and Filter
  async search(searchTerm: string): Promise<void> {
    await this.searchInput.fill(searchTerm);
    await this.page.waitForTimeout(500); // Wait for debounce
  }

  async filterByType(type: string): Promise<void> {
    await this.typeFilter.selectOption(type);
    await this.page.waitForTimeout(500);
  }

  async filterByStatus(status: string): Promise<void> {
    await this.statusFilter.selectOption(status);
    await this.page.waitForTimeout(500);
  }

  async clearFilters(): Promise<void> {
    await this.typeFilter.selectOption('');
    await this.statusFilter.selectOption('');
    await this.searchInput.clear();
    await this.page.waitForTimeout(500);
  }

  // Sorting
  async sortBy(columnName: string): Promise<void> {
    await this.page.getByText(columnName, { exact: true }).click();
    await this.page.waitForTimeout(500);
  }

  // Pagination
  async goToNextPage(): Promise<void> {
    await this.nextButton.click();
    await this.page.waitForTimeout(500);
  }

  async goToPreviousPage(): Promise<void> {
    await this.previousButton.click();
    await this.page.waitForTimeout(500);
  }

  async setPageSize(size: string): Promise<void> {
    await this.pageSizeSelect.selectOption(size);
    await this.page.waitForTimeout(500);
  }

  // CRUD Operations
  async clickAddVendor(): Promise<void> {
    await this.addVendorButton.click();
    await this.page.waitForURL('**/vendors/new**');
  }

  async fillVendorForm(vendor: {
    name: string;
    type?: string;
    status?: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    paymentTerms?: string;
    address?: string;
    notes?: string;
  }): Promise<void> {
    await this.vendorNameInput.fill(vendor.name);
    if (vendor.type) await this.vendorTypeSelect.selectOption(vendor.type);
    if (vendor.status) await this.vendorStatusSelect.selectOption(vendor.status);
    if (vendor.contactPerson) await this.contactPersonInput.fill(vendor.contactPerson);
    if (vendor.email) await this.emailInput.fill(vendor.email);
    if (vendor.phone) await this.phoneInput.fill(vendor.phone);
    if (vendor.paymentTerms) await this.paymentTermsInput.fill(vendor.paymentTerms);
    if (vendor.address) await this.addressInput.fill(vendor.address);
    if (vendor.notes) await this.notesInput.fill(vendor.notes);
  }

  async submitVendorForm(): Promise<void> {
    await this.submitButton.click();
  }

  async createVendor(vendor: {
    name: string;
    type?: string;
    status?: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    paymentTerms?: string;
    address?: string;
    notes?: string;
  }): Promise<void> {
    await this.clickAddVendor();
    await this.fillVendorForm(vendor);
    await this.submitVendorForm();
    await this.page.waitForURL('**/vendors');
  }

  // Row actions
  async clickViewDetails(rowIndex: number): Promise<void> {
    await this.tableRows.nth(rowIndex).locator('button[title="View Details"]').click();
    await expect(this.modal).toBeVisible();
  }

  async clickEdit(rowIndex: number): Promise<void> {
    await this.tableRows.nth(rowIndex).locator('button[title="Edit"]').click();
    await expect(this.modal).toBeVisible();
  }

  async clickDelete(rowIndex: number): Promise<void> {
    await this.tableRows.nth(rowIndex).locator('button[title="Delete"]').click();
  }

  async confirmDelete(): Promise<void> {
    await this.page.getByRole('button', { name: /delete/i }).last().click();
  }

  async cancelDelete(): Promise<void> {
    await this.page.getByRole('button', { name: /cancel/i }).last().click();
  }

  // Bulk selection
  async selectAll(): Promise<void> {
    await this.selectAllCheckbox.check();
  }

  async deselectAll(): Promise<void> {
    await this.selectAllCheckbox.uncheck();
  }

  async selectRow(rowIndex: number): Promise<void> {
    await this.tableRows.nth(rowIndex).locator('input[type="checkbox"]').check();
  }

  // Helper methods
  async getRowCount(): Promise<number> {
    return this.tableRows.count();
  }

  async getVendorNames(): Promise<string[]> {
    const names: string[] = [];
    const count = await this.tableRows.count();
    for (let i = 0; i < count; i++) {
      const name = await this.tableRows.nth(i).locator('td').nth(1).textContent();
      if (name) names.push(name.trim());
    }
    return names;
  }

  async vendorExists(name: string): Promise<boolean> {
    return this.page.getByText(name).isVisible();
  }
}
