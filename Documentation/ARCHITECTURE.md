# ARCHITECTURE

## System Overview

**KarmaTech AI EDR** (Enterprise Digital Runner) is a comprehensive SaaS-based project management platform designed to manage the complete project lifecycle from opportunity identification to project closure. The system is built using a modern, scalable architecture with a dual backend approach (C# .NET Core + Node.js) and a React-based frontend.

### Business Purpose

The platform supports enterprise-level project management with the following capabilities:
- Business Development & Opportunity Tracking
- Go/No-Go Decision Management
- Bid Preparation & Version Control
- Project Execution with Work Breakdown Structure (WBS)
- Resource Planning & Allocation
- Monthly Progress Tracking & Reporting
- Change Control Management
- Project Closure Documentation
- Comprehensive Audit Logging
- Sprint Management
- Kanban Board (To Do, In Progress, Testing, Done)
- Cashflow
- Dashboard

### Technical Architecture

The application follows a **three-tier architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  React 18.3 + TypeScript + Material-UI + Vite (SPA)        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTPS/REST API
                       │ JWT Bearer Token
                       │
┌──────────────────────┴──────────────────────────────────────┐
│                  APPLICATION LAYER                           │
│                                                              │
│  ┌──────────────────────┐    ┌──────────────────────┐      │
│  │  C# .NET Core 8.0    │    │  Node.js/Express     │      │
│  │  (Primary Backend)   │    │  (Complementary)     │      │
│  │  - ASP.NET Core API  │    │  - TypeScript        │      │
│  │  - Entity Framework  │    │  - MongoDB           │      │
│  │  - CQRS + MediatR    │    │  - JWT Auth          │      │
│  │  - Repository Pattern│    │                      │      │
│  └──────────┬───────────┘    └──────────┬───────────┘      │
│             │                            │                  │
└─────────────┼────────────────────────────┼──────────────────┘
              │                            │
              │                            │
┌─────────────┴────────────────────────────┴──────────────────┐
│                    DATA LAYER                                │
│                                                              │
│  ┌──────────────────────┐    ┌──────────────────────┐      │
│  │ Microsoft SQL Server │    │  MongoDB Atlas       │      │
│  │ KarmaTechAI_SAAS     │    │  (Cloud SaaS)       │      │
│  │ 85+ Entities         │    │  User & Project Data │      │
│  └──────────────────────┘    └──────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | React | 18.3.1 | UI Component Framework |
| Language | TypeScript | 5.5.3 | Type-safe JavaScript |
| Build Tool | Vite | 5.4.8 | Fast build & HMR |
| UI Library | Material-UI (MUI) | 6.4.11 | Component Library |
| State Management | React Context API | 18.3.1 | Global State |
| HTTP Client | Axios | 1.7.7 | API Communication |
| Routing | React Router | 7.6.1 | Client-side Routing |
| Form Management | Formik + Yup | 2.4.6 + 1.6.1 | Form Handling & Validation |
| Additional Validation | Zod | 3.25.41 | Schema Validation |
| Charts | Recharts | 2.15.1 | Data Visualization |
| Gantt Chart | wx-react-gantt | 1.3.1 | Project Timeline |
| Date Handling | date-fns | 2.30.0 | Date Utilities |
| Excel Export | XLSX | 0.18.5 | Excel Generation |
| Testing | Vitest + React Testing Library | 3.0.9 | Unit & Integration Tests |

### Backend Stack (.NET Core)

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | ASP.NET Core | 8.0 | Web API Framework |
| Language | C# | 10+ | Server-side Language |
| ORM | Entity Framework Core | 8.0.10 | Database Access |
| CQRS | MediatR | 12.4.1 | Command/Query Separation |
| Mapping | AutoMapper | 12.0.1 | Object-Object Mapping |
| Authentication | ASP.NET Core Identity + JWT | 8.0 | User Auth & Token |
| Email | MailKit | 4.11.0 | SMTP Email Service |
| Excel | ClosedXML | 0.102.1 | Excel Export |
| Logging | NLog.Web.AspNetCore | 5.5.0 | Structured Logging |
| API Documentation | Swashbuckle (Swagger) | 6.5.0 | OpenAPI Spec |
| Compression | ResponseCompression | 2.3.0 | HTTP Compression |

### Backend Stack (Node.js)

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Runtime | Node.js | Latest | JavaScript Runtime |
| Framework | Express.js | 4.21.2 | Web Framework |
| Language | TypeScript | 5.7.2 | Type-safe JavaScript |
| Database | Mongoose | 8.9.3 | MongoDB ODM |
| Authentication | jsonwebtoken | 9.0.2 | JWT Token |
| Password Hashing | bcryptjs | 2.4.3 | Secure Hashing |
| Development | Nodemon + ts-node | Latest | Dev Server |

### Database

| Component | Technology | Details |
|-----------|-----------|---------|
| Primary Database | Microsoft SQL Server | Relational database with 85+ entities |
| Database Name | KarmaTechAI_SAAS | Production database |
| Secondary Database | MongoDB Atlas | NoSQL cloud database |
| Connection | Trusted Connection | Windows Authentication for SQL Server |
| Migration Tool | EF Core Migrations | Code-first migrations |

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT TIER                               │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Web Browser (Chrome, Firefox, Edge, Safari)         │  │
│  │  - React SPA loaded via HTTPS                        │  │
│  │  - JWT Token stored in localStorage                  │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       │ HTTPS (Port 443)
                       │ CORS Configured
                       │
┌──────────────────────┴───────────────────────────────────────┐
│                   WEB/API TIER                               │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  IIS (Internet Information Services)                 │  │
│  │  ┌──────────────────────────────────────────────┐    │  │
│  │  │ ASP.NET Core 8.0 API (Port 5245)            │    │  │
│  │  │ - JWT Authentication Middleware              │    │  │
│  │  │ - CORS Middleware                            │    │  │
│  │  │ - Response Compression                       │    │  │
│  │  │ - NLog Logging                               │    │  │
│  │  │ - Swagger UI (/swagger)                      │    │  │
│  │  └──────────────────────────────────────────────┘    │  │
│  │                                                        │  │
│  │  ┌──────────────────────────────────────────────┐    │  │
│  │  │ Node.js/Express API (Port 3000)             │    │  │
│  │  │ - JWT Middleware                             │    │  │
│  │  │ - CORS Enabled                               │    │  │
│  │  └──────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       │ ADO.NET / Mongoose
                       │
┌──────────────────────┴───────────────────────────────────────┐
│                   DATABASE TIER                              │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Microsoft SQL Server (localhost)                    │  │
│  │  Database: KarmaTechAI_SAAS                          │  │
│  │  - 85+ Tables                                        │  │
│  │  - Stored Procedures                                 │  │
│  │  - Audit Triggers                                    │  │
│  │  - Full-Text Indexing                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  MongoDB Atlas (Cloud)                               │  │
│  │  mongodb+srv://karmatechai.mpkpl.mongodb.net         │  │
│  │  - User Collection                                   │  │
│  │  - Project Collection                                │  │
│  │  - WBS Collection                                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Deployment Environments

#### Development Environment
- **Frontend**: http://localhost:5173 (Vite Dev Server)
- **Backend API**: http://localhost:5245 (ASP.NET Core)
- **Node Backend**: http://localhost:3000 (Express)
- **Database**: localhost SQL Server + MongoDB Atlas
- **CORS**: Multiple localhost origins enabled

#### Production Environment
- **Domain**: https://njs-project-management.com
- **Web Server**: IIS on Windows Server
- **HTTPS**: Enabled with SSL certificate
- **HSTS**: Enabled for security
- **Database**: SQL Server (localhost) + MongoDB Atlas
- **Compression**: Enabled for API responses

## Data Flow Diagram

### Authentication Flow

```
User                  Frontend              API Gateway           Auth Service         Database
 │                       │                       │                      │                  │
 │  1. Login Request     │                       │                      │                  │
 ├──────────────────────>│                       │                      │                  │
 │   (email, password)   │                       │                      │                  │
 │                       │  2. POST /api/user/login                     │                  │
 │                       ├──────────────────────>│                      │                  │
 │                       │                       │  3. ValidateUserAsync│                  │
 │                       │                       ├─────────────────────>│                  │
 │                       │                       │                      │ 4. Query User    │
 │                       │                       │                      ├─────────────────>│
 │                       │                       │                      │ 5. User Entity   │
 │                       │                       │                      │<─────────────────┤
 │                       │                       │  6. Verify Password  │                  │
 │                       │                       │                      │                  │
 │                       │                       │  7. Generate JWT     │                  │
 │                       │                       │<─────────────────────┤                  │
 │                       │  8. Response (token)  │                      │                  │
 │                       │<──────────────────────┤                      │                  │
 │  9. Store Token       │                       │                      │                  │
 │<──────────────────────┤                       │                      │                  │
 │   localStorage        │                       │                      │                  │
```

### API Request Flow (Protected Endpoint)

```
User                Frontend            Axios Interceptor      API Gateway        Controller         Service            Repository        Database
 │                     │                       │                    │                 │                  │                   │                │
 │  Action Triggered   │                       │                    │                 │                  │                   │                │
 ├────────────────────>│                       │                    │                 │                  │                   │                │
 │                     │  Get JWT from         │                    │                 │                  │                   │                │
 │                     │  localStorage         │                    │                 │                  │                   │                │
 │                     │                       │                    │                 │                  │                   │                │
 │                     │  API Request          │                    │                 │                  │                   │                │
 │                     ├──────────────────────>│                    │                 │                  │                   │                │
 │                     │                       │  Add Authorization  │                 │                  │                   │                │
 │                     │                       │  Header: Bearer {token}              │                  │                   │                │
 │                     │                       ├───────────────────>│                 │                  │                   │                │
 │                     │                       │                    │  Validate JWT   │                  │                   │                │
 │                     │                       │                    │  Extract Claims │                  │                   │                │
 │                     │                       │                    │  Check Roles    │                  │                   │                │
 │                     │                       │                    ├────────────────>│                  │                   │                │
 │                     │                       │                    │                 │  Business Logic  │                   │                │
 │                     │                       │                    │                 ├─────────────────>│                   │                │
 │                     │                       │                    │                 │                  │  Data Access      │                │
 │                     │                       │                    │                 │                  ├──────────────────>│                │
 │                     │                       │                    │                 │                  │                   │  SQL Query     │
 │                     │                       │                    │                 │                  │                   ├───────────────>│
 │                     │                       │                    │                 │                  │                   │  Entity Data   │
 │                     │                       │                    │                 │                  │                   │<───────────────┤
 │                     │                       │                    │                 │                  │  DTO Mapping      │                │
 │                     │                       │                    │                 │                  │<──────────────────┤                │
 │                     │                       │                    │                 │  Response DTO    │                   │                │
 │                     │                       │                    │                 │<─────────────────┤                   │                │
 │                     │                       │                    │  JSON Response  │                   │                   │                │
 │                     │                       │                    │<────────────────┤                   │                   │                │
 │                     │                       │  HTTP 200 OK       │                   │                   │                   │                │
 │                     │                       │<───────────────────┤                   │                   │                   │                │
 │                     │  Response Data        │                                                                                                  │
 │                     │<──────────────────────┤                                                                                                  │
 │  UI Update          │                                                                                                                          │
 │<────────────────────┤                                                                                                                          │
```

## Module/Service Breakdown

### Frontend Modules

#### 1. Authentication Module
- **Location**: `frontend/src/services/authApi.tsx`
- **Components**: LoginScreen, Protected Routes
- **Functionality**: User login, logout, token management, session handling
- **State Management**: Context API for user state

#### 2. Business Development Module
- **Location**: `frontend/src/pages/BusinessDevelopment.tsx`
- **API Service**: `opportunityApi.tsx`
- **Features**:
  - Opportunity tracking
  - Opportunity status management
  - Opportunity history logging
  - Approval workflow

#### 3. Go/No-Go Decision Module
- **Location**: `frontend/src/pages/` (Go/No-Go components)
- **API Service**: `goNoGoApi.tsx`
- **Features**:
  - Multi-criteria decision scoring
  - Version control
  - Decision history
  - Approval workflow

#### 4. Bid Preparation Module
- **API Service**: `bidPreparationApi.tsx`
- **Features**:
  - Document category management
  - Version control
  - Document tracking
  - Bid submission

#### 5. Project Management Module
- **Location**: `frontend/src/pages/ProjectManagement.tsx`
- **API Service**: `projectApi.tsx`
- **Features**:
  - Project CRUD operations
  - Project dashboard
  - Project filtering
  - Project status tracking

#### 6. Work Breakdown Structure (WBS) Module
- **API Service**: `wbsHeaderApi.tsx`
- **Features**:
  - Hierarchical task structure
  - Resource allocation
  - Budget estimation
  - Task dependencies
  - Gantt chart visualization

#### 7. Job Start Form Module
- **API Service**: `jobStartFormApi.ts`
- **Features**:
  - Project initiation
  - Resource planning
  - Budget allocation
  - Approval workflow

#### 8. Monthly Progress Module
- **API Service**: `monthlyProgressApi.tsx`
- **Features**:
  - Financial tracking
  - Schedule monitoring
  - Manpower planning
  - Deliverable tracking
  - Change order management

#### 9. Project Closure Module
- **Location**: `frontend/src/pages/ProjectClosure.tsx`
- **API Service**: `projectClosureApi.ts`
- **Features**:
  - Closure documentation
  - Lessons learned
  - Client feedback
  - Final approvals

#### 10. Change Control Module
- **API Service**: `changeControlApi.ts`
- **Features**:
  - Change request management
  - Impact analysis
  - Approval workflow
  - Change history

#### 11. Administration Module
- **Location**: `frontend/src/pages/AdminPanel.tsx`
- **Features**:
  - User management
  - Role management
  - Permission management
  - System settings

### Backend Services (.NET Core)

#### 1. Authentication Service
- **File**: `NJS.Application/Services/AuthService.cs`
- **Responsibilities**:
  - User validation
  - JWT token generation
  - Token verification
  - Role assignment

#### 2. Email Service
- **Technology**: MailKit
- **Configuration**: SMTP (Gmail)
- **Features**:
  - Email notifications
  - Workflow notifications
  - Failed email logging

#### 3. Excel Export Service
- **Technology**: ClosedXML
- **Controller**: ExcelController
- **Features**:
  - Monthly progress reports
  - Project status exports
  - Custom report generation

#### 4. Project Management Service
- **Responsibilities**:
  - Project lifecycle management
  - Project status transitions
  - Project validation

#### 5. Workflow Service
- **Strategy Pattern**: Multiple workflow strategies
- **Strategies**:
  - JobStartFormWorkflowStrategy
  - ChangeControlWorkflowStrategy
  - ProjectClosureWorkflowStrategy
  - WBSWorkflowStrategy

#### 6. Notification Service
- **Purpose**: Event-driven notifications
- **Integration**: Email service
- **Triggers**: Workflow state changes

#### 7. Audit Service
- **Implementation**: EF Core Interceptors
- **Features**:
  - Automatic change tracking
  - User action logging
  - IP address capture
  - Old/new value comparison

## Integration Points

### Internal Integration Points

#### 1. Frontend-to-Backend API Integration
- **Protocol**: HTTPS REST API
- **Authentication**: JWT Bearer Token
- **Data Format**: JSON
- **Base URL**: Configured via environment
- **Error Handling**: Axios interceptors with retry logic

#### 2. C# Backend to SQL Server
- **Technology**: Entity Framework Core 8.0.10
- **Pattern**: Repository + Unit of Work
- **Connection**: Trusted Connection with Multiple Active Result Sets
- **Migration**: Code-first with EF migrations
- **Audit**: SaveChanges interceptor for automatic logging

#### 3. Node Backend to MongoDB
- **Technology**: Mongoose 8.9.3
- **Connection**: MongoDB Atlas (cloud)
- **Authentication**: Connection string with credentials
- **Schema**: Defined via TypeScript models

### External Integration Points

#### 1. Email Service Integration (SMTP)
- **Provider**: Gmail SMTP
- **Server**: smtp.gmail.com
- **Port**: 587
- **Security**: TLS/SSL
- **Authentication**: Username/Password
- **From Email**: dishadais2025@gmail.com
- **Purpose**:
  - User notifications
  - Workflow approvals
  - Project updates
  - System alerts

#### 2. Excel Export Integration
- **Library**: ClosedXML (C#) + XLSX (Frontend)
- **Format**: .xlsx (Office Open XML)
- **Features**:
  - Server-side generation
  - Client-side download
  - Custom formatting
  - Multiple worksheets

### Data Synchronization

No real-time synchronization exists between SQL Server and MongoDB. The two databases serve different purposes:
- **SQL Server**: Primary application data
- **MongoDB**: Complementary services (alternative data model exploration)

## Authentication & Authorization Mechanism

### Authentication Flow

#### 1. User Login
1. User submits email and password via frontend login form
2. Frontend sends POST request to `/api/user/login`
3. Backend `UserController` receives request
4. `AuthService.ValidateUserAsync()` is called
5. User lookup in database via `UserManager.FindByEmailAsync()`
6. Password verification via `UserManager.CheckPasswordAsync()`
7. JWT token generation via `GenerateJwtTokenAsync()`
8. Last login time updated
9. Token returned to frontend
10. Frontend stores token in `localStorage`

#### 2. JWT Token Structure

```json
{
  "sub": "user-id-guid",
  "email": "user@example.com",
  "jti": "unique-token-id",
  "name": "username",
  "role": "Admin",
  "Permissions": "EDIT_BUSINESS_DEVELOPMENT,DELETE_BUSINESS_DEVELOPMENT,APPROVE_PROJECT",
  "exp": 1234567890,
  "iss": "your-app-name",
  "aud": "your-app-name"
}
```

#### 3. Token Validation
- **Issuer Validation**: Ensures token issued by the application
- **Audience Validation**: Ensures token intended for the application
- **Lifetime Validation**: Checks token expiration (3 hours)
- **Signature Validation**: HMAC SHA-256 signature verification
- **Algorithm**: HS256

#### 4. Request Authentication
1. Frontend makes API request
2. Axios interceptor adds `Authorization: Bearer {token}` header
3. ASP.NET Core JWT middleware intercepts request
4. Token extracted from header
5. Token validated against configuration
6. Claims extracted and added to `HttpContext.User`
7. Request proceeds to controller

### Authorization Mechanism

#### 1. Role-Based Access Control (RBAC)

**Predefined Roles:**
- **Admin**: Full system access, user management, system configuration
- **Manager**: Project oversight, approvals, reporting
- **User**: Limited operations, self-service features

**Role Assignment:**
- Roles assigned during user creation
- Managed via Admin Panel
- Stored in `AspNetUserRoles` table
- Loaded into JWT claims during login

#### 2. Permission-Based Access Control (PBAC)

**Granular Permissions:**
- `EDIT_BUSINESS_DEVELOPMENT`
- `DELETE_BUSINESS_DEVELOPMENT`
- `REVIEW_BUSINESS_DEVELOPMENT`
- `APPROVE_BUSINESS_DEVELOPMENT`
- `SUBMIT_FOR_APPROVAL`
- `SUBMIT_PROJECT_FOR_REVIEW`
- `APPROVE_PROJECT`
- `SUBMIT_PROJECT_FOR_APPROVAL`
- `VIEW_BUSINESS_DEVELOPMENT`
- `VIEW_PROJECT`
- `SYSTEM_ADMIN`

**Permission Structure:**
```
Role ──1:N── RolePermission ──N:1── Permission
```

**Permission Enforcement:**
- Backend: `[Authorize(Policy = "RequireAdminRole")]` attributes
- Frontend: Component-level permission checks
- Loaded into JWT claims as comma-separated string
- Checked before rendering UI components

#### 3. Authorization Policies

Defined in `Program.cs`:

```csharp
// Admin-only endpoints
options.AddPolicy("RequireAdminRole", policy =>
    policy.RequireRole("Admin"));

// Manager-only endpoints
options.AddPolicy("RequireManagerRole", policy =>
    policy.RequireRole("Manager"));

// User-level endpoints
options.AddPolicy("RequireUserRole", policy =>
    policy.RequireRole("User"));

// Admin or Manager
options.AddPolicy("RequireAdminOrManager", policy =>
    policy.RequireRole("Admin", "Manager"));

// Default: All authenticated users
options.DefaultPolicy = new AuthorizationPolicyBuilder()
    .RequireAuthenticatedUser()
    .Build();
```

#### 4. Frontend Authorization

**Protected Routes:**
```typescript
<ProtectedRoute
  element={<AdminPanel />}
  requiredPermission="SYSTEM_ADMIN"
/>
```

**Component-Level Checks:**
```typescript
{hasPermission("EDIT_BUSINESS_DEVELOPMENT") && (
  <Button>Edit Opportunity</Button>
)}
```

**User Context:**
- Global user state via React Context
- Permissions array stored in state
- Automatic route protection
- Conditional component rendering

## Multi-Tenancy Approach

**Current Implementation**: Single-tenant architecture

**Tenant Identification**:
- Region-based data segmentation
- User-project associations
- Role-based data filtering

**Future Multi-Tenancy Considerations**:
- Tenant ID column in tables
- Row-level security
- Tenant-specific schemas
- Isolated databases per tenant

## Performance Considerations and Constraints

### Current Performance Optimizations

#### 1. Database Optimizations
- **Indexes**: Created on foreign keys, frequently queried columns
- **Pagination**: Not currently implemented (potential bottleneck for large datasets)
- **Lazy Loading**: EF Core lazy loading disabled (explicit loading used)
- **Connection Pooling**: Multiple Active Result Sets enabled
- **Decimal Precision**: Optimized for financial calculations (18,2)

#### 2. API Performance
- **Response Compression**: Enabled for all API responses
- **HTTP Caching**: Not implemented
- **Asynchronous Operations**: All database operations use async/await
- **DTOs**: AutoMapper for efficient object mapping

#### 3. Frontend Performance
- **Code Splitting**: Vite automatic code splitting
- **Lazy Loading**: React.lazy() for route-based code splitting
- **Memoization**: React.memo() for expensive components
- **Virtual Scrolling**: Not implemented (potential issue for large lists)

### Performance Constraints

#### 1. Database Constraints
- **Large Datasets**: No pagination on list endpoints
- **N+1 Queries**: Potential issue with related entities
- **Full Table Scans**: Lack of covering indexes on complex queries

#### 2. API Constraints
- **No Rate Limiting**: Vulnerable to abuse
- **No Caching**: Repeated queries for static data
- **Synchronous Email**: Blocks request thread

#### 3. Frontend Constraints
- **Full Data Loading**: Large lists loaded entirely
- **No Virtual Scrolling**: Memory issues with 1000+ items
- **Token Expiry**: 3-hour token lifetime may cause session interruptions

### Recommended Performance Improvements
1. Implement server-side pagination
2. Add Redis caching layer
3. Implement rate limiting
4. Add database query optimization
5. Implement virtual scrolling for large lists
6. Add CDN for static assets
7. Implement background job processing for emails

## Scalability Notes

### Current Scalability Characteristics

#### Horizontal Scalability
- **API Layer**: Stateless design allows horizontal scaling
- **Session Management**: JWT tokens (no server-side sessions)
- **Database**: Single SQL Server instance (vertical scaling only)
- **File Storage**: Local file system (not scalable)

#### Vertical Scalability
- **Database**: Can scale with more CPU/RAM
- **API Server**: Can handle more load with better hardware
- **Limitations**: Single point of failure

### Scalability Recommendations

#### Short-term (Current Architecture)
1. **Load Balancer**: Add load balancer for API instances
2. **Database Optimization**: Query optimization, indexing
3. **Caching**: Implement Redis for frequently accessed data
4. **CDN**: Serve static assets via CDN

#### Long-term (Architectural Changes)
1. **Database Sharding**: Partition by region or tenant
2. **Read Replicas**: Separate read and write databases
3. **Message Queue**: RabbitMQ/Azure Service Bus for async operations
4. **Microservices**: Break monolith into domain services
5. **Cloud Migration**: Azure App Service + Azure SQL Database
6. **Blob Storage**: Azure Blob Storage for file uploads

### Current Bottlenecks
1. Single SQL Server instance
2. No caching layer
3. Synchronous email sending
4. Full dataset loading in frontend
5. No background job processing

## Security Architecture

### Security Layers

#### 1. Network Security
- **HTTPS**: SSL/TLS encryption for all traffic
- **CORS**: Strict origin validation
- **HSTS**: HTTP Strict Transport Security header
- **Firewall**: Server-level firewall rules

#### 2. Authentication Security
- **JWT**: HMAC SHA-256 signed tokens
- **Password Hashing**: ASP.NET Core Identity (PBKDF2)
- **Token Expiration**: 3-hour token lifetime
- **Secure Storage**: Tokens in localStorage (XSS risk)

#### 3. Authorization Security
- **Role-Based Access Control**: Three-tier role system
- **Permission-Based Control**: Granular permissions
- **Policy-Based Authorization**: Declarative policies
- **Frontend Guards**: Route and component-level protection

#### 4. Data Security
- **SQL Injection**: Parameterized queries via EF Core
- **XSS Protection**: React automatic escaping
- **CSRF Protection**: Not implemented (JWT mitigates)
- **Input Validation**: Server-side validation with FluentValidation

#### 5. Audit & Compliance
- **Audit Logging**: All data changes logged
- **User Actions**: Action tracking with IP address
- **Change History**: Old/new value comparison
- **Compliance**: Audit trail for regulatory requirements

### Security Vulnerabilities & Mitigations

| Vulnerability | Risk Level | Mitigation |
|---------------|-----------|------------|
| XSS (Cross-Site Scripting) | Medium | React automatic escaping |
| CSRF (Cross-Site Request Forgery) | Low | JWT token (not in cookies) |
| SQL Injection | Low | EF Core parameterized queries |
| Sensitive Data Exposure | High | HTTPS, but secrets in config files |
| Broken Authentication | Medium | JWT with expiration, but no refresh tokens |
| Insufficient Logging | Low | Comprehensive audit logging |
| Missing Rate Limiting | High | No implementation |
| Insecure Dependencies | Medium | Regular updates needed |

### Security Best Practices Implemented
1. JWT-based authentication
2. HTTPS enforcement
3. CORS configuration
4. Password complexity requirements (production)
5. Account lockout after failed attempts
6. Comprehensive audit logging
7. Role-based access control
8. Input validation

### Security Improvements Needed
1. Implement refresh token mechanism
2. Add rate limiting
3. Move secrets to secure vault (Azure Key Vault)
4. Implement CSRF tokens for sensitive operations
5. Add Web Application Firewall (WAF)
6. Implement Content Security Policy (CSP)
7. Add API request throttling
8. Implement secure session management

---

**Document Version**: 1.0
**Last Updated**: 2025-10-30
**Maintained By**: Business Analyst Team
