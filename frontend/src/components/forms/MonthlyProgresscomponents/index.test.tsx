import { describe, it, expect } from 'vitest';
import * as MonthlyProgressComponents from './index';

describe('MonthlyProgresscomponents/index', () => {
  it('should export TabComponents', () => {
    expect(MonthlyProgressComponents.CurrentMonthActionsTab).toBeDefined();
    expect(MonthlyProgressComponents.FinancialDetailsTab).toBeDefined();
    expect(MonthlyProgressComponents.LastMonthActionsTab).toBeDefined();
    expect(MonthlyProgressComponents.ManpowerPlanningTab).toBeDefined();
    expect(MonthlyProgressComponents.ProgressReviewDeliverables).toBeDefined();
  });
});
