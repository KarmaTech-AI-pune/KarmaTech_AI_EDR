---
inclusion: fileMatch
fileMatchPattern: '**/Controllers/**|**/API/**|**/*Controller.cs|**/*Api.ts'
---

# EDR API Documentation for AI-DLC Implementation (Updated)

## Backend Architecture & Technology Stack

The EDR API is built using **.NET Core** and follows a robust, scalable architecture incorporating the following patterns and technologies:

- **Architectural Patterns**:
  - **CQRS (Command Query Responsibility Segregation)**: Separates read and write operations using **MediatR** for decoupling.
  - **Repository Pattern**: Abstracts data access logic.
  - **Dependency Injection (DI)**: Manages object lifecycles and dependencies.
- **Data Access**:
  - **Entity Framework Core (EF Core)**: ORM for database interactions.
  - **Code-First Approach**: Database schema is defined and managed via C# code migrations.
  - **Database**: **SQL Server**, managed via **SSMS** (SQL Server Management Studio).
- **Core Components**:
  - **Mediator**: Handles in-process messaging between commands/queries and handlers.
  - **Logger**: Centralized logging for tracking application behavior and errors.
  - **Exception Handling**: Global exception handling middleware.
  - **Manual Mapping**: Explicit mapping between DTOs and Entities (no AutoMapper).
- **Testing**:
  - **Unit Testing**: Ensures code reliability and correctness.

---

## API Design Standards

### Base URL Structure
- **Development**: `http://localhost:5245/api` (Example)
- **Production**: `https://njs-project-management.com/api`

### Authentication
All API endpoints require JWT Bearer token authentication except for login/register endpoints.

- **Header**: `Authorization: Bearer {jwt_token}`
- **Content-Type**: `application/json`

---

## Core API Endpoints

### 1. Authentication Endpoints

#### POST `/api/User/login`
Authentication endpoint to validate user credentials.

**Request Body** (`LoginModel`):
```json
{
    "email": "user@example.com",
    "password": "SecurePassword123",
    "tenant": "Optional-Tenant-Id"
}
```

**Response** (200 OK):
```json
{
    "success": true,
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
        "id": "guid-string",
        "userName": "user",
        "name": "John Doe",
        "email": "user@example.com",
        "standardRate": 0,
        "isConsultant": false,
        "avatar": "",
        "roles": [],
        "permissions": [],
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z",
        "tenantId": 1,
        "tenantDomain": "example.com",
        "twoFactorEnabled": false
    },
    "requiresOtp": false
}
```

### 2. Project Management Endpoints

#### GET `/api/Project/{id}`
Retrieves a specific project by ID.

**Response** (200 OK) - Returns full `ProjectDto`:
```json
{
    "id": 1,
    "tenantId": 1,
    "name": "Airport Terminal Construction",
    "clientName": "Airport Authority",
    "projectNo": 1001,
    "typeOfClient": "Government",
    "projectManagerId": "guid-user-id-1",
    "seniorProjectManagerId": "guid-user-id-2",
    "regionalManagerId": "guid-user-id-3",
    "office": "New York Office",
    "region": "North East",
    "typeOfJob": "Infrastructure",
    "sector": "Aviation",
    "feeType": "Fixed",
    "estimatedProjectCost": 5000000.00,
    "estimatedProjectFee": 500000.00,
    "percentage": 10.0,
    "details": "Expansion of Terminal B consisting of 5 new gates.",
    "priority": "High",
    "currency": "USD",
    "startDate": "2024-01-15T00:00:00Z",
    "endDate": "2024-12-31T00:00:00Z",
    "capitalValue": 5000000.00,
    "status": 1, 
    "progress": 25,
    "durationInMonths": 12,
    "fundingStream": "Federal Grant",
    "contractType": "EPC",
    "letterOfAcceptance": true,
    "opportunityTrackingId": 123,
    "programId": 45,
    "createdAt": "2024-01-01T10:00:00Z",
    "createdBy": "admin@example.com",
    "lastModifiedAt": "2024-01-15T10:00:00Z",
    "lastModifiedBy": "editor@example.com",
    "budgetReason": "Initial Budget Approval"
}
```

#### POST `/api/Project`
Creates a new project.

**Request Body** (`ProjectDto`):
> **Note**: Fields like `createdAt`, `createdBy`, `lastModifiedAt`, and `lastModifiedBy` are handled by the server. `Id` should be 0 or omitted for new creations.

```json
{
    "name": "New Shopping Mall",
    "clientName": "Mall Corp International",
    "projectNo": 2024002,
    "typeOfClient": "Private",
    "projectManagerId": "user-guid-here",
    "seniorProjectManagerId": "optional-guid-here",
    "regionalManagerId": "optional-guid-here",
    "office": "Chicago",
    "region": "Midwest",
    "typeOfJob": "Commercial",
    "sector": "Retail",
    "feeType": "Percentage",
    "estimatedProjectCost": 8000000.00,
    "estimatedProjectFee": 800000.00,
    "percentage": 10.0,
    "details": "Construction of a new 3-story shopping complex.",
    "priority": "Medium",
    "currency": "USD",
    "startDate": "2024-02-01T00:00:00Z",
    "endDate": "2025-01-31T00:00:00Z",
    "capitalValue": 8000000.00,
    "status": 1,
    "progress": 0,
    "durationInMonths": 12,
    "fundingStream": "Private Equity",
    "contractType": "Design-Build",
    "letterOfAcceptance": false,
    "opportunityTrackingId": null,
    "programId": null,
    "budgetReason": "Initial creation"
}
```

#### PUT `/api/Project/{id}`
Updates an existing project.

**Request Body** (`ProjectDto`):
Include the `Id` in the body matching the URL.

```json
{
    "id": 1,
    "name": "Updated Project Name",
    "clientName": "Updated Client",
    "projectNo": 1001,
    "typeOfClient": "Government",
    "projectManagerId": "guid-user-id-1",
    "office": "New York Office",
    "region": "North East",
    "typeOfJob": "Infrastructure",
    "sector": "Aviation",
    "feeType": "Fixed",
    "estimatedProjectCost": 5500000.00,
    "estimatedProjectFee": 550000.00,
    "percentage": 10.0,
    "details": "Updated details...",
    "priority": "High",
    "currency": "USD",
    "startDate": "2024-01-15T00:00:00Z",
    "endDate": "2025-02-28T00:00:00Z",
    "capitalValue": 5500000.00,
    "status": 1,
    "progress": 30,
    "durationInMonths": 14,
    "fundingStream": "Federal Grant",
    "contractType": "EPC",
    "letterOfAcceptance": true,
    "budgetReason": "Scope increase"
}
```

### 3. Business Development Endpoints (Opportunity Tracking)

#### GET `/api/OpportunityTracking`
Retrieves a list of opportunities with optional filters.

**Query Parameters**:
- `status` (Enum: 0=BidUnderPreparation, 1=BidSubmitted, 2=BidRejected, 3=BidAccepted, 4=SentForReview)
- `stage` (Enum: 0=None, 1=A, 2=B, 3=C, 4=D)
- `bidManagerId` (string)
- `clientSector` (string)
- `pageNumber` (int)
- `pageSize` (int)
- `sortBy` (string field name)
- `isAscending` (bool)

#### GET `/api/OpportunityTracking/{id}`
Retrieves a single opportunity by ID.

**Response** (200 OK) - `OpportunityTrackingDto`:
```json
{
    "id": 1,
    "bidNumber": "BID-2024-001",
    "stage": 1, 
    "strategicRanking": "High",
    "bidFees": 25000.00,
    "emd": 100000.00,
    "formOfEMD": "Bank Guarantee",
    "bidManagerId": "guid-user-id",
    "reviewManagerId": "guid-user-id",
    "approvalManagerId": "guid-user-id",
    "contactPersonAtClient": "Jane Doe",
    "dateOfSubmission": "2024-12-15T00:00:00Z",
    "percentageChanceOfProjectHappening": 75.00,
    "percentageChanceOfNJSSuccess": 60.00,
    "likelyCompetition": "Competitor A, Competitor B",
    "grossRevenue": 15000000.00,
    "netNJSRevenue": 12000000.00,
    "followUpComments": "Follow up required next week",
    "notes": "Internal notes",
    "probableQualifyingCriteria": "Technical Score > 80",
    "operation": "Operation details",
    "workName": "Highway Construction",
    "client": "Dept of Transportation",
    "clientSector": "Public",
    "likelyStartDate": "2025-01-01T00:00:00Z",
    "status": 0, 
    "currency": "USD",
    "capitalValue": 500000.00,
    "durationOfProject": 24,
    "fundingStream": "Government",
    "contractType": "Standard",
    "currentHistory": {
        "id": 10,
        "opportunityId": 1,
        "actionDate": "2024-11-01T00:00:00Z",
        "comments": "Initial creation",
        "status": "Bid Under Preparation",
        "statusId": 0,
        "action": "Created",
        "actionBy": "John Doe",
        "assignedToId": "guid-user-id"
    }
}
```

#### POST `/api/OpportunityTracking`
Creates a new opportunity.

**Request Body** (`CreateOpportunityTrackingCommand`):
```json
{
    "stage": 1,
    "strategicRanking": "High",
    "bidFees": 25000.00,
    "emd": 100000.00,
    "formOfEMD": "Bank Guarantee",
    "bidManagerId": "guid-user-id",
    "reviewManagerId": "guid-user-id",
    "approvalManagerId": "guid-user-id",
    "contactPersonAtClient": "Jane Doe",
    "dateOfSubmission": "2024-12-15T00:00:00Z",
    "percentageChanceOfProjectHappening": 75.00,
    "percentageChanceOfNJSSuccess": 60.00,
    "likelyCompetition": "Competitor A",
    "grossRevenue": 15000000.00,
    "netNJSRevenue": 12000000.00,
    "followUpComments": "Initial meeting notes",
    "notes": "Strategy notes",
    "probableQualifyingCriteria": "Criteria details",
    "operation": "New Operation",
    "workName": "Project Name",
    "client": "Client Name",
    "clientSector": "Public",
    "likelyStartDate": "2025-01-01T00:00:00Z",
    "status": 0,
    "currency": "USD",
    "capitalValue": 5000000.00,
    "durationOfProject": 24,
    "fundingStream": "Self-Funded",
    "contractType": "Fixed Price"
}
```

#### PUT `/api/OpportunityTracking/UpdateOpportunityTracking/{id}`
Updates an existing opportunity.

**Request Body** (`UpdateOpportunityTrackingCommand`):
```json
{
    "id": 1,
    "projectId": null, 
    "stage": 1,
    "strategicRanking": "Medium",
    "bidFees": 30000.00,
    "emd": 120000.00,
    "formOfEMD": "Cash",
    "bidManagerId": "guid-user-id",
    "reviewManagerId": "guid-user-id",
    "approvalManagerId": "guid-user-id",
    "contactPersonAtClient": "John Smith",
    "dateOfSubmission": "2024-12-20T00:00:00Z",
    "percentageChanceOfProjectHappening": 80.00,
    "percentageChanceOfNJSSuccess": 65.00,
    "likelyCompetition": "Competitor C",
    "grossRevenue": 16000000.00,
    "netNJSRevenue": 13000000.00,
    "followUpComments": "Revised notes",
    "notes": "Updated strategy",
    "probableQualifyingCriteria": "New criteria",
    "operation": "Operation Update",
    "workName": "Project Name Updated",
    "client": "Client Name Updated",
    "clientSector": "Private",
    "likelyStartDate": "2025-02-01T00:00:00Z",
    "status": 0,
    "currency": "USD",
    "capitalValue": 5500000.00,
    "durationOfProject": 26,
    "fundingStream": "Loan",
    "contractType": "Time and Material",
    "workflowId": 0 
}
```

#### DELETE `/api/OpportunityTracking/{id}`
Deletes an opportunity.

#### Workflow Actions
All these endpoints perform status transitions and history updates.

**POST `/api/OpportunityTracking/SendToReview`**
```json
{
    "opportunityId": 1,
    "assignedToId": "guid-reviewer-id",
    "action": "SendToReview",
    "comments": "Ready for review, please check the financials."
}
```

**POST `/api/OpportunityTracking/SendToApproval`**
Used by Regional Manager/Director to move to next approval stage.
```json
{
    "opportunityId": 1,
    "assignedToId": "guid-approver-id",
    "action": "SendToApproval",
    "comments": "Reviewed and looks good. Sending for final approval."
}
```

**POST `/api/OpportunityTracking/SendToApprove`**
Used by Regional Director for final approval.
```json
{
    "opportunityId": 1,
    "assignedToId": "guid-user-id",
    "action": "Approve",
    "comments": "Approved. Proceed with bid submission."
}
```

**POST `/api/OpportunityTracking/Reject`**
```json
{
    "opportunityId": 1,
    "assignedToId": "guid-original-user-id",
    "action": "Reject",
    "comments": "Rejected due to low margin. Please revise."
}
```

### 4. Work Breakdown Structure (WBS) Endpoints

#### GET `/api/projects/{projectId}/WBS`
Retrieves the WBS for a project.

**Response** (200 OK) - `WBSMasterDto`:
> **Note on Hierarchy**: The `tasks` array contains a flat list of tasks. Hierarchy is defined by the `level`, `parentId`, and `wbsOptionId` fields.
> - **Level 1**: Top-level tasks (`parentId` is null).
> - **Level 2**: Children of Level 1 (`parentId` points to a Level 1 `id`).
> - **Level 3**: Children of Level 2 (`parentId` points to a Level 2 `id`).

```json
{
  "wbsHeaderId": 1,
  "workBreakdownStructures": [
    {
      "workBreakdownStructureId": 2,
      "name": "Phase 1 - Inception",
      "description": "Initial project phase",
      "displayOrder": 0,
      "tasks": [
        {
          "id": 4,
          "workBreakdownStructureId": 2,
          "level": 1,
          "title": "Inception Report",
          "description": "Initial report generation",
          "displayOrder": 0,
          "estimatedBudget": 0,
          "startDate": "2026-01-07T10:51:41.587",
          "endDate": "2026-01-07T10:51:41.587",
          "taskType": 0,
          "assignedUserId": null,
          "assignedUserName": null,
          "costRate": 0,
          "resourceName": null,
          "resourceUnit": null,
          "resourceRoleId": null,
          "resourceRoleName": null,
          "plannedHours": [
            {
              "year": 2026,
              "month": "January",
              "plannedHours": 0
            }
          ],
          "totalHours": 0,
          "totalCost": 0,
          "wbsOptionId": 1,
          "wbsOptionLabel": "Inception Report",
          "parentId": null
        },
        {
          "id": 5,
          "workBreakdownStructureId": 2,
          "level": 2,
          "title": "Surveys",
          "description": "Site surveys",
          "displayOrder": 0,
          "estimatedBudget": 0,
          "startDate": "2026-01-07T10:51:41.587",
          "endDate": "2026-01-07T10:51:41.587",
          "taskType": 0,
          "assignedUserId": null,
          "assignedUserName": null,
          "costRate": 0,
          "resourceName": null,
          "resourceUnit": null,
          "resourceRoleId": null,
          "resourceRoleName": null,
          "plannedHours": [],
          "totalHours": 0,
          "totalCost": 0,
          "wbsOptionId": 7,
          "wbsOptionLabel": "Surveys",
          "parentId": 4
        },
        {
          "id": 6,
          "workBreakdownStructureId": 2,
          "level": 3,
          "title": "Soil Investigation",
          "description": "Detailed soil analysis",
          "displayOrder": 0,
          "estimatedBudget": 0,
          "startDate": "2026-01-07T10:51:41.587",
          "endDate": "2026-01-07T10:51:41.587",
          "taskType": 0,
          "assignedUserId": null,
          "assignedUserName": null,
          "costRate": 0,
          "resourceName": null,
          "resourceUnit": "Samples",
          "resourceRoleId": null,
          "resourceRoleName": null,
          "plannedHours": [],
          "totalHours": 0,
          "totalCost": 0,
          "wbsOptionId": 26,
          "wbsOptionLabel": "Soil Investigation",
          "parentId": 5
        }
      ]
    }
  ]
}
```

#### PUT `/api/projects/{projectId}/WBS`
Creates or replaces the entire WBS structure.

**Request Body** (`WBSMasterDto`):
> **Note**: Use `id: 0` for new items (Headers, WBS Groups, Tasks). For updates, provide the existing `id`.

```json
{
  "wbsHeaderId": 0,
  "workBreakdownStructures": [
    {
      "workBreakdownStructureId": 0,
      "name": "Phase 1 - Inception",
      "description": "Initial project phase",
      "displayOrder": 0,
      "tasks": [
        {
          "id": 0,
          "workBreakdownStructureId": 0,
          "level": 1,
          "title": "Inception Report",
          "description": "Initial report generation",
          "displayOrder": 0,
          "estimatedBudget": 5000.00,
          "startDate": "2026-02-01T00:00:00Z",
          "endDate": "2026-02-28T00:00:00Z",
          "taskType": 0,
          "assignedUserId": null,
          "costRate": 0,
          "resourceUnit": null,
          "plannedHours": [
            {
              "year": 2026,
              "month": "February",
              "plannedHours": 40
            }
          ],
          "wbsOptionId": 1,
          "wbsOptionLabel": "Inception Report",
          "parentId": null
        },
        {
          "id": 0,
          "workBreakdownStructureId": 0,
          "level": 2,
          "title": "Surveys",
          "description": "Site surveys",
          "displayOrder": 1,
          "estimatedBudget": 2000.00,
          "startDate": "2026-02-05T00:00:00Z",
          "endDate": "2026-02-15T00:00:00Z",
          "taskType": 0,
          "wbsOptionId": 7,
          "wbsOptionLabel": "Surveys",
          "parentId": null 
        }
      ]
    }
  ]
}
```

### 5. Monthly Progress Endpoints

#### GET `/api/projects/{projectId}/monthlyprogress`
Retrieves all monthly progress records for a project.

**Response** (200 OK) - Array of `MonthlyProgressDto` (see structure below).

#### GET `/api/projects/{projectId}/monthlyprogress/year/{year}/month/{month}`
Retrieves a specific monthly progress record for a given year and month.

**Response** (200 OK) - `MonthlyProgressDto`:
```json
{
  "id": 1,
  "projectId": 3,
  "month": 1,
  "year": 2026,
  "financialAndContractDetails": {
    "net": 500000,
    "serviceTax": 18,
    "feeTotal": 590000,
    "budgetOdcs": 12360,
    "budgetStaff": 19920,
    "budgetSubTotal": 32280,
    "contractType": "lumpsum"
  },
  "actualCost": {
    "priorCumulativeOdc": null,
    "priorCumulativeStaff": null,
    "priorCumulativeTotal": 0,
    "actualOdc": 5000,
    "actualStaff": 25000,
    "actualSubtotal": 30000,
    "totalCumulativeOdc": 5000,
    "totalCumulativeStaff": 25000,
    "totalCumulativeCost": 30000
  },
  "ctcAndEac": {
    "ctcODC": 7360,
    "ctcStaff": -5080,
    "ctcSubtotal": 2280,
    "actualctcODC": 50005,
    "actualCtcStaff": 50000,
    "actualCtcSubtotal": 100005,
    "eacOdc": 55005,
    "eacStaff": 75000,
    "totalEAC": 130005,
    "grossProfitPercentage": 74
  },
  "schedule": {
    "dateOfIssueWOLOI": "2026-01-19T00:00:00",
    "completionDateAsPerContract": "2026-02-07T00:00:00",
    "completionDateAsPerExtension": "2026-02-07T00:00:00",
    "expectedCompletionDate": "2026-02-07T00:00:00"
  },
  "budgetTable": {
    "originalBudget": {
      "revenueFee": 500000,
      "cost": 104380.8,
      "profitPercentage": 79.12
    },
    "currentBudgetInMIS": {
      "revenueFee": 500000,
      "cost": 130005,
      "profitPercentage": 74
    },
    "percentCompleteOnCosts": {
      "revenueFee": 0,
      "cost": 23.08
    }
  },
  "manpowerPlanning": {
    "manpower": [
      {
        "workAssignment": "Soil Investigation",
        "assignee": "Vidyadhar Vengurlekar",
        "planned": 0,
        "consumed": 0,
        "balance": 0,
        "nextMonthPlanning": 0,
        "manpowerComments": ""
      }
    ],
    "manpowerTotal": {
      "plannedTotal": 0,
      "consumedTotal": 0,
      "balanceTotal": 0,
      "nextMonthPlanningTotal": 0
    }
  },
  "progressDeliverable": {
    "deliverables": [],
    "totalPaymentDue": 0
  },
  "changeOrder": [],
  "programmeSchedule": [],
  "earlyWarnings": [],
  "lastMonthActions": [],
  "currentMonthActions": []
}
```

#### POST `/api/projects/{projectId}/monthlyprogress`
Creates a new monthly progress report.

**Request Body** (`CreateMonthlyProgressDto`):
```json
{
  "month": 2,
  "year": 2026,
  "financialAndContractDetails": {
    "net": 500000,
    "serviceTax": 18,
    "feeTotal": 590000,
    "budgetOdcs": 12360,
    "budgetStaff": 19920,
    "budgetSubTotal": 32280,
    "contractType": "lumpsum"
  },
  "actualCost": {
    "actualOdc": 0,
    "actualStaff": 0
  },
  "ctcAndEac": {
    "ctcODC": 0,
    "ctcStaff": 0,
    "eacOdc": 0,
    "eacStaff": 0,
    "grossProfitPercentage": 0
  },
  "schedule": {
    "dateOfIssueWOLOI": "2026-01-19T00:00:00",
    "completionDateAsPerContract": "2026-02-07T00:00:00",
    "expectedCompletionDate": "2026-02-07T00:00:00"
  },
  "manpowerPlanning": {
    "manpower": [],
    "manpowerTotal": {
      "plannedTotal": 0,
      "consumedTotal": 0,
      "balanceTotal": 0,
      "nextMonthPlanningTotal": 0
    }
  },
  "progressDeliverable": {
    "deliverables": [],
    "totalPaymentDue": 0
  },
  "changeOrder": [],
  "programmeSchedule": [],
  "earlyWarnings": [],
  "lastMonthActions": [],
  "currentMonthActions": []
}
```

---

### 6. Excel Export Endpoints

#### GET `/api/Excel/export-options`
Exports project configuration options (Sectors, Statuses, Contract Types, Currencies) to an Excel file.

**Response** (200 OK):
- **Content-Type**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **File**: `ProjectOptions.xlsx`

---

## Response Format Standards

### 1. Success Response Format
Resource endpoints typically return the DTO directly or a wrapped response:
```json
{
    "success": true,
    "data": {}, 
    "message": "Optional success message"
    // Pagination fields if applicable
}
```

### 2. Error Response Format
```json
{
    "success": false,
    "message": "Error description",
    "errors": [
        {
            "field": "fieldName",
            "message": "Specific validation error"
        }
    ],
    "statusCode": 400,
    "timestamp": "2024-01-01T10:00:00Z",
    "path": "/api/resource"
}
```

## Pagination Standards

### 1. Query Parameters
Standard parameters for paginated endpoints:
```
?pageNumber=1&pageSize=10&sortBy=createdAt&isAscending=false
```

### 2. Response Headers
Common headers observed in responses:
```http
access-control-allow-credentials: true 
access-control-allow-headers: Content-Type,Authorization 
access-control-allow-methods: GET,POST,PUT,DELETE,OPTIONS 
access-control-allow-origin: https://api.karmatech-ai.com 
content-type: application/json; charset=utf-8 
date: Mon,19 Jan 2026 05:20:26 GMT 
server: Microsoft-IIS/10.0 
vary: Origin 
x-powered-by: ASP.NET
```

## Filtering and Sorting Standards

### 1. Filtering
Use specific query parameters to filter results:
```
GET /api/OpportunityTracking?status=1&stage=2&clientSector=Public
```

### 2. Sorting
Use `sortBy` field name and `isAscending` boolean:
```
GET /api/projects?sortBy=name&isAscending=true
```

---

## File Upload Endpoints

### 1. Document Upload
**POST** `/api/documents/upload`

**Request Header**:
- `Content-Type`: `multipart/form-data`

**Form Data**:
- `file`: (Binary) The file to upload.
- `entityType`: (string) e.g., "Project", "Opportunity".
- `entityId`: (int/string) ID of the entity.
- `category`: (string) e.g., "Technical", "Financial".
- `description`: (string) Optional description.

**Response** (201 Created):
```json
{
    "success": true,
    "data": {
        "documentId": "doc-guid",
        "fileName": "technical-specs.pdf",
        "fileSize": 2048576,
        "contentType": "application/pdf",
        "uploadedAt": "2024-11-12T10:30:00Z",
        "uploadedBy": "user@example.com",
        "downloadUrl": "/api/documents/doc-guid/download"
    }
}
```

---

## Workflow Endpoints (Opportunity Tracking)

The system implements specific workflow transitions for Project and Business Development.

### 1. Send To Review
```http
POST /api/OpportunityTracking/SendToReview
Content-Type: application/json

Request:
{
    "opportunityId": 1,
    "assignedToId": "reviewer-guid",
    "action": "SendToReview",
    "comments": "Ready for review"
}

Response: 200 OK
{
    "id": 1,
    "status": 4, 
    "currentHistory": {
        "status": "SentForReview",
        "action": "SendToReview",
        "comments": "Ready for review"
    }
}
```

### 2. Send To Approval
```http
POST /api/OpportunityTracking/SendToApproval
Content-Type: application/json

Request:
{
    "opportunityId": 1,
    "assignedToId": "approver-guid",
    "action": "SendToApproval",
    "comments": "Reviewed and sending for approval"
}

Response: 200 OK
{
    "id": 1,
    "status": 4,
    "currentHistory": {
        "status": "SentForApproval",
        "action": "SendToApproval"
    }
}
```

### 3. Approve
```http
POST /api/OpportunityTracking/SendToApprove
Content-Type: application/json

Request:
{
    "opportunityId": 1,
    "assignedToId": "director-guid",
    "action": "Approve",
    "comments": "Approved"
}

Response: 200 OK
{
    "id": 1,
    "status": 3, 
    "currentHistory": {
        "status": "BidAccepted",
        "action": "Approve"
    }
}
```

### 4. Reject
```http
POST /api/OpportunityTracking/Reject
Content-Type: application/json

Request:
{
    "opportunityId": 1,
    "assignedToId": "user-guid",
    "action": "Reject",
    "comments": "Rejected due to budget constraints"
}

Response: 200 OK
{
    "id": 1,
    "status": 2, 
    "currentHistory": {
        "status": "BidRejected",
        "action": "Reject"
    }
}
```

---

## Performance and Caching

### 1. Caching Headers
Standard headers for cacheable resources:
```http
Cache-Control: public, max-age=3600
ETag: "abc123def456"
Last-Modified: Tue, 12 Nov 2024 10:30:00 GMT
```

### 2. Conditional Requests
Supports `If-None-Match` for `304 Not Modified` responses to reduce bandwidth.

---

## Rate Limiting

### 1. Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1699776000
```

### 2. Rate Limit Exceeded Response
**Code**: `429 Too Many Requests`
```json
{
    "success": false,
    "message": "Rate limit exceeded. Try again in 60 seconds.",
    "statusCode": 429,
    "retryAfter": 60
}
```

---

## API Versioning

### 1. URL Versioning
Primary method:
```
GET /api/v1/projects
GET /api/v2/projects
```

### 2. Header Versioning
Secondary method:
```http
API-Version: 1.0
Accept: application/vnd.api+json;version=1
```

---

## Security Headers

The API implements standard security headers:
```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

---

## AI-DLC API Generation Rules

### 1. Endpoint Generation Standards
- Follow RESTful conventions strictly.
- Include proper HTTP status codes.
- Implement consistent error handling.
- Add comprehensive validation.
- Include audit logging.

### 2. Documentation Generation
- Auto-generate OpenAPI/Swagger specs.
- Include request/response examples.
- Document all query parameters.
- Provide error code references.
- Include authentication requirements.

### 3. Testing Requirements
- Generate integration tests for all endpoints.
- Include positive and negative test cases.
- Test authentication and authorization.
- Validate response formats.
- Performance testing for critical endpoints.


## How to Implement New Functionality

To ensure maintainability and loose coupling, all new functionality must follow the **CQRS (Command Query Responsibility Segregation)** pattern with **Mediator**. This approach minimizes direct dependencies and standardizes the code structure.

### Implementation Checklist
1.  **Analyze Existing Implementation**: **CRITICAL STEP**. Read through existing Controllers, Services, and DTOs.
    -   **Do not duplicate functionality.**
    -   **Reuse existing DTOs** if possible.
    -   **Only create new files if absolutely necessary.**
2.  **Define Domain Entity**: Ensure the entity exists in `NJS.Domain.Entities`.
3.  **DTO Creation**: Create a Data Transfer Object in `NJS.Application.Dtos` to carry data between the client and the application.
4.  **CQRS Pattern**:
    -   **Command/Query**: Create a record in `NJS.Application.CQRS.{Feature}.Commands` or `Queries`. Inherit from `IRequest<TResponse>`.
    -   **Handler**: Create a handler in `NJS.Application.CQRS.{Feature}.Handlers`. Implement `IRequestHandler<TCommand, TResponse>`.
    -   **Validator**: (Optional but recommended) Create a validator using FluentValidation.
5.  **Repository Interface**: Use `I{Feature}Repository` (defined in `NJS.Repositories.Interfaces`) to abstract data access. **Do not access `DbContext` directly in Handlers.**
6.  **Controller**:
    -   Inject `IMediator` into the controller.
    -   Create an endpoint that simply sends the command/query to the Mediator: `await _mediator.Send(command)`.
    -   **Do not write business logic in the Controller.**

### Code Standards & Loose Coupling
-   **Dependency Injection**: Always inject interfaces (`IInterface`), never concrete classes.
-   **Single Responsibility**: Each Handler should do one thing (handle one command/query).
-   **Manual Mapping**: Explicitly map DTOs to Entities in the Handler. Do not use AutoMapper unless explicitly configured for the global project.
-   **File Management**: Group CQRS files by feature (e.g., `CQRS/Projects/Commands`, `CQRS/Projects/Handlers`) to keep the project organized without creating excessive root-level folders.

### Efficiency & Simplicity
> [!IMPORTANT]
> **Check Existing Files First**: Before creating any new file, verify if the functionality can logically fit into an existing class or DTO.
-   **Reuse DTOs**: If a DTO with similar properties exists, reuse it or extend it instead of creating a near-duplicate.
-   **Avoid Over-Engineering**: Do not create complex wrappers or abstraction layers unless absolutely necessary. Keep the code simple and readable.
-   **Verify Before Creation**: Read through the existing implementation of the specific feature to understand the current connections and flow. Only create new files if the current structure cannot support the new requirement.

---

This API documentation pattern ensures consistent, well-documented, and maintainable APIs for AI-DLC generated features.