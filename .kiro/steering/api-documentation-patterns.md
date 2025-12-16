---
inclusion: always
---

---
inclusion: fileMatch
fileMatchPattern: '**/Controllers/**|**/API/**|**/*Controller.cs|**/*Api.ts'
---

# EDR API Documentation Patterns for AI-DLC Implementation

## API Design Standards

### Base URL Structure
```
Development: http://localhost:5245/api
Production: https://njs-project-management.com/api
```

### Authentication
All API endpoints require JWT Bearer token authentication except for login/register endpoints.

```http
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

## RESTful Endpoint Patterns

### 1. Resource Naming Conventions
```
✅ GOOD - RESTful resource naming
GET    /api/projects              - Get all projects
GET    /api/projects/{id}         - Get project by ID
POST   /api/projects              - Create new project
PUT    /api/projects/{id}         - Update entire project
PATCH  /api/projects/{id}         - Partial update project
DELETE /api/projects/{id}         - Delete project

GET    /api/projects/{id}/wbs     - Get WBS for project
POST   /api/projects/{id}/wbs     - Create WBS for project

❌ BAD - Non-RESTful patterns
GET    /api/getProjects            - Verb in URL
POST   /api/createProject          - Verb in URL
GET    /api/project/{id}           - Inconsistent plural/singular
```

### 2. HTTP Status Code Standards
```csharp
// Success Responses
200 OK          - Successful GET, PUT, PATCH
201 Created     - Successful POST
204 No Content  - Successful DELETE
206 Partial Content - Paginated results

// Client Error Responses
400 Bad Request     - Invalid request data
401 Unauthorized    - Missing or invalid token
403 Forbidden       - Valid token but insufficient permissions
404 Not Found       - Resource doesn't exist
409 Conflict        - Resource conflict (duplicate)
422 Unprocessable Entity - Validation errors

// Server Error Responses
500 Internal Server Error - Unexpected server error
503 Service Unavailable   - Service temporarily down
```

## Core API Endpoints

### 1. Authentication Endpoints
```http
POST /api/user/login
Content-Type: application/json

Request:
{
    "email": "user@example.com",
    "password": "SecurePassword123"
}

Response: 200 OK
{
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": "user-guid",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "Admin",
        "permissions": ["EDIT_BUSINESS_DEVELOPMENT", "APPROVE_PROJECT"]
    },
    "expiresAt": "2024-11-12T18:30:00Z"
}

Error Response: 401 Unauthorized
{
    "success": false,
    "message": "Invalid email or password",
    "errors": []
}
```

### 2. Project Management Endpoints
```http
GET /api/projects
Query Parameters:
- status (optional): Filter by project status
- regionId (optional): Filter by region
- page (optional): Page number (default: 1)
- pageSize (optional): Items per page (default: 10)

Response: 200 OK
{
    "success": true,
    "data": [
        {
            "projectId": 1,
            "projectName": "Airport Terminal Construction",
            "projectNumber": "PRJ-2024-001",
            "status": "Active",
            "estimatedProjectCost": 5000000.00,
            "estimatedProjectFee": 500000.00,
            "startDate": "2024-01-15T00:00:00Z",
            "endDate": "2024-12-31T00:00:00Z",
            "projectManager": "John Smith",
            "region": {
                "regionId": 1,
                "regionName": "North Region"
            },
            "createdAt": "2024-01-01T10:00:00Z",
            "createdBy": "admin@example.com"
        }
    ],
    "pagination": {
        "currentPage": 1,
        "pageSize": 10,
        "totalCount": 25,
        "totalPages": 3,
        "hasNext": true,
        "hasPrevious": false
    }
}
```

```http
POST /api/projects
Content-Type: application/json

Request:
{
    "projectName": "New Shopping Mall",
    "projectNumber": "PRJ-2024-002",
    "description": "Construction of a modern shopping mall",
    "estimatedProjectCost": 8000000.00,
    "estimatedProjectFee": 800000.00,
    "startDate": "2024-02-01T00:00:00Z",
    "endDate": "2025-01-31T00:00:00Z",
    "projectManager": "Jane Doe",
    "regionId": 2
}

Response: 201 Created
{
    "success": true,
    "data": {
        "projectId": 26,
        "projectName": "New Shopping Mall",
        "projectNumber": "PRJ-2024-002",
        "status": "Planning",
        "estimatedProjectCost": 8000000.00,
        "estimatedProjectFee": 800000.00,
        "startDate": "2024-02-01T00:00:00Z",
        "endDate": "2025-01-31T00:00:00Z",
        "projectManager": "Jane Doe",
        "regionId": 2,
        "createdAt": "2024-11-12T10:30:00Z",
        "createdBy": "current-user-id"
    },
    "message": "Project created successfully"
}
```

### 3. Business Development Endpoints
```http
GET /api/opportunities
Query Parameters:
- status (optional): Filter by opportunity status
- client (optional): Filter by client name
- bidSubmissionDateFrom (optional): Filter by bid submission date range
- bidSubmissionDateTo (optional): Filter by bid submission date range

Response: 200 OK
{
    "success": true,
    "data": [
        {
            "opportunityId": 1,
            "title": "Highway Construction Project",
            "description": "Construction of 50km highway",
            "client": "Department of Transportation",
            "bidFees": 25000.00,
            "emd": 100000.00,
            "percentageChanceOfProjectHappening": 75.00,
            "percentageChanceOfNJSSuccess": 60.00,
            "grossRevenue": 15000000.00,
            "netNJSRevenue": 12000000.00,
            "bidSubmissionDate": "2024-12-15T00:00:00Z",
            "status": {
                "statusId": 2,
                "statusName": "Under Review"
            },
            "approvalManager": {
                "id": "manager-guid",
                "firstName": "Alice",
                "lastName": "Johnson"
            },
            "createdAt": "2024-11-01T09:00:00Z",
            "createdBy": "user@example.com"
        }
    ]
}
```

```http
POST /api/opportunities
Content-Type: application/json

Request:
{
    "title": "Bridge Construction Project",
    "description": "Construction of suspension bridge",
    "client": "City Municipality",
    "bidFees": 30000.00,
    "emd": 150000.00,
    "percentageChanceOfProjectHappening": 80.00,
    "percentageChanceOfNJSSuccess": 70.00,
    "grossRevenue": 20000000.00,
    "netNJSRevenue": 16000000.00,
    "bidSubmissionDate": "2025-01-30T00:00:00Z",
    "approvalManagerId": "manager-guid",
    "reviewManagerId": "reviewer-guid"
}

Response: 201 Created
{
    "success": true,
    "data": {
        "opportunityId": 15,
        "title": "Bridge Construction Project",
        "status": {
            "statusId": 1,
            "statusName": "Draft"
        },
        "createdAt": "2024-11-12T11:00:00Z",
        "createdBy": "current-user-id"
    },
    "message": "Opportunity created successfully"
}
```

### 4. Work Breakdown Structure Endpoints
```http
GET /api/projects/{projectId}/wbs
Response: 200 OK
{
    "success": true,
    "data": {
        "id": 1,
        "projectId": 5,
        "tasks": [
            {
                "taskId": 1,
                "parentId": null,
                "taskName": "Project Planning",
                "taskLevel": 1,
                "estimatedBudget": 100000.00,
                "estimatedHours": 200.00,
                "startDate": "2024-01-15T00:00:00Z",
                "endDate": "2024-02-15T00:00:00Z",
                "status": "In Progress",
                "children": [
                    {
                        "taskId": 2,
                        "parentId": 1,
                        "taskName": "Requirements Analysis",
                        "taskLevel": 2,
                        "estimatedBudget": 25000.00,
                        "estimatedHours": 50.00,
                        "startDate": "2024-01-15T00:00:00Z",
                        "endDate": "2024-01-25T00:00:00Z",
                        "status": "Completed"
                    }
                ]
            }
        ],
        "createdAt": "2024-01-10T08:00:00Z",
        "createdBy": "pm@example.com"
    }
}
```

### 5. Monthly Progress Endpoints
```http
GET /api/projects/{projectId}/monthly-progress
Query Parameters:
- year (optional): Filter by year
- month (optional): Filter by month

Response: 200 OK
{
    "success": true,
    "data": [
        {
            "progressId": 1,
            "projectId": 5,
            "month": 11,
            "year": 2024,
            "manpowerTotal": 25,
            "financialDetails": {
                "budgetOdcs": 500000.00,
                "budgetStaff": 300000.00,
                "feeTotal": 800000.00
            },
            "schedule": {
                "plannedStartDate": "2024-11-01T00:00:00Z",
                "actualStartDate": "2024-11-03T00:00:00Z",
                "plannedEndDate": "2024-11-30T00:00:00Z",
                "forecastEndDate": "2024-12-05T00:00:00Z"
            },
            "deliverables": [
                {
                    "deliverableName": "Foundation Work",
                    "plannedCompletion": 100.00,
                    "actualCompletion": 95.00,
                    "paymentReceived": 450000.00
                }
            ],
            "createdAt": "2024-11-01T00:00:00Z",
            "createdBy": "pm@example.com"
        }
    ]
}
```

## Response Format Standards

### 1. Success Response Format
```json
{
    "success": true,
    "data": {}, // or [] for arrays
    "message": "Optional success message",
    "pagination": {  // Only for paginated responses
        "currentPage": 1,
        "pageSize": 10,
        "totalCount": 100,
        "totalPages": 10,
        "hasNext": true,
        "hasPrevious": false
    }
}
```

### 2. Error Response Format
```json
{
    "success": false,
    "message": "Error description",
    "errors": [
        {
            "field": "projectName",
            "message": "Project name is required"
        },
        {
            "field": "estimatedCost",
            "message": "Estimated cost must be greater than 0"
        }
    ],
    "statusCode": 400,
    "timestamp": "2024-11-12T10:30:00Z",
    "path": "/api/projects"
}
```

### 3. Validation Error Response
```json
{
    "success": false,
    "message": "Validation failed",
    "errors": [
        {
            "field": "email",
            "message": "Email is required",
            "code": "REQUIRED"
        },
        {
            "field": "password",
            "message": "Password must be at least 8 characters",
            "code": "MIN_LENGTH"
        }
    ],
    "statusCode": 422
}
```

## Pagination Standards

### 1. Query Parameters
```
?page=1&pageSize=10&sortBy=createdAt&sortOrder=desc
```

### 2. Response Headers
```http
X-Total-Count: 250
X-Page-Count: 25
X-Current-Page: 1
X-Per-Page: 10
Link: <https://api.example.com/projects?page=2>; rel="next",
      <https://api.example.com/projects?page=25>; rel="last"
```

## Filtering and Sorting Standards

### 1. Filtering
```
GET /api/projects?status=Active&regionId=1&createdAfter=2024-01-01
GET /api/opportunities?client=Department&bidSubmissionDateFrom=2024-12-01&bidSubmissionDateTo=2024-12-31
```

### 2. Sorting
```
GET /api/projects?sortBy=projectName&sortOrder=asc
GET /api/opportunities?sortBy=bidSubmissionDate&sortOrder=desc
```

### 3. Search
```
GET /api/projects?search=airport
GET /api/opportunities?search=highway construction
```

## File Upload Endpoints

### 1. Document Upload
```http
POST /api/documents/upload
Content-Type: multipart/form-data

Form Data:
- file: [binary file data]
- entityType: "Project" | "Opportunity" | "BidPreparation"
- entityId: 123
- category: "Technical" | "Financial" | "Legal"
- description: "Optional description"

Response: 201 Created
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

### 2. Excel Export
```http
GET /api/projects/export/excel
Query Parameters:
- status (optional): Filter by status
- regionId (optional): Filter by region
- format: "xlsx" | "csv"

Response: 200 OK
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="projects-export-2024-11-12.xlsx"

[Binary Excel file data]
```

## Workflow Endpoints

### 1. Status Transition
```http
POST /api/opportunities/{id}/transition
Content-Type: application/json

Request:
{
    "newStatusId": 3,
    "comments": "All documents reviewed and approved",
    "assignToUserId": "reviewer-guid"
}

Response: 200 OK
{
    "success": true,
    "data": {
        "opportunityId": 5,
        "oldStatus": "Under Review",
        "newStatus": "Approved",
        "transitionedAt": "2024-11-12T10:30:00Z",
        "transitionedBy": "manager@example.com",
        "comments": "All documents reviewed and approved"
    }
}
```

### 2. Workflow History
```http
GET /api/opportunities/{id}/history
Response: 200 OK
{
    "success": true,
    "data": [
        {
            "historyId": 1,
            "statusName": "Draft",
            "actionBy": {
                "id": "user-guid",
                "firstName": "John",
                "lastName": "Doe"
            },
            "actionDate": "2024-11-01T09:00:00Z",
            "comments": "Initial opportunity created"
        },
        {
            "historyId": 2,
            "statusName": "Submitted for Review",
            "actionBy": {
                "id": "user-guid",
                "firstName": "John",
                "lastName": "Doe"
            },
            "actionDate": "2024-11-05T14:30:00Z",
            "comments": "Submitted for manager review"
        }
    ]
}
```

## Performance and Caching

### 1. Caching Headers
```http
Cache-Control: public, max-age=3600
ETag: "abc123def456"
Last-Modified: Tue, 12 Nov 2024 10:30:00 GMT
```

### 2. Conditional Requests
```http
GET /api/projects/1
If-None-Match: "abc123def456"

Response: 304 Not Modified (if not changed)
```

## Rate Limiting

### 1. Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1699776000
```

### 2. Rate Limit Exceeded Response
```http
HTTP/1.1 429 Too Many Requests
{
    "success": false,
    "message": "Rate limit exceeded. Try again in 60 seconds.",
    "statusCode": 429,
    "retryAfter": 60
}
```

## API Versioning

### 1. URL Versioning
```
GET /api/v1/projects
GET /api/v2/projects
```

### 2. Header Versioning
```http
Accept: application/vnd.api+json;version=1
API-Version: 1.0
```

## Security Headers

### 1. Required Security Headers
```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

## AI-DLC API Generation Rules

### 1. Endpoint Generation Standards
- Follow RESTful conventions strictly
- Include proper HTTP status codes
- Implement consistent error handling
- Add comprehensive validation
- Include audit logging

### 2. Documentation Generation
- Auto-generate OpenAPI/Swagger specs
- Include request/response examples
- Document all query parameters
- Provide error code references
- Include authentication requirements

### 3. Testing Requirements
- Generate integration tests for all endpoints
- Include positive and negative test cases
- Test authentication and authorization
- Validate response formats
- Performance testing for critical endpoints

This API documentation pattern ensures consistent, well-documented, and maintainable APIs for AI-DLC generated features.