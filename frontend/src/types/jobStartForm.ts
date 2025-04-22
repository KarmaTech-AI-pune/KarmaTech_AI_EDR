// Types for JobStart Form Components

export interface TaskAllocation {
  taskId: string;
  title: string;
  rate: number;
  hours: number;
  cost: number;
}

export interface EmployeeAllocation {
  id: string;
  name: string;
  is_consultant: boolean;
  allocations: TaskAllocation[];
  totalHours: number;
  totalCost: number;
  remarks: string;
}

export interface ExpenseEntry {
  number: string;
  remarks: string;
}

export interface OutsideAgencyEntry {
  description: string;
  rate: string;
  units: string;
  remarks: string;
}

export interface ProjectSpecificEntry {
  name: string;
  number: string;
  remarks: string;
}

export interface TimeContingencyEntry {
  rate: string;
  units: string;
  remarks: string;
}

export interface ServiceTaxEntry {
  percentage: string;
}

export type ExpensesType = {
  '2a': ExpenseEntry;
  '2b': ExpenseEntry;
  '3': ExpenseEntry;
  '4': ExpenseEntry;
  '5': ExpenseEntry;
  '7': ExpenseEntry;
}

export type OutsideAgencyType = {
  'a': OutsideAgencyEntry;
  'b': OutsideAgencyEntry;
  'c': OutsideAgencyEntry;
}

export type ProjectSpecificType = {
  '6c': ProjectSpecificEntry;
  '6d': ProjectSpecificEntry;
  '6e': ProjectSpecificEntry;
}

// Form state interface
export interface JobStartFormState {
  employeeAllocations: EmployeeAllocation[];
  timeContingency: TimeContingencyEntry;
  expenses: ExpensesType;
  surveyWorks: ExpenseEntry;
  outsideAgency: OutsideAgencyType;
  projectSpecific: ProjectSpecificType;
  projectFees: string;
  serviceTax: ServiceTaxEntry;
  isUpdating: boolean;
  currentFormId: number | string | null;
  loading: boolean;
  error: string | null;
  submitting: boolean;
  snackbarOpen: boolean;
  snackbarMessage: string;
  snackbarSeverity: 'success' | 'error';
  expanded: string[];
}

// Props interfaces for components
export interface TimeSectionProps {
  employeeAllocations: EmployeeAllocation[];
  timeContingency: TimeContingencyEntry;
  onRemarksChange: (employeeId: string, value: string) => void;
  onTimeContingencyChange: (field: keyof TimeContingencyEntry, value: string) => void;
  calculateTotalCost: (employees: EmployeeAllocation[], isConsultant: boolean) => number;
  calculateTimeContingencyCost: () => number;
  calculateTotalTimeCost: () => number;
  expanded: string[];
  handleAccordionChange: (panel: string) => void;
  textFieldStyle: any;
  tableHeaderStyle: any;
  tableCellStyle: any;
  accordionStyle: any;
  sectionStyle: any;
  summaryRowStyle: any;
  formatTitle: (title: string) => string;
}

export interface ExpensesSectionProps {
  expenses: ExpensesType;
  surveyWorks: ExpenseEntry;
  outsideAgency: OutsideAgencyType;
  projectSpecific: ProjectSpecificType;
  onExpenseChange: (id: keyof ExpensesType, field: keyof ExpenseEntry, value: string) => void;
  onSurveyWorksChange: (field: keyof ExpenseEntry, value: string) => void;
  onOutsideAgencyChange: (id: keyof OutsideAgencyType, field: keyof OutsideAgencyEntry, value: string) => void;
  onProjectSpecificChange: (id: keyof ProjectSpecificType, field: keyof ProjectSpecificEntry, value: string) => void;
  calculateOutsideAgencyCost: (entry: OutsideAgencyEntry) => number;
  calculateExpensesTotal: () => number;
  expanded: string[];
  handleAccordionChange: (panel: string) => void;
  textFieldStyle: any;
  tableHeaderStyle: any;
  tableCellStyle: any;
  accordionStyle: any;
  sectionStyle: any;
  summaryRowStyle: any;
}

export interface SummarySectionProps {
  projectFees: string;
  serviceTax: ServiceTaxEntry;
  onProjectFeesChange: (value: string) => void;
  onServiceTaxChange: (value: string) => void;
  calculateGrandTotal: () => number;
  calculateProfit: () => number;
  calculateServiceTax: () => number;
  calculateTotalProjectFees: () => number;
  textFieldStyle: any;
  tableCellStyle: any;
  sectionStyle: any;
}

export interface EmployeePersonnelTableProps {
  employeeAllocations: EmployeeAllocation[];
  isConsultant: boolean;
  onRemarksChange: (employeeId: string, value: string) => void;
  calculateTotalCost: (employees: EmployeeAllocation[], isConsultant: boolean) => number;
  textFieldStyle: any;
  tableCellStyle: any;
  formatTitle: (title: string) => string;
}

export interface TimeContingencyRowProps {
  timeContingency: TimeContingencyEntry;
  onTimeContingencyChange: (field: keyof TimeContingencyEntry, value: string) => void;
  calculateTimeContingencyCost: () => number;
  textFieldStyle: any;
  tableCellStyle: any;
}

export interface RegularExpensesTableProps {
  expenses: ExpensesType;
  onExpenseChange: (id: keyof ExpensesType, field: keyof ExpenseEntry, value: string) => void;
  textFieldStyle: any;
  tableCellStyle: any;
}

export interface OutsideAgencyTableProps {
  outsideAgency: OutsideAgencyType;
  onOutsideAgencyChange: (id: keyof OutsideAgencyType, field: keyof OutsideAgencyEntry, value: string) => void;
  calculateOutsideAgencyCost: (entry: OutsideAgencyEntry) => number;
  textFieldStyle: any;
  tableCellStyle: any;
}

export interface SurveyWorksRowProps {
  surveyWorks: ExpenseEntry;
  onSurveyWorksChange: (field: keyof ExpenseEntry, value: string) => void;
  textFieldStyle: any;
  tableCellStyle: any;
}

export interface ProjectSpecificTableProps {
  projectSpecific: ProjectSpecificType;
  onProjectSpecificChange: (id: keyof ProjectSpecificType, field: keyof ProjectSpecificEntry, value: string) => void;
  textFieldStyle: any;
  tableCellStyle: any;
}

export interface ExpenseContingenciesRowProps {
  expenses: ExpensesType;
  onExpenseChange: (id: keyof ExpensesType, field: keyof ExpenseEntry, value: string) => void;
  textFieldStyle: any;
  tableCellStyle: any;
}

export interface FormSectionProps {
  title: string;
  expanded: boolean;
  onChange: () => void;
  children: React.ReactNode;
  accordionStyle: any;
}

export interface SectionSummaryRowProps {
  label: string;
  value: number | string;
  colSpan?: number;
  isHighlighted?: boolean;
  isNegativeHighlight?: boolean;
  tableCellStyle: any;
  summaryRowStyle?: any;
}
