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
    // Update these selectors based on your actual component structure
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
    await expect(this.costInput).toBeVisible({ timeout: 5000 });
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
    await expect(this.timeline).toBeVisible({ timeout: 5000 });
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
