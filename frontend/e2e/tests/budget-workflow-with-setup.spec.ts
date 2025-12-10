/**
 * Budget Workflow E2E Test with Project Setup
 * This test ensures a project exists before testing budget functionality
 */

import { test, expect, Page } from '@playwright/test';

const TEST_CONFIG = {
  baseURL: 'http://localhost:5176',
  timeout: 60000,
  testUser: {
    email: 'test@example.com',
    password: 'Admin@123',
  },
};

// Helper function to login
async function login(page: Page) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  
  await page.getByLabel(/email/i).fill(TEST_CONFIG.testUser.email);
  await page.getByLabel(/password/i).fill(TEST_CONFIG.testUser.password);
  await page.getByRole('button', { name: /log in/i }).click();
  
  await page.waitForURL('/', { timeout: TEST_CONFIG.timeout });
  await page.waitForLoadState('networkidle');
}

// Helper function to select a project from the list
async function selectFirstProject(page: Page): Promise<string | null> {
  // Navigate to project management
  await page.goto('/project-management');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  // Look for project list items
  const projectItems = page.locator('[role="listitem"], .MuiListItem-root').filter({ hasText: /project|client|cost/i });
  const count = await projectItems.count();
  
  console.log(`Found ${count} project items`);
  
  if (count > 0) {
    // Click the first project
    await projectItems.first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Get the project ID from sessionStorage
    const projectId = await page.evaluate(() => sessionStorage.getItem('projectId'));
    console.log(`Selected project ID: ${projectId}`);
    return projectId;
  }
  
  return null;
}

// Helper function to navigate to project overview
async function navigateToProjectOverview(page: Page) {
  await page.goto('/project-management/project/overview');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
}

test.describe('Budget Workflow with Project Setup', () => {
  
  test.setTimeout(TEST_CONFIG.timeout);

  test('Complete budget update workflow', async ({ page }) => {
    // Step 1: Login
    console.log('Step 1: Logging in...');
    await login(page);
    
    // Step 2: Select a project
    console.log('Step 2: Selecting a project...');
    const projectId = await selectFirstProject(page);
    
    if (!projectId) {
      console.log('❌ No projects found in the system');
      console.log('Please create a project first through the UI or API');
      test.skip();
      return;
    }
    
    console.log(`✅ Project selected: ${projectId}`);
    
    // Step 3: Navigate to project overview
    console.log('Step 3: Navigating to project overview...');
    await navigateToProjectOverview(page);
    
    // Take screenshot to see what's on the page
    await page.screenshot({ path: 'test-results/project-overview.png', fullPage: true });
    
    // Step 4: Look for the update budget button
    console.log('Step 4: Looking for update budget button...');
    
    // Try multiple selectors
    const buttonSelectors = [
      '[data-testid="update-budget-button"]',
      'button:has-text("Update Budget")',
      'button:has-text("Edit Budget")',
      'button:has-text("Change Budget")',
      '[aria-label*="budget"]',
    ];
    
    let updateButton = null;
    for (const selector of buttonSelectors) {
      const button = page.locator(selector).first();
      if (await button.isVisible({ timeout: 2000 }).catch(() => false)) {
        updateButton = button;
        console.log(`✅ Found button with selector: ${selector}`);
        break;
      }
    }
    
    if (!updateButton) {
      console.log('❌ Update budget button not found');
      console.log('Page content:');
      const bodyText = await page.textContent('body');
      console.log(bodyText?.substring(0, 500));
      
      // List all buttons on the page
      const allButtons = await page.locator('button').all();
      console.log(`Found ${allButtons.length} buttons on the page:`);
      for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
        const text = await allButtons[i].textContent();
        const isVisible = await allButtons[i].isVisible();
        console.log(`Button ${i + 1}: "${text?.trim()}" (visible: ${isVisible})`);
      }
      
      test.fail();
      return;
    }
    
    // Step 5: Click the update budget button
    console.log('Step 5: Clicking update budget button...');
    await updateButton.click();
    await page.waitForTimeout(1000);
    
    // Step 6: Fill in the budget update form
    console.log('Step 6: Filling budget update form...');
    
    const costInput = page.getByLabel(/estimated project cost/i);
    const feeInput = page.getByLabel(/estimated project fee/i);
    const reasonInput = page.getByLabel(/reason/i);
    
    await costInput.waitFor({ state: 'visible', timeout: 5000 });
    
    // Clear and fill new values
    await costInput.clear();
    await costInput.fill('1500000');
    
    await feeInput.clear();
    await feeInput.fill('150000');
    
    await reasonInput.fill('E2E test budget update');
    
    // Step 7: Submit the form
    console.log('Step 7: Submitting form...');
    const submitButton = page.getByRole('button', { name: /update|save|submit/i });
    await submitButton.click();
    
    // Wait for success message or dialog to close
    await page.waitForTimeout(2000);
    
    // Step 8: Verify the update
    console.log('Step 8: Verifying budget update...');
    
    // Navigate to budget history
    await page.goto('/project-management/project/budget-history');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Take screenshot of history
    await page.screenshot({ path: 'test-results/budget-history.png', fullPage: true });
    
    // Look for the history entry
    const historyContent = await page.textContent('body');
    
    expect(historyContent).toContain('1,500,000');
    expect(historyContent).toContain('E2E test budget update');
    
    console.log('✅ Budget update workflow completed successfully!');
  });
});
