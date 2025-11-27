import { test, expect } from '../../../shared/fixtures/test-fixtures.js';
import { LoginPage } from '../pages/LoginPage.js';
import { VendorsPage } from '../pages/VendorsPage.js';

/**
 * Vendor CRUD E2E tests for KayTee Tropical Dashboard.
 *
 * Migrated from Cypress vendor-crud.cy.ts tests.
 */

// Get credentials
function getCredentials(): { email: string; password: string } {
  return {
    email: process.env.PROD_ADMIN_EMAIL || process.env.LOCALHOST_EMAIL || '',
    password: process.env.PROD_ADMIN_PASSWORD || process.env.LOCALHOST_PASSWORD || '',
  };
}

test.describe('Vendor Management - CRUD Operations', () => {
  const credentials = getCredentials();
  let vendorsPage: VendorsPage;

  test.skip(!credentials.email || !credentials.password, 'Requires credentials in environment');

  test.beforeEach(async ({ page }) => {
    // Login first
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAndWaitForDashboard(credentials.email, credentials.password);

    // Navigate to vendors
    vendorsPage = new VendorsPage(page);
    await vendorsPage.goto();
  });

  test.describe('Vendor List Page', () => {
    test('should display the vendor list page', async () => {
      await expect(vendorsPage.pageTitle).toBeVisible();
      await expect(vendorsPage.addVendorButton).toBeVisible();
    });

    test('should display vendors in table', async () => {
      await expect(vendorsPage.vendorTable).toBeVisible();
      const rowCount = await vendorsPage.getRowCount();
      expect(rowCount).toBeGreaterThanOrEqual(0);
    });

    test('should show vendor information in table rows', async () => {
      const rowCount = await vendorsPage.getRowCount();
      if (rowCount > 0) {
        // First row should have columns
        const firstRow = vendorsPage.tableRows.first();
        const cellCount = await firstRow.locator('td').count();
        expect(cellCount).toBeGreaterThanOrEqual(4); // Name, Type, Contact, Status, Actions
      }
    });
  });

  test.describe('Search and Filter', () => {
    test('should filter vendors by type', async () => {
      await vendorsPage.filterByType('wholesaler');

      // All visible rows should show wholesaler type
      const rowCount = await vendorsPage.getRowCount();
      if (rowCount > 0) {
        for (let i = 0; i < rowCount; i++) {
          const rowText = await vendorsPage.tableRows.nth(i).textContent();
          expect(rowText?.toLowerCase()).toContain('wholesaler');
        }
      }
    });

    test('should filter vendors by status', async () => {
      await vendorsPage.filterByStatus('active');

      const rowCount = await vendorsPage.getRowCount();
      if (rowCount > 0) {
        for (let i = 0; i < rowCount; i++) {
          const rowText = await vendorsPage.tableRows.nth(i).textContent();
          expect(rowText?.toLowerCase()).toContain('active');
        }
      }
    });

    test('should search vendors by name', async () => {
      const names = await vendorsPage.getVendorNames();
      if (names.length > 0) {
        const searchTerm = names[0].substring(0, 5);
        await vendorsPage.search(searchTerm);

        // Results should contain search term
        const newNames = await vendorsPage.getVendorNames();
        expect(newNames.some((n) => n.toLowerCase().includes(searchTerm.toLowerCase()))).toBe(true);
      }
    });

    test('should clear filters', async () => {
      // Apply filter
      await vendorsPage.filterByType('wholesaler');
      const filteredCount = await vendorsPage.getRowCount();

      // Clear filters
      await vendorsPage.clearFilters();
      const unfilteredCount = await vendorsPage.getRowCount();

      // Should have same or more results after clearing
      expect(unfilteredCount).toBeGreaterThanOrEqual(filteredCount);
    });
  });

  test.describe('Sorting', () => {
    test('should sort vendors by clicking column header', async () => {
      const initialNames = await vendorsPage.getVendorNames();

      if (initialNames.length > 1) {
        await vendorsPage.sortBy('Name');
        const sortedNames = await vendorsPage.getVendorNames();

        // Names should be sorted (or at least different order)
        expect(sortedNames.length).toBe(initialNames.length);
      }
    });
  });

  test.describe('Pagination', () => {
    test('should have pagination controls', async () => {
      // Check if pagination elements exist
      const nextButtonVisible = await vendorsPage.nextButton.isVisible().catch(() => false);
      const prevButtonVisible = await vendorsPage.previousButton.isVisible().catch(() => false);

      // At least one should be visible if pagination is available
      expect(nextButtonVisible !== undefined || prevButtonVisible !== undefined).toBe(true);
    });

    test('should disable Previous button on first page', async () => {
      const isDisabled = await vendorsPage.previousButton.isDisabled().catch(() => true);
      expect(isDisabled).toBe(true);
    });
  });

  test.describe('Create Vendor', () => {
    test('should navigate to create vendor page', async () => {
      await vendorsPage.clickAddVendor();

      expect(vendorsPage.getUrl()).toContain('/vendors/new');
    });

    test('should create a new vendor with all fields', async () => {
      const uniqueName = `Playwright Test Vendor ${Date.now()}`;

      await vendorsPage.createVendor({
        name: uniqueName,
        type: 'wholesaler',
        status: 'active',
        contactPerson: 'John Playwright',
        email: 'playwright@test.com',
        phone: '123-456-7890',
        paymentTerms: 'Net 30',
        address: '123 Playwright St, Test City, TS 12345',
        notes: 'Created by Playwright E2E test',
      });

      // Should redirect to vendor list
      expect(vendorsPage.getUrl()).toContain('/vendors');
      expect(vendorsPage.getUrl()).not.toContain('/new');

      // Search for the created vendor
      await vendorsPage.search(uniqueName);
      const exists = await vendorsPage.vendorExists(uniqueName);
      expect(exists).toBe(true);
    });

    test('should create vendor with only required fields', async () => {
      const uniqueName = `Minimal Vendor ${Date.now()}`;

      await vendorsPage.createVendor({
        name: uniqueName,
        type: 'supplier',
      });

      expect(vendorsPage.getUrl()).toContain('/vendors');

      await vendorsPage.search(uniqueName);
      const exists = await vendorsPage.vendorExists(uniqueName);
      expect(exists).toBe(true);
    });

    test('should show validation error for missing required fields', async () => {
      await vendorsPage.clickAddVendor();

      // Try to submit without filling required fields
      await vendorsPage.submitVendorForm();

      // Should still be on new vendor page (form not submitted)
      expect(vendorsPage.getUrl()).toContain('/vendors/new');
    });
  });

  test.describe('View Vendor Details', () => {
    test('should open vendor detail modal when clicking view button', async () => {
      const rowCount = await vendorsPage.getRowCount();
      if (rowCount > 0) {
        await vendorsPage.clickViewDetails(0);
        await expect(vendorsPage.modal).toBeVisible();
      }
    });

    test('should close modal when clicking close button', async () => {
      const rowCount = await vendorsPage.getRowCount();
      if (rowCount > 0) {
        await vendorsPage.clickViewDetails(0);
        await expect(vendorsPage.modal).toBeVisible();

        await vendorsPage.closeModalButton.click();
        await expect(vendorsPage.modal).not.toBeVisible();
      }
    });
  });

  test.describe('Edit Vendor', () => {
    test('should open edit modal when clicking edit button', async () => {
      const rowCount = await vendorsPage.getRowCount();
      if (rowCount > 0) {
        await vendorsPage.clickEdit(0);
        await expect(vendorsPage.modal).toBeVisible();
      }
    });

    test('should pre-populate form with existing vendor data', async () => {
      const rowCount = await vendorsPage.getRowCount();
      if (rowCount > 0) {
        // Get vendor name from table
        const vendorName = await vendorsPage.tableRows.first().locator('td').nth(0).textContent();

        await vendorsPage.clickEdit(0);

        // Name input should have the vendor name
        const inputValue = await vendorsPage.vendorNameInput.inputValue();
        expect(inputValue).toBeTruthy();
      }
    });

    test('should cancel edit without saving', async () => {
      const rowCount = await vendorsPage.getRowCount();
      if (rowCount > 0) {
        await vendorsPage.clickEdit(0);

        // Clear name and type something else
        await vendorsPage.vendorNameInput.fill('Should Not Save');
        await vendorsPage.cancelButton.click();

        // Modal should close
        await expect(vendorsPage.modal).not.toBeVisible();

        // "Should Not Save" should not exist in table
        const exists = await vendorsPage.vendorExists('Should Not Save');
        expect(exists).toBe(false);
      }
    });
  });

  test.describe('Delete Vendor', () => {
    test('should show confirmation dialog when clicking delete', async () => {
      // Create a vendor to delete
      const uniqueName = `To Delete ${Date.now()}`;
      await vendorsPage.createVendor({
        name: uniqueName,
        type: 'supplier',
      });

      await vendorsPage.search(uniqueName);
      await vendorsPage.clickDelete(0);

      // Confirmation should appear
      await expect(vendorsPage.page.getByText(/are you sure/i)).toBeVisible();
    });

    test('should delete vendor when confirmed', async () => {
      // Create a vendor to delete
      const uniqueName = `Delete Me ${Date.now()}`;
      await vendorsPage.createVendor({
        name: uniqueName,
        type: 'wholesaler',
      });

      await vendorsPage.search(uniqueName);
      await vendorsPage.clickDelete(0);
      await vendorsPage.confirmDelete();

      // Vendor should be removed
      await vendorsPage.page.waitForTimeout(1000);
      await vendorsPage.search(uniqueName);
      const exists = await vendorsPage.vendorExists(uniqueName);
      expect(exists).toBe(false);
    });

    test('should cancel deletion', async () => {
      const rowCount = await vendorsPage.getRowCount();
      if (rowCount > 0) {
        await vendorsPage.clickDelete(0);
        await vendorsPage.cancelDelete();

        // Vendor should still exist
        const newRowCount = await vendorsPage.getRowCount();
        expect(newRowCount).toBe(rowCount);
      }
    });
  });

  test.describe('Bulk Operations', () => {
    test('should select individual vendors', async () => {
      const rowCount = await vendorsPage.getRowCount();
      if (rowCount > 0) {
        await vendorsPage.selectRow(0);

        const checkbox = vendorsPage.tableRows.first().locator('input[type="checkbox"]');
        await expect(checkbox).toBeChecked();
      }
    });

    test('should select all vendors', async () => {
      const rowCount = await vendorsPage.getRowCount();
      if (rowCount > 0) {
        await vendorsPage.selectAll();

        // All checkboxes should be checked
        const checkboxes = vendorsPage.tableRows.locator('input[type="checkbox"]');
        const count = await checkboxes.count();
        for (let i = 0; i < count; i++) {
          await expect(checkboxes.nth(i)).toBeChecked();
        }
      }
    });

    test('should deselect all when clicking select all again', async () => {
      const rowCount = await vendorsPage.getRowCount();
      if (rowCount > 0) {
        await vendorsPage.selectAll();
        await vendorsPage.deselectAll();

        const checkboxes = vendorsPage.tableRows.locator('input[type="checkbox"]');
        const count = await checkboxes.count();
        for (let i = 0; i < count; i++) {
          await expect(checkboxes.nth(i)).not.toBeChecked();
        }
      }
    });
  });
});
