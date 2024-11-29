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
        reportDate: new Date("2024-01-31"),
        ganttProgress: {
            planned: [
                { task: "Topographical Survey", completion: 100 },
                { task: "Soil Investigation", completion: 100 },
                { task: "Social Impact Assessment", completion: 80 }
            ],
            actual: [
                { task: "Topographical Survey", completion: 100 },
                { task: "Soil Investigation", completion: 100 },
                { task: "Social Impact Assessment", completion: 75 }
            ]
        },
        pieChartData: {
            planned: { completed: 30, inProgress: 20, notStarted: 50 },
            actual: { completed: 32, inProgress: 18, notStarted: 50 }
        }
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
        comments: "Process and mechanical design phases initiated",
        reportDate: new Date("2024-02-29"),
        ganttProgress: {
            planned: [
                { task: "Process Design", completion: 100 },
                { task: "Mechanical Design", completion: 90 },
                { task: "Structural Design", completion: 50 }
            ],
            actual: [
                { task: "Process Design", completion: 100 },
                { task: "Mechanical Design", completion: 85 },
                { task: "Structural Design", completion: 45 }
            ]
        },
        pieChartData: {
            planned: { completed: 60, inProgress: 25, notStarted: 15 },
            actual: { completed: 58, inProgress: 27, notStarted: 15 }
        }
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
        schedulePerformanceIndex: 0.98,
        monthlyBreakdown: [
            {
                month: "Jan 2024",
                planned: 100000,
                actual: 96000,
                earned: 98000
            },
            {
                month: "Feb 2024",
                planned: 150000,
                actual: 140000,
                earned: 145000
            }
        ]
    }
];
