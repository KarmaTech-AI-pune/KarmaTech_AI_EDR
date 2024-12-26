import { resourceRole, Employee } from "../../models";

// Resource Roles table
export const resourceRoles: resourceRole[] = [
    {
        id: 1,
        name: "Project Manager",
        description: "Oversees project planning and execution",
        min_rate: 150
    },
    {
        id: 2,
        name: "Senior Engineer",
        description: "Lead technical design and engineering",
        min_rate: 120
    },
    {
        id: 3,
        name: "Civil Engineer",
        description: "Structural and civil engineering design",
        min_rate: 100
    },
    {
        id: 4,
        name: "Environmental Engineer",
        description: "Environmental assessment and planning",
        min_rate: 90
    },
    {
        id: 5,
        name: "Mechanical Engineer",
        description: "Mechanical systems design",
        min_rate: 100
    },
    {
        id: 6,
        name: "Electrical Engineer",
        description: "Electrical systems and ICA design",
        min_rate: 100
    },
    {
        id: 7,
        name: "Surveyor",
        description: "Topographical and site surveys",
        min_rate: 80
    },
    {
        id: 8,
        name: "Cost Estimator",
        description: "Project costing and estimation",
        min_rate: 90
    }
];

// Employees table with foreign key to Resource Roles
export const employees: Employee[] = [
    {
        id: "1",
        name: "Rajesh Kumar",
        email: "rajesh.kumar@company.com",
        role_id: 1,
        standard_rate: 175,
        is_consultant: false,
        is_active: true
    },
    {
        id: "2",
        name: "Priya Sharma",
        email: "priya.sharma@company.com",
        role_id: 2,
        standard_rate: 150,
        is_consultant: false,
        is_active: true
    },
    {
        id: "3",
        name: "Amit Patel",
        email: "amit.patel@company.com",
        role_id: 3,
        standard_rate: 125,
        is_consultant: false,
        is_active: true
    },
    {
        id: "4",
        name: "Deepika Verma",
        email: "deepika.verma@company.com",
        role_id: 4,
        standard_rate: 115,
        is_consultant: false,
        is_active: true
    },
    {
        id: "5",
        name: "Arjun Reddy",
        email: "arjun.reddy@company.com",
        role_id: 5,
        standard_rate: 125,
        is_consultant: false,
        is_active: true
    },
    {
        id: "6",
        name: "Neha Gupta",
        email: "neha.gupta@company.com",
        role_id: 6,
        standard_rate: 125,
        is_consultant: false,
        is_active: true
    },
    {
        id: "7",
        name: "Vikram Singh",
        email: "vikram.singh@company.com",
        role_id: 7,
        standard_rate: 100,
        is_consultant: false,
        is_active: true
    },
    {
        id: "8",
        name: "Ananya Mehta",
        email: "ananya.mehta@company.com",
        role_id: 8,
        standard_rate: 110,
        is_consultant: false,
        is_active: true
    },
    {
        id: "9",
        name: "Rahul Kapoor",
        email: "rahul.kapoor@company.com",
        role_id: 7,
        standard_rate: 100,
        is_consultant: true,
        is_active: true
    },
    {
        id: "10",
        name: "Meera Iyer",
        email: "meera.iyer@company.com",
        role_id: 8,
        standard_rate: 110,
        is_consultant: true,
        is_active: true
    }
];

// Project Resources table - junction table for Project-Employee assignments
export const projectResources = [
    {
        id: 1,
        projectId: 1,
        employeeId: "1",
        projectRate: 175,
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-12-31")
    },
    {
        id: 2,
        projectId: 1,
        employeeId: "2",
        projectRate: 150,
        startDate: new Date("2024-01-16"),
        endDate: new Date("2024-06-15")
    },
    {
        id: 3,
        projectId: 1,
        employeeId: "3",
        projectRate: 125,
        startDate: new Date("2024-02-01"),
        endDate: new Date("2024-05-31")
    },
    {
        id: 4,
        projectId: 1,
        employeeId: "4",
        projectRate: 115,
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-03-31")
    },
    {
        id: 5,
        projectId: 1,
        employeeId: "5",
        projectRate: 125,
        startDate: new Date("2024-03-01"),
        endDate: new Date("2024-06-30")
    },
    {
        id: 6,
        projectId: 1,
        employeeId: "6",
        projectRate: 125,
        startDate: new Date("2024-03-15"),
        endDate: new Date("2024-07-15")
    },
    {
        id: 7,
        projectId: 1,
        employeeId: "7",
        projectRate: 100,
        startDate: new Date("2024-01-15"),
        endDate: new Date("2024-03-15")
    },
    {
        id: 8,
        projectId: 1,
        employeeId: "8",
        projectRate: 110,
        startDate: new Date("2024-02-01"),
        endDate: new Date("2024-04-30")
    }
];
