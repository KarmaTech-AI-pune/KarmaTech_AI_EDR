// Monthly Progress table with foreign key to projects
export const monthlyProgress = [
    {
        id: 1,
        projectId: 1,
        year: 2024,
        month: 1,
        plannedProgress: 30,
        actualProgress: 32,
        plannedCost: 100000,
        actualCost: 96000,
        comments: "Project kickoff successful, ahead on deliverables",
        reportDate: new Date("2024-01-31")
    },
    {
        id: 2,
        projectId: 1,
        year: 2024,
        month: 2,
        plannedProgress: 60,
        actualProgress: 58,
        plannedCost: 150000,
        actualCost: 140000,
        comments: "Frontend development on track, backend starting",
        reportDate: new Date("2024-02-29")
    },
    {
        id: 3,
        projectId: 1,
        year: 2024,
        month: 3,
        plannedProgress: 90,
        actualProgress: 85,
        plannedCost: 200000,
        actualCost: 180000,
        comments: "Integration testing in progress",
        reportDate: new Date("2024-03-15")
    }
];

// Resource Utilization table - tracks resource usage across projects
export const resourceUtilization = [
    {
        id: 1,
        employeeId: 1,
        projectId: 1,
        year: 2024,
        month: 1,
        plannedHours: 160,
        actualHours: 155,
        utilizationPercentage: 97
    },
    {
        id: 2,
        employeeId: 2,
        projectId: 1,
        year: 2024,
        month: 1,
        plannedHours: 80,
        actualHours: 85,
        utilizationPercentage: 106
    },
    {
        id: 3,
        employeeId: 3,
        projectId: 1,
        year: 2024,
        month: 2,
        plannedHours: 160,
        actualHours: 150,
        utilizationPercentage: 94
    },
    {
        id: 4,
        employeeId: 4,
        projectId: 1,
        year: 2024,
        month: 2,
        plannedHours: 120,
        actualHours: 125,
        utilizationPercentage: 104
    }
];

// Resource Capacity table - tracks overall resource availability
export const resourceCapacity = [
    {
        id: 1,
        employeeId: 1,
        year: 2024,
        month: 1,
        totalCapacity: 160,
        allocated: 155,
        available: 5
    },
    {
        id: 2,
        employeeId: 2,
        year: 2024,
        month: 1,
        totalCapacity: 160,
        allocated: 85,
        available: 75
    },
    {
        id: 3,
        employeeId: 3,
        year: 2024,
        month: 2,
        totalCapacity: 160,
        allocated: 150,
        available: 10
    },
    {
        id: 4,
        employeeId: 4,
        year: 2024,
        month: 2,
        totalCapacity: 160,
        allocated: 125,
        available: 35
    }
];

// Project Financials table - tracks financial metrics
export const projectFinancials = [
    {
        id: 1,
        projectId: 1,
        plannedCost: 450000,
        actualCost: 416000,
        variance: 34000,
        earnedValue: 425000,
        costPerformanceIndex: 1.02,
        schedulePerformanceIndex: 0.98
    }
];
