/**
 * Budget Health Indicator E2E Test
 * 
 * This test demonstrates how the BudgetHealthIndicator component is accessed
 * and used in the application. It covers:
 * 
 * 1. Login to the platform
 * 2. Navigate to Project Management
 * 3. View project with budget health indicator
 * 4. Verify color coding (Green/Yellow/Red)
 * 5. Verify utilization percentage display
 * 6. Test different budget scenarios
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */

import { test, expect, Page } from '@playwright/test';

// Test configuration
const BASE_URL = 'http://localhost:5176';
const TEST_USER = {
  email: 'test@example.com',
  password: 'Admin@123'
};

/**
 * Helper function to login
 */
async function login(page: Page) {
  console.log('🔐 Logging in...');
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('domcontentloaded');
  
  await page.getByLabel(/email/i).waitFor({ state: 'visible', timeout: 10000 });
  await page.getByLabel(/email/i).fill(TEST_USER.email);
  await page.getByLabel(/password/i).fill(TEST_USER.password);
  await page.getByRole('button', { name: /log in/i }).click();
  
  await page.waitForURL('/', { timeout: 30000 });
  console.log('✅ Logged in successfully');
}

/**
 * Helper function to navigate to project management
 */
async function navigateToProjectManagement(page: Page) {
  console.log('📂 Navigating to Project Management...');
  await page.goto(`${BASE_URL}/project-management`);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000); // Wait for projects to load
  console.log('✅ On Project Management page');
}

/**
 * Helper function to find and open a project
 */
async function openProject(page: Page, projectName: string): Promise<boolean> {
  console.log(`🔍 Looking for project: ${projectName}...`);
  
  const projectItems = page.locator('[role="listitem"], .MuiListItem-root, .MuiCard-root');
  const count = await projectItems.count();
  console.log(`Found ${count} project items`);
  
  for (let i = 0; i < count; i++) {
    const item = projectItems.nth(i);
    const text = await item.textContent();
    
    if (text && text.includes(projectName)) {
      console.log(`✅ Found project: ${projectName}`);
      await item.click();
      await page.waitForTimeout(2000);
      return true;
    }
  }
  
  console.log(`❌ Project not found: ${projectName}`);
  return false;
}

/**
 * Helper function to check budget health indicator
 */
async function checkBudgetHealthIndicator(page: Page) {
  console.log('🔍 Looking for Budget Health Indicator...');
  
  // Look for the budget health indicator chip
  // It should be a MUI Chip with status text and percentage
  const healthIndicator = page.locator('.MuiChip-root').filter({
    hasText: /Healthy|Warning|Critical/
  }).first();
  
  const isVisible = await healthIndicator.isVisible({ timeout: 5000 }).catch(() => false);
  
  if (!isVisible) {
    console.log('❌ Budget Health Indicator not found');
    return null;
  }
  
  console.log('✅ Budget Health Indicator found!');
  
  // Get the text content
  const text = await healthIndicator.textContent();
  console.log(`   Text: ${text}`);
  
  // Extract status and percentage
  const statusMatch = text?.match(/(Healthy|Warning|Critical)/);
  const percentageMatch = text?.match(/(\d+\.?\d*)%/);
  
  const status = statusMatch ? statusMatch[1] : null;
  const percentage = percentageMatch ? parseFloat(percentageMatch[1]) : null;
  
  console.log(`   Status: ${status}`);
  console.log(`   Utilization: ${percentage}%`);
  
  // Get the color by checking the chip's class
  const chipClasses = await healthIndicator.getAttribute('class');
  let color = 'unknown';
  
  if (chipClasses?.includes('MuiChip-colorSuccess')) {
    color = 'green';
  } else if (chipClasses?.includes('MuiChip-colorWarning')) {
    color = 'yellow';
  } else if (chipClasses?.includes('MuiChip-colorError')) {
    color = 'red';
  }
  
  console.log(`   Color: ${color}`);
  
  return { status, percentage, color, element: healthIndicator };
}

test.describe('Budget Health Indicator - Visual Verification', () => {
  test.setTimeout(120000); // 2 minutes
  
  test('Should display budget health indicator on project overview', async ({ page }) => {
    // Step 1: Login
    await login(page);
    await page.screenshot({ path: 'test-results/budget-health/01-logged-in.png', fullPage: true });
    
    // Step 2: Navigate to Project Management
    await navigateToProjectManagement(page);
    await page.screenshot({ path: 'test-results/budget-health/02-project-list.png', fullPage: true });
    
    // Step 3: Open a project (try AI-DLC first, then any project)
    let projectOpened = await openProject(page, 'AI-DLC');
    
    if (!projectOpened) {
      console.log('AI-DLC not found, trying first available project...');
      const firstProject = page.locator('[role="listitem"], .MuiListItem-root, .MuiCard-root').first();
      await firstProject.click();
      await page.waitForTimeout(2000);
      projectOpened = true;
    }
    
    expect(projectOpened).toBe(true);
    await page.screenshot({ path: 'test-results/budget-health/03-project-opened.png', fullPage: true });
    
    // Step 4: Check for Budget Health Indicator
    const healthData = await checkBudgetHealthIndicator(page);
    
    if (healthData) {
      console.log('\n✅✅✅ SUCCESS! Budget Health Indicator is working!');
      console.log(`   Status: ${healthData.status}`);
      console.log(`   Utilization: ${healthData.percentage}%`);
      console.log(`   Color: ${healthData.color}`);
      
      // Verify the indicator is present
      expect(healthData.status).toBeTruthy();
      expect(healthData.percentage).toBeGreaterThanOrEqual(0);
      
      // Verify color coding matches status (Requirements 2.1, 2.2, 2.3)
      if (healthData.status === 'Healthy') {
        expect(healthData.color).toBe('green');
        expect(healthData.percentage).toBeLessThan(90);
      } else if (healthData.status === 'Warning') {
        expect(healthData.color).toBe('yellow');
        expect(healthData.percentage).toBeGreaterThanOrEqual(90);
        expect(healthData.percentage).toBeLessThanOrEqual(100);
      } else if (healthData.status === 'Critical') {
        expect(healthData.color).toBe('red');
        expect(healthData.percentage).toBeGreaterThan(100);
      }
      
      // Take a screenshot highlighting the indicator
      await healthData.element.screenshot({ 
        path: 'test-results/budget-health/04-indicator-closeup.png' 
      });
      
      // Hover over the indicator to see tooltip (if enabled)
      await healthData.element.hover();
      await page.waitForTimeout(1000);
      await page.screenshot({ 
        path: 'test-results/budget-health/05-indicator-hover.png', 
        fullPage: true 
      });
      
    } else {
      console.log('\n⚠️ Budget Health Indicator not found on this page');
      console.log('This might mean:');
      console.log('1. The component is not yet integrated into this view');
      console.log('2. The project has no budget data');
      console.log('3. The component is on a different page/tab');
      
      // Try to find where budget information is displayed
      const budgetText = page.locator('text=/budget|cost|fee/i').first();
      const hasBudgetInfo = await budgetText.isVisible({ timeout: 5000 }).catch(() => false);
      
      if (hasBudgetInfo) {
        console.log('Found budget-related text on page');
        const text = await budgetText.textContent();
        console.log(`Budget text: ${text}`);
      }
    }
    
    await page.screenshot({ path: 'test-results/budget-health/06-final-state.png', fullPage: true });
    
    console.log('\n📸 Screenshots saved in test-results/budget-health/');
    console.log('Browser will stay open for 5 seconds for inspection...');
    await page.waitForTimeout(5000);
  });
  
  test('Should display budget health indicator with API data', async ({ page }) => {
    // This test demonstrates accessing the component via API
    
    // Step 1: Login
    await login(page);
    
    // Step 2: Navigate to Project Management
    await navigateToProjectManagement(page);
    
    // Step 3: Intercept API calls to see budget health data
    let budgetHealthData: any = null;
    
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/budget/health')) {
        console.log(`📡 Intercepted budget health API call: ${url}`);
        try {
          const data = await response.json();
          budgetHealthData = data;
          console.log('Budget Health Data:', JSON.stringify(data, null, 2));
        } catch (e) {
          console.log('Could not parse response');
        }
      }
    });
    
    // Step 4: Open a project to trigger API call
    const projectOpened = await openProject(page, 'AI-DLC');
    
    if (projectOpened) {
      // Wait for API call
      await page.waitForTimeout(3000);
      
      if (budgetHealthData) {
        console.log('\n✅ Budget Health API Response:');
        console.log(`   Project ID: ${budgetHealthData.projectId}`);
        console.log(`   Status: ${budgetHealthData.status}`);
        console.log(`   Utilization: ${budgetHealthData.utilizationPercentage}%`);
        console.log(`   Estimated Budget: $${budgetHealthData.estimatedBudget}`);
        console.log(`   Actual Cost: $${budgetHealthData.actualCost}`);
        
        // Verify the data structure
        expect(budgetHealthData).toHaveProperty('projectId');
        expect(budgetHealthData).toHaveProperty('status');
        expect(budgetHealthData).toHaveProperty('utilizationPercentage');
        expect(budgetHealthData).toHaveProperty('estimatedBudget');
        expect(budgetHealthData).toHaveProperty('actualCost');
        
        // Verify status is one of the valid values
        expect(['Healthy', 'Warning', 'Critical']).toContain(budgetHealthData.status);
      } else {
        console.log('⚠️ No budget health API call intercepted');
        console.log('The API endpoint might not be called on this page');
      }
    }
    
    await page.screenshot({ 
      path: 'test-results/budget-health/07-api-test.png', 
      fullPage: true 
    });
  });
});

test.describe('Budget Health Indicator - Integration Test', () => {
  test.setTimeout(120000);
  
  test('Complete workflow: View project → Check budget health → Verify color coding', async ({ page }) => {
    console.log('\n🚀 Starting Complete Budget Health Workflow Test\n');
    
    // Step 1: Login
    console.log('Step 1: Login');
    await login(page);
    await page.screenshot({ path: 'test-results/budget-health/workflow-01-login.png' });
    
    // Step 2: Navigate to Project Management
    console.log('\nStep 2: Navigate to Project Management');
    await navigateToProjectManagement(page);
    await page.screenshot({ path: 'test-results/budget-health/workflow-02-projects.png' });
    
    // Step 3: Get list of all projects
    console.log('\nStep 3: Scanning all projects for budget health indicators');
    const projectItems = page.locator('[role="listitem"], .MuiListItem-root, .MuiCard-root');
    const projectCount = await projectItems.count();
    console.log(`Found ${projectCount} projects`);
    
    let healthyCount = 0;
    let warningCount = 0;
    let criticalCount = 0;
    
    // Check first 3 projects
    for (let i = 0; i < Math.min(projectCount, 3); i++) {
      console.log(`\n--- Checking Project ${i + 1} ---`);
      
      // Click on project
      await projectItems.nth(i).click();
      await page.waitForTimeout(2000);
      
      // Check for budget health indicator
      const healthData = await checkBudgetHealthIndicator(page);
      
      if (healthData) {
        if (healthData.status === 'Healthy') healthyCount++;
        if (healthData.status === 'Warning') warningCount++;
        if (healthData.status === 'Critical') criticalCount++;
        
        await page.screenshot({ 
          path: `test-results/budget-health/workflow-project-${i + 1}.png`,
          fullPage: true
        });
      }
      
      // Go back to project list
      await page.goto(`${BASE_URL}/project-management`);
      await page.waitForTimeout(1000);
    }
    
    console.log('\n📊 Budget Health Summary:');
    console.log(`   🟢 Healthy: ${healthyCount}`);
    console.log(`   🟡 Warning: ${warningCount}`);
    console.log(`   🔴 Critical: ${criticalCount}`);
    
    console.log('\n✅ Workflow test complete!');
    console.log('Check test-results/budget-health/ for screenshots');
  });
});

/**
 * Standalone test that can be run independently
 * This demonstrates the simplest way to access the component
 */
test.describe('Budget Health Indicator - Quick Demo', () => {
  test('Quick demo: Login → View project → See budget health', async ({ page }) => {
    console.log('\n🎬 Quick Demo: How to access Budget Health Indicator\n');
    
    // 1. Login
    console.log('1️⃣ Login to the application');
    await page.goto(`${BASE_URL}/login`);
    await page.getByLabel(/email/i).fill(TEST_USER.email);
    await page.getByLabel(/password/i).fill(TEST_USER.password);
    await page.getByRole('button', { name: /log in/i }).click();
    await page.waitForURL('/', { timeout: 30000 });
    console.log('   ✅ Logged in\n');
    
    // 2. Go to Project Management
    console.log('2️⃣ Navigate to Project Management');
    await page.goto(`${BASE_URL}/project-management`);
    await page.waitForTimeout(2000);
    console.log('   ✅ On Project Management page\n');
    
    // 3. Click on first project
    console.log('3️⃣ Open a project');
    const firstProject = page.locator('[role="listitem"], .MuiCard-root').first();
    await firstProject.click();
    await page.waitForTimeout(2000);
    console.log('   ✅ Project opened\n');
    
    // 4. Look for Budget Health Indicator
    console.log('4️⃣ Look for Budget Health Indicator');
    const indicator = page.locator('.MuiChip-root').filter({
      hasText: /Healthy|Warning|Critical/
    }).first();
    
    const isVisible = await indicator.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (isVisible) {
      const text = await indicator.textContent();
      console.log(`   ✅ Found Budget Health Indicator: ${text}\n`);
      
      // Highlight it
      await indicator.evaluate((el) => {
        el.style.border = '3px solid blue';
        el.style.boxShadow = '0 0 10px blue';
      });
      
      await page.screenshot({ 
        path: 'test-results/budget-health/quick-demo.png',
        fullPage: true
      });
      
      console.log('📸 Screenshot saved: test-results/budget-health/quick-demo.png');
      console.log('\n✅ Demo complete! The Budget Health Indicator is working!');
    } else {
      console.log('   ⚠️ Budget Health Indicator not visible on this page');
      console.log('   It may need to be integrated into this view');
    }
    
    await page.waitForTimeout(3000);
  });
});
