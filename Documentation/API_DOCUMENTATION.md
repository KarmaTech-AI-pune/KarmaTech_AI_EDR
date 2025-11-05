# API DOCUMENTATION

## Base URLs

### Development Environment
```
API Base URL: http://localhost:5245/api
Swagger UI:   http://localhost:5245/swagger
```

### Production Environment
```
API Base URL: https://njs-project-management.com/api
Swagger UI:   https://njs-project-management.com/swagger
```

### Node.js Backend (Complementary Services)
```
Development:  http://localhost:3000/api
Production:   https://njs-project-management.com/node-api
```

## Authentication Method

### JWT Bearer Token Authentication

All API endpoints (except `/api/user/login` and public endpoints) require JWT Bearer token authentication.

#### Obtaining a Token

**Endpoint**: `POST /api/user/login`

**Request**:
```http
POST /api/user/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": "guid-string",
    "email": "user@example.com",
    "userName": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "role": "Admin",
    "permissions": [
      "EDIT_BUSINESS_DEVELOPMENT",
      "APPROVE_PROJECT",
      "SYSTEM_ADMIN"
    ]
  }
}
```

#### Using the Token

Include the token in the `Authorization` header for all protected endpoints:

```http
GET /api/projects
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

#### Token Expiration

- **Token Lifetime**: 3 hours
- **Refresh**: Re-authenticate when token expires (no refresh token mechanism currently)
- **Validation**: Token validated on every request

## API Endpoints

---

## 1. Authentication & User Management

### 1.1. User Login

**Endpoint**: `POST /api/user/login`

**Description**: Authenticate user and receive JWT token

**Authorization**: None (Public endpoint)

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "email": "user@example.com",
    "userName": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "role": "Admin",
    "permissions": ["EDIT_BUSINESS_DEVELOPMENT", "APPROVE_PROJECT"]
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid credentials
- `400 Bad Request`: Missing or invalid request body

---

### 1.2. Get All Users

**Endpoint**: `GET /api/user`

**Description**: Retrieve list of all users

**Authorization**: Required (Admin only)

**Response** (200 OK):
```json
[
  {
    "userId": "guid-1",
    "email": "user1@example.com",
    "userName": "user1",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "https://example.com/avatars/user1.jpg",
    "isActive": true,
    "lastLogin": "2024-10-30T10:30:00Z",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  {
    "userId": "guid-2",
    "email": "user2@example.com",
    "userName": "user2",
    "firstName": "Jane",
    "lastName": "Smith",
    "avatar": null,
    "isActive": true,
    "lastLogin": "2024-10-29T14:20:00Z",
    "createdAt": "2024-02-15T00:00:00Z"
  }
]
```

---

### 1.3. Get User by ID

**Endpoint**: `GET /api/user/{id}`

**Description**: Retrieve user details by ID

**Authorization**: Required

**Path Parameters**:
- `id` (string, required): User ID (GUID)

**Response** (200 OK):
```json
{
  "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "user@example.com",
  "userName": "johndoe",
  "firstName": "John",
  "lastName": "Doe",
  "avatar": "https://example.com/avatars/johndoe.jpg",
  "phoneNumber": "+1-555-0100",
  "isActive": true,
  "lastLogin": "2024-10-30T10:30:00Z",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-10-30T10:30:00Z"
}
```

**Error Responses**:
- `404 Not Found`: User not found

---

### 1.4. Create User (Register)

**Endpoint**: `POST /api/user/register`

**Description**: Register a new user

**Authorization**: Required (Admin only)

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123!",
  "userName": "newuser",
  "firstName": "New",
  "lastName": "User",
  "phoneNumber": "+1-555-0199",
  "role": "User"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "userId": "new-guid",
  "message": "User created successfully"
}
```

**Error Responses**:
- `400 Bad Request`: Validation errors, duplicate email/username
- `403 Forbidden`: Insufficient permissions

---

### 1.5. Update User

**Endpoint**: `PUT /api/user/{id}`

**Description**: Update user profile

**Authorization**: Required (Self or Admin)

**Path Parameters**:
- `id` (string, required): User ID

**Request Body**:
```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "phoneNumber": "+1-555-0200",
  "avatar": "https://example.com/avatars/updated.jpg"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "User updated successfully"
}
```

---

### 1.6. Change Password

**Endpoint**: `POST /api/user/change-password`

**Description**: Change user password

**Authorization**: Required (Self)

**Request Body**:
```json
{
  "oldPassword": "OldPassword123!",
  "newPassword": "NewPassword456!"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid old password or password requirements not met

---

## 2. Role & Permission Management

### 2.1. Get All Roles

**Endpoint**: `GET /api/role`

**Description**: Retrieve all roles with permissions

**Authorization**: Required (Admin only)

**Response** (200 OK):
```json
[
  {
    "roleId": "role-guid-1",
    "roleName": "Admin",
    "description": "System administrator",
    "permissions": [
      {
        "permissionId": 1,
        "name": "SYSTEM_ADMIN",
        "description": "Full system access"
      },
      {
        "permissionId": 2,
        "name": "EDIT_BUSINESS_DEVELOPMENT",
        "description": "Edit opportunities"
      }
    ]
  },
  {
    "roleId": "role-guid-2",
    "roleName": "Manager",
    "description": "Project manager",
    "permissions": [
      {
        "permissionId": 3,
        "name": "APPROVE_PROJECT",
        "description": "Approve projects"
      }
    ]
  }
]
```

---

### 2.2. Create Role

**Endpoint**: `POST /api/role`

**Description**: Create a new role

**Authorization**: Required (Admin only)

**Request Body**:
```json
{
  "roleName": "Custom Role",
  "description": "Custom role description",
  "permissionIds": [1, 2, 3]
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "roleId": "new-role-guid",
  "message": "Role created successfully"
}
```

---

## 3. Project Management

### 3.1. Get All Projects

**Endpoint**: `GET /api/projects`

**Description**: Retrieve all projects

**Authorization**: Required

**Query Parameters** (Optional):
- `status` (string): Filter by status
- `regionId` (int): Filter by region
- `page` (int): Page number (not currently implemented)
- `pageSize` (int): Items per page (not currently implemented)

**Response** (200 OK):
```json
[
  {
    "projectId": 1,
    "projectName": "Airport Terminal Expansion",
    "projectNumber": "PRJ-2024-001",
    "description": "Design and construction management",
    "startDate": "2024-01-15",
    "endDate": "2025-12-31",
    "status": "Active",
    "estimatedProjectCost": 5000000.00,
    "estimatedProjectFee": 500000.00,
    "projectManager": "John Doe",
    "regionId": 1,
    "region": {
      "regionId": 1,
      "regionName": "North America"
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-10-30T10:00:00Z"
  }
]
```

---

### 3.2. Get Project by ID

**Endpoint**: `GET /api/projects/{id}`

**Description**: Retrieve project details

**Authorization**: Required

**Path Parameters**:
- `id` (int, required): Project ID

**Response** (200 OK):
```json
{
  "projectId": 1,
  "projectName": "Airport Terminal Expansion",
  "projectNumber": "PRJ-2024-001",
  "description": "Design and construction management for new terminal",
  "startDate": "2024-01-15",
  "endDate": "2025-12-31",
  "status": "Active",
  "estimatedProjectCost": 5000000.00,
  "estimatedProjectFee": 500000.00,
  "projectManager": "John Doe",
  "regionId": 1,
  "region": {
    "regionId": 1,
    "regionName": "North America",
    "description": "North American region"
  },
  "createdBy": "user-guid",
  "updatedBy": "user-guid",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-10-30T10:00:00Z"
}
```

**Error Responses**:
- `404 Not Found`: Project not found

---

### 3.3. Create Project

**Endpoint**: `POST /api/projects`

**Description**: Create a new project

**Authorization**: Required (EDIT_PROJECT permission)

**Request Body**:
```json
{
  "projectName": "New Bridge Construction",
  "projectNumber": "PRJ-2024-025",
  "description": "Design and oversight of new bridge",
  "startDate": "2024-11-01",
  "endDate": "2026-06-30",
  "status": "Planning",
  "estimatedProjectCost": 8500000.00,
  "estimatedProjectFee": 850000.00,
  "projectManager": "Jane Smith",
  "regionId": 2
}
```

**Validation Rules**:
- `projectName`: Required, max 255 characters
- `projectNumber`: Optional, max 50 characters, unique
- `estimatedProjectCost`: Required, must be >= 0
- `estimatedProjectFee`: Required, must be >= 0
- `startDate`: Optional
- `endDate`: Optional, must be after startDate if both provided

**Response** (201 Created):
```json
{
  "success": true,
  "projectId": 25,
  "message": "Project created successfully"
}
```

**Error Responses**:
- `400 Bad Request`: Validation errors
- `403 Forbidden`: Insufficient permissions

---

### 3.4. Update Project

**Endpoint**: `PUT /api/projects/{id}`

**Description**: Update existing project

**Authorization**: Required (EDIT_PROJECT permission)

**Path Parameters**:
- `id` (int, required): Project ID

**Request Body**:
```json
{
  "projectName": "Updated Project Name",
  "description": "Updated description",
  "status": "In Progress",
  "estimatedProjectCost": 5200000.00,
  "estimatedProjectFee": 520000.00,
  "endDate": "2026-03-31"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Project updated successfully"
}
```

---

### 3.5. Delete Project

**Endpoint**: `DELETE /api/projects/{id}`

**Description**: Delete a project

**Authorization**: Required (DELETE_PROJECT permission)

**Path Parameters**:
- `id` (int, required): Project ID

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

**Error Responses**:
- `404 Not Found`: Project not found
- `400 Bad Request`: Cannot delete project with associated data

---

## 4. Opportunity Tracking

### 4.1. Get All Opportunities

**Endpoint**: `GET /api/opportunities`

**Description**: Retrieve all opportunities

**Authorization**: Required (VIEW_BUSINESS_DEVELOPMENT permission)

**Response** (200 OK):
```json
[
  {
    "opportunityId": 1,
    "title": "Highway Expansion Project",
    "description": "Opportunity to provide design services",
    "client": "State Transportation Department",
    "bidFees": 25000.00,
    "emd": 50000.00,
    "percentageChanceOfProjectHappening": 75.00,
    "percentageChanceOfNJSSuccess": 60.00,
    "grossRevenue": 1200000.00,
    "netNJSRevenue": 960000.00,
    "bidSubmissionDate": "2024-11-15T17:00:00Z",
    "statusId": 2,
    "status": {
      "statusId": 2,
      "statusName": "Under Review"
    },
    "createdBy": "user-guid",
    "createdAt": "2024-10-01T00:00:00Z",
    "updatedAt": "2024-10-30T00:00:00Z"
  }
]
```

---

### 4.2. Create Opportunity

**Endpoint**: `POST /api/opportunities`

**Description**: Create new opportunity

**Authorization**: Required (EDIT_BUSINESS_DEVELOPMENT permission)

**Request Body**:
```json
{
  "title": "Railway Station Renovation",
  "description": "Design services for station renovation",
  "client": "National Rail Corporation",
  "bidFees": 35000.00,
  "emd": 75000.00,
  "percentageChanceOfProjectHappening": 80.00,
  "percentageChanceOfNJSSuccess": 70.00,
  "grossRevenue": 1500000.00,
  "netNJSRevenue": 1200000.00,
  "bidSubmissionDate": "2024-12-01T17:00:00Z",
  "statusId": 1
}
```

**Validation Rules**:
- `title`: Required, max 255 characters
- `client`: Optional, max 200 characters
- `bidFees`, `emd`, `grossRevenue`, `netNJSRevenue`: Must be >= 0
- `percentageChanceOfProjectHappening`, `percentageChanceOfNJSSuccess`: 0-100
- `bidSubmissionDate`: Must be future date

**Response** (201 Created):
```json
{
  "success": true,
  "opportunityId": 15,
  "message": "Opportunity created successfully"
}
```

---

### 4.3. Submit Opportunity for Approval

**Endpoint**: `POST /api/opportunities/{id}/submit`

**Description**: Submit opportunity for manager approval

**Authorization**: Required (SUBMIT_FOR_APPROVAL permission)

**Path Parameters**:
- `id` (int, required): Opportunity ID

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Opportunity submitted for approval",
  "newStatus": "Submitted for Review"
}
```

---

### 4.4. Get Opportunity History

**Endpoint**: `GET /api/opportunities/{id}/history`

**Description**: Get audit trail for opportunity

**Authorization**: Required

**Path Parameters**:
- `id` (int, required): Opportunity ID

**Response** (200 OK):
```json
[
  {
    "historyId": 1,
    "opportunityId": 5,
    "statusId": 1,
    "status": {
      "statusName": "Draft"
    },
    "actionBy": "user-guid",
    "user": {
      "userName": "johndoe",
      "firstName": "John",
      "lastName": "Doe"
    },
    "actionDate": "2024-10-01T10:00:00Z",
    "comments": "Created initial opportunity"
  },
  {
    "historyId": 2,
    "opportunityId": 5,
    "statusId": 2,
    "status": {
      "statusName": "Submitted for Review"
    },
    "actionBy": "user-guid",
    "user": {
      "userName": "johndoe",
      "firstName": "John",
      "lastName": "Doe"
    },
    "actionDate": "2024-10-05T14:30:00Z",
    "comments": "Submitted for manager review"
  }
]
```

---

## 5. Go/No-Go Decision Management

### 5.1. Get All Decisions

**Endpoint**: `GET /api/gonogo`

**Description**: Retrieve all Go/No-Go decisions

**Authorization**: Required

**Response** (200 OK):
```json
[
  {
    "decisionId": 1,
    "opportunityId": 5,
    "opportunity": {
      "title": "Highway Expansion Project"
    },
    "typeOfClient": "Government",
    "regionalBDHead": "Jane Smith",
    "totalScore": 68,
    "recommendation": "GO",
    "createdBy": "user-guid",
    "createdAt": "2024-10-10T00:00:00Z",
    "criteria": [
      {
        "criteriaId": 1,
        "criteriaName": "Client Relationship",
        "score": 8,
        "maxScore": 10
      },
      {
        "criteriaId": 2,
        "criteriaName": "Technical Capability",
        "score": 9,
        "maxScore": 10
      }
    ]
  }
]
```

---

### 5.2. Create Go/No-Go Decision

**Endpoint**: `POST /api/gonogo`

**Description**: Create new decision

**Authorization**: Required

**Request Body**:
```json
{
  "opportunityId": 10,
  "typeOfClient": "Private",
  "regionalBDHead": "John Manager",
  "criteria": [
    {
      "scoringCriteriaId": 1,
      "score": 7,
      "comments": "Good existing relationship"
    },
    {
      "scoringCriteriaId": 2,
      "score": 9,
      "comments": "Strong technical match"
    },
    {
      "scoringCriteriaId": 3,
      "score": 6,
      "comments": "Moderate financial attractiveness"
    }
  ]
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "decisionId": 5,
  "totalScore": 73,
  "recommendation": "GO",
  "message": "Go/No-Go decision created successfully"
}
```

---

### 5.3. Get Decision Versions

**Endpoint**: `GET /api/gonogo/{id}/versions`

**Description**: Get version history for decision

**Authorization**: Required

**Path Parameters**:
- `id` (int, required): Decision header ID

**Response** (200 OK):
```json
[
  {
    "versionId": 1,
    "versionNumber": 1,
    "totalScore": 65,
    "recommendation": "GO",
    "createdBy": "user-guid",
    "createdAt": "2024-10-10T10:00:00Z"
  },
  {
    "versionId": 2,
    "versionNumber": 2,
    "totalScore": 73,
    "recommendation": "GO",
    "createdBy": "user-guid",
    "createdAt": "2024-10-15T14:30:00Z"
  }
]
```

---

## 6. Work Breakdown Structure (WBS)

### 6.1. Get WBS for Project

**Endpoint**: `GET /api/wbs/project/{projectId}`

**Description**: Get WBS structure for project

**Authorization**: Required

**Path Parameters**:
- `projectId` (int, required): Project ID

**Response** (200 OK):
```json
{
  "wbsId": 1,
  "projectId": 5,
  "tasks": [
    {
      "taskId": 1,
      "taskName": "Design Phase",
      "taskLevel": 1,
      "parentId": null,
      "estimatedBudget": 200000.00,
      "estimatedHours": 2000.00,
      "startDate": "2024-01-15",
      "endDate": "2024-06-30",
      "status": "In Progress",
      "children": [
        {
          "taskId": 2,
          "taskName": "Preliminary Design",
          "taskLevel": 2,
          "parentId": 1,
          "estimatedBudget": 80000.00,
          "estimatedHours": 800.00,
          "startDate": "2024-01-15",
          "endDate": "2024-03-31",
          "status": "Completed",
          "children": []
        },
        {
          "taskId": 3,
          "taskName": "Detailed Design",
          "taskLevel": 2,
          "parentId": 1,
          "estimatedBudget": 120000.00,
          "estimatedHours": 1200.00,
          "startDate": "2024-04-01",
          "endDate": "2024-06-30",
          "status": "In Progress",
          "children": []
        }
      ]
    }
  ],
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

### 6.2. Add Task to WBS

**Endpoint**: `POST /api/wbs/{id}/tasks`

**Description**: Add task to WBS

**Authorization**: Required

**Path Parameters**:
- `id` (int, required): WBS ID

**Request Body**:
```json
{
  "taskName": "Construction Phase",
  "taskLevel": 1,
  "parentId": null,
  "estimatedBudget": 500000.00,
  "estimatedHours": 5000.00,
  "startDate": "2024-07-01",
  "endDate": "2025-12-31",
  "status": "Not Started"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "taskId": 4,
  "message": "Task added successfully"
}
```

---

## 7. Monthly Progress

### 7.1. Get Monthly Progress for Project

**Endpoint**: `GET /api/monthly/project/{projectId}`

**Description**: Get monthly progress reports

**Authorization**: Required

**Path Parameters**:
- `projectId` (int, required): Project ID

**Response** (200 OK):
```json
[
  {
    "progressId": 1,
    "projectId": 5,
    "month": 10,
    "year": 2024,
    "manpowerTotal": 320.50,
    "financialDetails": {
      "budgetOdcs": 50000.00,
      "budgetStaff": 150000.00,
      "budgetSubTotal": 200000.00,
      "feeTotal": 20000.00,
      "net": 180000.00,
      "serviceTax": 18000.00
    },
    "contractAndCost": {
      "priorCumulativeOdc": 450000.00,
      "priorCumulativeStaff": 1200000.00,
      "actualOdc": 52000.00,
      "actualStaff": 148000.00,
      "totalCumulativeOdc": 502000.00,
      "totalCumulativeStaff": 1348000.00,
      "totalCumulativeCost": 1850000.00
    },
    "schedule": {
      "plannedStartDate": "2024-01-15",
      "actualStartDate": "2024-01-20",
      "plannedEndDate": "2025-12-31",
      "forecastEndDate": "2026-01-15",
      "percentComplete": 42.50
    },
    "createdAt": "2024-11-01T00:00:00Z"
  }
]
```

---

### 7.2. Create Monthly Progress

**Endpoint**: `POST /api/monthly`

**Description**: Create monthly progress report

**Authorization**: Required

**Request Body**:
```json
{
  "projectId": 5,
  "month": 11,
  "year": 2024,
  "manpowerTotal": 340.00,
  "financialDetails": {
    "budgetOdcs": 55000.00,
    "budgetStaff": 160000.00,
    "budgetSubTotal": 215000.00,
    "feeTotal": 21500.00,
    "net": 193500.00,
    "serviceTax": 19350.00
  },
  "contractAndCost": {
    "priorCumulativeOdc": 502000.00,
    "priorCumulativeStaff": 1348000.00,
    "actualOdc": 56000.00,
    "actualStaff": 162000.00
  },
  "schedule": {
    "percentComplete": 48.00,
    "forecastEndDate": "2026-01-10"
  }
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "progressId": 12,
  "message": "Monthly progress created successfully"
}
```

---

## 8. Change Control

### 8.1. Get Change Controls for Project

**Endpoint**: `GET /api/changecontrol/project/{projectId}`

**Description**: Get change controls

**Authorization**: Required

**Path Parameters**:
- `projectId` (int, required): Project ID

**Response** (200 OK):
```json
[
  {
    "changeControlId": 1,
    "projectId": 5,
    "originator": "John Doe",
    "description": "Additional structural analysis required",
    "costImpact": "+$50,000",
    "timeImpact": "+2 weeks",
    "resourcesImpact": "+1 structural engineer",
    "qualityImpact": "Improved structural integrity",
    "changeOrderStatus": "Pending",
    "clientApprovalStatus": "Awaiting Response",
    "workflowStatusId": 2,
    "workflowStatus": {
      "statusName": "Under Review"
    },
    "createdBy": "user-guid",
    "createdAt": "2024-10-25T00:00:00Z"
  }
]
```

---

### 8.2. Create Change Control

**Endpoint**: `POST /api/changecontrol`

**Description**: Create change control request

**Authorization**: Required

**Request Body**:
```json
{
  "projectId": 5,
  "originator": "Jane Smith",
  "description": "Design revision per client feedback",
  "costImpact": "+$25,000",
  "timeImpact": "+1 week",
  "resourcesImpact": "Minimal",
  "qualityImpact": "Enhanced client satisfaction",
  "changeOrderStatus": "Pending",
  "clientApprovalStatus": "Not Submitted"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "changeControlId": 8,
  "message": "Change control created successfully"
}
```

---

## 9. Project Closure

### 9.1. Get Project Closure

**Endpoint**: `GET /api/closure/project/{projectId}`

**Description**: Get closure document

**Authorization**: Required

**Path Parameters**:
- `projectId` (int, required): Project ID

**Response** (200 OK):
```json
{
  "closureId": 1,
  "projectId": 5,
  "workflowStatusId": 3,
  "workflowStatus": {
    "statusName": "Closed"
  },
  "clientFeedback": "Excellent work, met all requirements",
  "successCriteria": "All deliverables completed on time and budget",
  "lessonsLearned": "Better early stakeholder engagement needed",
  "positives": "Strong team collaboration, good risk management",
  "createdBy": "user-guid",
  "createdAt": "2024-10-30T00:00:00Z"
}
```

---

### 9.2. Create Project Closure

**Endpoint**: `POST /api/closure`

**Description**: Create closure document

**Authorization**: Required

**Request Body**:
```json
{
  "projectId": 5,
  "clientFeedback": "Project completed successfully",
  "successCriteria": "All objectives met",
  "lessonsLearned": "Improved communication protocols",
  "positives": "Team collaboration was excellent"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "closureId": 3,
  "message": "Project closure created successfully"
}
```

---

## 10. Audit Logs

### 10.1. Get Audit Logs

**Endpoint**: `GET /api/audit`

**Description**: Retrieve audit logs

**Authorization**: Required (SYSTEM_ADMIN permission)

**Query Parameters**:
- `entityName` (string, optional): Filter by entity type
- `entityId` (string, optional): Filter by entity ID
- `page` (int, optional): Page number (default: 1)
- `pageSize` (int, optional): Items per page (default: 50)

**Response** (200 OK):
```json
{
  "logs": [
    {
      "logId": 1,
      "entityName": "Project",
      "action": "UPDATE",
      "entityId": "5",
      "oldValues": "{\"projectName\":\"Old Name\",\"status\":\"Active\"}",
      "newValues": "{\"projectName\":\"New Name\",\"status\":\"Active\"}",
      "changedBy": "user@example.com",
      "changedAt": "2024-10-30T10:30:00Z",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0..."
    }
  ],
  "totalCount": 150,
  "page": 1,
  "pageSize": 50
}
```

---

### 10.2. Get Audit Logs for Entity

**Endpoint**: `GET /api/audit/entity/{entityName}/{entityId}`

**Description**: Get audit trail for specific entity

**Authorization**: Required

**Path Parameters**:
- `entityName` (string, required): Entity type (e.g., "Project", "Opportunity")
- `entityId` (string, required): Entity ID

**Response** (200 OK):
```json
[
  {
    "logId": 1,
    "entityName": "Project",
    "action": "INSERT",
    "entityId": "5",
    "oldValues": "{}",
    "newValues": "{\"projectName\":\"New Project\",\"status\":\"Active\"}",
    "changedBy": "admin@example.com",
    "changedAt": "2024-01-01T00:00:00Z",
    "reason": "Initial project creation"
  },
  {
    "logId": 25,
    "entityName": "Project",
    "action": "UPDATE",
    "entityId": "5",
    "oldValues": "{\"projectName\":\"New Project\"}",
    "newValues": "{\"projectName\":\"Updated Project Name\"}",
    "changedBy": "user@example.com",
    "changedAt": "2024-10-30T10:30:00Z",
    "reason": "Name correction"
  }
]
```

---

## Rate Limiting

**Current Implementation**: No rate limiting

**Future Recommendation**: Implement rate limiting with the following thresholds:
- **Authenticated Users**: 1000 requests per hour
- **Admin Users**: 5000 requests per hour
- **Unauthenticated**: 100 requests per hour (for public endpoints)

**Rate Limit Headers** (when implemented):
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1698691200
```

---

## Error Response Format

All API endpoints return errors in a consistent JSON format.

### Standard Error Response

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "projectName",
      "message": "Project name is required"
    },
    {
      "field": "estimatedProjectCost",
      "message": "Cost must be a positive value"
    }
  ]
}
```

### HTTP Status Codes

| Status Code | Meaning | Description |
|-------------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 204 | No Content | Request successful, no response body |
| 400 | Bad Request | Validation error or malformed request |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict (e.g., duplicate) |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily unavailable |

### Error Examples

#### 400 Bad Request (Validation Error)
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

#### 401 Unauthorized (Missing Token)
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Authorization header missing"
}
```

#### 401 Unauthorized (Invalid Token)
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Invalid or expired token"
}
```

#### 403 Forbidden (Insufficient Permissions)
```json
{
  "success": false,
  "statusCode": 403,
  "message": "Insufficient permissions to perform this action",
  "requiredPermission": "EDIT_BUSINESS_DEVELOPMENT"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Project with ID 999 not found"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "statusCode": 500,
  "message": "Internal Server Error",
  "detailed": "Database connection failed" // Development only
}
```

---

## Common Request/Response Patterns

### Pagination (Future Implementation)

**Request**:
```http
GET /api/projects?page=2&pageSize=20
```

**Response**:
```json
{
  "data": [...],
  "pagination": {
    "currentPage": 2,
    "pageSize": 20,
    "totalPages": 5,
    "totalItems": 100
  }
}
```

### Filtering

**Request**:
```http
GET /api/projects?status=Active&regionId=1
```

### Sorting (Future Implementation)

**Request**:
```http
GET /api/projects?sortBy=projectName&sortOrder=asc
```

### Search (Future Implementation)

**Request**:
```http
GET /api/projects?search=airport
```

---

## Swagger/OpenAPI Documentation

Interactive API documentation is available via Swagger UI.

### Accessing Swagger

**Development**:
```
http://localhost:5245/swagger
```

**Production**:
```
https://njs-project-management.com/swagger
```

### Swagger Configuration

**API Version**: v1.10.4

**API Title**: NJS API

**Description**: KarmaTech AI EDR Project Management API

### Using Swagger UI

1. Navigate to Swagger URL
2. Click "Authorize" button
3. Enter JWT token in format: `Bearer {your-token}`
4. Click "Authorize" to save
5. All subsequent requests will include the token

### Example Swagger Request

```http
GET /api/projects/5
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## CORS Configuration

### Allowed Origins

**Development**:
- http://localhost:5173
- http://localhost:5245
- http://localhost:5176
- http://117.248.109.35:5179
- http://117.248.109.35:5176
- http://192.168.29.235:5004

**Production**:
- https://njs-project-management.com
- https://www.njs-project-management.com

### CORS Headers

**Allowed Methods**: GET, POST, PUT, DELETE, OPTIONS

**Allowed Headers**: Authorization, Content-Type, Accept

**Allow Credentials**: true

### Preflight Requests

The API supports CORS preflight requests (OPTIONS method).

**Example Preflight**:
```http
OPTIONS /api/projects
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Authorization, Content-Type
Origin: http://localhost:5173
```

**Response**:
```http
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type, Accept
Access-Control-Allow-Credentials: true
```

---

## API Versioning

**Current Version**: v1 (implicit)

**URL Pattern**: `/api/{resource}`

**Future Versioning** (recommended):
- Header-based: `API-Version: 1`
- URL-based: `/api/v1/{resource}`
- Query parameter: `/api/{resource}?version=1`

---

## Performance Considerations

### Response Times (Typical)

| Endpoint Type | Average Response Time |
|---------------|---------------------|
| Simple GET (single record) | 50-100ms |
| Complex GET (with joins) | 100-300ms |
| POST/PUT operations | 100-200ms |
| DELETE operations | 50-100ms |
| Excel export | 1-3 seconds |

### Payload Size Limits

- **Request Body**: 10 MB maximum
- **File Uploads**: Not currently supported
- **Response Size**: No limit (potential issue for large datasets)

### Optimization Recommendations

1. Implement pagination for list endpoints
2. Add response caching for frequently accessed data
3. Implement field selection (sparse fieldsets)
4. Add ETags for conditional requests
5. Implement compression (currently enabled)

---

**Document Version**: 1.0
**Last Updated**: 2025-10-30
**Maintained By**: Business Analyst Team
