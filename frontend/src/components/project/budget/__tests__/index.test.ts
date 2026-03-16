import { describe, it, expect } from 'vitest';
import * as exportObj from '../index';

describe('components/project/budget/index', () => {
  it('exports expected modules without crashing', () => {
    expect(exportObj).toBeDefined();
    // Assuming it exports BudgetHealthIndicator, VarianceIndicator, BudgetChangeTimeline, ProjectBudgetHistory, BudgetUpdateDialog
    expect(exportObj.BudgetHealthIndicator).toBeDefined();
    expect(exportObj.VarianceIndicator).toBeDefined();
    expect(exportObj.BudgetChangeTimeline).toBeDefined();
    expect(exportObj.ProjectBudgetHistory).toBeDefined();
    expect(exportObj.BudgetUpdateDialog).toBeDefined();
  });
});
