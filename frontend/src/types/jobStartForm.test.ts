/**
 * Unit Tests for Job Start Form Types
 * 
 * Tests type definitions, interfaces, and type safety for job start form types.
 * Ensures proper TypeScript compilation and type constraints.
 */

import { describe, it, expect } from 'vitest';
import type { 
  TaskAllocation,
  EmployeeAllocation,
  ExpenseEntry,
  OutsideAgencyEntry,
  ProjectSpecificEntry,
  TimeContingencyEntry,
  ServiceTaxEntry,
  ExpensesType,
  OutsideAgencyType,
  ProjectSpecificType,
  JobStartFormState,
  TimeSectionProps,
  SectionSummaryRowProps
} from './jobStartForm';

describe('Job Start Form Types', () => {
  describe('TaskAllocation Interface', () => {
    it('should accept valid task allocation object', () => {
      // Arrange
      const taskAllocation: TaskAllocation = {
        taskId: 'task-123',
        title: 'Frontend Development',
        rate: 75.50,
        hours: 40,
        cost: 3020.00
      };

      // Assert
      expect(taskAllocation.taskId).toBe('task-123');
      expect(taskAllocation.title).toBe('Frontend Development');
      expect(taskAllocation.rate).toBe(75.50);
      expect(taskAllocation.hours).toBe(40);
      expect(taskAllocation.cost).toBe(3020.00);
    });

    it('should enforce required properties', () => {
      // Arrange
      const taskAllocation: TaskAllocation = {
        taskId: 'task-456',
        title: 'Backend Development',
        rate: 80.00,
        hours: 35,
        cost: 2800.00
      };

      // Assert
      expect(taskAllocation).toHaveProperty('taskId');
      expect(taskAllocation).toHaveProperty('title');
      expect(taskAllocation).toHaveProperty('rate');
      expect(taskAllocation).toHaveProperty('hours');
      expect(taskAllocation).toHaveProperty('cost');
    });

    it('should handle cost calculations correctly', () => {
      // Arrange
      const taskAllocation: TaskAllocation = {
        taskId: 'calc-test',
        title: 'Testing Task',
        rate: 60.00,
        hours: 20,
        cost: 1200.00
      };

      // Act
      const calculatedCost = taskAllocation.rate * taskAllocation.hours;

      // Assert
      expect(calculatedCost).toBe(taskAllocation.cost);
    });

    it('should handle decimal precision in rates and costs', () => {
      // Arrange
      const precisionTask: TaskAllocation = {
        taskId: 'precision-test',
        title: 'Precision Task',
        rate: 87.654321,
        hours: 12.5,
        cost: 1095.679
      };

      // Assert
      expect(precisionTask.rate).toBeCloseTo(87.654321, 6);
      expect(precisionTask.hours).toBeCloseTo(12.5, 1);
      expect(precisionTask.cost).toBeCloseTo(1095.679, 3);
    });
  });

  describe('EmployeeAllocation Interface', () => {
    it('should accept valid employee allocation object', () => {
      // Arrange
      const taskAllocation: TaskAllocation = {
        taskId: 'task-1',
        title: 'Development',
        rate: 70.00,
        hours: 40,
        cost: 2800.00
      };

      const employeeAllocation: EmployeeAllocation = {
        id: 'emp-123',
        name: 'John Doe',
        is_consultant: false,
        allocations: [taskAllocation],
        totalHours: 40,
        totalCost: 2800.00,
        remarks: 'Full-time developer'
      };

      // Assert
      expect(employeeAllocation.id).toBe('emp-123');
      expect(employeeAllocation.name).toBe('John Doe');
      expect(employeeAllocation.is_consultant).toBe(false);
      expect(employeeAllocation.allocations).toHaveLength(1);
      expect(employeeAllocation.totalHours).toBe(40);
      expect(employeeAllocation.totalCost).toBe(2800.00);
      expect(employeeAllocation.remarks).toBe('Full-time developer');
    });

    it('should handle consultant vs employee correctly', () => {
      // Arrange
      const consultant: EmployeeAllocation = {
        id: 'consultant-1',
        name: 'Jane Consultant',
        is_consultant: true,
        allocations: [],
        totalHours: 20,
        totalCost: 3000.00,
        remarks: 'External consultant'
      };

      const employee: EmployeeAllocation = {
        id: 'employee-1',
        name: 'Bob Employee',
        is_consultant: false,
        allocations: [],
        totalHours: 40,
        totalCost: 2800.00,
        remarks: 'Internal employee'
      };

      // Assert
      expect(consultant.is_consultant).toBe(true);
      expect(employee.is_consultant).toBe(false);
      expect(consultant.totalCost / consultant.totalHours).toBeGreaterThan(employee.totalCost / employee.totalHours);
    });

    it('should handle multiple task allocations', () => {
      // Arrange
      const allocations: TaskAllocation[] = [
        { taskId: 'task-1', title: 'Frontend', rate: 70, hours: 20, cost: 1400 },
        { taskId: 'task-2', title: 'Backend', rate: 80, hours: 15, cost: 1200 }
      ];

      const employee: EmployeeAllocation = {
        id: 'multi-task-emp',
        name: 'Multi Task Employee',
        is_consultant: false,
        allocations: allocations,
        totalHours: 35,
        totalCost: 2600,
        remarks: 'Multi-skilled developer'
      };

      // Act
      const calculatedHours = employee.allocations.reduce((sum, alloc) => sum + alloc.hours, 0);
      const calculatedCost = employee.allocations.reduce((sum, alloc) => sum + alloc.cost, 0);

      // Assert
      expect(calculatedHours).toBe(employee.totalHours);
      expect(calculatedCost).toBe(employee.totalCost);
      expect(employee.allocations).toHaveLength(2);
    });
  });

  describe('ExpenseEntry Interface', () => {
    it('should accept valid expense entry object', () => {
      // Arrange
      const expenseEntry: ExpenseEntry = {
        number: '1500.00',
        remarks: 'Travel expenses for client meetings'
      };

      // Assert
      expect(expenseEntry.number).toBe('1500.00');
      expect(expenseEntry.remarks).toBe('Travel expenses for client meetings');
    });

    it('should handle empty values', () => {
      // Arrange
      const emptyExpense: ExpenseEntry = {
        number: '',
        remarks: ''
      };

      // Assert
      expect(emptyExpense.number).toBe('');
      expect(emptyExpense.remarks).toBe('');
    });

    it('should handle special characters in remarks', () => {
      // Arrange
      const specialExpense: ExpenseEntry = {
        number: '2500.50',
        remarks: 'Equipment & software licenses (50% discount)'
      };

      // Assert
      expect(specialExpense.remarks).toContain('&');
      expect(specialExpense.remarks).toContain('(');
      expect(specialExpense.remarks).toContain('%');
    });
  });

  describe('OutsideAgencyEntry Interface', () => {
    it('should accept valid outside agency entry object', () => {
      // Arrange
      const agencyEntry: OutsideAgencyEntry = {
        description: 'External Security Audit',
        rate: '150.00',
        units: '10',
        remarks: 'Comprehensive security assessment'
      };

      // Assert
      expect(agencyEntry.description).toBe('External Security Audit');
      expect(agencyEntry.rate).toBe('150.00');
      expect(agencyEntry.units).toBe('10');
      expect(agencyEntry.remarks).toBe('Comprehensive security assessment');
    });

    it('should handle string-based numeric values', () => {
      // Arrange
      const agencyEntry: OutsideAgencyEntry = {
        description: 'Consulting Services',
        rate: '200.50',
        units: '5.5',
        remarks: 'Hourly consulting'
      };

      // Act
      const calculatedCost = parseFloat(agencyEntry.rate) * parseFloat(agencyEntry.units);

      // Assert
      expect(typeof agencyEntry.rate).toBe('string');
      expect(typeof agencyEntry.units).toBe('string');
      expect(calculatedCost).toBeCloseTo(1102.75, 2);
    });
  });

  describe('ProjectSpecificEntry Interface', () => {
    it('should accept valid project specific entry object', () => {
      // Arrange
      const projectEntry: ProjectSpecificEntry = {
        name: 'Custom Integration Module',
        number: '5000.00',
        remarks: 'Client-specific integration requirements'
      };

      // Assert
      expect(projectEntry.name).toBe('Custom Integration Module');
      expect(projectEntry.number).toBe('5000.00');
      expect(projectEntry.remarks).toBe('Client-specific integration requirements');
    });

    it('should handle long names and descriptions', () => {
      // Arrange
      const longEntry: ProjectSpecificEntry = {
        name: 'Very Long Project Specific Entry Name That Exceeds Normal Length',
        number: '10000.00',
        remarks: 'This is a very detailed remark that explains the complex nature of this project-specific requirement and its implementation details'
      };

      // Assert
      expect(longEntry.name.length).toBeGreaterThan(50);
      expect(longEntry.remarks.length).toBeGreaterThan(100);
    });
  });

  describe('TimeContingencyEntry Interface', () => {
    it('should accept valid time contingency entry object', () => {
      // Arrange
      const timeContingency: TimeContingencyEntry = {
        units: '40',
        remarks: 'Buffer time for unexpected issues'
      };

      // Assert
      expect(timeContingency.units).toBe('40');
      expect(timeContingency.remarks).toBe('Buffer time for unexpected issues');
    });

    it('should handle decimal units as strings', () => {
      // Arrange
      const decimalContingency: TimeContingencyEntry = {
        units: '15.5',
        remarks: 'Partial hour contingency'
      };

      // Assert
      expect(decimalContingency.units).toBe('15.5');
      expect(parseFloat(decimalContingency.units)).toBe(15.5);
    });
  });

  describe('ServiceTaxEntry Interface', () => {
    it('should accept valid service tax entry object', () => {
      // Arrange
      const serviceTax: ServiceTaxEntry = {
        percentage: '18.0'
      };

      // Assert
      expect(serviceTax.percentage).toBe('18.0');
    });

    it('should handle different percentage formats', () => {
      // Arrange
      const percentages: ServiceTaxEntry[] = [
        { percentage: '0' },
        { percentage: '5.5' },
        { percentage: '18' },
        { percentage: '28.0' }
      ];

      // Assert
      percentages.forEach(tax => {
        expect(typeof tax.percentage).toBe('string');
        expect(parseFloat(tax.percentage)).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Complex Type Definitions', () => {
    describe('ExpensesType', () => {
      it('should accept valid expenses type object', () => {
        // Arrange
        const expenses: ExpensesType = {
          '2a': { number: '1000', remarks: 'Travel expenses' },
          '2b': { number: '500', remarks: 'Accommodation' },
          '3': { number: '200', remarks: 'Communication' },
          '4': { number: '300', remarks: 'Utilities' },
          '5': { number: '150', remarks: 'Office supplies' },
          '7': { number: '250', remarks: 'Miscellaneous' }
        };

        // Assert
        expect(expenses['2a'].number).toBe('1000');
        expect(expenses['2b'].remarks).toBe('Accommodation');
        expect(expenses['3'].number).toBe('200');
        expect(expenses['4'].remarks).toBe('Utilities');
        expect(expenses['5'].number).toBe('150');
        expect(expenses['7'].remarks).toBe('Miscellaneous');
      });

      it('should enforce specific key structure', () => {
        // Arrange
        const expenses: ExpensesType = {
          '2a': { number: '100', remarks: 'Test 2a' },
          '2b': { number: '200', remarks: 'Test 2b' },
          '3': { number: '300', remarks: 'Test 3' },
          '4': { number: '400', remarks: 'Test 4' },
          '5': { number: '500', remarks: 'Test 5' },
          '7': { number: '700', remarks: 'Test 7' }
        };

        // Act
        const keys = Object.keys(expenses);

        // Assert
        expect(keys).toContain('2a');
        expect(keys).toContain('2b');
        expect(keys).toContain('3');
        expect(keys).toContain('4');
        expect(keys).toContain('5');
        expect(keys).toContain('7');
        expect(keys).toHaveLength(6);
      });
    });

    describe('OutsideAgencyType', () => {
      it('should accept valid outside agency type object', () => {
        // Arrange
        const outsideAgency: OutsideAgencyType = {
          'a': { description: 'Agency A', rate: '100', units: '10', remarks: 'First agency' },
          'b': { description: 'Agency B', rate: '150', units: '8', remarks: 'Second agency' },
          'c': { description: 'Agency C', rate: '200', units: '5', remarks: 'Third agency' }
        };

        // Assert
        expect(outsideAgency['a'].description).toBe('Agency A');
        expect(outsideAgency['b'].rate).toBe('150');
        expect(outsideAgency['c'].units).toBe('5');
      });

      it('should support cost calculations across agencies', () => {
        // Arrange
        const outsideAgency: OutsideAgencyType = {
          'a': { description: 'Dev Agency', rate: '120', units: '10', remarks: 'Development' },
          'b': { description: 'Design Agency', rate: '100', units: '15', remarks: 'UI/UX Design' },
          'c': { description: 'QA Agency', rate: '80', units: '20', remarks: 'Quality Assurance' }
        };

        // Act
        const totalCost = Object.values(outsideAgency).reduce((sum, agency) => {
          return sum + (parseFloat(agency.rate) * parseFloat(agency.units));
        }, 0);

        // Assert
        expect(totalCost).toBe(4300); // (120*10) + (100*15) + (80*20)
      });
    });

    describe('ProjectSpecificType', () => {
      it('should accept valid project specific type object', () => {
        // Arrange
        const projectSpecific: ProjectSpecificType = {
          '6c': { name: 'Custom Module C', number: '3000', remarks: 'Module C development' },
          '6d': { name: 'Custom Module D', number: '4000', remarks: 'Module D development' },
          '6e': { name: 'Custom Module E', number: '5000', remarks: 'Module E development' }
        };

        // Assert
        expect(projectSpecific['6c'].name).toBe('Custom Module C');
        expect(projectSpecific['6d'].number).toBe('4000');
        expect(projectSpecific['6e'].remarks).toBe('Module E development');
      });

      it('should handle total project specific costs', () => {
        // Arrange
        const projectSpecific: ProjectSpecificType = {
          '6c': { name: 'Integration', number: '2500', remarks: 'API Integration' },
          '6d': { name: 'Customization', number: '3500', remarks: 'UI Customization' },
          '6e': { name: 'Migration', number: '4000', remarks: 'Data Migration' }
        };

        // Act
        const totalCost = Object.values(projectSpecific).reduce((sum, item) => {
          return sum + parseFloat(item.number);
        }, 0);

        // Assert
        expect(totalCost).toBe(10000);
      });
    });
  });

  describe('JobStartFormState Interface', () => {
    it('should accept valid job start form state object', () => {
      // Arrange
      const formState: JobStartFormState = {
        employeeAllocations: [],
        timeContingency: { units: '10', remarks: 'Buffer time' },
        expenses: {
          '2a': { number: '100', remarks: 'Travel' },
          '2b': { number: '200', remarks: 'Stay' },
          '3': { number: '50', remarks: 'Comm' },
          '4': { number: '75', remarks: 'Utils' },
          '5': { number: '25', remarks: 'Supplies' },
          '7': { number: '30', remarks: 'Misc' }
        },
        surveyWorks: { number: '500', remarks: 'Survey work' },
        outsideAgency: {
          'a': { description: 'Agency A', rate: '100', units: '5', remarks: 'Service A' },
          'b': { description: 'Agency B', rate: '150', units: '3', remarks: 'Service B' },
          'c': { description: 'Agency C', rate: '200', units: '2', remarks: 'Service C' }
        },
        projectSpecific: {
          '6c': { name: 'Module C', number: '1000', remarks: 'Custom module C' },
          '6d': { name: 'Module D', number: '1500', remarks: 'Custom module D' },
          '6e': { name: 'Module E', number: '2000', remarks: 'Custom module E' }
        },
        projectFees: '50000',
        serviceTax: { percentage: '18' },
        isUpdating: false,
        currentFormId: 'form-123',
        loading: false,
        error: null,
        submitting: false,
        snackbarOpen: false,
        snackbarMessage: '',
        snackbarSeverity: 'success',
        expanded: ['section1', 'section2']
      };

      // Assert
      expect(formState.employeeAllocations).toEqual([]);
      expect(formState.timeContingency.units).toBe('10');
      expect(formState.projectFees).toBe('50000');
      expect(formState.serviceTax.percentage).toBe('18');
      expect(formState.isUpdating).toBe(false);
      expect(formState.loading).toBe(false);
      expect(formState.error).toBeNull();
      expect(formState.snackbarSeverity).toBe('success');
      expect(formState.expanded).toHaveLength(2);
    });

    it('should handle form state transitions', () => {
      // Arrange
      const initialState: Partial<JobStartFormState> = {
        loading: false,
        submitting: false,
        error: null,
        snackbarOpen: false
      };

      const loadingState: Partial<JobStartFormState> = {
        loading: true,
        submitting: false,
        error: null,
        snackbarOpen: false
      };

      const errorState: Partial<JobStartFormState> = {
        loading: false,
        submitting: false,
        error: 'Submission failed',
        snackbarOpen: true,
        snackbarMessage: 'Error occurred',
        snackbarSeverity: 'error'
      };

      // Assert
      expect(initialState.loading).toBe(false);
      expect(loadingState.loading).toBe(true);
      expect(errorState.error).toBe('Submission failed');
      expect(errorState.snackbarSeverity).toBe('error');
    });

    it('should handle currentFormId as string or number', () => {
      // Arrange
      const stringIdState: Partial<JobStartFormState> = {
        currentFormId: 'form-abc-123'
      };

      const numberIdState: Partial<JobStartFormState> = {
        currentFormId: 12345
      };

      const nullIdState: Partial<JobStartFormState> = {
        currentFormId: null
      };

      // Assert
      expect(typeof stringIdState.currentFormId).toBe('string');
      expect(typeof numberIdState.currentFormId).toBe('number');
      expect(nullIdState.currentFormId).toBeNull();
    });
  });

  describe('Component Props Interfaces', () => {
    describe('TimeSectionProps', () => {
      it('should accept valid time section props', () => {
        // Arrange
        const mockFunctions = {
          onRemarksChange: () => {},
          onTimeContingencyChange: () => {},
          calculateTotalCost: () => 1000,
          calculateTimeContingencyCost: () => 100,
          calculateTotalTimeCost: () => 1100,
          handleAccordionChange: () => {},
          formatTitle: (title: string) => title.toUpperCase()
        };

        const props: TimeSectionProps = {
          employeeAllocations: [],
          timeContingency: { units: '10', remarks: 'Buffer' },
          ...mockFunctions,
          expanded: ['time-section'],
          textFieldStyle: { margin: '8px' },
          tableHeaderStyle: { fontWeight: 'bold' },
          tableCellStyle: { padding: '4px' },
          accordionStyle: { marginBottom: '16px' },
          sectionStyle: { padding: '16px' },
          summaryRowStyle: { backgroundColor: '#f5f5f5' }
        };

        // Assert
        expect(props.employeeAllocations).toEqual([]);
        expect(props.timeContingency.units).toBe('10');
        expect(props.expanded).toContain('time-section');
        expect(typeof props.calculateTotalCost).toBe('function');
        expect(typeof props.formatTitle).toBe('function');
      });
    });

    describe('SectionSummaryRowProps', () => {
      it('should accept valid section summary row props', () => {
        // Arrange
        const props: SectionSummaryRowProps = {
          label: 'Total Cost',
          value: 15000,
          colSpan: 3,
          isHighlighted: true,
          isNegativeHighlight: false,
          tableCellStyle: { padding: '8px' },
          summaryRowStyle: { fontWeight: 'bold' }
        };

        // Assert
        expect(props.label).toBe('Total Cost');
        expect(props.value).toBe(15000);
        expect(props.colSpan).toBe(3);
        expect(props.isHighlighted).toBe(true);
        expect(props.isNegativeHighlight).toBe(false);
      });

      it('should handle string and number values', () => {
        // Arrange
        const numberProps: SectionSummaryRowProps = {
          label: 'Numeric Value',
          value: 12345.67,
          tableCellStyle: {}
        };

        const stringProps: SectionSummaryRowProps = {
          label: 'String Value',
          value: '$12,345.67',
          tableCellStyle: {}
        };

        // Assert
        expect(typeof numberProps.value).toBe('number');
        expect(typeof stringProps.value).toBe('string');
      });

      it('should handle optional properties', () => {
        // Arrange
        const minimalProps: SectionSummaryRowProps = {
          label: 'Minimal Row',
          value: 100,
          tableCellStyle: {}
        };

        // Assert
        expect(minimalProps.colSpan).toBeUndefined();
        expect(minimalProps.isHighlighted).toBeUndefined();
        expect(minimalProps.isNegativeHighlight).toBeUndefined();
        expect(minimalProps.summaryRowStyle).toBeUndefined();
      });
    });
  });

  describe('JSON Serialization Compatibility', () => {
    it('should serialize and deserialize TaskAllocation correctly', () => {
      // Arrange
      const original: TaskAllocation = {
        taskId: 'serialize-test',
        title: 'Serializable Task',
        rate: 85.75,
        hours: 25.5,
        cost: 2186.625
      };

      // Act
      const serialized = JSON.stringify(original);
      const deserialized: TaskAllocation = JSON.parse(serialized);

      // Assert
      expect(deserialized).toEqual(original);
      expect(typeof deserialized.rate).toBe('number');
      expect(typeof deserialized.hours).toBe('number');
      expect(typeof deserialized.cost).toBe('number');
    });

    it('should serialize and deserialize complex form state correctly', () => {
      // Arrange
      const originalState: Partial<JobStartFormState> = {
        projectFees: '75000',
        serviceTax: { percentage: '18.5' },
        isUpdating: true,
        loading: false,
        error: null,
        snackbarSeverity: 'success',
        expanded: ['section1', 'section2', 'section3']
      };

      // Act
      const serialized = JSON.stringify(originalState);
      const deserialized: Partial<JobStartFormState> = JSON.parse(serialized);

      // Assert
      expect(deserialized).toEqual(originalState);
      expect(typeof deserialized.isUpdating).toBe('boolean');
      expect(Array.isArray(deserialized.expanded)).toBe(true);
      expect(deserialized.error).toBeNull();
    });
  });
});