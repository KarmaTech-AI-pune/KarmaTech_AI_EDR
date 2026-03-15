import { describe, it, expect } from 'vitest';
import * as FormExports from './index';

describe('forms/index', () => {
  it('should export all expected form components', () => {
    expect(FormExports.WorkBreakdownStructureForm).toBeDefined();
    expect(FormExports.JobStartForm).toBeDefined();
    expect(FormExports.InputRegisterForm).toBeDefined();
    expect(FormExports.CorrespondenceForm).toBeDefined();
    expect(FormExports.CheckReviewForm).toBeDefined();
    expect(FormExports.ChangeControlForm).toBeDefined();
    expect(FormExports.MonthlyProgressForm).toBeDefined();
    expect(FormExports.ProjectClosureForm).toBeDefined();
    expect(FormExports.FormsOverview).toBeDefined();
    expect(FormExports.MonthlyReports).toBeDefined();
  });
});
