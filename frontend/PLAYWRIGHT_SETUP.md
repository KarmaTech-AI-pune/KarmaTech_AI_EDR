# Playwright E2E Testing Setup Guide

## Step 1: Install Playwright

Run the following command in the `frontend` directory:

```bash
npm init playwright@latest
```

When prompted, choose:
- ✅ TypeScript (recommended)
- ✅ tests folder: `e2e` (or `tests`)
- ✅ Add GitHub Actions workflow: No (optional)
- ✅ Install Playwright browsers: Yes

**Alternative manual installation:**

```bash
npm install -D @playwright/test
npx playwright install
```

## Step 2: Update package.json Scripts

Add these scripts to your `package.json`:

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

## Step 3: Create Playwright Configuration

Create `playwright.config.ts` in the frontend root:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Step 4: Create E2E Test Directory Structure

```
frontend/
├── e2e/
│   ├── fixtures/
│   │   └── auth.fixture.ts
│   ├── pages/
│   │   ├── login.page.ts
│   │   └── project-budget.page.ts
│   ├── tests/
│   │   ├── budget-update.spec.ts
│   │   ├── budget-history.spec.ts
│   │   └── budget-workflow.spec.ts
│   └── utils/
│       └── test-helpers.ts
└── playwright.config.ts
```

## Step 5: Create Page Object Models (POM)

### Login Page Object

Create `e2e/pages/login.page.ts`:

```typescript
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.page.waitForURL('/dashboard');
  }
}
```

### Project Budget Page Object

Create `e2e/pages/project-budget.page.ts`:

```typescript
import { Page, Locator, expect } from '@playwright/test';

export class ProjectBudgetPage {
  readonly page: Page;
  readonly updateBudgetButton: Locator;
  readonly budgetHistoryTab: Locator;
  readonly costInput: Locator;
  readonly feeInput: Locator;
  readonly reasonInput: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly successMessage: Locator;
  readonly timeline: Locator;

  constructor(page: Page) {
    this.page = page;
    this.updateBudgetButton = page.getByRole('button', { name: /update budget/i });
    this.budgetHistoryTab = page.getByRole('tab', { name: /budget history/i });
    this.costInput = page.getByLabel(/estimated project cost/i);
    this.feeInput = page.getByLabel(/estimated project fee/i);
    this.reasonInput = page.getByLabel(/reason/i);
    this.saveButton = page.getByRole('button', { name: /save/i });
    this.cancelButton = page.getByRole('button', { name: /cancel/i });
    this.successMessage = page.getByText(/budget updated successfully/i);
    this.timeline = page.locator('[data-testid="budget-timeline"]');
  }

  async gotoProject(projectId: number) {
    await this.page.goto(`/projects/${projectId}`);
  }

  async openBudgetUpdateDialog() {
    await this.updateBudgetButton.click();
    await expect(this.costInput).toBeVisible();
  }

  async updateBudget(cost?: number, fee?: number, reason?: string) {
    if (cost !== undefined) {
      await this.costInput.clear();
      await this.costInput.fill(cost.toString());
    }
    if (fee !== undefined) {
      await this.feeInput.clear();
      await this.feeInput.fill(fee.toString());
    }
    if (reason) {
      await this.reasonInput.fill(reason);
    }
    await this.saveButton.click();
  }

  async viewBudgetHistory() {
    await this.budgetHistoryTab.click();
    await expect(this.timeline).toBeVisible();
  }

  async getLatestHistoryEntry() {
    return this.timeline.locator('[data-testid="timeline-item"]').first();
  }

  async filterByFieldType(type: 'cost' | 'fee' | 'all') {
    const filterSelect = this.page.getByLabel(/filter by/i);
    await filterSelect.click();
    await this.page.getByRole('option', { name: new RegExp(type, 'i') }).click();
  }
}
```

## Step 6: Create Authentication Fixture

Create `e2e/fixtures/auth.fixture.ts`:

```typescript
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

type AuthFixtures = {
  authenticatedPage: any;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Login before each test
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('test@example.com', 'password123');
    
    // Use the authenticated page
    await use(page);
  },
});

export { expect } from '@playwright/test';
```

## Step 7: Create E2E Test Files

### Budget Update Test

Create `e2e/tests/budget-update.spec.ts`:

```typescript
import { test, expect } from '../fixtures/auth.fixture';
import { ProjectBudgetPage } from '../pages/project-budget.page';

test.describe('Budget Update', () => {
  let budgetPage: ProjectBudgetPage;

  test.beforeEach(async ({ authenticatedPage }) => {
    budgetPage = new ProjectBudgetPage(authenticatedPage);
    await budgetPage.gotoProject(1);
  });

  test('should update budget with reason and create history record', async () => {
    // Open budget update dialog
    await budgetPage.openBudgetUpdateDialog();

    // Update budget
    await budgetPage.updateBudget(150000, undefined, 'Q4 budget adjustment');

    // Verify success message
    await expect(budgetPage.successMessage).toBeVisible();

    // View history
    await budgetPage.viewBudgetHistory();

    // Verify history entry
    const latestEntry = await budgetPage.getLatestHistoryEntry();
    await expect(latestEntry).toContainText('150,000');
    await expect(latestEntry).toContainText('Q4 budget adjustment');
  });

  test('should update budget without reason', async () => {
    await budgetPage.openBudgetUpdateDialog();
    await budgetPage.updateBudget(undefined, 20000);
    await expect(budgetPage.successMessage).toBeVisible();
  });

  test('should show validation error for invalid input', async () => {
    await budgetPage.openBudgetUpdateDialog();
    await budgetPage.costInput.fill('-1000');
    await budgetPage.saveButton.click();
    await expect(budgetPage.page.getByText(/must be greater than/i)).toBeVisible();
  });
});
```

### Budget History Test

Create `e2e/tests/budget-history.spec.ts`:

```typescript
import { test, expect } from '../fixtures/auth.fixture';
import { ProjectBudgetPage } from '../pages/project-budget.page';

test.describe('Budget History', () => {
  let budgetPage: ProjectBudgetPage;

  test.beforeEach(async ({ authenticatedPage }) => {
    budgetPage = new ProjectBudgetPage(authenticatedPage);
    await budgetPage.gotoProject(1);
    await budgetPage.viewBudgetHistory();
  });

  test('should display budget history in chronological order', async () => {
    const timelineItems = budgetPage.timeline.locator('[data-testid="timeline-item"]');
    const count = await timelineItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should filter history by cost changes only', async () => {
    await budgetPage.filterByFieldType('cost');
    const timelineItems = budgetPage.timeline.locator('[data-testid="timeline-item"]');
    const firstItem = timelineItems.first();
    await expect(firstItem).toContainText('Cost');
  });

  test('should filter history by fee changes only', async () => {
    await budgetPage.filterByFieldType('fee');
    const timelineItems = budgetPage.timeline.locator('[data-testid="timeline-item"]');
    const firstItem = timelineItems.first();
    await expect(firstItem).toContainText('Fee');
  });

  test('should display variance with color coding', async () => {
    const timelineItems = budgetPage.timeline.locator('[data-testid="timeline-item"]');
    const firstItem = timelineItems.first();
    
    // Check for variance indicator
    const varianceIndicator = firstItem.locator('[data-testid="variance-indicator"]');
    await expect(varianceIndicator).toBeVisible();
  });
});
```

### Complete Workflow Test

Create `e2e/tests/budget-workflow.spec.ts`:

```typescript
import { test, expect } from '../fixtures/auth.fixture';
import { ProjectBudgetPage } from '../pages/project-budget.page';

test.describe('Complete Budget Workflow', () => {
  test('should complete full budget update and history workflow', async ({ authenticatedPage }) => {
    const budgetPage = new ProjectBudgetPage(authenticatedPage);

    // Step 1: Navigate to project
    await budgetPage.gotoProject(1);
    await expect(authenticatedPage).toHaveURL(/\/projects\/1/);

    // Step 2: Update budget with reason
    await budgetPage.openBudgetUpdateDialog();
    await budgetPage.updateBudget(200000, 25000, 'Major scope change approved');
    await expect(budgetPage.successMessage).toBeVisible();

    // Step 3: View budget history
    await budgetPage.viewBudgetHistory();
    await expect(budgetPage.timeline).toBeVisible();

    // Step 4: Verify latest entry
    const latestEntry = await budgetPage.getLatestHistoryEntry();
    await expect(latestEntry).toContainText('200,000');
    await expect(latestEntry).toContainText('25,000');
    await expect(latestEntry).toContainText('Major scope change approved');

    // Step 5: Verify variance calculation
    const varianceIndicator = latestEntry.locator('[data-testid="variance-indicator"]');
    await expect(varianceIndicator).toBeVisible();

    // Step 6: Test filtering
    await budgetPage.filterByFieldType('cost');
    const costItems = budgetPage.timeline.locator('[data-testid="timeline-item"]');
    expect(await costItems.count()).toBeGreaterThan(0);
  });

  test('should handle multiple budget updates in sequence', async ({ authenticatedPage }) => {
    const budgetPage = new ProjectBudgetPage(authenticatedPage);
    await budgetPage.gotoProject(1);

    // First update
    await budgetPage.openBudgetUpdateDialog();
    await budgetPage.updateBudget(150000, undefined, 'First adjustment');
    await expect(budgetPage.successMessage).toBeVisible();

    // Second update
    await budgetPage.openBudgetUpdateDialog();
    await budgetPage.updateBudget(175000, undefined, 'Second adjustment');
    await expect(budgetPage.successMessage).toBeVisible();

    // Verify both entries in history
    await budgetPage.viewBudgetHistory();
    const timelineItems = budgetPage.timeline.locator('[data-testid="timeline-item"]');
    expect(await timelineItems.count()).toBeGreaterThanOrEqual(2);
  });
});
```

## Step 8: Run E2E Tests

### Run all tests:
```bash
npm run test:e2e
```

### Run tests in UI mode (interactive):
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser):
```bash
npm run test:e2e:headed
```

### Run tests in debug mode:
```bash
npm run test:e2e:debug
```

### Run specific test file:
```bash
npx playwright test budget-update.spec.ts
```

### Run tests in specific browser:
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### View test report:
```bash
npm run test:e2e:report
```

## Step 9: Generate E2E Test Report

After running tests, generate the report:

```bash
npx playwright show-report
```

This will open an HTML report in your browser showing:
- Test results (passed/failed)
- Screenshots of failures
- Traces for debugging
- Performance metrics

## Step 10: Add to CI/CD (Optional)

Create `.github/workflows/e2e-tests.yml`:

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install dependencies
        run: npm ci
        working-directory: ./frontend
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps
        working-directory: ./frontend
      - name: Run E2E tests
        run: npm run test:e2e
        working-directory: ./frontend
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: frontend/playwright-report/
          retention-days: 30
```

## Tips and Best Practices

### 1. Use Data Test IDs
Add `data-testid` attributes to your components for reliable selectors:

```tsx
<div data-testid="budget-timeline">
  <div data-testid="timeline-item">...</div>
</div>
```

### 2. Wait for Network Requests
```typescript
await page.waitForResponse(response => 
  response.url().includes('/api/projects') && response.status() === 200
);
```

### 3. Take Screenshots
```typescript
await page.screenshot({ path: 'screenshot.png' });
```

### 4. Use Soft Assertions
```typescript
await expect.soft(element).toBeVisible();
await expect.soft(element).toHaveText('Expected text');
```

### 5. Parallel Execution
Playwright runs tests in parallel by default. Configure workers:

```typescript
// playwright.config.ts
workers: process.env.CI ? 1 : 4
```

## Troubleshooting

### Issue: Tests timeout
**Solution:** Increase timeout in config:
```typescript
use: {
  actionTimeout: 10000,
  navigationTimeout: 30000,
}
```

### Issue: Element not found
**Solution:** Use better selectors or wait for element:
```typescript
await page.waitForSelector('[data-testid="element"]');
```

### Issue: Flaky tests
**Solution:** Add explicit waits:
```typescript
await page.waitForLoadState('networkidle');
```

## Next Steps

1. Install Playwright: `npm init playwright@latest`
2. Create page objects for your components
3. Write E2E tests for budget tracking feature
4. Run tests: `npm run test:e2e`
5. Generate report and document results
6. Complete Task 9.5 in tasks.md

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
