# E2E Testing Quick Reference Guide

## Correct Routing Paths

### ✅ Use These Paths:
```typescript
'/project-management'                          // Project list
'/project-management/project'                  // Project details
'/project-management/project/overview'         // Overview tab
'/project-management/project/forms'            // Forms tab
'/project-management/project/documents'        // Documents tab
'/project-management/project/timeline'         // Timeline tab
'/project-management/project/budget-history'   // Budget history tab
```

### ❌ Don't Use These:
```typescript
'/project-management/projects/1/overview'      // Wrong: plural + ID
'/projects/1/overview'                         // Wrong: missing base
'/project-management/projects/1'               // Wrong: plural + ID
```

## Navigation Template

```typescript
import { test, expect, Page } from '@playwright/test';

// 1. Login helper
async function login(page: Page) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill('test@example.com');
  await page.getByLabel(/password/i).fill('Admin@123');
  await page.getByRole('button', { name: /log in/i }).click();
  await page.waitForURL('/');
}

// 2. Select project helper
async function selectFirstProject(page: Page): Promise<string | null> {
  await page.goto('/project-management');
  await page.waitForLoadState('networkidle');
  
  const projectItems = page.locator('[role="listitem"]');
  const count = await projectItems.count();
  
  if (count > 0) {
    await projectItems.first().click();
    await page.waitForLoadState('networkidle');
    return await page.evaluate(() => sessionStorage.getItem('projectId'));
  }
  return null;
}

// 3. Navigate to project page helper
async function navigateToProjectPage(page: Page, projectId: string, tab: string = 'overview') {
  // Set project ID in sessionStorage
  await page.evaluate((id) => {
    sessionStorage.setItem('projectId', id);
  }, projectId);
  
  // Navigate to the tab
  await page.goto(`/project-management/project/${tab}`);
  await page.waitForLoadState('networkidle');
}

// 4. Your test
test('My test', async ({ page }) => {
  await login(page);
  const projectId = await selectFirstProject(page);
  await navigateToProjectPage(page, projectId!, 'overview');
  
  // Your test logic here
});
```

## Common Selectors

```typescript
// Update Budget Button
'[data-testid="update-budget-button"]'

// Form Fields
page.getByLabel(/estimated project cost/i)
page.getByLabel(/estimated project fee/i)
page.getByLabel(/reason/i)

// Submit Buttons
page.getByRole('button', { name: /update|save|submit/i })

// Project List Items
page.locator('[role="listitem"]')
```

## Debugging Tips

```typescript
// 1. Take screenshots
await page.screenshot({ path: 'debug.png', fullPage: true });

// 2. Log page content
const content = await page.textContent('body');
console.log(content);

// 3. List all buttons
const buttons = await page.locator('button').all();
for (const button of buttons) {
  const text = await button.textContent();
  console.log(`Button: "${text}"`);
}

// 4. Check sessionStorage
const projectId = await page.evaluate(() => sessionStorage.getItem('projectId'));
console.log(`Project ID: ${projectId}`);

// 5. Run with browser visible
// npx playwright test --headed
```

## Key Points

1. **Project ID is in sessionStorage, NOT in URL**
2. **Always set sessionStorage before navigating to project pages**
3. **Use singular "project" not plural "projects"**
4. **Wait for networkidle after navigation**
5. **Mimic real user behavior (click from list)**

## Quick Commands

```bash
# Run single test with browser visible
npx playwright test my-test.spec.ts --headed

# Run with specific browser
npx playwright test --project=chromium

# Debug mode
npx playwright test --debug

# Generate test
npx playwright codegen http://localhost:5176
```
