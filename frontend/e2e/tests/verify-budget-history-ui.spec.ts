/**
 * Manual Verification Test for Budget History UI
 * 
 * This test follows the exact steps to verify budget history is visible:
 * 1. Login to the platform
 * 2. Navigate to Project management tab
 * 3. Select project ID 2 and edit estimated project fee
 * 4. Open the project card
 * 5. Navigate to Budget History and click the button
 * 6. Check if the changes made in budget for project 2 reflect
 */

import { test, expect, Page } from '@playwright/test';

test.describe('Budget History UI Verification', () => {
  
  test('Complete workflow: Edit budget → View in Budget History', async ({ page }) => {
    test.setTimeout(120000); // 2 minutes for manual verification
    
    // Step 1: Login to the platform
    console.log('Step 1: Logging in...');
    await page.goto('http://localhost:5176/login');
    await page.waitForLoadState('domcontentloaded');
    
    await page.getByLabel(/email/i).waitFor({ state: 'visible', timeout: 10000 });
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('Admin@123');
    await page.getByRole('button', { name: /log in/i }).click();
    
    await page.waitForURL('/', { timeout: 30000 });
    console.log('✅ Step 1 Complete: Logged in successfully');
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/01-logged-in.png', fullPage: true });
    
    // Step 2: Navigate to Project Management tab
    console.log('Step 2: Navigating to Project Management...');
    await page.goto('http://localhost:5176/project-management');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000); // Wait for projects to load
    
    console.log('✅ Step 2 Complete: On Project Management page');
    await page.screenshot({ path: 'test-results/02-project-management.png', fullPage: true });
    
    // Step 3: Find and click on AI-DLC project to open it
    console.log('Step 3: Looking for project ID 2 (AI-DLC)...');
    
    // Look for project list items
    const projectItems = page.locator('[role="listitem"], .MuiListItem-root');
    const count = await projectItems.count();
    console.log(`Found ${count} project items`);
    
    // Find and click the AI-DLC project
    let projectFound = false;
    
    for (let i = 0; i < count; i++) {
      const item = projectItems.nth(i);
      const text = await item.textContent();
      
      if (text && text.includes('AI-DLC')) {
        console.log(`Found AI-DLC project at index ${i}, clicking to open...`);
        projectFound = true;
        
        // Click on the project item itself (not edit button)
        await item.click();
        await page.waitForTimeout(3000);
        break;
      }
    }
    
    if (!projectFound) {
      console.log('❌ AI-DLC project not found! Available projects:');
      for (let i = 0; i < Math.min(count, 5); i++) {
        const text = await projectItems.nth(i).textContent();
        console.log(`  Project ${i + 1}: ${text?.substring(0, 100)}`);
      }
      throw new Error('AI-DLC project not found');
    }
    
    console.log('✅ Step 3 Complete: Opened AI-DLC project');
    console.log(`Current URL: ${page.url()}`);
    await page.screenshot({ path: 'test-results/03-project-opened.png', fullPage: true });
    
    // Step 4: On Project Overview, click the Budget Update button (pencil icon)
    console.log('Step 4: Looking for Budget Update button on Overview page...');
    
    // Wait for overview page to load
    await page.waitForTimeout(2000);
    
    // Look for the update budget button (pencil icon next to budget)
    const updateBudgetButton = page.locator('[data-testid="update-budget-button"]').or(
      page.locator('button[aria-label*="Update Budget"]')
    ).first();
    
    await updateBudgetButton.waitFor({ state: 'visible', timeout: 10000 });
    console.log('Found Update Budget button, clicking...');
    await updateBudgetButton.click();
    await page.waitForTimeout(2000);
    
    console.log('✅ Step 4 Complete: Opened Budget Update Dialog');
    await page.screenshot({ path: 'test-results/04-budget-dialog-opened.png', fullPage: true });
    
    // Step 5: Edit the Estimated Project Fee in the dialog
    console.log('Step 5: Editing Estimated Project Fee in Budget Update Dialog...');
    
    // Look for Estimated Project Fee field
    const feeField = page.getByLabel(/estimated project fee/i).first();
    await feeField.waitFor({ state: 'visible', timeout: 10000 });
    
    // Get current value
    const currentValue = await feeField.inputValue();
    console.log(`Current Estimated Project Fee: ${currentValue}`);
    
    // Set new value (add 10000 to current value)
    const newValue = (parseFloat(currentValue || '0') + 10000).toString();
    console.log(`New Estimated Project Fee: ${newValue}`);
    
    await feeField.clear();
    await feeField.fill(newValue);
    
    // Fill in the reason field
    const reasonField = page.getByLabel(/reason/i).first();
    await reasonField.waitFor({ state: 'visible', timeout: 5000 });
    await reasonField.fill('E2E Test: Verifying budget history display via Budget Update Dialog');
    console.log('Added reason for budget change');
    
    await page.screenshot({ path: 'test-results/05-fee-updated.png', fullPage: true });
    
    // Click Update button
    const updateButton = page.getByRole('button', { name: /update|save/i });
    await updateButton.click();
    console.log('Clicked Update button');
    
    // Wait for update to complete
    await page.waitForTimeout(3000);
    
    console.log('✅ Step 5 Complete: Updated Estimated Project Fee via Budget Update Dialog');
    await page.screenshot({ path: 'test-results/06-updated.png', fullPage: true });
    
    // Step 6: Navigate to Budget History tab
    console.log('Step 6: Navigating to Budget History...');
    
    // Look for Budget History in sidebar or tabs
    const budgetHistoryLink = page.locator('text=/budget.*history/i, [href*="budget-history"]').first();
    
    const linkExists = await budgetHistoryLink.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (linkExists) {
      console.log('Found Budget History link, clicking...');
      await budgetHistoryLink.click();
      await page.waitForTimeout(3000);
    } else {
      console.log('Budget History link not found, trying direct navigation...');
      // Try direct navigation
      await page.goto('http://localhost:5176/project-management/project/budget-history');
      await page.waitForTimeout(3000);
    }
    
    console.log('✅ Step 6 Complete: On Budget History page');
    console.log(`Current URL: ${page.url()}`);
    await page.screenshot({ path: 'test-results/07-budget-history-page.png', fullPage: true });
    
    // Step 7: Check if changes are visible
    console.log('Step 7: Checking if budget changes are visible...');
    
    // Wait a bit for data to load
    await page.waitForTimeout(3000);
    
    // Check for timeline component
    const timeline = page.locator('[class*="Timeline"], [class*="timeline"]').first();
    const timelineExists = await timeline.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (timelineExists) {
      console.log('✅ Timeline component is visible!');
      
      // Check for timeline items
      const timelineItems = page.locator('[class*="TimelineItem"], [class*="timeline-item"]');
      const itemCount = await timelineItems.count();
      console.log(`Found ${itemCount} timeline items`);
      
      // Get page content to check for our change
      const pageContent = await page.textContent('body');
      
      if (pageContent?.includes(newValue) || pageContent?.includes('E2E Test')) {
        console.log('✅✅✅ SUCCESS! Budget change is visible in the timeline!');
      } else {
        console.log('⚠️ Timeline exists but our specific change not found yet');
        console.log('This might be due to timing - checking what is displayed...');
        
        // Log what's actually shown
        for (let i = 0; i < Math.min(itemCount, 3); i++) {
          const itemText = await timelineItems.nth(i).textContent();
          console.log(`Timeline item ${i + 1}: ${itemText?.substring(0, 200)}`);
        }
      }
    } else {
      console.log('❌ Timeline component not found');
      
      // Check for empty state message
      const emptyMessage = page.locator('text=/no.*budget.*change|no.*change.*found/i');
      const hasEmptyMessage = await emptyMessage.isVisible({ timeout: 2000 }).catch(() => false);
      
      if (hasEmptyMessage) {
        console.log('Found empty state message - no budget changes recorded yet');
      }
      
      // Check for error message
      const errorMessage = page.locator('[role="alert"], .MuiAlert-root');
      const hasError = await errorMessage.isVisible({ timeout: 2000 }).catch(() => false);
      
      if (hasError) {
        const errorText = await errorMessage.textContent();
        console.log(`Error message: ${errorText}`);
      }
      
      // Log page content for debugging
      const bodyText = await page.textContent('body');
      console.log('Page content (first 500 chars):');
      console.log(bodyText?.substring(0, 500));
    }
    
    await page.screenshot({ path: 'test-results/08-final-state.png', fullPage: true });
    
    // Open browser console to check for errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`Browser console error: ${msg.text()}`);
      } else if (msg.text().includes('budget') || msg.text().includes('history')) {
        console.log(`Browser console: ${msg.text()}`);
      }
    });
    
    // Keep browser open for manual inspection
    console.log('\n=== TEST COMPLETE ===');
    console.log('Screenshots saved in test-results/ folder');
    console.log('Check the screenshots to see the actual UI state');
    console.log('\nBrowser will stay open for 10 seconds for manual inspection...');
    
    await page.waitForTimeout(10000);
  });
});
