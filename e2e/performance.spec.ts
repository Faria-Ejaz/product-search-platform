import { test, expect } from '@playwright/test';

test.describe('Basic UI Checks', () => {
  test('should load the home page and show search utilities', async ({ page }) => {
    await page.goto('/');
    
    // Check for the Logo/Site Name (accessible by text since its name is "Scroll to top")
    const logo = page.getByText(/healf/i).first();
    await expect(logo).toBeVisible();

    // Check for Search Input
    const searchInput = page.getByPlaceholder(/search products/i).first();
    await expect(searchInput).toBeVisible();

    // Check for Filter Button
    const filterBtn = page.getByRole('button', { name: /show filters/i });
    await expect(filterBtn).toBeVisible();
  });

  test('should open/close the filter sidebar', async ({ page }) => {
    await page.goto('/');
    
    // Open Filters
    const filterBtn = page.getByRole('button', { name: /show filters/i });
    await filterBtn.click();
    
    // Check if sidebar text appears
    const hideBtn = page.getByRole('button', { name: /hide filters/i });
    await expect(hideBtn).toBeVisible();
    
    // Close Filters
    await hideBtn.click();
    await expect(hideBtn).not.toBeVisible();
  });
});
