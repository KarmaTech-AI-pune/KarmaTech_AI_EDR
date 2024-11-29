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
        name: "Senior Engineer",
        description: "Lead technical design and engineering",
        minRate: 120,
        maxRate: 180
    },
    {
        id: 3,
        name: "Civil Engineer",
        description: "Structural and civil engineering design",
        minRate: 100,
        maxRate: 150
    },
    {
        id: 4,
        name: "Environmental Engineer",
        description: "Environmental assessment and planning",
        minRate: 90,
        maxRate: 140
    },
    {
        id: 5,
        name: "Mechanical Engineer",
        description: "Mechanical systems design",
        minRate: 100,
        maxRate: 150
    },
    {
        id: 6,
        name: "Electrical Engineer",
        description: "Electrical systems and ICA design",
        minRate: 100,
        maxRate: 150
    },
    {
        id: 7,
        name: "Surveyor",
        description: "Topographical and site surveys",
        minRate: 80,
        maxRate: 120
    },
    {
        id: 8,
        name: "Cost Estimator",
        description: "Project costing and estimation",
        minRate: 90,
        maxRate: 130
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
        skills: ["Project Management", "Engineering Management", "Risk Management"]
    },
    {
        id: 2,
        roleId: 2,
        name: "Michael Chen",
        email: "michael.c@company.com",
        standardRate: 150,
        costToCompany: 180000,
        isConsultant: false,
        skills: ["Process Design", "Technical Leadership", "Engineering"]
    },
    {
        id: 3,
        roleId: 3,
        name: "Emily Rodriguez",
        email: "emily.r@company.com",
        standardRate: 125,
        costToCompany: 150000,
        isConsultant: false,
        skills: ["Structural Design", "Civil Engineering", "AutoCAD"]
    },
    {
        id: 4,
        roleId: 4,
        name: "David Kim",
        email: "david.k@company.com",
        standardRate: 115,
        costToCompany: 140000,
        isConsultant: false,
        skills: ["Environmental Assessment", "Impact Analysis", "Sustainability"]
    },
    {
        id: 5,
        roleId: 5,
        name: "Lisa Patel",
        email: "lisa.p@company.com",
        standardRate: 125,
        costToCompany: 150000,
        isConsultant: false,
        skills: ["Mechanical Design", "HVAC", "Piping Systems"]
    },
    {
        id: 6,
        roleId: 6,
        name: "James Wilson",
        email: "james.w@company.com",
        standardRate: 125,
        costToCompany: 150000,
        isConsultant: false,
        skills: ["Electrical Systems", "ICA Design", "Power Distribution"]
    },
    {
        id: 7,
        roleId: 7,
        name: "Robert Taylor",
        email: "robert.t@company.com",
        standardRate: 100,
        costToCompany: 120000,
        isConsultant: false,
        skills: ["Topographical Survey", "GIS", "Site Investigation"]
    },
    {
        id: 8,
        roleId: 8,
        name: "Maria Garcia",
        email: "maria.g@company.com",
        standardRate: 110,
        costToCompany: 130000,
        isConsultant: false,
        skills: ["Cost Estimation", "Quantity Surveying", "Project Economics"]
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
        projectRate: 150,
        startDate: new Date("2024-01-16"),
        endDate: new Date("2024-06-15")
    },
    {
        id: 3,
        projectId: 1,
        employeeId: 3,
        projectRate: 125,
        startDate: new Date("2024-02-01"),
        endDate: new Date("2024-05-31")
    },
    {
        id: 4,
        projectId: 1,
        employeeId: 4,
        projectRate: 115,
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-03-31")
    },
    {
        id: 5,
        projectId: 1,
        employeeId: 5,
        projectRate: 125,
        startDate: new Date("2024-03-01"),
        endDate: new Date("2024-06-30")
    },
    {
        id: 6,
        projectId: 1,
        employeeId: 6,
        projectRate: 125,
        startDate: new Date("2024-03-15"),
        endDate: new Date("2024-07-15")
    },
    {
        id: 7,
        projectId: 1,
        employeeId: 7,
        projectRate: 100,
        startDate: new Date("2024-01-15"),
        endDate: new Date("2024-03-15")
    },
    {
        id: 8,
        projectId: 1,
        employeeId: 8,
        projectRate: 110,
        startDate: new Date("2024-02-01"),
        endDate: new Date("2024-04-30")
    }
];
