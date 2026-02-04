# 🚀 Quick Start: E2E Testing with Playwright

## TL;DR - Get Started in 5 Minutes

### Option 1: Automated Setup (Recommended)

```powershell
# Run from frontend directory
.\setup-e2e.ps1
```

### Option 2: Manual Setup

```bash
# 1. Install Playwright
npm install -D @playwright/test

# 2. Install browsers
npx playwright install

# 3. Copy example config
copy playwright.config.example.ts playwright.config.ts

# 4. Add scripts to package.json (see below)

# 5. Run tests
npm run test:e2e
```

## 📝 Add These Scripts to package.json

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report"
  }
}
```

## 📁 Project Structure

```
frontend/
├── e2e/
│   ├── fixtures/
│   │   └── auth.fixture.ts          # Authentication setup
│   ├── pages/
│   │   ├── login.page.ts            # Login page object
│   │   └── project-budget.page.ts   # Budget page object
│   ├── tests/
│   │   ├── budget-update.spec.ts    # Budget update tests
│   │   ├── budget-history.spec.ts   # History display tests
│   │   └── budget-workflow.spec.ts  # Complete workflow tests
│   └── utils/
│       └── test-helpers.ts          # Shared utilities
├── playwright.config.ts              # Playwright configuration
└── PLAYWRIGHT_SETUP.md              # Detailed setup guide
```

## 🎯 Your E2E Test Scenarios (Task 9.5)

Based on your requirements, you need to test:

### 1. Complete User Workflow
- ✅ Login → Navigate to Project → Update Budget → View History

### 2. Budget Update with Reason
- ✅ Update budget with reason → Verify history created → Verify timeline displays

### 3. Budget Update without Reason
- ✅ Update budget without reason → Verify optional field works

### 4. Filter History by Cost Changes
- ✅ Filter by cost only → Verify correct records shown

### 5. Filter History by Fee Changes
- ✅ Filter by fee only → Verify correct records shown

### 6. Cross-Component Integration
- ✅ Test API integration → Timeline updates → Error handling

### 7. Browser Compatibility
- ✅ Chrome, Firefox, Safari (webkit)

## 🏃 Running Tests

### Run all tests
```bash
npm run test:e2e
```

### Run in UI mode (interactive, recommended for development)
```bash
npm run test:e2e:ui
```

### Run in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Run specific test file
```bash
npx playwright test budget-update.spec.ts
```

### Run in specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Debug a test
```bash
npm run test:e2e:debug
```

## 📊 View Test Results

After running tests:

```bash
npm run test:e2e:report
```

This opens an HTML report showing:
- ✅ Test results (passed/failed)
- 📸 Screenshots of failures
- 🎬 Videos of test runs
- 🔍 Traces for debugging
- ⏱️ Performance metrics

## 🎨 Example Test

```typescript
import { test, expect } from '@playwright/test';

test('update budget with reason', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: 'Login' }).click();

  // Navigate to project
  await page.goto('/projects/1');

  // Update budget
  await page.getByRole('button', { name: /update budget/i }).click();
  await page.getByLabel(/cost/i).fill('150000');
  await page.getByLabel(/reason/i).fill('Q4 adjustment');
  await page.getByRole('button', { name: /save/i }).click();

  // Verify success
  await expect(page.getByText(/success/i)).toBeVisible();

  // View history
  await page.getByRole('tab', { name: /history/i }).click();
  await expect(page.getByText('150,000')).toBeVisible();
  await expect(page.getByText('Q4 adjustment')).toBeVisible();
});
```

## 🔧 Configuration Tips

### Adjust Timeouts
```typescript
// playwright.config.ts
use: {
  actionTimeout: 10000,      // 10 seconds for actions
  navigationTimeout: 30000,  // 30 seconds for navigation
}
```

### Run Tests in Parallel
```typescript
// playwright.config.ts
workers: 4,  // Run 4 tests in parallel
```

### Disable Specific Browsers
```typescript
// playwright.config.ts
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },  // Disabled
]
```

## 📝 Generate E2E Test Report (Task 9.5)

After running tests, create the report:

```bash
# Run tests
npm run test:e2e

# View HTML report
npm run test:e2e:report

# Results are in:
# - playwright-report/index.html (HTML report)
# - test-results/results.json (JSON results)
# - test-results/junit.xml (JUnit XML)
```

Then create `e2e-workflow-test-report.md` documenting:
- ✅ Test execution results
- ✅ Screenshots of workflows
- ✅ Browser compatibility results
- ✅ Performance metrics
- ✅ Issues found and resolutions

## 🆘 Troubleshooting

### Tests timeout
```typescript
// Increase timeout in test
test.setTimeout(60000); // 60 seconds
```

### Element not found
```typescript
// Wait for element
await page.waitForSelector('[data-testid="element"]');

// Or use better selector
await page.getByRole('button', { name: 'Submit' });
```

### Flaky tests
```typescript
// Wait for network to be idle
await page.waitForLoadState('networkidle');

// Or wait for specific API call
await page.waitForResponse(response => 
  response.url().includes('/api/projects')
);
```

## 📚 Resources

- **Detailed Setup Guide**: `PLAYWRIGHT_SETUP.md`
- **Playwright Docs**: https://playwright.dev/
- **Best Practices**: https://playwright.dev/docs/best-practices
- **API Reference**: https://playwright.dev/docs/api/class-playwright

## ✅ Checklist for Task 9.5

- [ ] Install Playwright (`npm install -D @playwright/test`)
- [ ] Install browsers (`npx playwright install`)
- [ ] Copy `playwright.config.example.ts` to `playwright.config.ts`
- [ ] Add test scripts to `package.json`
- [ ] Create page objects in `e2e/pages/`
- [ ] Write tests in `e2e/tests/`
- [ ] Run tests (`npm run test:e2e`)
- [ ] Generate HTML report (`npm run test:e2e:report`)
- [ ] Create `e2e-workflow-test-report.md`
- [ ] Mark Task 9.5 as complete in `tasks.md`

## 🎉 You're Ready!

Start with the automated setup script or follow the manual steps above. The detailed guide in `PLAYWRIGHT_SETUP.md` has everything you need including complete code examples.

**Estimated Time**: 2-4 hours to set up and write all E2E tests for Task 9.5

Good luck! 🚀
