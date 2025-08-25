import { describe, it, expect } from 'vitest';
import {
  formatTitle,
  calculateTotalCost,
  calculateTimeContingencyCost,
  calculateOutsideAgencyCost,
  calculateTotalTimeCost,
  calculateExpensesTotal,
  calculateGrandTotal,
  calculateProfit,
  calculateServiceTax,
  calculateTotalProjectFees,
} from './jobStartFormUtils';
import {
  EmployeeAllocation,
  TimeContingencyEntry,
  OutsideAgencyEntry,
  ExpensesType,
  OutsideAgencyType,
  ProjectSpecificType
} from '../types/jobStartForm';

describe('jobStartFormUtils', () => {
  describe('formatTitle', () => {
    it('should convert snake_case to Title Case', () => {
      expect(formatTitle('project_name')).toBe('Project Name');
      expect(formatTitle('another_example_title')).toBe('Another Example Title');
    });

    it('should handle single word titles', () => {
      expect(formatTitle('title')).toBe('Title');
    });

    it('should handle empty string', () => {
      expect(formatTitle('')).toBe('');
    });

    it('should handle titles with numbers', () => {
      expect(formatTitle('project_2023')).toBe('Project 2023');
    });
  });

  describe('calculateTotalCost', () => {
    const employeeAllocations: EmployeeAllocation[] = [
      { id: '1', name: 'Emp1', is_consultant: false, allocations: [], totalHours: 0, totalCost: 100, remarks: '' },
      { id: '2', name: 'Emp2', is_consultant: false, allocations: [], totalHours: 0, totalCost: 200, remarks: '' },
      { id: '3', name: 'Cons1', is_consultant: true, allocations: [], totalHours: 0, totalCost: 150, remarks: '' },
      { id: '4', name: 'Cons2', is_consultant: true, allocations: [], totalHours: 0, totalCost: 250, remarks: '' },
    ];

    it('should calculate total cost for employees', () => {
      expect(calculateTotalCost(employeeAllocations, false)).toBe(300);
    });

    it('should calculate total cost for consultants', () => {
      expect(calculateTotalCost(employeeAllocations, true)).toBe(400);
    });

    it('should return 0 for empty array', () => {
      expect(calculateTotalCost([], false)).toBe(0);
      expect(calculateTotalCost([], true)).toBe(0);
    });

    it('should return 0 if no matching type', () => {
      const noConsultants: EmployeeAllocation[] = [
        { id: '1', name: 'Emp1', totalCost: 100, is_consultant: false, role: '', units: 0, rate: 0 },
      ];
      expect(calculateTotalCost(noConsultants, true)).toBe(0);
    });
  });

  describe('calculateTimeContingencyCost', () => {
    it('should return the units as percentage', () => {
      const contingency: TimeContingencyEntry = { units: '10', remarks: '' };
      expect(calculateTimeContingencyCost(contingency)).toBe(10);
    });

    it('should return 0 for invalid units', () => {
      const contingency: TimeContingencyEntry = { units: 'abc', remarks: '' };
      expect(calculateTimeContingencyCost(contingency)).toBe(0);
    });

    it('should return 0 for empty units', () => {
      const contingency: TimeContingencyEntry = { units: '', remarks: '' };
      expect(calculateTimeContingencyCost(contingency)).toBe(0);
    });
  });

  describe('calculateOutsideAgencyCost', () => {
    it('should calculate cost correctly', () => {
      const entry: OutsideAgencyEntry = { description: '', rate: '100', units: '5', remarks: '' };
      expect(calculateOutsideAgencyCost(entry)).toBe(500);
    });

    it('should return 0 for invalid rate or units', () => {
      const entry1: OutsideAgencyEntry = { description: '', rate: 'abc', units: '5', remarks: '' };
      expect(calculateOutsideAgencyCost(entry1)).toBe(0);
      const entry2: OutsideAgencyEntry = { description: '', rate: '100', units: 'xyz', remarks: '' };
      expect(calculateOutsideAgencyCost(entry2)).toBe(0);
    });

    it('should return 0 for empty rate or units', () => {
      const entry1: OutsideAgencyEntry = { description: '', rate: '', units: '5', remarks: '' };
      expect(calculateOutsideAgencyCost(entry1)).toBe(0);
      const entry2: OutsideAgencyEntry = { description: '', rate: '100', units: '', remarks: '' };
      expect(calculateOutsideAgencyCost(entry2)).toBe(0);
    });
  });

  describe('calculateTotalTimeCost', () => {
    const employeeAllocations: EmployeeAllocation[] = [
      { id: '1', name: 'Emp1', is_consultant: false, allocations: [], totalHours: 0, totalCost: 100, remarks: '' },
      { id: '2', name: 'Cons1', is_consultant: true, allocations: [], totalHours: 0, totalCost: 100, remarks: '' },
    ];
    const timeContingency: TimeContingencyEntry = { units: '10', remarks: '' }; // 10%

    it('should calculate total time cost including contingency', () => {
      // Total employee cost = 100 (emp) + 100 (cons) = 200
      // Contingency = 10% of 200 = 20
      // Total time cost = 200 + 20 = 220
      expect(calculateTotalTimeCost(employeeAllocations, timeContingency)).toBe(220);
    });

    it('should handle zero contingency', () => {
      const zeroContingency: TimeContingencyEntry = { units: '0', remarks: '' };
      expect(calculateTotalTimeCost(employeeAllocations, zeroContingency)).toBe(200);
    });

    it('should handle empty employee allocations', () => {
      expect(calculateTotalTimeCost([], timeContingency)).toBe(0);
    });
  });

  describe('calculateExpensesTotal', () => {
    const expenses: ExpensesType = {
      '2a': { number: '50', remarks: '' },
      '2b': { number: '25', remarks: '' },
      '3': { number: '0', remarks: '' },
      '4': { number: '0', remarks: '' },
      '5': { number: '0', remarks: '' },
      '7': { number: '0', remarks: '' },
    };
    const surveyWorks = { number: '75', remarks: '' };
    const outsideAgency: OutsideAgencyType = {
      'a': { description: '', rate: '10', units: '5', remarks: '' }, // 50
      'b': { description: '', rate: '20', units: '2', remarks: '' }, // 40
      'c': { description: '', rate: '0', units: '0', remarks: '' },
    };
    const projectSpecific: ProjectSpecificType = {
      '6c': { name: '', number: '30', remarks: '' },
      '6d': { name: '', number: '0', remarks: '' },
      '6e': { name: '', number: '0', remarks: '' },
    };

    it('should calculate total expenses correctly', () => {
      // 50 + 25 (expenses) + 75 (survey) + 50 + 40 (outside agency) + 30 (project specific) = 270
      expect(calculateExpensesTotal(expenses, surveyWorks, outsideAgency, projectSpecific)).toBe(270);
    });

    it('should handle empty inputs', () => {
      const emptyExpenses: ExpensesType = {
        '2a': { number: '', remarks: '' }, '2b': { number: '', remarks: '' }, '3': { number: '', remarks: '' },
        '4': { number: '', remarks: '' }, '5': { number: '', remarks: '' }, '7': { number: '', remarks: '' },
      };
      const emptySurveyWorks = { number: '', remarks: '' };
      const emptyOutsideAgency: OutsideAgencyType = {
        'a': { description: '', rate: '', units: '', remarks: '' },
        'b': { description: '', rate: '', units: '', remarks: '' },
        'c': { description: '', rate: '', units: '', remarks: '' },
      };
      const emptyProjectSpecific: ProjectSpecificType = {
        '6c': { name: '', number: '', remarks: '' },
        '6d': { name: '', number: '', remarks: '' },
        '6e': { name: '', number: '', remarks: '' },
      };
      expect(calculateExpensesTotal(emptyExpenses, emptySurveyWorks, emptyOutsideAgency, emptyProjectSpecific)).toBe(0);
    });

    it('should handle invalid numbers in inputs', () => {
      const invalidExpenses: ExpensesType = {
        '2a': { number: 'abc', remarks: '' }, '2b': { number: '', remarks: '' }, '3': { number: '', remarks: '' },
        '4': { number: '', remarks: '' }, '5': { number: '', remarks: '' }, '7': { number: '', remarks: '' },
      };
      const invalidSurveyWorks = { number: 'xyz', remarks: '' };
      const invalidOutsideAgency: OutsideAgencyType = {
        'a': { description: '', rate: 'a', units: 'b', remarks: '' },
        'b': { description: '', rate: '', units: '', remarks: '' },
        'c': { description: '', rate: '', units: '', remarks: '' },
      };
      const invalidProjectSpecific: ProjectSpecificType = {
        '6c': { name: '', number: 'def', remarks: '' },
        '6d': { name: '', number: '', remarks: '' },
        '6e': { name: '', number: '', remarks: '' },
      };
      expect(calculateExpensesTotal(invalidExpenses, invalidSurveyWorks, invalidOutsideAgency, invalidProjectSpecific)).toBe(0);
    });
  });

  describe('calculateGrandTotal', () => {
    const employeeAllocations: EmployeeAllocation[] = [
      { id: '1', name: 'Emp1', is_consultant: false, allocations: [], totalHours: 0, totalCost: 100, remarks: '' },
    ];
    const timeContingency: TimeContingencyEntry = { units: '10', remarks: '' }; // 10% of 100 = 10
    // Total time cost = 100 + 10 = 110

    const expenses: ExpensesType = {
      '2a': { number: '50', remarks: '' }, '2b': { number: '0', remarks: '' }, '3': { number: '0', remarks: '' },
      '4': { number: '0', remarks: '' }, '5': { number: '0', remarks: '' }, '7': { number: '0', remarks: '' },
    };
    const surveyWorks = { number: '20', remarks: '' };
    const outsideAgency: OutsideAgencyType = {
      'a': { description: '', rate: '10', units: '3', remarks: '' }, // 30
      'b': { description: '', rate: '0', units: '0', remarks: '' },
      'c': { description: '', rate: '0', units: '0', remarks: '' },
    };
    const projectSpecific: ProjectSpecificType = {
      '6c': { name: '', number: '10', remarks: '' },
      '6d': { name: '', number: '0', remarks: '' },
      '6e': { name: '', number: '0', remarks: '' },
    };
    // Total expenses = 50 + 20 + 30 + 10 = 110

    it('should calculate grand total correctly', () => {
      // Grand total = 110 (time cost) + 110 (expenses total) = 220
      expect(calculateGrandTotal(
        employeeAllocations,
        timeContingency,
        expenses,
        surveyWorks,
        outsideAgency,
        projectSpecific
      )).toBe(220);
    });

    it('should handle all zero inputs', () => {
      const emptyAllocations: EmployeeAllocation[] = [];
      const zeroContingency: TimeContingencyEntry = { units: '0', remarks: '' };
      const emptyExpenses: ExpensesType = {
        '2a': { number: '0', remarks: '' }, '2b': { number: '0', remarks: '' }, '3': { number: '0', remarks: '' },
        '4': { number: '0', remarks: '' }, '5': { number: '0', remarks: '' }, '7': { number: '0', remarks: '' },
      };
      const zeroSurveyWorks = { number: '0', remarks: '' };
      const emptyOutsideAgency: OutsideAgencyType = {
        'a': { description: '', rate: '0', units: '0', remarks: '' },
        'b': { description: '', rate: '0', units: '0', remarks: '' },
        'c': { description: '', rate: '0', units: '0', remarks: '' },
      };
      const emptyProjectSpecific: ProjectSpecificType = {
        '6c': { name: '', number: '0', remarks: '' },
        '6d': { name: '', number: '0', remarks: '' },
        '6e': { name: '', number: '0', remarks: '' },
      };

      expect(calculateGrandTotal(
        emptyAllocations,
        zeroContingency,
        emptyExpenses,
        zeroSurveyWorks,
        emptyOutsideAgency,
        emptyProjectSpecific
      )).toBe(0);
    });
  });

  describe('calculateProfit', () => {
    const employeeAllocations: EmployeeAllocation[] = [
      { id: '1', name: 'Emp1', is_consultant: false, allocations: [], totalHours: 0, totalCost: 100, remarks: '' },
    ];
    const timeContingency: TimeContingencyEntry = { units: '10', remarks: '' }; // 10% of 100 = 10
    // Total time cost = 110

    const expenses: ExpensesType = {
      '2a': { number: '50', remarks: '' }, '2b': { number: '0', remarks: '' }, '3': { number: '0', remarks: '' },
      '4': { number: '0', remarks: '' }, '5': { number: '0', remarks: '' }, '7': { number: '0', remarks: '' },
    };
    const surveyWorks = { number: '20', remarks: '' };
    const outsideAgency: OutsideAgencyType = {
      'a': { description: '', rate: '10', units: '3', remarks: '' }, // 30
      'b': { description: '', rate: '0', units: '0', remarks: '' },
      'c': { description: '', rate: '0', units: '0', remarks: '' },
    };
    const projectSpecific: ProjectSpecificType = {
      '6c': { name: '', number: '10', remarks: '' },
      '6d': { name: '', number: '0', remarks: '' },
      '6e': { name: '', number: '0', remarks: '' },
    };
    // Total expenses = 110
    // Grand total = 220

    it('should calculate profit correctly', () => {
      const projectFees = '300';
      // Profit = 300 - 220 = 80
      expect(calculateProfit(
        projectFees,
        employeeAllocations,
        timeContingency,
        expenses,
        surveyWorks,
        outsideAgency,
        projectSpecific
      )).toBe(80);
    });

    it('should handle zero project fees', () => {
      const projectFees = '0';
      // Profit = 0 - 220 = -220
      expect(calculateProfit(
        projectFees,
        employeeAllocations,
        timeContingency,
        expenses,
        surveyWorks,
        outsideAgency,
        projectSpecific
      )).toBe(-220);
    });

    it('should handle invalid project fees', () => {
      const projectFees = 'abc';
      // Profit = 0 - 220 = -220
      expect(calculateProfit(
        projectFees,
        employeeAllocations,
        timeContingency,
        expenses,
        surveyWorks,
        outsideAgency,
        projectSpecific
      )).toBe(-220);
    });
  });

  describe('calculateServiceTax', () => {
    it('should calculate service tax correctly', () => {
      expect(calculateServiceTax('1000', '10')).toBe(100);
      expect(calculateServiceTax('500', '5')).toBe(25);
    });

    it('should handle zero project fees', () => {
      expect(calculateServiceTax('0', '10')).toBe(0);
    });

    it('should handle zero tax percentage', () => {
      expect(calculateServiceTax('1000', '0')).toBe(0);
    });

    it('should handle invalid inputs', () => {
      expect(calculateServiceTax('abc', '10')).toBe(0);
      expect(calculateServiceTax('1000', 'xyz')).toBe(0);
    });
  });

  describe('calculateTotalProjectFees', () => {
    it('should calculate total project fees correctly', () => {
      // Fees = 1000, Tax = 10% (100) -> Total = 1100
      expect(calculateTotalProjectFees('1000', '10')).toBe(1100);
      // Fees = 500, Tax = 5% (25) -> Total = 525
      expect(calculateTotalProjectFees('500', '5')).toBe(525);
    });

    it('should handle zero project fees', () => {
      expect(calculateTotalProjectFees('0', '10')).toBe(0);
    });

    it('should handle zero tax percentage', () => {
      expect(calculateTotalProjectFees('1000', '0')).toBe(1000);
    });

    it('should handle invalid inputs', () => {
      expect(calculateTotalProjectFees('abc', '10')).toBe(0);
      expect(calculateTotalProjectFees('1000', 'xyz')).toBe(1000); // Tax becomes 0, so only fees remain
    });
  });
});
