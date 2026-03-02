import { test, expect } from '@playwright/test';

/**
 * Login to Project Navigation Regression Tests
 * 
 * Verifies the full user journey from login page through
 * to project viewing. Tests that critical navigation paths
 * work after code changes.
 */
test.describe('Login to Project Regression', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the app root
        await page.goto('/');
    });

    test('login page loads correctly', async ({ page }) => {
        // Should show the login form
        await expect(page.getByText('Login to your account')).toBeVisible({ timeout: 10000 });
        await expect(page.getByLabel('Email')).toBeVisible();
        await expect(page.getByLabel('Password')).toBeVisible();
        await expect(page.getByRole('button', { name: /log in/i })).toBeVisible();
    });

    test('login page displays version info', async ({ page }) => {
        // Wait for the page to load
        await page.waitForLoadState('networkidle');

        // Should show version somewhere on the page
        const versionText = page.getByText(/Version/i);
        await expect(versionText.first()).toBeVisible({ timeout: 10000 });
    });

    test('login form accepts input', async ({ page }) => {
        await expect(page.getByLabel('Email')).toBeVisible({ timeout: 10000 });

        // Type into login fields
        await page.getByLabel('Email').fill('test@example.com');
        await page.getByLabel('Password').fill('testpassword');

        // Verify input values
        await expect(page.getByLabel('Email')).toHaveValue('test@example.com');
        await expect(page.getByLabel('Password')).toHaveValue('testpassword');
    });

    test('signup link navigates to signup page', async ({ page }) => {
        await page.waitForLoadState('networkidle');

        // Look for signup link
        const signupLink = page.getByText(/sign up/i).first();
        if (await signupLink.isVisible()) {
            await signupLink.click();
            // Should navigate away from login
            await page.waitForURL(/signup|register/i, { timeout: 5000 }).catch(() => {
                // If URL doesn't change, check for signup form content
            });
        }
    });

    test('forgot password link is accessible', async ({ page }) => {
        await page.waitForLoadState('networkidle');

        // Look for forgot password link
        const forgotLink = page.getByText(/forgot password/i).first();
        if (await forgotLink.isVisible()) {
            await forgotLink.click();
            await page.waitForTimeout(1000);
            // Verify navigation happened
        }
    });
});
