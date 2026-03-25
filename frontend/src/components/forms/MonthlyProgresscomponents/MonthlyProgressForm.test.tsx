import React from 'react'
import {
  render,
  screen,
  waitFor,
  fireEvent,
  within,
  act,
} from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { MonthlyProgressForm } from './MonthlyProgressForm'
import { ProjectContext } from '../../../context/ProjectContext'
import { getMonthlyProgressData } from '../../../services/monthlyProgressDataService'
import { MonthlyProgressAPI } from '../../../services/monthlyProgressApi'

// ---------------------------------------------------------------------------
// Global mocks
// ---------------------------------------------------------------------------

// Mock heavy child tab components with lightweight stubs
// NOTE: vi.mock() is hoisted above imports by Vitest, so JSX is unavailable here.
// Use React.createElement() instead to avoid "Cannot find name 'div'" errors.
vi.mock('./index', () => ({
  FinancialDetailsTab: () => React.createElement('div', { 'data-testid': 'tab-financial' }, 'FinancialDetailsTab'),
  ManpowerPlanningTab: () => React.createElement('div', { 'data-testid': 'tab-manpower' }, 'ManpowerPlanningTab'),
  ActualCost: () => React.createElement('div', { 'data-testid': 'tab-actual-cost' }, 'ActualCost'),
  CostToCompleteAndEAC: () => React.createElement('div', { 'data-testid': 'tab-ctc' }, 'CostToCompleteAndEAC'),
  ScheduleTab: () => React.createElement('div', { 'data-testid': 'tab-schedule' }, 'ScheduleTab'),
  ProgressReviewDeliverables: () => React.createElement('div', { 'data-testid': 'tab-progress' }, 'ProgressReviewDeliverables'),
  BudgetRevenueTab: () => React.createElement('div', { 'data-testid': 'tab-budget' }, 'BudgetRevenueTab'),
  ChangeOrdersTab: () => React.createElement('div', { 'data-testid': 'tab-change-orders' }, 'ChangeOrdersTab'),
  ProgrammeScheduleTab: () => React.createElement('div', { 'data-testid': 'tab-programme' }, 'ProgrammeScheduleTab'),
  EarlyWarningsTab: () => React.createElement('div', { 'data-testid': 'tab-early-warnings' }, 'EarlyWarningsTab'),
  LastMonthActionsTab: () => React.createElement('div', { 'data-testid': 'tab-last-month' }, 'LastMonthActionsTab'),
  CurrentMonthActionsTab: () => React.createElement('div', { 'data-testid': 'tab-current-month' }, 'CurrentMonthActionsTab'),
}))

vi.mock('../../../services/monthlyProgressDataService', () => ({
  getMonthlyProgressData: vi.fn(),
}))

vi.mock('../../../services/monthlyProgressApi', () => ({
  MonthlyProgressAPI: {
    submitMonthlyProgress: vi.fn(),
  },
}))

vi.mock('../../../utils/MonthlyProgress/monthlyProgressUtils', () => ({
  getCurrentMonthYear: () => 'March 2026',
}))

// Mock zod resolver to always return valid (pass-through) so Submit fires onSubmit
vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: () => async (values: unknown) => ({ values, errors: {} }),
}))

// Silence MUI scroll errors in JSDOM
window.scrollTo = vi.fn()

// ---------------------------------------------------------------------------
// Helper: a fully populated form payload (returned by getMonthlyProgressData)
// This lets form.reset() populate the form so zod validates cleanly.
// ---------------------------------------------------------------------------
const VALID_FORM_DATA = {
  financialAndContractDetails: {
    net: 100000,
    serviceTax: 18,
    feeTotal: 118000,
    budgetOdcs: 50000,
    budgetStaff: 60000,
    budgetSubTotal: 110000,
    contractType: 'lumpsum',
  },
  actualCost: {
    priorCumulativeOdc: 0,
    priorCumulativeStaff: 0,
    priorCumulativeTotal: 0,
    actualOdc: 5000,
    actualStaff: 8000,
    actualSubtotal: 13000,
    totalCumulativeOdc: 5000,
    totalCumulativeStaff: 8000,
    totalCumulativeCost: 13000,
  },
  ctcAndEac: {
    ctcODC: 45000,
    ctcStaff: 52000,
    ctcSubtotal: 97000,
    actualctcODC: 45000,
    actualCtcStaff: 52000,
    actualCtcSubtotal: 97000,
    eacOdc: 50000,
    eacStaff: 60000,
    totalEAC: 110000,
    grossProfitPercentage: 6.8,
  },
  schedule: {
    dateOfIssueWOLOI: '01-01-2026',
    completionDateAsPerContract: '31-12-2026',
    completionDateAsPerExtension: null,
    expectedCompletionDate: '31-12-2026',
  },
  budgetTable: {
    originalBudget: { revenueFee: 118000, cost: 110000, profitPercentage: 6.8 },
    currentBudgetInMIS: { revenueFee: 118000, cost: 110000, profitPercentage: 6.8 },
    percentCompleteOnCosts: { revenueFee: 50, cost: 50 },
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
  progressDeliverable: { deliverables: [], totalPaymentDue: 0 },
  changeOrder: [],
  programmeSchedule: [],
  earlyWarnings: [],
  lastMonthActions: [],
  currentMonthActions: [],
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MOCK_PROJECT_ID = 'test-project-123'

const makeContextValue = (projectId: string | null = MOCK_PROJECT_ID) => ({
  projectId,
  setProjectId: vi.fn(),
  programId: null,
  setProgramId: vi.fn(),
})

const renderForm = (projectId: string | null = MOCK_PROJECT_ID) =>
  render(
    <ProjectContext.Provider value={makeContextValue(projectId)}>
      <MonthlyProgressForm />
    </ProjectContext.Provider>
  )

// MUI Select renders a role="combobox" div. Year = index 0, Month = index 1.
const getYearCombobox = () => screen.getAllByRole('combobox')[0]
const getMonthCombobox = () => screen.getAllByRole('combobox')[1]

// ---------------------------------------------------------------------------
// Setup / Teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks()
  ;(getMonthlyProgressData as ReturnType<typeof vi.fn>).mockResolvedValue(VALID_FORM_DATA)
})

afterEach(() => {
  vi.restoreAllMocks()
})

// ===========================================================================
// 1. INITIAL RENDER & STRUCTURE
// ===========================================================================

describe('MonthlyProgressForm – initial render', () => {
  it('shows a loading spinner while data is being fetched', () => {
    ;(getMonthlyProgressData as ReturnType<typeof vi.fn>).mockReturnValue(
      new Promise(() => {}) // never resolves → stays loading
    )
    renderForm()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.queryByText(/Monthly Progress Review/i)).not.toBeInTheDocument()
  })

  it('renders the form title with current month/year after loading', async () => {
    renderForm()
    await waitFor(() =>
      expect(
        screen.getByText(/PMD7\. Monthly Progress Review - March 2026/i)
      ).toBeInTheDocument()
    )
  })

  it('renders Year and Month comboboxes after loading', async () => {
    renderForm()
    await waitFor(() => expect(screen.getAllByRole('combobox').length).toBeGreaterThanOrEqual(2))
    expect(getYearCombobox()).toBeInTheDocument()
    expect(getMonthCombobox()).toBeInTheDocument()
  })

  it('renders all 12 tab labels in the tab header after loading', async () => {
    renderForm()
    await waitFor(() =>
      expect(screen.getByText('Financial Details & Contract')).toBeInTheDocument()
    )
    const expectedLabels = [
      'Financial Details & Contract',
      'Manpower Planning',
      'Actual Cost',
      'CTC & EAC',
      'Schedule',
      'Progress Review Deliverables',
      'Budget Revenue',
      'Change Orders',
      'Programme Schedule',
      'Early Warnings',
      'Last Month Actions',
      'Current Month Actions',
    ]
    expectedLabels.forEach((label) =>
      expect(screen.getByText(label)).toBeInTheDocument()
    )
  })

  it('renders the first tab component (FinancialDetailsTab) by default', async () => {
    renderForm()
    await waitFor(() =>
      expect(screen.getByTestId('tab-financial')).toBeInTheDocument()
    )
  })

  it('renders the Next button (not Save) on the first tab', async () => {
    renderForm()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument()
    )
    expect(screen.queryByRole('button', { name: /Save/i })).not.toBeInTheDocument()
  })

  it('Back button is disabled on the first tab', async () => {
    renderForm()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Back/i })).toBeDisabled()
    )
  })
})

// ===========================================================================
// 2. ERROR STATE
// ===========================================================================

describe('MonthlyProgressForm – error state', () => {
  it('displays an error message when the data fetch fails', async () => {
    ;(getMonthlyProgressData as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Network error')
    )
    renderForm()
    await waitFor(() =>
      expect(screen.getByText(/Failed to fetch form data/i)).toBeInTheDocument()
    )
    expect(screen.queryByText(/Monthly Progress Review/i)).not.toBeInTheDocument()
  })
})

// ===========================================================================
// 3. NO PROJECT ID
// ===========================================================================

describe('MonthlyProgressForm – no projectId', () => {
  it('does not call getMonthlyProgressData when projectId is null', async () => {
    renderForm(null)
    // Allow effects to settle
    await act(async () => {})
    expect(getMonthlyProgressData).not.toHaveBeenCalled()
  })

  it('still renders the form (not loading/error) when projectId is null', async () => {
    renderForm(null)
    await waitFor(() =>
      expect(screen.getByText(/PMD7\. Monthly Progress Review/i)).toBeInTheDocument()
    )
  })
})

// ===========================================================================
// 4. DATA FETCHING
// ===========================================================================

describe('MonthlyProgressForm – data fetching', () => {
  it('calls getMonthlyProgressData with the correct projectId, year, and month', async () => {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1
    renderForm()
    await waitFor(() =>
      expect(getMonthlyProgressData).toHaveBeenCalledWith(
        MOCK_PROJECT_ID,
        currentYear,
        currentMonth
      )
    )
  })

  it('calls getMonthlyProgressData exactly once on initial mount', async () => {
    renderForm()
    await waitFor(() => expect(getMonthlyProgressData).toHaveBeenCalledTimes(1))
  })
})

// ===========================================================================
// 5. YEAR / MONTH SELECTOR
// ===========================================================================

describe('MonthlyProgressForm – year/month selectors', () => {
  it('Year combobox displays the current year by default', async () => {
    renderForm()
    await waitFor(() => expect(screen.getAllByRole('combobox').length).toBeGreaterThanOrEqual(2))
    const yearBox = getYearCombobox()
    expect(yearBox).toHaveTextContent(String(new Date().getFullYear()))
  })

  it('Month combobox displays the current month by default', async () => {
    renderForm()
    await waitFor(() => expect(screen.getAllByRole('combobox').length).toBeGreaterThanOrEqual(2))
    const currentMonthName = new Date().toLocaleString('default', { month: 'long' })
    expect(getMonthCombobox()).toHaveTextContent(currentMonthName)
  })

  it('Year dropdown contains 10 year options starting from current year', async () => {
    renderForm()
    await waitFor(() => expect(screen.getAllByRole('combobox').length).toBeGreaterThanOrEqual(2))

    fireEvent.mouseDown(getYearCombobox())
    const listbox = await screen.findByRole('listbox')
    const options = within(listbox).getAllByRole('option')

    expect(options).toHaveLength(10)
    expect(options[0]).toHaveTextContent(String(new Date().getFullYear()))
    expect(options[9]).toHaveTextContent(String(new Date().getFullYear() - 9))
  })

  it('Month dropdown contains 12 month options', async () => {
    renderForm()
    await waitFor(() => expect(screen.getAllByRole('combobox').length).toBeGreaterThanOrEqual(2))

    fireEvent.mouseDown(getMonthCombobox())
    const listbox = await screen.findByRole('listbox')
    const options = within(listbox).getAllByRole('option')

    expect(options).toHaveLength(12)
    expect(options[0]).toHaveTextContent('January')
    expect(options[11]).toHaveTextContent('December')
  })

  it('re-fetches data when the year is changed', async () => {
    const previousYear = new Date().getFullYear() - 1
    renderForm()
    await waitFor(() => expect(getMonthlyProgressData).toHaveBeenCalledTimes(1))

    fireEvent.mouseDown(getYearCombobox())
    const listbox = await screen.findByRole('listbox')
    fireEvent.click(within(listbox).getByText(String(previousYear)))

    await waitFor(() =>
      expect(getMonthlyProgressData).toHaveBeenCalledWith(
        MOCK_PROJECT_ID,
        previousYear,
        expect.any(Number)
      )
    )
  })

  it('re-fetches data when the month is changed', async () => {
    renderForm()
    await waitFor(() => expect(getMonthlyProgressData).toHaveBeenCalledTimes(1))

    fireEvent.mouseDown(getMonthCombobox())
    const listbox = await screen.findByRole('listbox')
    fireEvent.click(within(listbox).getByText('August'))

    await waitFor(() =>
      expect(getMonthlyProgressData).toHaveBeenCalledWith(
        MOCK_PROJECT_ID,
        expect.any(Number),
        8
      )
    )
  })
})

// ===========================================================================
// 6. TAB NAVIGATION
// ===========================================================================

describe('MonthlyProgressForm – tab navigation', () => {
  it('clicking Next advances to the second tab (Manpower Planning)', async () => {
    renderForm()
    await waitFor(() => screen.getByRole('button', { name: /Next/i }))

    fireEvent.click(screen.getByRole('button', { name: /Next/i }))

    await waitFor(() =>
      expect(screen.getByTestId('tab-manpower')).toBeInTheDocument()
    )
  })

  it('clicking Back on the second tab returns to the first tab', async () => {
    renderForm()
    await waitFor(() => screen.getByRole('button', { name: /Next/i }))

    fireEvent.click(screen.getByRole('button', { name: /Next/i }))
    await waitFor(() => screen.getByTestId('tab-manpower'))

    fireEvent.click(screen.getByRole('button', { name: /Back/i }))

    await waitFor(() =>
      expect(screen.getByTestId('tab-financial')).toBeInTheDocument()
    )
  })

  it('clicking a tab label directly navigates to that tab', async () => {
    renderForm()
    await waitFor(() => screen.getByText('Schedule'))

    fireEvent.click(screen.getByText('Schedule'))

    await waitFor(() =>
      expect(screen.getByTestId('tab-schedule')).toBeInTheDocument()
    )
  })

  it('shows Save button (not Next) on the last tab', async () => {
    renderForm()
    await waitFor(() => screen.getByText('Current Month Actions'))

    fireEvent.click(screen.getByText('Current Month Actions'))

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument()
    )
    expect(screen.queryByRole('button', { name: /Next/i })).not.toBeInTheDocument()
  })

  it('Back button is enabled (not disabled) on the last tab', async () => {
    renderForm()
    await waitFor(() => screen.getByText('Current Month Actions'))

    fireEvent.click(screen.getByText('Current Month Actions'))

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Back/i })).not.toBeDisabled()
    )
  })

  it('navigates through all 12 tabs sequentially via Next button', async () => {
    const tabTestIds = [
      'tab-financial', 'tab-manpower', 'tab-actual-cost', 'tab-ctc',
      'tab-schedule', 'tab-progress', 'tab-budget', 'tab-change-orders',
      'tab-programme', 'tab-early-warnings', 'tab-last-month', 'tab-current-month',
    ]

    renderForm()
    await waitFor(() => screen.getByTestId('tab-financial'))

    for (let i = 0; i < tabTestIds.length - 1; i++) {
      expect(screen.getByTestId(tabTestIds[i])).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: /Next/i }))
      await waitFor(() => screen.getByTestId(tabTestIds[i + 1]))
    }
    // Final tab shows Save
    expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument()
  })
})

// ===========================================================================
// 7. FORM SUBMISSION
// ===========================================================================

describe('MonthlyProgressForm – form submission', () => {
  const navigateToLastTab = async () => {
    await waitFor(() => screen.getByText('Current Month Actions'))
    fireEvent.click(screen.getByText('Current Month Actions'))
    await waitFor(() => screen.getByRole('button', { name: /Save/i }))
  }

  it('shows success snackbar after a successful submission', async () => {
    ;(MonthlyProgressAPI.submitMonthlyProgress as ReturnType<typeof vi.fn>).mockResolvedValue({})
    renderForm()
    await navigateToLastTab()

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Save/i }))
    })

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/Review saved successfully/i)
    )
  })

  it('shows error snackbar when submission API throws', async () => {
    ;(MonthlyProgressAPI.submitMonthlyProgress as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Server error')
    )
    renderForm()
    await navigateToLastTab()

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Save/i }))
    })

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/Server error/i)
    )
  })

  it('shows "Project ID not available" error when projectId is null on submit', async () => {
    renderForm(null)
    await navigateToLastTab()

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Save/i }))
    })

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/Project ID is not available/i)
    )
    expect(MonthlyProgressAPI.submitMonthlyProgress).not.toHaveBeenCalled()
  })

  it('calls submitMonthlyProgress with the correct projectId, year, and month', async () => {
    ;(MonthlyProgressAPI.submitMonthlyProgress as ReturnType<typeof vi.fn>).mockResolvedValue({})
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1
    renderForm()
    await navigateToLastTab()

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Save/i }))
    })

    await waitFor(() =>
      expect(MonthlyProgressAPI.submitMonthlyProgress).toHaveBeenCalledWith(
        MOCK_PROJECT_ID,
        expect.objectContaining({ year: currentYear, month: currentMonth })
      )
    )
  })

  it('does not call submitMonthlyProgress when projectId is null', async () => {
    renderForm(null)
    await navigateToLastTab()

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Save/i }))
    })

    await waitFor(() => screen.getByRole('alert'))
    expect(MonthlyProgressAPI.submitMonthlyProgress).not.toHaveBeenCalled()
  })
})

// ===========================================================================
// 8. SNACKBAR
// ===========================================================================

describe('MonthlyProgressForm – snackbar', () => {
  it('success snackbar has severity "success"', async () => {
    ;(MonthlyProgressAPI.submitMonthlyProgress as ReturnType<typeof vi.fn>).mockResolvedValue({})
    renderForm()
    await waitFor(() => screen.getByText('Current Month Actions'))
    fireEvent.click(screen.getByText('Current Month Actions'))
    await waitFor(() => screen.getByRole('button', { name: /Save/i }))

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Save/i }))
    })

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/Review saved successfully/i)
    // MUI Alert with severity="success" gets class containing "success"
    expect(alert.className).toMatch(/success/i)
  })

  it('error snackbar has severity "error"', async () => {
    ;(MonthlyProgressAPI.submitMonthlyProgress as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Oops')
    )
    renderForm()
    await waitFor(() => screen.getByText('Current Month Actions'))
    fireEvent.click(screen.getByText('Current Month Actions'))
    await waitFor(() => screen.getByRole('button', { name: /Save/i }))

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Save/i }))
    })

    const alert = await screen.findByRole('alert')
    expect(alert.className).toMatch(/error/i)
  })

  it('closes the snackbar when the Alert close button is clicked', async () => {
    ;(MonthlyProgressAPI.submitMonthlyProgress as ReturnType<typeof vi.fn>).mockResolvedValue({})
    renderForm()
    await waitFor(() => screen.getByText('Current Month Actions'))
    fireEvent.click(screen.getByText('Current Month Actions'))
    await waitFor(() => screen.getByRole('button', { name: /Save/i }))

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Save/i }))
    })

    const alert = await screen.findByRole('alert')
    // The close (×) button inside the Alert
    const closeBtn = within(alert).getByRole('button')
    fireEvent.click(closeBtn)

    await waitFor(() =>
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    )
  })
})
