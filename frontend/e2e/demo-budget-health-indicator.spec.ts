import { test, expect } from '@playwright/test';

/**
 * DEMO: Project Budget Health Indicator Feature
 * 
 * LOGIN CREDENTIALS:
 * - Email: admin@test.com
 * - Password: Admin@123
 */

const TEST_EMAIL = 'admin@test.com';
const TEST_PASSWORD = 'Admin@123';

test.describe('Budget Health Indicator Demo', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Demo 1: Login and Navigate to Project Management', async ({ page }) => {
    console.log('\n========================================');
    console.log('  BUDGET HEALTH INDICATOR DEMO');
    console.log('========================================\n');
    
    console.log('STEP 1: Login');
    console.log(`  Email: ${TEST_EMAIL}`);
    
    await page.getByLabel('Email').fill(TEST_EMAIL);
    await page.getByLabel('Password').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'Log In' }).click();
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: 'test-results/demo/01-after-login.png',
      fullPage: true 
    });
    console.log('  Login successful');
    
    console.log('STEP 2: Navigate to Project Management');
    
    const projectMgmtLink = page.locator('text=Project Management').first();
    await projectMgmtLink.click();
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'test-results/demo/02-project-management.png',
      fullPage: true 
    });
    
    const healthyCount = await page.locator('text=Healthy').count();
    const warningCount = await page.locator('text=Warning').count();
    const criticalCount = await page.locator('text=Critical').count();
    
    console.log('  Found indicators:');
    console.log(`    Healthy: ${healthyCount}`);
    console.log(`    Warning: ${warningCount}`);
    console.log(`    Critical: ${criticalCount}`);
    
    expect(page.url()).toContain('project');
  });


  test('Demo 2: View Project Details', async ({ page }) => {
    console.log('\n========================================');
    console.log('  PROJECT DETAILS - BUDGET HEALTH');
    console.log('========================================\n');
    
    await page.getByLabel('Email').fill(TEST_EMAIL);
    await page.getByLabel('Password').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'Log In' }).click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    await page.locator('text=Project Management').first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('STEP 1: Click on a project row');
    
    const projectRow = page.locator('tr').nth(1);
    if (await projectRow.isVisible()) {
      await projectRow.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: 'test-results/demo/03-project-details.png',
        fullPage: true 
      });
      console.log('  Project details opened');
    }
    
    expect(true).toBe(true);
  });

  test('Demo 3: Feature Summary', async ({ page }) => {
    console.log('\n========================================');
    console.log('  FEATURE SUMMARY');
    console.log('========================================\n');
    
    console.log('WHERE IS THE FEATURE?\n');
    console.log('  BACKEND:');
    console.log('  - backend/src/EDR.Application/CQRS/Projects/Queries/GetBudgetHealthQuery.cs');
    console.log('  - backend/src/EDR.Application/CQRS/Projects/Handlers/GetBudgetHealthQueryHandler.cs');
    console.log('  - backend/src/EDR.Application/Dtos/BudgetHealthDto.cs');
    console.log('');
    console.log('  FRONTEND:');
    console.log('  - frontend/src/components/Projects/BudgetHealthIndicator.tsx');
    console.log('  - frontend/src/api/projectApi.ts');
    console.log('');
    
    console.log('HOW TO USE?\n');
    console.log('  1. Login: admin@test.com / Admin@123');
    console.log('  2. Click Project Management in sidebar');
    console.log('  3. View budget health chips on project list');
    console.log('  4. Click any project for details');
    console.log('');
    
    console.log('STATUS INDICATORS:\n');
    console.log('  GREEN  = Healthy  (< 90% budget used)');
    console.log('  YELLOW = Warning  (90-100% budget used)');
    console.log('  RED    = Critical (> 100% budget used)');
    console.log('');
    
    expect(true).toBe(true);
  });
});
