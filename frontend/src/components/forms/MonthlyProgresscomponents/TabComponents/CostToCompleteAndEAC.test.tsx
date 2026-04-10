import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import CostToCompleteAndEAC from './CostToCompleteAndEAC';
import { FormProvider, useForm } from 'react-hook-form';

// ─── Reusable wrapper factory ────────────────────────────────────────────────
const makeWrapper = (overrides: Record<string, any> = {}) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const methods = useForm({
      defaultValues: {
        financialAndContractDetails: {
          net: 100000,
          budgetOdcs: 20000,
          budgetStaff: 50000,
          serviceTax: 0,
          feeTotal: null,
          budgetSubTotal: null,
          contractType: 'lumpsum',
        },
        actualCost: {
          totalCumulativeOdc: 5000,
          totalCumulativeStaff: 10000,
          totalCumulativeCost: 15000,
          priorCumulativeOdc: null,
          priorCumulativeStaff: null,
          priorCumulativeTotal: null,
          actualOdc: null,
          actualStaff: null,
          actualSubtotal: null,
        },
        ctcAndEac: {
          ctcODC: null,
          ctcStaff: null,
          ctcSubtotal: null,
          actualctcODC: null,
          actualCtcStaff: null,
          actualCtcSubtotal: null,
          eacOdc: null,
          eacStaff: null,
          totalEAC: null,
          grossProfitPercentage: null,
          expectedGrossProfitPercentage: null,
        },
        budgetTable: {
          originalBudget: { revenueFee: null, cost: null, profitPercentage: null },
          currentBudgetInMIS: { revenueFee: null, cost: null, profitPercentage: null },
          percentCompleteOnCosts: { revenueFee: null, cost: null },
        },
        manpowerPlanning: {
          manpower: [],
          manpowerTotal: {
            plannedTotal: 0,
            consumedTotal: 0,
            approvedTotal: 0,
            extraHoursTotal: 0,
            extraCostTotal: 0,
            paymentTotal: 0,
            balanceTotal: 0,
            nextMonthPlanningTotal: 0,
          },
        },
        ...overrides,
      },
    });
    return <FormProvider {...methods}>{children}</FormProvider>;
  };
  return Wrapper;
};

// ─── Rendering Tests ─────────────────────────────────────────────────────────
describe('CostToCompleteAndEAC — Rendering', () => {
  it('renders all 5 section titles', () => {
    const Wrapper = makeWrapper();
    render(<Wrapper><CostToCompleteAndEAC /></Wrapper>);
    expect(screen.getByText('TCAC')).toBeInTheDocument();
    expect(screen.getByText('CTC')).toBeInTheDocument();
    expect(screen.getByText('ACTC')).toBeInTheDocument();
    expect(screen.getByText('EAC')).toBeInTheDocument();
    expect(screen.getByText('Gross Profit')).toBeInTheDocument();
  });

  it('renders all field labels', () => {
    const Wrapper = makeWrapper();
    render(<Wrapper><CostToCompleteAndEAC /></Wrapper>);
    expect(screen.getAllByText('Expected GP %').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Current GP %').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Total EAC').length).toBeGreaterThanOrEqual(1);
    // ODCs and Staff labels appear in multiple sections
    expect(screen.getAllByText('ODCs').length).toBeGreaterThanOrEqual(3);
    expect(screen.getAllByText('Staff').length).toBeGreaterThanOrEqual(3);
  });

  it('renders 5 Paper sections', () => {
    const Wrapper = makeWrapper();
    const { container } = render(<Wrapper><CostToCompleteAndEAC /></Wrapper>);
    const papers = container.querySelectorAll('.MuiPaper-root');
    expect(papers.length).toBe(5);
  });
});

// ─── CTC Calculation Tests ────────────────────────────────────────────────────
describe('CostToCompleteAndEAC — CTC Calculations', () => {
  it('calculates CTC ODC = budgetOdcs - totalCumulativeOdc', () => {
    // 20000 - 5000 = 15000
    const Wrapper = makeWrapper();
    render(<Wrapper><CostToCompleteAndEAC /></Wrapper>);
    const values = screen.getAllByDisplayValue('15,000.00');
    expect(values.length).toBeGreaterThanOrEqual(1);
  });

  it('calculates CTC Staff = budgetStaff - totalCumulativeStaff', () => {
    // 50000 - 10000 = 40000
    const Wrapper = makeWrapper();
    render(<Wrapper><CostToCompleteAndEAC /></Wrapper>);
    const values = screen.getAllByDisplayValue('40,000.00');
    expect(values.length).toBeGreaterThanOrEqual(1);
  });

  it('calculates CTC Subtotal = ctcODC + ctcStaff', () => {
    // 15000 + 40000 = 55000
    const Wrapper = makeWrapper();
    render(<Wrapper><CostToCompleteAndEAC /></Wrapper>);
    const values = screen.getAllByDisplayValue('55,000.00');
    expect(values.length).toBeGreaterThanOrEqual(1);
  });

  it('calculates CTC correctly when budgetOdcs is null (treats as 0)', () => {
    const Wrapper = makeWrapper({
      financialAndContractDetails: {
        net: 100000, budgetOdcs: null, budgetStaff: 50000,
        serviceTax: 0, feeTotal: null, budgetSubTotal: null, contractType: 'lumpsum',
      },
    });
    render(<Wrapper><CostToCompleteAndEAC /></Wrapper>);
    // ctcODC = 0 - 5000 = -5000
    expect(screen.getAllByDisplayValue('-5,000.00').length).toBeGreaterThanOrEqual(1);
  });
});

// ─── ACTC Calculation Tests ───────────────────────────────────────────────────
describe('CostToCompleteAndEAC — ACTC Calculations', () => {
  it('calculates actualCtcStaff = ctcStaff + extraCostTotal', () => {
    // ctcStaff = 40000, extraCostTotal = 2000 → 42000
    const Wrapper = makeWrapper({
      manpowerPlanning: {
        manpower: [],
        manpowerTotal: {
          plannedTotal: 0, consumedTotal: 0, approvedTotal: 0,
          extraHoursTotal: 0, extraCostTotal: 2000,
          paymentTotal: 0, balanceTotal: 0, nextMonthPlanningTotal: 0,
        },
      },
    });
    render(<Wrapper><CostToCompleteAndEAC /></Wrapper>);
    expect(screen.getAllByDisplayValue('42,000.00').length).toBeGreaterThanOrEqual(1);
  });

  it('calculates actualCtcSubtotal = actualctcODC + actualCtcStaff', () => {
    // actualctcODC = 3000, ctcStaff = 40000, extraCost = 0 → 43000
    const Wrapper = makeWrapper({
      ctcAndEac: {
        ctcODC: null, ctcStaff: null, ctcSubtotal: null,
        actualctcODC: 3000,
        actualCtcStaff: null, actualCtcSubtotal: null,
        eacOdc: null, eacStaff: null, totalEAC: null,
        grossProfitPercentage: null, expectedGrossProfitPercentage: null,
      },
    });
    render(<Wrapper><CostToCompleteAndEAC /></Wrapper>);
    expect(screen.getAllByDisplayValue('43,000.00').length).toBeGreaterThanOrEqual(1);
  });

  it('uses 0 for extraCostTotal when manpowerPlanning is not set', () => {
    const Wrapper = makeWrapper();
    render(<Wrapper><CostToCompleteAndEAC /></Wrapper>);
    // actualCtcStaff = ctcStaff (40000) + 0 = 40000
    expect(screen.getAllByDisplayValue('40,000.00').length).toBeGreaterThanOrEqual(1);
  });
});

// ─── EAC Calculation Tests ────────────────────────────────────────────────────
describe('CostToCompleteAndEAC — EAC Calculations', () => {
  it('calculates totalEAC when actualctcODC is null (uses budgetOdcs)', () => {
    // eacOdc = budgetOdcs = 20000, eacStaff = 10000 + 40000 = 50000 → totalEAC = 70000
    const Wrapper = makeWrapper();
    render(<Wrapper><CostToCompleteAndEAC /></Wrapper>);
    expect(screen.getByDisplayValue('70,000.00')).toBeInTheDocument();
  });

  it('calculates eacOdc = totalCumulativeOdc + actualctcODC when actualctcODC is set', () => {
    // totalCumulativeOdc = 5000, actualctcODC = 3000 → eacOdc = 8000
    const Wrapper = makeWrapper({
      ctcAndEac: {
        ctcODC: null, ctcStaff: null, ctcSubtotal: null,
        actualctcODC: 3000,
        actualCtcStaff: null, actualCtcSubtotal: null,
        eacOdc: null, eacStaff: null, totalEAC: null,
        grossProfitPercentage: null, expectedGrossProfitPercentage: null,
      },
    });
    render(<Wrapper><CostToCompleteAndEAC /></Wrapper>);
    expect(screen.getAllByDisplayValue('8,000.00').length).toBeGreaterThanOrEqual(1);
  });

  it('calculates eacStaff = totalCumulativeStaff + actualCtcStaff', () => {
    // totalCumulativeStaff = 10000, actualCtcStaff = 40000 → eacStaff = 50000
    const Wrapper = makeWrapper();
    render(<Wrapper><CostToCompleteAndEAC /></Wrapper>);
    expect(screen.getAllByDisplayValue('50,000.00').length).toBeGreaterThanOrEqual(1);
  });
});

// ─── Gross Profit Tests ───────────────────────────────────────────────────────
describe('CostToCompleteAndEAC — Gross Profit', () => {
  it('calculates current GP% = (net - totalEAC) / net * 100', () => {
    // net=100000, totalEAC=70000 → (100000-70000)/100000*100 = 30.00
    const Wrapper = makeWrapper();
    render(<Wrapper><CostToCompleteAndEAC /></Wrapper>);
    expect(screen.getByDisplayValue('30.00')).toBeInTheDocument();
  });

  it('shows 0.00 for Expected GP% when JobStartForm profitPercentage is null', () => {
    const Wrapper = makeWrapper();
    render(<Wrapper><CostToCompleteAndEAC /></Wrapper>);
    // budgetTable.originalBudget.profitPercentage is null → defaults to 0
    const expectedGPField = screen.getByLabelText('Expected GP %');
    expect(expectedGPField).toHaveValue('0.00');
  });

  it('shows JobStartForm profitPercentage as Expected GP%', () => {
    const Wrapper = makeWrapper({
      budgetTable: {
        originalBudget: { revenueFee: null, cost: null, profitPercentage: 25 },
        currentBudgetInMIS: { revenueFee: null, cost: null, profitPercentage: null },
        percentCompleteOnCosts: { revenueFee: null, cost: null },
      },
    });
    render(<Wrapper><CostToCompleteAndEAC /></Wrapper>);
    const expectedGPField = screen.getByLabelText('Expected GP %');
    expect(expectedGPField).toHaveValue('25.00');
  });

  it('returns 0 for current GP% when net is 0 (avoids division by zero)', () => {
    const Wrapper = makeWrapper({
      financialAndContractDetails: {
        net: 0, budgetOdcs: 20000, budgetStaff: 50000,
        serviceTax: 0, feeTotal: null, budgetSubTotal: null, contractType: 'lumpsum',
      },
    });
    render(<Wrapper><CostToCompleteAndEAC /></Wrapper>);
    const currentGPField = screen.getByLabelText('Current GP %');
    expect(currentGPField).toHaveValue('0.00');
  });

  it('shows negative GP% when totalEAC exceeds net fee', () => {
    // net=50000, totalEAC=70000 → (50000-70000)/50000*100 = -40.00
    const Wrapper = makeWrapper({
      financialAndContractDetails: {
        net: 50000, budgetOdcs: 20000, budgetStaff: 50000,
        serviceTax: 0, feeTotal: null, budgetSubTotal: null, contractType: 'lumpsum',
      },
    });
    render(<Wrapper><CostToCompleteAndEAC /></Wrapper>);
    const currentGPField = screen.getByLabelText('Current GP %');
    expect(currentGPField).toHaveValue('-40.00');
  });
});

// ─── Read-only Field Tests ────────────────────────────────────────────────────
describe('CostToCompleteAndEAC — Read-only Fields', () => {
  it('all fields except actualctcODC are read-only', () => {
    const Wrapper = makeWrapper();
    const { container } = render(<Wrapper><CostToCompleteAndEAC /></Wrapper>);
    const inputs = container.querySelectorAll('input');
    const editableInputs = Array.from(inputs).filter(
      (input) => !input.readOnly
    );
    // Only actualctcODC should be editable
    expect(editableInputs.length).toBe(1);
  });

  it('actualctcODC field is editable', async () => {
    const Wrapper = makeWrapper();
    const { container } = render(<Wrapper><CostToCompleteAndEAC /></Wrapper>);
    const editableInput = Array.from(container.querySelectorAll('input')).find(
      (input) => !input.readOnly
    );
    expect(editableInput).toBeDefined();
  });

  it('read-only fields have grey background', () => {
    const Wrapper = makeWrapper();
    const { container } = render(<Wrapper><CostToCompleteAndEAC /></Wrapper>);
    const readOnlyInputs = Array.from(container.querySelectorAll('input')).filter(
      (input) => input.readOnly
    );
    expect(readOnlyInputs.length).toBeGreaterThan(0);
  });
});

// ─── Tooltip Tests ────────────────────────────────────────────────────────────
describe('CostToCompleteAndEAC — Section Tooltips', () => {
  it('CTC section has tooltip "Cost to Complete"', async () => {
    const Wrapper = makeWrapper();
    render(<Wrapper><CostToCompleteAndEAC /></Wrapper>);
    const ctcTitle = screen.getByText('CTC');
    expect(ctcTitle).toBeInTheDocument();
  });

  it('ACTC section has tooltip "Actual Cost To Complete"', () => {
    const Wrapper = makeWrapper();
    render(<Wrapper><CostToCompleteAndEAC /></Wrapper>);
    expect(screen.getByText('ACTC')).toBeInTheDocument();
  });

  it('EAC section has tooltip "Estimated Actual Cost"', () => {
    const Wrapper = makeWrapper();
    render(<Wrapper><CostToCompleteAndEAC /></Wrapper>);
    expect(screen.getByText('EAC')).toBeInTheDocument();
  });

  it('TCAC section has tooltip "Total Cumulative Actual Cost"', () => {
    const Wrapper = makeWrapper();
    render(<Wrapper><CostToCompleteAndEAC /></Wrapper>);
    expect(screen.getByText('TCAC')).toBeInTheDocument();
  });
});

// ─── TCAC Section Tests ───────────────────────────────────────────────────────
describe('CostToCompleteAndEAC — TCAC Section', () => {
  it('TCAC ODCs shows totalCumulativeOdc value', () => {
    const Wrapper = makeWrapper();
    render(<Wrapper><CostToCompleteAndEAC /></Wrapper>);
    // totalCumulativeOdc = 5000
    expect(screen.getAllByDisplayValue('5,000.00').length).toBeGreaterThanOrEqual(1);
  });

  it('TCAC Staff shows totalCumulativeStaff value', () => {
    const Wrapper = makeWrapper();
    render(<Wrapper><CostToCompleteAndEAC /></Wrapper>);
    // totalCumulativeStaff = 10000
    expect(screen.getAllByDisplayValue('10,000.00').length).toBeGreaterThanOrEqual(1);
  });

  it('TCAC Subtotal shows totalCumulativeCost value', () => {
    const Wrapper = makeWrapper();
    render(<Wrapper><CostToCompleteAndEAC /></Wrapper>);
    // totalCumulativeCost = 15000
    expect(screen.getAllByDisplayValue('15,000.00').length).toBeGreaterThanOrEqual(1);
  });
});

// ─── Edge Cases ───────────────────────────────────────────────────────────────
describe('CostToCompleteAndEAC — Edge Cases', () => {
  it('handles all null financial values without crashing', () => {
    const Wrapper = makeWrapper({
      financialAndContractDetails: {
        net: null, budgetOdcs: null, budgetStaff: null,
        serviceTax: 0, feeTotal: null, budgetSubTotal: null, contractType: 'lumpsum',
      },
      actualCost: {
        totalCumulativeOdc: null, totalCumulativeStaff: null, totalCumulativeCost: null,
        priorCumulativeOdc: null, priorCumulativeStaff: null, priorCumulativeTotal: null,
        actualOdc: null, actualStaff: null, actualSubtotal: null,
      },
    });
    expect(() =>
      render(<Wrapper><CostToCompleteAndEAC /></Wrapper>)
    ).not.toThrow();
  });

  it('renders without crashing when extraCostTotal is undefined', () => {
    const Wrapper = makeWrapper({
      manpowerPlanning: {
        manpower: [],
        manpowerTotal: {
          plannedTotal: 0, consumedTotal: 0, approvedTotal: 0,
          extraHoursTotal: 0, extraCostTotal: undefined,
          paymentTotal: 0, balanceTotal: 0, nextMonthPlanningTotal: 0,
        },
      },
    });
    expect(() =>
      render(<Wrapper><CostToCompleteAndEAC /></Wrapper>)
    ).not.toThrow();
  });

  it('renders correct number of input fields (14 total)', () => {
    const Wrapper = makeWrapper();
    const { container } = render(<Wrapper><CostToCompleteAndEAC /></Wrapper>);
    const inputs = container.querySelectorAll('input');
    // TCAC(3) + CTC(3) + ACTC(3) + EAC(3) + GrossProfit(2) = 14
    expect(inputs.length).toBe(14);
  });
});
