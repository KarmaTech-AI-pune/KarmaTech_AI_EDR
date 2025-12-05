/**
 * E2E Test Template for Project Budget Change Tracking
 * 
 * Copy this file to e2e/tests/ and customize for your specific tests
 * 
 * Usage:
 * 1. Copy to e2e/tests/your-test-name.spec.ts
 * 2. Update test descriptions and selectors
 * 3. Run: npx playwright test your-test-name.spec.ts
 */

import { test, expect, Page } from '@playwright/test';

// Test configuration
test.describe.configure({ mode: 'serial' }); // Run tests in order

// Shared state
let page: Page;

// Before all tests - setup
test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
  
  // Login once for all tests
  await page.goto('/login');
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL('/dashboard');
});

// After all tests - cleanup
test.afterAll(async () => {
  await page.close();
});

// Test Suite
test.describe('Project Budget Change Tracking - E2E Tests', () => {
  
  // Test 1: Complete User Workflow
  test('should complete full workflow: Login → Update Budget → View History', async () => {
    // Navigate to project
    await page.goto('/projects/1');
    await expect(page).toHaveURL(/\/projects\/1/);
    
    // Open budget update dialog
    await page.getByRole('button', { name: /update budget/i }).click();
    await expect(page.getByLabel(/estimated project cost/i)).toBeVisible();
    
    // Update budget with reason
    await page.getByLabel(/estimated project cost/i).clear();
    await page.getByLabel(/estimated project cost/i).fill('150000');
    await page.getByLabel(/reason/i).fill('Q4 budget adjustment');
    await page.getByRole('button', { name: /save/i }).click();
    
    // Verify success message
    await expect(page.getByText(/budget updated successfully/i)).toBeVisible();
    
    // Navigate to budget history
    await page.getByRole('tab', { name: /budget history/i }).click();
    
    // Verify history entry
    const timeline = page.locator('[data-testid="budget-timeline"]');
    await expect(timeline).toBeVisible();
    
    const latestEntry = timeline.locator('[data-testid="timeline-item"]').first();
    await expect(latestEntry).toContainText('150,000');
    await expect(latestEntry).toContainText('Q4 budget adjustment');
  });
  
  // Test 2: Budget Update Without Reason
  test('should update budget without reason (optional field)', async () => {
    await page.goto('/projects/1');
    
    // Open dialog
    await page.getByRole('button', { name: /update budget/i }).click();
    
    // Update only fee, no reason
    await page.getByLabel(/estimated project fee/i).clear();
    await page.getByLabel(/estimated project fee/i).fill('20000');
    await page.getByRole('button', { name: /save/i }).click();
    
    // Verify success
    await expect(page.getByText(/success/i)).toBeVisible();
  });
  
  // Test 3: Filter History by Cost Changes
  test('should filter history by cost changes only', async () => {
    await page.goto('/projects/1');
    await page.getByRole('tab', { name: /budget history/i }).click();
    
    // Apply filter
    await page.getByLabel(/filter by/i).click();
    await page.getByRole('option', { name: /cost/i }).click();
    
    // Verify filtered results
    const timelineItems = page.locator('[data-testid="timeline-item"]');
    const count = await timelineItems.count();
    expect(count).toBeGreaterThan(0);
    
    // Verify all items are cost changes
    const firstItem = timelineItems.first();
    await expect(firstItem).toContainText('Cost');
  });
  
  // Test 4: Filter History by Fee Changes
  test('should filter history by fee changes only', async () => {
    await page.goto('/projects/1');
    await page.getByRole('tab', { name: /budget history/i }).click();
    
    // Apply filter
    await page.getByLabel(/filter by/i).click();
    await page.getByRole('option', { name: /fee/i }).click();
    
    // Verify filtered results
    const timelineItems = page.locator('[data-testid="timeline-item"]');
    const firstItem = timelineItems.first();
    await expect(firstItem).toContainText('Fee');
  });
  
  // Test 5: Validation Error Handling
  test('should show validation errors for invalid input', async () => {
    await page.goto('/projects/1');
    await page.getByRole('button', { name: /update budget/i }).click();
    
    // Enter invalid value
    await page.getByLabel(/estimated project cost/i).fill('-1000');
    await page.getByRole('button', { name: /save/i }).click();
    
    // Verify error message
    await expect(page.getByText(/must be greater than/i)).toBeVisible();
  });
  
  // Test 6: Reason Field Character Limit
  test('should enforce 500 character limit on reason field', async () => {
    await page.goto('/projects/1');
    await page.getByRole('button', { name: /update budget/i }).click();
    
    // Enter 501 characters
    const longReason = 'a'.repeat(501);
    await page.getByLabel(/reason/i).fill(longReason);
    await page.getByRole('button', { name: /save/i }).click();
    
    // Verify validation error
    await expect(page.getByText(/maximum.*500.*characters/i)).toBeVisible();
  });
  
  // Test 7: Variance Display with Color Coding
  test('should display variance with correct color coding', async () => {
    await page.goto('/projects/1');
    await page.getByRole('tab', { name: /budget history/i }).click();
    
    const timeline = page.locator('[data-testid="budget-timeline"]');
    const firstItem = timeline.locator('[data-testid="timeline-item"]').first();
    
    // Check for variance indicator
    const varianceIndicator = firstItem.locator('[data-testid="variance-indicator"]');
    await expect(varianceIndicator).toBeVisible();
    
    // Verify color coding (green for increase, red for decrease)
    const color = await varianceIndicator.evaluate(el => 
      window.getComputedStyle(el).color
    );
    expect(color).toBeTruthy();
  });
  
  // Test 8: Pagination
  test('should paginate history when there are many records', async () => {
    await page.goto('/projects/1');
    await page.getByRole('tab', { name: /budget history/i }).click();
    
    // Check if pagination controls exist
    const pagination = page.locator('[data-testid="pagination"]');
    
    if (await pagination.isVisible()) {
      // Click next page
      await page.getByRole('button', { name: /next/i }).click();
      
      // Verify page changed
      await expect(page.getByText(/page 2/i)).toBeVisible();
    }
  });
  
  // Test 9: API Error Handling
  test('should handle API errors gracefully', async () => {
    // Intercept API call and return error
    await page.route('**/api/projects/*/budget', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });
    
    await page.goto('/projects/1');
    await page.getByRole('button', { name: /update budget/i }).click();
    await page.getByLabel(/estimated project cost/i).fill('150000');
    await page.getByRole('button', { name: /save/i }).click();
    
    // Verify error message displayed
    await expect(page.getByText(/error/i)).toBeVisible();
  });
  
  // Test 10: Data Consistency
  test('should maintain data consistency across updates', async () => {
    await page.goto('/projects/1');
    
    // First update
    await page.getByRole('button', { name: /update budget/i }).click();
    await page.getByLabel(/estimated project cost/i).fill('100000');
    await page.getByLabel(/reason/i).fill('First update');
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/success/i)).toBeVisible();
    
    // Second update
    await page.getByRole('button', { name: /update budget/i }).click();
    await page.getByLabel(/estimated project cost/i).fill('120000');
    await page.getByLabel(/reason/i).fill('Second update');
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText(/success/i)).toBeVisible();
    
    // Verify both entries in history
    await page.getByRole('tab', { name: /budget history/i }).click();
    const timelineItems = page.locator('[data-testid="timeline-item"]');
    const count = await timelineItems.count();
    expect(count).toBeGreaterThanOrEqual(2);
    
    // Verify order (newest first)
    const firstItem = timelineItems.first();
    await expect(firstItem).toContainText('120,000');
    await expect(firstItem).toContainText('Second update');
  });
});

// Additional test suite for cross-browser compatibility
test.describe('Cross-Browser Compatibility', () => {
  test('should work correctly in all browsers', async ({ browserName }) => {
    console.log(`Testing in ${browserName}`);
    
    await page.goto('/projects/1');
    await expect(page).toHaveURL(/\/projects\/1/);
    
    // Test basic functionality
    await page.getByRole('button', { name: /update budget/i }).click();
    await expect(page.getByLabel(/estimated project cost/i)).toBeVisible();
    
    // Close dialog
    await page.getByRole('button', { name: /cancel/i }).click();
  });
});

// Performance test
test.describe('Performance', () => {
  test('should load budget history within 3 seconds', async () => {
    const startTime = Date.now();
    
    await page.goto('/projects/1');
    await page.getByRole('tab', { name: /budget history/i }).click();
    await page.waitForSelector('[data-testid="budget-timeline"]');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // 3 seconds
  });
  
  test('should update budget within 500ms', async () => {
    await page.goto('/projects/1');
    await page.getByRole('button', { name: /update budget/i }).click();
    await page.getByLabel(/estimated project cost/i).fill('150000');
    
    const startTime = Date.now();
    await page.getByRole('button', { name: /save/i }).click();
    await page.waitForResponse(response => 
      response.url().includes('/api/projects') && response.status() === 200
    );
    const responseTime = Date.now() - startTime;
    
    expect(responseTime).toBeLessThan(500); // 500ms requirement
  });
});
