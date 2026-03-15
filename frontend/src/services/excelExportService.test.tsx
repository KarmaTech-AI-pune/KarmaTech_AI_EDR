import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the XLSX library
vi.mock('xlsx', () => ({
  utils: {
    book_new: vi.fn(() => ({})),
    aoa_to_sheet: vi.fn(() => ({})),
    book_append_sheet: vi.fn(),
  },
  write: vi.fn(() => new Uint8Array([1, 2, 3])),
}));

// Mock the dateUtils module
vi.mock('../utils/dateUtils', () => ({
  getMonthName: vi.fn((month: number) => {
    const months = ['', 'January', 'February', 'March', 'April', 'May', 'June',
                     'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month] || `Month${month}`;
  }),
}));

import { exportToExcel } from './excelExportService';
import type { MonthlyReport } from './monthlyProgressApi';

describe('excelExportService', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const createMinimalReport = (overrides: Partial<MonthlyReport> = {}): MonthlyReport => ({
    month: 3,
    year: 2023,
    ...overrides,
  } as MonthlyReport);

  it('exports minimal report data successfully', () => {
    const result = exportToExcel(createMinimalReport());
    expect(result).toBeInstanceOf(Blob);
  });

  it('includes financial and contract details when present', () => {
    const report = createMinimalReport({
      financialAndContractDetails: { net: 1000, serviceTax: 18 } as any,
    });
    const result = exportToExcel(report);
    expect(result).toBeInstanceOf(Blob);
  });

  it('includes actual cost when present', () => {
    const report = createMinimalReport({
      actualCost: { priorCumulativeOdc: 500 } as any,
    });
    const result = exportToExcel(report);
    expect(result).toBeInstanceOf(Blob);
  });

  it('includes ctcAndEac when present', () => {
    const report = createMinimalReport({
      ctcAndEac: { ctcODC: 100 } as any,
    });
    const result = exportToExcel(report);
    expect(result).toBeInstanceOf(Blob);
  });

  it('includes schedule when present', () => {
    const report = createMinimalReport({
      schedule: { dateOfIssueWOLOI: '2023-01-01' } as any,
    });
    const result = exportToExcel(report);
    expect(result).toBeInstanceOf(Blob);
  });

  it('includes budget table with sub-sections', () => {
    const report = createMinimalReport({
      budgetTable: {
        originalBudget: { cost: 1000 },
        currentBudgetInMIS: { revenueFee: 500 },
        percentCompleteOnCosts: { cost: 50 },
      } as any,
    });
    const result = exportToExcel(report);
    expect(result).toBeInstanceOf(Blob);
  });

  it('includes manpower planning with data', () => {
    const report = createMinimalReport({
      manpowerPlanning: {
        manpower: [{ workAssignment: 'Task1', assignee: 'John', planned: 40 }],
      } as any,
    });
    const result = exportToExcel(report);
    expect(result).toBeInstanceOf(Blob);
  });

  it('includes progress deliverable', () => {
    const report = createMinimalReport({
      progressDeliverable: {
        deliverables: [{ name: 'D1', status: 'In Progress' }],
      } as any,
    });
    const result = exportToExcel(report);
    expect(result).toBeInstanceOf(Blob);
  });

  it('includes arrays: changeOrder, programmeSchedule, earlyWarnings, actions', () => {
    const report = createMinimalReport({
      changeOrder: [{ id: 1, description: 'CO1' }] as any,
      programmeSchedule: [{ activity: 'A1' }] as any,
      earlyWarnings: [{ risk: 'R1' }] as any,
      lastMonthActions: [{ action: 'LM1' }] as any,
      currentMonthActions: [{ action: 'CM1' }] as any,
    });
    const result = exportToExcel(report);
    expect(result).toBeInstanceOf(Blob);
  });

  it('throws when reportData is null', () => {
    expect(() => exportToExcel(null as any)).toThrow();
  });
});
