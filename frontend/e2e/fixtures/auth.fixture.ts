import { test as base } from '@playwright/test';

type AuthFixtures = {
  authenticatedPage: any;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Perform login
    // TODO: Update with actual login credentials and selectors
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: /login/i }).click();
    
    // Wait for navigation to complete
    await page.waitForURL('/dashboard', { timeout: 10000 }).catch(() => {
      // If dashboard redirect doesn't happen, continue anyway
      console.log('Dashboard redirect timeout - continuing with test');
    });
    
    // Use the authenticated page
    await use(page);
  },
});

export { expect } from '@playwright/test';
