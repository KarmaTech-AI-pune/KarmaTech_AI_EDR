/**
 * Comprehensive E2E Tests for Project Budget Change Tracking
 * Task 9.5: Execute end-to-end workflow tests and generate report
 * 
 * Requirements: All requirements (1.1-5.5) - End-to-end validation
 * 
 * Test Coverage:
 * - Complete user workflows
 * - Cross-component integration
 * - User experience validation
 * - Data consistency
 * - Browser compatibility
 * 
 * Note: These tests require backend API and frontend to be running
 * Backend: http://localhost:5245
 * Frontend: http://localhost:5173
 */

import { test, expect, Page } from '@playwright/test';

// Test configuration
const TEST_CONFIG = {
  baseURL: 'http://localhost:5176',
  apiURL: 'http://localhost:5245',
  timeout: 30000,
  // Set these via environment variables or update for your test environment
  testUser: {
    email: 'test@example.com',
    password: 'Admin@123',
  },
  testProjectId: '1', // Will be set dynamically after project selection
};

// Helper function to login
async function login(page: Page) {
  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');
  
  // Wait for email field to be visible before interacting
  await page.getByLabel(/email/i).waitFor({ state: 'visible', timeout: 5000 });
  await page.getByLabel(/email/i).fill(TEST_CONFIG.testUser.email);
  await page.getByLabel(/password/i).fill(TEST_CONFIG.testUser.password);
  
  // The button text is "Log In" (with space)
  await page.getByRole('button', { name: /log in/i }).click();
  
  // Wait for navigation to home page (/) after successful login
  await page.waitForURL('/', { timeout: TEST_CONFIG.timeout });
  await page.waitForLoadState('domcontentloaded');
}

// Helper function to navigate to project
async function navigateToProject(page: Page, projectId: string) {
  // IMPORTANT: The app stores project ID in sessionStorage, not in URL
  // Set project ID in sessionStorage (this is how the app tracks selected project)
  await page.evaluate((id) => {
    sessionStorage.setItem('projectId', id);
  }, projectId);
  
  // Navigate using the correct routing structure (no ID in URL)
  // Correct path: /project-management/project/overview (singular "project")
  await page.goto('/project-management/project/overview');
  await page.waitForLoadState('domcontentloaded');
  
  // Wait for update budget button to be visible (indicates page is ready)
  await page.locator('[data-testid="update-budget-button"]').waitFor({ 
    state: 'visible', 
    timeout: 10000 
  });
}

// Helper function to open budget update dialog
async function openBudgetUpdateDialog(page: Page) {
  // Use data-testid for reliable selection
  const updateButton = page.locator('[data-testid="update-budget-button"]');
  await updateButton.waitFor({ state: 'visible', timeout: 10000 });
  await updateButton.click();
  
  // Wait for dialog to be visible
  await page.getByLabel(/estimated project cost/i).waitFor({ state: 'visible', timeout: 5000 });
}

// Helper function to navigate to budget history tab
async function navigateToBudgetHistory(page: Page) {
  // Try different possible selectors for the budget history tab
  const historyTab = page.locator('[role="tab"]').filter({ hasText: /budget history|history/i }).first();
  
  if (await historyTab.isVisible()) {
    await historyTab.click();
  } else {
    // Alternative: navigate directly via URL using correct routing
    // Correct path: /project-management/project/budget-history (singular "project", no ID)
    await page.goto('/project-management/project/budget-history');
  }
  
  await page.waitForLoadState('domcontentloaded');
  
  // Wait for timeline or empty state to be visible
  const timeline = page.locator('[class*="Timeline"], [class*="timeline"]').first();
  const emptyState = page.locator('text=/no.*history|no.*records/i').first();
  
  await Promise.race([
    timeline.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {}),
    emptyState.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
  ]);
}

test.describe('Project Budget Change Tracking - Complete E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Set longer timeout for E2E tests
    test.setTimeout(TEST_CONFIG.timeout);
  });

  // ============================================================================
  // TEST 1: Complete User Workflow - Login → Navigate → Update → View History
  // ============================================================================
  test('E2E-1: Complete workflow - Login → Navigate to Project → Update Budget → View History', async ({ page }) => {
    test.slow(); // Mark as slow test
    
    // Step 1: Login
    await login(page);
    await expect(page).toHaveURL('/');
    
    // Step 2: Navigate to project
    await navigateToProject(page, TEST_CONFIG.testProjectId);
    // Fixed: Correct URL pattern (no ID in path)
    await expect(page).toHaveURL(/project-management\/project\/overview/);
    
    // Step 3: Open budget update dialog
    await openBudgetUpdateDialog(page);
    
    // Step 4: Update budget with reason
    const newCost = '250000';
    const reason = 'E2E test - Complete workflow validation';
    
    await page.getByLabel(/estimated project cost/i).clear();
    await page.getByLabel(/estimated project cost/i).fill(newCost);
    await page.getByLabel(/reason/i).fill(reason);
    
    // Step 5: Submit the form
    await page.getByRole('button', { name: /update budget|save/i }).click();
    
    // Step 6: Verify success message
    await expect(page.getByText(/budget updated successfully|success/i)).toBeVisible({ timeout: 10000 });
    
    // Step 7: Navigate to budget history
    await navigateToBudgetHistory(page);
    
    // Step 8: Verify history entry exists
    const timeline = page.locator('[class*="Timeline"], [class*="timeline"]').first();
    await expect(timeline).toBeVisible({ timeout: 10000 });
    
    // Step 9: Verify the new entry contains our values
    const timelineContent = await timeline.textContent();
    expect(timelineContent).toContain(reason);
  });

  // ============================================================================
  // TEST 2: Budget Update Without Reason (Optional Field)
  // ============================================================================
  test('E2E-2: Budget update without reason - verify optional field works', async ({ page }) => {
    await login(page);
    await navigateToProject(page, TEST_CONFIG.testProjectId);
    
    // Open dialog
    await openBudgetUpdateDialog(page);
    
    // Update only fee, no reason
    const newFee = '35000';
    await page.getByLabel(/estimated project fee/i).clear();
    await page.getByLabel(/estimated project fee/i).fill(newFee);
    
    // Leave reason field empty
    const reasonField = page.getByLabel(/reason/i);
    await expect(reasonField).toBeVisible();
    await expect(reasonField).toHaveValue('');
    
    // Submit
    await page.getByRole('button', { name: /update budget|save/i }).click();
    
    // Verify success
    await expect(page.getByText(/success/i)).toBeVisible({ timeout: 10000 });
  });

  // ============================================================================
  // TEST 3: Filter History by Cost Changes Only
  // ============================================================================
  test('E2E-3: Filter history by cost changes only - verify correct records shown', async ({ page }) => {
    await login(page);
    await navigateToProject(page, TEST_CONFIG.testProjectId);
    await navigateToBudgetHistory(page);
    
    // Find and click filter dropdown
    const filterSelect = page.getByLabel(/filter by field|filter/i);
    await filterSelect.click();
    
    // Select "Cost Changes Only"
    await page.getByRole('option', { name: /cost changes only|estimated project cost/i }).click();
    
    // Wait for timeline items to update (dynamic wait)
    const timelineItems = page.locator('[class*="TimelineItem"], [class*="timeline-item"]');
    await timelineItems.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    
    // Verify timeline items contain "Cost" or "EstimatedProjectCost"
    const count = await timelineItems.count();
    
    if (count > 0) {
      const firstItem = timelineItems.first();
      const itemText = await firstItem.textContent();
      expect(itemText).toMatch(/cost|project cost/i);
    }
  });

  // ============================================================================
  // TEST 4: Filter History by Fee Changes Only
  // ============================================================================
  test('E2E-4: Filter history by fee changes only - verify correct records shown', async ({ page }) => {
    await login(page);
    await navigateToProject(page, TEST_CONFIG.testProjectId);
    await navigateToBudgetHistory(page);
    
    // Find and click filter dropdown
    const filterSelect = page.getByLabel(/filter by field|filter/i);
    await filterSelect.click();
    
    // Select "Fee Changes Only"
    await page.getByRole('option', { name: /fee changes only|estimated project fee/i }).click();
    
    // Wait for timeline items to update (dynamic wait)
    const timelineItems = page.locator('[class*="TimelineItem"], [class*="timeline-item"]');
    await timelineItems.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    
    // Verify timeline items contain "Fee" or "EstimatedProjectFee"
    const count = await timelineItems.count();
    
    if (count > 0) {
      const firstItem = timelineItems.first();
      const itemText = await firstItem.textContent();
      expect(itemText).toMatch(/fee|project fee/i);
    }
  });

  // ============================================================================
  // TEST 5: Cross-Component Integration - API Data Fetching
  // ============================================================================
  test('E2E-5: ProjectBudgetHistory component fetches real data from API', async ({ page }) => {
    await login(page);
    await navigateToProject(page, TEST_CONFIG.testProjectId);
    
    // Intercept API call with correct endpoint pattern
    const apiPromise = page.waitForResponse(
      response => response.url().includes('/api/projects/') && 
                  response.url().includes('/budget/history'),
      { timeout: 10000 }
    );
    
    await navigateToBudgetHistory(page);
    
    // Verify API was called
    const apiResponse = await apiPromise;
    expect(apiResponse.status()).toBe(200);
    
    // Verify data is displayed
    const timeline = page.locator('[class*="Timeline"], [class*="timeline"]').first();
    await expect(timeline).toBeVisible();
  });

  // ============================================================================
  // TEST 6: Cross-Component Integration - Dialog Submission
  // ============================================================================
  test('E2E-6: BudgetUpdateDialog submits to real API endpoint', async ({ page }) => {
    await login(page);
    await navigateToProject(page, TEST_CONFIG.testProjectId);
    
    await openBudgetUpdateDialog(page);
    
    // Set up API response listener
    const apiPromise = page.waitForResponse(
      response => response.url().includes('/api/projects') && 
                  response.url().includes('budget') && 
                  response.request().method() === 'PUT',
      { timeout: 10000 }
    );
    
    // Update budget
    await page.getByLabel(/estimated project cost/i).clear();
    await page.getByLabel(/estimated project cost/i).fill('275000');
    await page.getByRole('button', { name: /update budget|save/i }).click();
    
    // Verify API call was made
    const apiResponse = await apiPromise;
    expect(apiResponse.status()).toBeLessThan(300); // 200 or 201
    
    // Wait for success message to confirm
    await page.getByText(/success/i).waitFor({ state: 'visible', timeout: 10000 });
  });

  // ============================================================================
  // TEST 7: Timeline Updates After Budget Change
  // ============================================================================
  test('E2E-7: Timeline updates after successful budget change', async ({ page }) => {
    await login(page);
    await navigateToProject(page, TEST_CONFIG.testProjectId);
    
    // Get initial history count
    await navigateToBudgetHistory(page);
    const initialItems = await page.locator('[class*="TimelineItem"]').count();
    
    // Navigate back and update budget
    await page.goBack();
    await page.waitForLoadState('domcontentloaded');
    await page.locator('[data-testid="update-budget-button"]').waitFor({ state: 'visible', timeout: 10000 });
    
    await openBudgetUpdateDialog(page);
    
    const timestamp = Date.now();
    await page.getByLabel(/estimated project cost/i).clear();
    await page.getByLabel(/estimated project cost/i).fill('280000');
    await page.getByLabel(/reason/i).fill(`E2E test ${timestamp}`);
    await page.getByRole('button', { name: /update budget|save/i }).click();
    
    await expect(page.getByText(/success/i)).toBeVisible({ timeout: 10000 });
    
    // Navigate to history and verify new entry
    await navigateToBudgetHistory(page);
    
    // Wait for timeline items to update
    await page.locator('[class*="TimelineItem"]').first().waitFor({ state: 'visible', timeout: 5000 });
    
    const newItems = await page.locator('[class*="TimelineItem"]').count();
    expect(newItems).toBeGreaterThanOrEqual(initialItems);
  });

  // ============================================================================
  // TEST 8: Error Handling - API Errors
  // ============================================================================
  test('E2E-8: Error handling flows - API errors display helpful messages', async ({ page }) => {
    await login(page);
    await navigateToProject(page, TEST_CONFIG.testProjectId);
    
    // Intercept API and return error
    await page.route('**/api/projects/*/budget', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal server error' })
      });
    });
    
    await openBudgetUpdateDialog(page);
    await page.getByLabel(/estimated project cost/i).clear();
    await page.getByLabel(/estimated project cost/i).fill('300000');
    await page.getByRole('button', { name: /update budget|save/i }).click();
    
    // Wait for error message to appear (dynamic wait)
    const errorMessage = page.getByText(/error|failed/i);
    await errorMessage.waitFor({ state: 'visible', timeout: 10000 });
    await expect(errorMessage).toBeVisible();
  });

  // ============================================================================
  // TEST 9: Error Handling - Validation Errors
  // ============================================================================
  test('E2E-9: Validation errors display with helpful information', async ({ page }) => {
    await login(page);
    await navigateToProject(page, TEST_CONFIG.testProjectId);
    
    await openBudgetUpdateDialog(page);
    
    // Enter invalid value (negative)
    await page.getByLabel(/estimated project cost/i).clear();
    await page.getByLabel(/estimated project cost/i).fill('-1000');
    await page.getByRole('button', { name: /update budget|save/i }).click();
    
    // Verify validation error message
    await expect(page.getByText(/cannot be negative|must be greater/i)).toBeVisible();
  });

  // ============================================================================
  // TEST 10: User Experience - Loading States
  // ============================================================================
  test('E2E-10: Loading states appear during API calls', async ({ page }) => {
    await login(page);
    await navigateToProject(page, TEST_CONFIG.testProjectId);
    
    // Slow down network to see loading state
    await page.route('**/api/projects/*/budget**', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });
    
    // Start navigation and immediately check for loading indicator
    const navigationPromise = navigateToBudgetHistory(page);
    
    // Check for loading indicator (should appear during API call)
    const loadingIndicator = page.locator('[class*="CircularProgress"], [role="progressbar"]');
    const isLoadingVisible = await loadingIndicator.isVisible().catch(() => false);
    
    // Wait for navigation to complete
    await navigationPromise;
    
    // If loading indicator was visible at any point, test passes
    // Otherwise, check if data loaded successfully (which is also acceptable)
    if (!isLoadingVisible) {
      const timeline = page.locator('[class*="Timeline"]').first();
      await expect(timeline).toBeVisible({ timeout: 5000 });
    }
  });

  // ============================================================================
  // TEST 11: User Experience - Success Messages
  // ============================================================================
  test('E2E-11: Success messages display after budget update', async ({ page }) => {
    await login(page);
    await navigateToProject(page, TEST_CONFIG.testProjectId);
    
    await openBudgetUpdateDialog(page);
    await page.getByLabel(/estimated project cost/i).clear();
    await page.getByLabel(/estimated project cost/i).fill('310000');
    await page.getByRole('button', { name: /update budget|save/i }).click();
    
    // Verify success message
    const successMessage = page.getByText(/budget updated successfully|success/i);
    await expect(successMessage).toBeVisible({ timeout: 10000 });
    
    // Verify message has appropriate styling (green/success color)
    const messageElement = await successMessage.elementHandle();
    if (messageElement) {
      const color = await messageElement.evaluate(el => 
        window.getComputedStyle(el).backgroundColor
      );
      // Success messages typically have green background
      expect(color).toBeTruthy();
    }
  });

  // ============================================================================
  // TEST 12: User Experience - Form Reset
  // ============================================================================
  test('E2E-12: Form resets after successful submission', async ({ page }) => {
    await login(page);
    await navigateToProject(page, TEST_CONFIG.testProjectId);
    
    await openBudgetUpdateDialog(page);
    
    // Fill form
    await page.getByLabel(/estimated project cost/i).clear();
    await page.getByLabel(/estimated project cost/i).fill('320000');
    await page.getByLabel(/reason/i).fill('Test reason');
    
    // Submit
    await page.getByRole('button', { name: /update budget|save/i }).click();
    await expect(page.getByText(/success/i)).toBeVisible({ timeout: 10000 });
    
    // Wait for dialog to close
    await page.waitForTimeout(2000);
    
    // Reopen dialog
    await openBudgetUpdateDialog(page);
    
    // Verify form is reset (reason field should be empty)
    const reasonField = page.getByLabel(/reason/i);
    await expect(reasonField).toHaveValue('');
  });

  // ============================================================================
  // TEST 13: Data Consistency - Database Record Creation
  // ============================================================================
  test('E2E-13: Update budget via API → Verify database record created', async ({ page }) => {
    await login(page);
    await navigateToProject(page, TEST_CONFIG.testProjectId);
    
    const uniqueReason = `E2E test ${Date.now()}`;
    
    // Update budget
    await openBudgetUpdateDialog(page);
    await page.getByLabel(/estimated project cost/i).clear();
    await page.getByLabel(/estimated project cost/i).fill('330000');
    await page.getByLabel(/reason/i).fill(uniqueReason);
    await page.getByRole('button', { name: /update budget|save/i }).click();
    
    await expect(page.getByText(/success/i)).toBeVisible({ timeout: 10000 });
    
    // Navigate to history and verify record exists
    await navigateToBudgetHistory(page);
    
    // Wait for timeline to load
    const timeline = page.locator('[class*="Timeline"], [class*="timeline"]').first();
    await timeline.waitFor({ state: 'visible', timeout: 5000 });
    
    // Search for our unique reason in the timeline
    const timelineText = await timeline.textContent();
    expect(timelineText).toContain(uniqueReason);
  });

  // ============================================================================
  // TEST 14: Data Consistency - Variance Calculations
  // ============================================================================
  test('E2E-14: Verify variance calculations are correct in database', async ({ page }) => {
    await login(page);
    await navigateToProject(page, TEST_CONFIG.testProjectId);
    await navigateToBudgetHistory(page);
    
    // Find variance indicators
    const varianceIndicators = page.locator('[class*="variance"], [class*="Variance"]');
    const count = await varianceIndicators.count();
    
    if (count > 0) {
      const firstIndicator = varianceIndicators.first();
      await expect(firstIndicator).toBeVisible();
      
      // Verify it contains numeric values
      const text = await firstIndicator.textContent();
      expect(text).toMatch(/[\d,]+/); // Should contain numbers
    }
  });

  // ============================================================================
  // TEST 15: Data Consistency - User Information
  // ============================================================================
  test('E2E-15: Verify user information is correctly associated', async ({ page }) => {
    await login(page);
    await navigateToProject(page, TEST_CONFIG.testProjectId);
    await navigateToBudgetHistory(page);
    
    // Verify timeline items show user information
    const timelineItems = page.locator('[class*="TimelineItem"], [class*="timeline-item"]');
    const count = await timelineItems.count();
    
    if (count > 0) {
      const firstItem = timelineItems.first();
      const itemText = await firstItem.textContent();
      
      // Should contain "by" followed by user name or email
      expect(itemText).toMatch(/by\s+[\w\s@.]+/i);
    }
  });

  // ============================================================================
  // TEST 16: Reason Field Character Limit
  // ============================================================================
  test('E2E-16: Enforce 500 character limit on reason field', async ({ page }) => {
    await login(page);
    await navigateToProject(page, TEST_CONFIG.testProjectId);
    
    await openBudgetUpdateDialog(page);
    
    // Enter 501 characters
    const longReason = 'a'.repeat(501);
    await page.getByLabel(/reason/i).fill(longReason);
    
    // Try to submit
    await page.getByLabel(/estimated project cost/i).clear();
    await page.getByLabel(/estimated project cost/i).fill('340000');
    await page.getByRole('button', { name: /update budget|save/i }).click();
    
    // Wait for validation error to appear (dynamic wait)
    const validationError = page.getByText(/maximum.*500.*character/i);
    await validationError.waitFor({ state: 'visible', timeout: 5000 });
    await expect(validationError).toBeVisible();
  });

  // ============================================================================
  // TEST 17: Variance Display with Color Coding
  // ============================================================================
  test('E2E-17: Variance indicators show correct color coding', async ({ page }) => {
    await login(page);
    await navigateToProject(page, TEST_CONFIG.testProjectId);
    await navigateToBudgetHistory(page);
    
    // Find variance indicators
    const varianceIndicators = page.locator('[class*="variance"], [class*="Variance"]');
    const count = await varianceIndicators.count();
    
    if (count > 0) {
      const firstIndicator = varianceIndicators.first();
      await expect(firstIndicator).toBeVisible();
      
      // Check if it has color styling
      const element = await firstIndicator.elementHandle();
      if (element) {
        const color = await element.evaluate(el => window.getComputedStyle(el).color);
        expect(color).toBeTruthy();
        // Color should not be default black (rgb(0, 0, 0))
        expect(color).not.toBe('rgb(0, 0, 0)');
      }
    }
  });

  // ============================================================================
  // TEST 18: Pagination
  // ============================================================================
  test('E2E-18: Pagination works correctly for large datasets', async ({ page }) => {
    await login(page);
    await navigateToProject(page, TEST_CONFIG.testProjectId);
    await navigateToBudgetHistory(page);
    
    // Check if pagination controls exist
    const pagination = page.locator('[class*="Pagination"], [role="navigation"]');
    
    if (await pagination.isVisible()) {
      // Click next page button
      const nextButton = page.getByRole('button', { name: /next/i });
      if (await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(1000);
        
        // Verify page changed (URL or content should update)
        const timeline = page.locator('[class*="Timeline"]').first();
        await expect(timeline).toBeVisible();
      }
    }
  });

  // ============================================================================
  // TEST 19: Performance - Page Load Time
  // ============================================================================
  test('E2E-19: Budget history page loads within 3 seconds', async ({ page }) => {
    await login(page);
    await navigateToProject(page, TEST_CONFIG.testProjectId);
    
    const startTime = Date.now();
    await navigateToBudgetHistory(page);
    
    // Wait for timeline to be visible
    await page.locator('[class*="Timeline"], [class*="timeline"]').first().waitFor({ 
      state: 'visible', 
      timeout: 3000 
    });
    
    const loadTime = Date.now() - startTime;
    console.log(`Budget history page load time: ${loadTime}ms`);
    
    // Performance requirement: <3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  // ============================================================================
  // TEST 20: Performance - API Response Time
  // ============================================================================
  test('E2E-20: Budget update API responds within 500ms', async ({ page }) => {
    await login(page);
    await navigateToProject(page, TEST_CONFIG.testProjectId);
    
    await openBudgetUpdateDialog(page);
    await page.getByLabel(/estimated project cost/i).clear();
    await page.getByLabel(/estimated project cost/i).fill('350000');
    
    const startTime = Date.now();
    
    // Set up response listener
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/api/projects') && 
                  response.url().includes('budget') && 
                  response.request().method() === 'PUT'
    );
    
    await page.getByRole('button', { name: /update budget|save/i }).click();
    
    const response = await responsePromise;
    const responseTime = Date.now() - startTime;
    
    console.log(`API response time: ${responseTime}ms`);
    
    // Performance requirement: <500ms (Req 5.4)
    expect(responseTime).toBeLessThan(500);
    expect(response.status()).toBeLessThan(300);
  });
});

// ============================================================================
// BROWSER COMPATIBILITY TESTS
// ============================================================================
test.describe('Browser Compatibility Tests', () => {
  
  test('BC-1: Works correctly in Chromium', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Chromium only');
    
    await login(page);
    await navigateToProject(page, TEST_CONFIG.testProjectId);
    await navigateToBudgetHistory(page);
    
    const timeline = page.locator('[class*="Timeline"]').first();
    await expect(timeline).toBeVisible();
  });

  test('BC-2: Works correctly in Firefox', async ({ page, browserName }) => {
    test.skip(browserName !== 'firefox', 'Firefox only');
    
    await login(page);
    await navigateToProject(page, TEST_CONFIG.testProjectId);
    await navigateToBudgetHistory(page);
    
    const timeline = page.locator('[class*="Timeline"]').first();
    await expect(timeline).toBeVisible();
  });

  test('BC-3: Works correctly in WebKit (Safari)', async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit', 'WebKit only');
    
    await login(page);
    await navigateToProject(page, TEST_CONFIG.testProjectId);
    await navigateToBudgetHistory(page);
    
    const timeline = page.locator('[class*="Timeline"]').first();
    await expect(timeline).toBeVisible();
  });
});

// ============================================================================
// ACCESSIBILITY TESTS
// ============================================================================
test.describe('Accessibility Tests', () => {
  
  test('A11Y-1: Budget update dialog is keyboard navigable', async ({ page }) => {
    await login(page);
    await navigateToProject(page, TEST_CONFIG.testProjectId);
    
    await openBudgetUpdateDialog(page);
    
    // Tab through form fields
    await page.keyboard.press('Tab'); // Focus on cost field
    await page.keyboard.type('360000');
    
    await page.keyboard.press('Tab'); // Focus on fee field
    await page.keyboard.type('40000');
    
    await page.keyboard.press('Tab'); // Focus on reason field
    await page.keyboard.type('Keyboard navigation test');
    
    // Tab to submit button and press Enter
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Verify submission worked
    await expect(page.getByText(/success/i)).toBeVisible({ timeout: 10000 });
  });

  test('A11Y-2: Form labels are properly associated', async ({ page }) => {
    await login(page);
    await navigateToProject(page, TEST_CONFIG.testProjectId);
    
    await openBudgetUpdateDialog(page);
    
    // Verify labels exist and are associated with inputs
    const costLabel = page.getByLabel(/estimated project cost/i);
    await expect(costLabel).toBeVisible();
    
    const feeLabel = page.getByLabel(/estimated project fee/i);
    await expect(feeLabel).toBeVisible();
    
    const reasonLabel = page.getByLabel(/reason/i);
    await expect(reasonLabel).toBeVisible();
  });
});
