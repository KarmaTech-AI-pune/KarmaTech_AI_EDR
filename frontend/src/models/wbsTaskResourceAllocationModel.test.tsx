import { describe, it, expect } from 'vitest';
import { WBSTaskResourceAllocation } from './wbsTaskResourceAllocationModel';

describe('WBSTaskResourceAllocationModel', () => {
  describe('WBSTaskResourceAllocation Interface', () => {
    it('should create a valid WBSTaskResourceAllocation object with all required fields', () => {
      const allocation: WBSTaskResourceAllocation = {
        id: 'allocation-123',
        wbs_task_id: 'task-456',
        role_id: 'role-789',
        employee_id: 'emp-101',
        cost_rate: 75.50,
        odc: 1200.00,
        created_at: new Date('2024-01-15T10:30:00Z'),
        updated_at: new Date('2024-01-16T14:20:00Z')
      };

      expect(allocation.id).toBe('allocation-123');
      expect(allocation.wbs_task_id).toBe('task-456');
      expect(allocation.role_id).toBe('role-789');
      expect(allocation.employee_id).toBe('emp-101');
      expect(allocation.cost_rate).toBe(75.50);
      expect(allocation.odc).toBe(1200.00);
      expect(allocation.created_at).toBeInstanceOf(Date);
      expect(allocation.updated_at).toBeInstanceOf(Date);
    });

    it('should handle allocation with null role_id', () => {
      const allocation: WBSTaskResourceAllocation = {
        id: 'allocation-no-role',
        wbs_task_id: 'task-789',
        role_id: null,
        employee_id: 'emp-202',
        cost_rate: 60.00,
        odc: 800.00,
        created_at: new Date('2024-01-20T09:00:00Z'),
        updated_at: new Date('2024-01-21T16:30:00Z')
      };

      expect(allocation.role_id).toBeNull();
      expect(allocation.employee_id).toBe('emp-202');
    });

    it('should handle allocation with null employee_id', () => {
      const allocation: WBSTaskResourceAllocation = {
        id: 'allocation-no-employee',
        wbs_task_id: 'task-999',
        role_id: 'role-555',
        employee_id: null,
        cost_rate: 85.00,
        odc: 1500.00,
        created_at: new Date('2024-01-25T11:15:00Z'),
        updated_at: new Date('2024-01-26T17:45:00Z')
      };

      expect(allocation.role_id).toBe('role-555');
      expect(allocation.employee_id).toBeNull();
    });

    it('should handle allocation with both role_id and employee_id as null', () => {
      const allocation: WBSTaskResourceAllocation = {
        id: 'allocation-no-role-employee',
        wbs_task_id: 'task-111',
        role_id: null,
        employee_id: null,
        cost_rate: 50.00,
        odc: 600.00,
        created_at: new Date('2024-02-01T08:00:00Z'),
        updated_at: new Date('2024-02-02T12:30:00Z')
      };

      expect(allocation.role_id).toBeNull();
      expect(allocation.employee_id).toBeNull();
      expect(allocation.cost_rate).toBe(50.00);
      expect(allocation.odc).toBe(600.00);
    });

    it('should handle allocation with optional total_hours', () => {
      const allocation: WBSTaskResourceAllocation = {
        id: 'allocation-with-hours',
        wbs_task_id: 'task-hours-test',
        role_id: 'role-dev',
        employee_id: 'emp-dev-001',
        cost_rate: 80.00,
        odc: 1000.00,
        total_hours: 40,
        created_at: new Date('2024-02-05T09:30:00Z'),
        updated_at: new Date('2024-02-06T15:00:00Z')
      };

      expect(allocation.total_hours).toBe(40);
      expect(typeof allocation.total_hours).toBe('number');
    });

    it('should handle allocation with optional total_cost', () => {
      const allocation: WBSTaskResourceAllocation = {
        id: 'allocation-with-cost',
        wbs_task_id: 'task-cost-test',
        role_id: 'role-manager',
        employee_id: 'emp-manager-001',
        cost_rate: 100.00,
        odc: 2000.00,
        total_cost: 5000.00,
        created_at: new Date('2024-02-10T10:00:00Z'),
        updated_at: new Date('2024-02-11T16:30:00Z')
      };

      expect(allocation.total_cost).toBe(5000.00);
      expect(typeof allocation.total_cost).toBe('number');
    });

    it('should handle allocation with both optional fields', () => {
      const allocation: WBSTaskResourceAllocation = {
        id: 'allocation-full-optional',
        wbs_task_id: 'task-full-test',
        role_id: 'role-senior',
        employee_id: 'emp-senior-001',
        cost_rate: 120.00,
        odc: 2500.00,
        total_hours: 80,
        total_cost: 12100.00, // (80 * 120) + 2500
        created_at: new Date('2024-02-15T11:00:00Z'),
        updated_at: new Date('2024-02-16T17:30:00Z')
      };

      expect(allocation.total_hours).toBe(80);
      expect(allocation.total_cost).toBe(12100.00);
      
      // Verify calculation: (hours * rate) + odc
      const expectedCost = (allocation.total_hours! * allocation.cost_rate) + allocation.odc;
      expect(allocation.total_cost).toBe(expectedCost);
    });

    it('should handle allocation with employee object', () => {
      const employeeData = {
        id: 'emp-with-data',
        name: 'John Doe',
        email: 'john.doe@company.com',
        role: 'Senior Developer'
      };

      const allocation: WBSTaskResourceAllocation = {
        id: 'allocation-with-employee-obj',
        wbs_task_id: 'task-employee-test',
        role_id: 'role-senior-dev',
        employee_id: 'emp-with-data',
        cost_rate: 95.00,
        odc: 1800.00,
        total_hours: 60,
        total_cost: 7500.00,
        created_at: new Date('2024-02-20T09:00:00Z'),
        updated_at: new Date('2024-02-21T18:00:00Z'),
        employee: employeeData
      };

      expect(allocation.employee).toBeDefined();
      expect(allocation.employee).toEqual(employeeData);
    });

    it('should handle different cost rates', () => {
      const costRates = [25.00, 50.00, 75.00, 100.00, 125.00, 150.00];
      
      const allocations: WBSTaskResourceAllocation[] = costRates.map((rate, index) => ({
        id: `allocation-rate-${index}`,
        wbs_task_id: `task-rate-${index}`,
        role_id: `role-${index}`,
        employee_id: `emp-${index}`,
        cost_rate: rate,
        odc: rate * 10, // ODC proportional to rate
        created_at: new Date(),
        updated_at: new Date()
      }));

      allocations.forEach((allocation, index) => {
        expect(allocation.cost_rate).toBe(costRates[index]);
        expect(allocation.odc).toBe(costRates[index] * 10);
      });
    });

    it('should handle different ODC values', () => {
      const odcValues = [0, 500, 1000, 1500, 2000, 3000];
      
      const allocations: WBSTaskResourceAllocation[] = odcValues.map((odc, index) => ({
        id: `allocation-odc-${index}`,
        wbs_task_id: `task-odc-${index}`,
        role_id: `role-odc-${index}`,
        employee_id: `emp-odc-${index}`,
        cost_rate: 75.00,
        odc: odc,
        created_at: new Date(),
        updated_at: new Date()
      }));

      allocations.forEach((allocation, index) => {
        expect(allocation.odc).toBe(odcValues[index]);
      });
    });

    it('should handle multiple allocations for same task', () => {
      const taskId = 'multi-allocation-task';
      const allocations: WBSTaskResourceAllocation[] = [
        {
          id: 'alloc-1',
          wbs_task_id: taskId,
          role_id: 'role-dev',
          employee_id: 'emp-dev-1',
          cost_rate: 80.00,
          odc: 1000.00,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 'alloc-2',
          wbs_task_id: taskId,
          role_id: 'role-tester',
          employee_id: 'emp-tester-1',
          cost_rate: 60.00,
          odc: 800.00,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 'alloc-3',
          wbs_task_id: taskId,
          role_id: 'role-designer',
          employee_id: 'emp-designer-1',
          cost_rate: 70.00,
          odc: 900.00,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      allocations.forEach(allocation => {
        expect(allocation.wbs_task_id).toBe(taskId);
      });

      expect(allocations).toHaveLength(3);
    });

    it('should calculate total project cost from multiple allocations', () => {
      const allocations: WBSTaskResourceAllocation[] = [
        {
          id: 'calc-1',
          wbs_task_id: 'calc-task-1',
          role_id: 'role-1',
          employee_id: 'emp-1',
          cost_rate: 100.00,
          odc: 1000.00,
          total_hours: 40,
          total_cost: 5000.00, // (40 * 100) + 1000
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 'calc-2',
          wbs_task_id: 'calc-task-2',
          role_id: 'role-2',
          employee_id: 'emp-2',
          cost_rate: 80.00,
          odc: 800.00,
          total_hours: 30,
          total_cost: 3200.00, // (30 * 80) + 800
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      const totalProjectCost = allocations.reduce((sum, allocation) => {
        return sum + (allocation.total_cost || 0);
      }, 0);

      expect(totalProjectCost).toBe(8200.00);
    });
  });

  describe('Type Safety and Validation', () => {
    it('should enforce string types for ID fields', () => {
      const allocation: WBSTaskResourceAllocation = {
        id: 'string-id-test',
        wbs_task_id: 'string-task-id',
        role_id: 'string-role-id',
        employee_id: 'string-employee-id',
        cost_rate: 75.00,
        odc: 1000.00,
        created_at: new Date(),
        updated_at: new Date()
      };

      expect(typeof allocation.id).toBe('string');
      expect(typeof allocation.wbs_task_id).toBe('string');
      expect(typeof allocation.role_id).toBe('string');
      expect(typeof allocation.employee_id).toBe('string');
    });

    it('should enforce number types for cost fields', () => {
      const allocation: WBSTaskResourceAllocation = {
        id: 'number-type-test',
        wbs_task_id: 'task-number-test',
        role_id: 'role-number-test',
        employee_id: 'emp-number-test',
        cost_rate: 85.75,
        odc: 1250.50,
        total_hours: 45,
        total_cost: 6109.25,
        created_at: new Date(),
        updated_at: new Date()
      };

      expect(typeof allocation.cost_rate).toBe('number');
      expect(typeof allocation.odc).toBe('number');
      expect(typeof allocation.total_hours).toBe('number');
      expect(typeof allocation.total_cost).toBe('number');
    });

    it('should enforce Date type for timestamp fields', () => {
      const now = new Date();
      const allocation: WBSTaskResourceAllocation = {
        id: 'date-type-test',
        wbs_task_id: 'task-date-test',
        role_id: 'role-date-test',
        employee_id: 'emp-date-test',
        cost_rate: 90.00,
        odc: 1500.00,
        created_at: now,
        updated_at: now
      };

      expect(allocation.created_at).toBeInstanceOf(Date);
      expect(allocation.updated_at).toBeInstanceOf(Date);
    });

    it('should handle null values for optional ID fields', () => {
      const allocation: WBSTaskResourceAllocation = {
        id: 'null-fields-test',
        wbs_task_id: 'task-null-test',
        role_id: null,
        employee_id: null,
        cost_rate: 70.00,
        odc: 900.00,
        created_at: new Date(),
        updated_at: new Date()
      };

      expect(allocation.role_id).toBeNull();
      expect(allocation.employee_id).toBeNull();
    });

    it('should handle undefined values for optional fields', () => {
      const allocation: WBSTaskResourceAllocation = {
        id: 'undefined-fields-test',
        wbs_task_id: 'task-undefined-test',
        role_id: 'role-test',
        employee_id: 'emp-test',
        cost_rate: 65.00,
        odc: 850.00,
        created_at: new Date(),
        updated_at: new Date()
        // total_hours, total_cost, and employee are undefined
      };

      expect(allocation.total_hours).toBeUndefined();
      expect(allocation.total_cost).toBeUndefined();
      expect(allocation.employee).toBeUndefined();
    });
  });

  describe('Business Logic Validation', () => {
    it('should validate cost calculation consistency', () => {
      const allocation: WBSTaskResourceAllocation = {
        id: 'cost-validation-test',
        wbs_task_id: 'task-cost-validation',
        role_id: 'role-validation',
        employee_id: 'emp-validation',
        cost_rate: 100.00,
        odc: 2000.00,
        total_hours: 50,
        total_cost: 7000.00, // (50 * 100) + 2000
        created_at: new Date(),
        updated_at: new Date()
      };

      // Verify cost calculation
      if (allocation.total_hours && allocation.total_cost) {
        const expectedCost = (allocation.total_hours * allocation.cost_rate) + allocation.odc;
        expect(allocation.total_cost).toBe(expectedCost);
      }
    });

    it('should handle zero cost scenarios', () => {
      const allocation: WBSTaskResourceAllocation = {
        id: 'zero-cost-test',
        wbs_task_id: 'task-zero-cost',
        role_id: 'role-volunteer',
        employee_id: 'emp-volunteer',
        cost_rate: 0,
        odc: 0,
        total_hours: 20,
        total_cost: 0,
        created_at: new Date(),
        updated_at: new Date()
      };

      expect(allocation.cost_rate).toBe(0);
      expect(allocation.odc).toBe(0);
      expect(allocation.total_cost).toBe(0);
    });

    it('should handle high-value allocations', () => {
      const allocation: WBSTaskResourceAllocation = {
        id: 'high-value-test',
        wbs_task_id: 'task-high-value',
        role_id: 'role-executive',
        employee_id: 'emp-executive',
        cost_rate: 500.00,
        odc: 10000.00,
        total_hours: 100,
        total_cost: 60000.00, // (100 * 500) + 10000
        created_at: new Date(),
        updated_at: new Date()
      };

      expect(allocation.cost_rate).toBe(500.00);
      expect(allocation.odc).toBe(10000.00);
      expect(allocation.total_cost).toBe(60000.00);
    });

    it('should handle fractional hours and costs', () => {
      const allocation: WBSTaskResourceAllocation = {
        id: 'fractional-test',
        wbs_task_id: 'task-fractional',
        role_id: 'role-part-time',
        employee_id: 'emp-part-time',
        cost_rate: 75.50,
        odc: 1250.75,
        total_hours: 37.5,
        total_cost: 4082.00, // (37.5 * 75.50) + 1250.75
        created_at: new Date(),
        updated_at: new Date()
      };

      expect(allocation.total_hours).toBe(37.5);
      expect(allocation.cost_rate).toBe(75.50);
      expect(allocation.odc).toBe(1250.75);
      
      // Verify fractional calculation
      const expectedCost = (allocation.total_hours! * allocation.cost_rate) + allocation.odc;
      expect(allocation.total_cost).toBe(expectedCost);
    });
  });
});