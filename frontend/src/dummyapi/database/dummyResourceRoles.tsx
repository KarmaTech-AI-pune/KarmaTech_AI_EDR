// Resource Roles table
export const resourceRoles = [
    {
        id: 1,
        name: "Project Manager",
        description: "Oversees project planning and execution",
        minRate: 150,
        maxRate: 200
    },
    {
        id: 2,
        name: "Senior Developer",
        description: "Lead technical implementation and architecture",
        minRate: 100,
        maxRate: 150
    },
    {
        id: 3,
        name: "Developer",
        description: "Implements technical solutions",
        minRate: 75,
        maxRate: 100
    },
    {
        id: 4,
        name: "Business Analyst",
        description: "Requirements analysis and documentation",
        minRate: 80,
        maxRate: 120
    },
    {
        id: 5,
        name: "QA Engineer",
        description: "Quality assurance and testing",
        minRate: 70,
        maxRate: 100
    }
];

// Employees table with foreign key to Resource Roles
export const employees = [
    {
        id: 1,
        roleId: 1,
        name: "Sarah Johnson",
        email: "sarah.j@company.com",
        standardRate: 175,
        costToCompany: 200000,
        isConsultant: false,
        skills: ["Project Management", "Agile", "Risk Management"]
    },
    {
        id: 2,
        roleId: 2,
        name: "Michael Chen",
        email: "michael.c@company.com",
        standardRate: 125,
        costToCompany: 150000,
        isConsultant: false,
        skills: ["Full Stack", "Architecture", "Cloud"]
    },
    {
        id: 3,
        roleId: 3,
        name: "Emily Rodriguez",
        email: "emily.r@company.com",
        standardRate: 85,
        costToCompany: 100000,
        isConsultant: false,
        skills: ["Frontend", "React", "TypeScript"]
    },
    {
        id: 4,
        roleId: 4,
        name: "David Kim",
        email: "david.k@company.com",
        standardRate: 100,
        costToCompany: 120000,
        isConsultant: false,
        skills: ["Requirements Analysis", "Documentation", "Stakeholder Management"]
    },
    {
        id: 5,
        roleId: 5,
        name: "Lisa Patel",
        email: "lisa.p@company.com",
        standardRate: 85,
        costToCompany: 95000,
        isConsultant: false,
        skills: ["Test Automation", "Performance Testing", "Quality Assurance"]
    }
];

// Project Resources table - junction table for Project-Employee assignments
export const projectResources = [
    {
        id: 1,
        projectId: 1,
        employeeId: 1,
        projectRate: 175,
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-12-31")
    },
    {
        id: 2,
        projectId: 1,
        employeeId: 2,
        projectRate: 125,
        startDate: new Date("2024-01-16"),
        endDate: new Date("2024-03-15")
    },
    {
        id: 3,
        projectId: 1,
        employeeId: 3,
        projectRate: 85,
        startDate: new Date("2024-01-16"),
        endDate: new Date("2024-02-15")
    },
    {
        id: 4,
        projectId: 1,
        employeeId: 4,
        projectRate: 100,
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-01-15")
    },
    {
        id: 5,
        projectId: 1,
        employeeId: 5,
        projectRate: 85,
        startDate: new Date("2024-02-16"),
        endDate: new Date("2024-03-15")
    }
];
