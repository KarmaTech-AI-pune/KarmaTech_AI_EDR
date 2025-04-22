import { 
  EmployeeAllocation, 
  OutsideAgencyEntry, 
  TimeContingencyEntry,
  ExpensesType,
  OutsideAgencyType,
  ProjectSpecificType
} from '../types/jobStartForm';

// Format title from snake_case to Title Case
export const formatTitle = (title: string): string => {
  return title
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Calculate total cost for employees or consultants
export const calculateTotalCost = (employees: EmployeeAllocation[], isConsultant: boolean): number => {
  return employees
    .filter(emp => emp.is_consultant === isConsultant)
    .reduce((total, emp) => total + emp.totalCost, 0);
};

// Calculate time contingency cost
export const calculateTimeContingencyCost = (timeContingency: TimeContingencyEntry): number => {
  const rate = Number(timeContingency.rate) || 0;
  const units = Number(timeContingency.units) || 0;
  return rate * units;
};

// Calculate outside agency cost
export const calculateOutsideAgencyCost = (entry: OutsideAgencyEntry): number => {
  const rate = Number(entry.rate) || 0;
  const units = Number(entry.units) || 0;
  return rate * units;
};

// Calculate total time cost
export const calculateTotalTimeCost = (
  employeeAllocations: EmployeeAllocation[], 
  timeContingency: TimeContingencyEntry
): number => {
  const employeesTotal = calculateTotalCost(employeeAllocations, false);
  const consultantsTotal = calculateTotalCost(employeeAllocations, true);
  const contingencyTotal = calculateTimeContingencyCost(timeContingency);
  return employeesTotal + consultantsTotal + contingencyTotal;
};

// Calculate expenses total
export const calculateExpensesTotal = (
  expenses: ExpensesType,
  surveyWorks: { number: string },
  outsideAgency: OutsideAgencyType,
  projectSpecific: ProjectSpecificType
): number => {
  let total = 0;
  // Add up all expense entries
  Object.values(expenses).forEach(entry => {
    total += Number(entry.number) || 0;
  });
  // Add survey works
  total += Number(surveyWorks.number) || 0;
  // Add up outside agency entries (rate * units)
  Object.values(outsideAgency).forEach(entry => {
    total += calculateOutsideAgencyCost(entry);
  });
  // Add up project specific entries
  Object.values(projectSpecific).forEach(entry => {
    total += Number(entry.number) || 0;
  });
  return total;
};

// Calculate grand total
export const calculateGrandTotal = (
  employeeAllocations: EmployeeAllocation[],
  timeContingency: TimeContingencyEntry,
  expenses: ExpensesType,
  surveyWorks: { number: string },
  outsideAgency: OutsideAgencyType,
  projectSpecific: ProjectSpecificType
): number => {
  const timeCost = calculateTotalTimeCost(employeeAllocations, timeContingency);
  const expensesTotal = calculateExpensesTotal(expenses, surveyWorks, outsideAgency, projectSpecific);
  return timeCost + expensesTotal;
};

// Calculate profit
export const calculateProfit = (
  projectFees: string,
  employeeAllocations: EmployeeAllocation[],
  timeContingency: TimeContingencyEntry,
  expenses: ExpensesType,
  surveyWorks: { number: string },
  outsideAgency: OutsideAgencyType,
  projectSpecific: ProjectSpecificType
): number => {
  const fees = Number(projectFees) || 0;
  const total = calculateGrandTotal(
    employeeAllocations,
    timeContingency,
    expenses,
    surveyWorks,
    outsideAgency,
    projectSpecific
  );
  return fees - total;
};

// Calculate service tax
export const calculateServiceTax = (projectFees: string, serviceTaxPercentage: string): number => {
  const fees = Number(projectFees) || 0;
  const taxPercentage = Number(serviceTaxPercentage) || 0;
  return (fees * taxPercentage) / 100;
};

// Calculate total project fees
export const calculateTotalProjectFees = (projectFees: string, serviceTaxPercentage: string): number => {
  const fees = Number(projectFees) || 0;
  const tax = calculateServiceTax(projectFees, serviceTaxPercentage);
  return fees + tax;
};
