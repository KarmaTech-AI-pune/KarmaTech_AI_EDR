# EDR/EAR Enhancement & EAR Extension Agents Development
## Kiro AI-DLC Implementation Roadmap

**Project Name**: Enterprise Digital Runner (EDR) & Enterprise Auto Runner (EAR) Enhancement  
**Approach**: AI-DLC (AI-Driven Development Lifecycle)  
**Methodology**: Specs-First, AI-First Development  
**Target Deployment**: AWS (EC2, RDS, ALB, Bedrock), Docker Containers  
**Version**: 1.0  
**Date**: November 2, 2025

---

## 📋 TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [AI-DLC Implementation Flow](#ai-dlc-implementation-flow)
3. [Phase 0: Pre-Implementation Foundation](#phase-0-pre-implementation-foundation)
4. [Phase 1: EDR Core Enhancements](#phase-1-edr-core-enhancements)
5. [Phase 2: EAR Core Agent Enhancements](#phase-2-ear-core-agent-enhancements)
6. [Phase 3: EAR Extension Agents Development](#phase-3-ear-extension-agents-development)
7. [Phase 4: DevOps & CI/CD Optimization](#phase-4-devops--cicd-optimization)
8. [Kiro Project Structure](#kiro-project-structure)
9. [Success Metrics & KPIs](#success-metrics--kpis)

---

## 🎯 EXECUTIVE SUMMARY

### Current State (AS-IS)
- **EDR**: 50-60% complete, manual project management system
  - Technology: .NET Core 8.0, CQRS, EF Core (Code First), SQL Server, React 18+
  - Deployed: Windows Dev Server, AWS EC2 (Production)
  - Features: Opportunity Tracking, Go/No-Go, Bid Preparation, Basic WBS, Change Control, Monthly Reports
  
- **EAR Core Agents**: Basic WBS planning with HR integration
  - Technology: Google ADK, MCP Server, mem0 memory management
  - Integration: Airtable HRMS for resource allocation
  - Deployed: Partially on AWS Bedrock
  
- **EAR Extension Agents**: Not yet developed

### Target State (TO-BE)
- **EDR**: 100% complete with advanced features
  - Multi-project WBS schema
  - Program-level management
  - Sprint management (WBS Level 4-5)
  - Automated versioning
  - Real-time dashboard with KPIs
  - Cash flow management
  - Full multi-tenant SaaS capability

- **EAR Core Agents**: Fully automated project lifecycle
  - Auto WBS versioning on change requests
  - Sprint management automation
  - Dashboard analytics agent
  - Notification agent
  - Finance agent integration

- **EAR Extension Agents**: Industry-specific agents
  - Querentia software development agents
  - Industry templates
  - Advanced planning for complex projects

### Key Deliverables
1. Complete AS-IS documentation (10 core documents)
2. Enhanced EDR with 14 priority features
3. Enhanced EAR Core with 8 priority agent capabilities
4. New EAR Extension agents for Querentia
5. Optimized CI/CD pipeline for multi-tenant deployment
6. ACE framework implementation for agent optimization

---

## 🔄 AI-DLC IMPLEMENTATION FLOW

### Core Principle
**Every feature follows a mandatory 7-step process before deployment**

```
┌─────────────────────────────────────────────────────────────┐
│                    AI-DLC WORKFLOW                          │
└─────────────────────────────────────────────────────────────┘

STEP 1: REQUIREMENT ANALYSIS (Internal, No Human Interaction)
├── Parse requirements into measurable acceptance criteria
├── Document all assumptions explicitly
├── Cross-reference with CODING_STANDARDS.md
├── Identify affected database tables
├── Identify API endpoints needed
├── Identify frontend components to modify/create
└── OUTPUT: REQUIREMENT_ANALYSIS_[FeatureID].md
    ↓
STEP 2: CODEBASE IMPACT ANALYSIS (Internal, Autonomous)
├── Search for similar existing features
├── Identify all files requiring modification
├── Identify integration points
├── Identify affected tests
├── List dependencies
├── Assess breaking change risks
└── OUTPUT: IMPACT_ANALYSIS_[FeatureID].md
    ↓
STEP 3: TECHNICAL DESIGN (Internal, Autonomous)
├── Design database schema changes with migrations
├── Design API endpoint specifications
├── Design frontend component architecture
├── Design state management approach
├── Design caching strategy
├── Plan implementation sequence
├── Identify edge cases and handling strategy
└── OUTPUT: TECHNICAL_DESIGN_[FeatureID].md
    ↓
    ┌───────────────────────────────────────┐
    │   HUMAN REVIEW GATE #1                │
    │   Review Steps 1-3 and Approve        │
    └───────────────────────────────────────┘
    ↓
STEP 4: IMPLEMENTATION (Internal, Autonomous)
├── 4A: Database Layer (migrations + rollback)
├── 4B: Backend/API Layer (business logic + validation)
├── 4C: Frontend Layer (components + state management)
├── 4D: Integration (connect frontend to backend)
└── OUTPUT: Production-ready code
    ↓
STEP 5: TESTING (Internal, Autonomous)
├── 5A: Unit Tests (target 80%+ coverage)
├── 5B: Integration Tests
├── 5C: E2E Tests
├── 5D: Performance Tests vs TO-BE targets
└── OUTPUT: TEST_REPORT_[FeatureID].md
    ↓
STEP 6: CODE QUALITY AUDIT (Internal, Autonomous)
├── 6A: Standards Compliance Check
├── 6B: Performance Check
├── 6C: Documentation Update
└── OUTPUT: CODE_QUALITY_REPORT_[FeatureID].md
    ↓
    ┌───────────────────────────────────────┐
    │   HUMAN REVIEW GATE #2                │
    │   Code Review & Approve for Staging   │
    └───────────────────────────────────────┘
    ↓
STEP 7: DEPLOYMENT PACKAGE (Internal, Autonomous)
├── Create deployment checklist
├── Prepare database migration scripts (forward + rollback)
├── Update environment variable documentation
├── Create rollback plan
├── Prepare monitoring/logging queries
├── Document breaking changes
└── OUTPUT: DEPLOYMENT_PACKAGE_[FeatureID].md
    ↓
    ┌───────────────────────────────────────┐
    │   HUMAN REVIEW GATE #3                │
    │   Approve Production Deployment       │
    └───────────────────────────────────────┘
    ↓
DEPLOY TO PRODUCTION
└── Monitor for 24-48 hours
```

### Key AI-DLC Principles

1. **Autonomy with Guard Rails**: Agent operates independently within boundaries
2. **Documentation as Source of Truth**: All decisions reference established docs
3. **Quality Over Speed**: Testing and verification take precedence
4. **Human as Validator, Not Executor**: Humans review and approve, not micromanage
5. **No Step Skipping**: Each step must be 100% complete before proceeding
6. **Mandatory Documentation**: Every step produces documented output
7. **Performance Baseline Required**: Cannot proceed without TO-BE metrics defined

---

## 🏗️ PHASE 0: PRE-IMPLEMENTATION FOUNDATION

**Duration**: 2-3 weeks  
**Objective**: Establish comprehensive AS-IS documentation and knowledge base for AI-DLC execution  
**Team**: Full team participation  
**Status**: CRITICAL - Must complete before any feature development

### 📚 EPIC 0.1: Knowledge Base Creation

**Priority**: CRITICAL  
**Duration**: 2 weeks  
**Owner**: Harshal, Koti, Varun, Ramya

#### Story 0.1.1: Complete ARCHITECTURE.md
**Description**: Document complete system architecture for EDR and EAR

**Tasks**:
- [ ] Document EDR .NET Core backend architecture
  - Clean Architecture layers
  - CQRS with MediatR implementation
  - Repository pattern with Unit of Work
  - Entity Framework Core setup
- [ ] Document EDR React frontend architecture
  - Component structure and hierarchy
  - Context API state management
  - Material-UI theming approach
  - Routing and navigation patterns
- [ ] Document EAR multi-agent architecture
  - Google ADK host agent structure
  - Individual agent responsibilities (PM, HR, Sprint, etc.)
  - mem0 memory management approach
  - Agent communication patterns
- [ ] Document AWS infrastructure
  - EC2 instances configuration
  - RDS SQL Server setup
  - ALB configuration
  - CloudFront + S3 for frontend
  - AWS Bedrock for EAR agents
- [ ] Document MCP server integration
  - MCP tool specifications (17 tools)
  - Request/response patterns
  - Authentication mechanism
- [ ] Create architecture diagrams
  - System context diagram
  - Container diagram (C4 model)
  - Component diagram for EDR
  - Agent interaction diagram for EAR
  - Deployment diagram

**Acceptance Criteria**:
- [ ] Complete architecture document with all sections
- [ ] All technology versions specified
- [ ] All integration points documented
- [ ] Diagrams created and embedded
- [ ] Document reviewed and approved by technical lead

**Assignee**: Harshal, Varun  
**Estimated Effort**: 3 days

---

#### Story 0.1.2: Complete DATABASE_SCHEMA.md
**Description**: Full database schema documentation with ERD

**Tasks**:
- [ ] Create comprehensive ERD (Entity Relationship Diagram)
  - Use tools like dbdiagram.io or draw.io
  - Show all tables and relationships
- [ ] Document all existing tables
  - Table name, purpose, and usage context
  - All columns with data types, constraints
  - Primary keys and foreign keys
  - Indexes and their purposes
  - Sample data for key tables
- [ ] Document versioning tables structure
  - Project version table
  - WBS version table
  - Change control relationship
- [ ] Document sprint management schema
  - Sprint table structure
  - User story table
  - Story points and progress tracking
- [ ] Document audit fields pattern
  - CreatedBy, CreatedDate, ModifiedBy, ModifiedDate
  - IsDeleted for soft deletes
- [ ] Document multi-tenant schema
  - TenantId usage
  - Data isolation approach

**Acceptance Criteria**:
- [ ] Complete ERD available and up-to-date
- [ ] All 50+ tables documented
- [ ] Foreign key relationships clearly shown
- [ ] Sample data provided for 10+ critical tables
- [ ] Migration history documented
- [ ] Document reviewed and approved

**Assignee**: Koti, Harshal  
**Estimated Effort**: 4 days

---

#### Story 0.1.3: Complete API_DOCUMENTATION.md
**Description**: Document all existing EDR APIs

**Tasks**:
- [ ] Export and format Swagger documentation
- [ ] Document authentication flow
  - JWT token generation
  - Token refresh mechanism
  - Role-based authorization
- [ ] Document all API endpoints by module:
  - **Business Development APIs**
    - Opportunity Tracking CRUD
    - Go/No-Go Decision CRUD
    - Bid Preparation CRUD
  - **Project Management APIs**
    - Project CRUD (including program support)
    - WBS CRUD (Level 1, 2, 3)
    - Resource assignment APIs
    - Sprint management APIs
    - Change Control APIs
    - Monthly Progress Report APIs
    - Job Start APIs
    - Input/Output Register APIs
  - **Dashboard APIs**
    - KPI calculation endpoints
    - Chart data endpoints
  - **User Management APIs**
    - User CRUD
    - Role and permission APIs
  - **File Management APIs**
    - Upload/download endpoints
- [ ] For each endpoint, document:
  - HTTP method and full path
  - Required authentication/authorization
  - Request parameters (query, path, body)
  - Request body schema with examples
  - Response schema with examples
  - Error codes and error response format
  - Rate limiting (if applicable)
- [ ] Document MCP Server APIs (17 tools)
  - Tool names and purposes
  - Request/response schemas
  - Usage examples

**Acceptance Criteria**:
- [ ] All 100+ endpoints documented
- [ ] Request/response examples provided for each
- [ ] Error codes documented
- [ ] Authentication clearly explained
- [ ] MCP tools documented
- [ ] Document reviewed and approved

**Assignee**: Harshal, Koti  
**Estimated Effort**: 5 days

---

#### Story 0.1.4: Complete INTEGRATION_GUIDE.md
**Description**: Document all system integrations

**Tasks**:
- [ ] Document EDR-EAR integration
  - API endpoints EAR uses to interact with EDR
  - Authentication mechanism
  - Data synchronization patterns
  - Error handling and retry logic
- [ ] Document MCP server integration
  - MCP server endpoint URLs
  - All 17 MCP tools with specifications
  - Authentication and authorization
  - Tool call patterns
- [ ] Document Airtable HRMS integration
  - Airtable API usage
  - Employee data schema
  - Skills and rates data structure
  - Availability tracking
  - Sync frequency and approach
- [ ] Document Google ADK host agent
  - Setup and configuration
  - Agent initialization
  - Tool registration with MCP
  - Memory management with mem0
- [ ] Document AWS Bedrock deployment
  - Bedrock API usage
  - Model configuration
  - Cost optimization settings
  - Monitoring and logging
- [ ] Document future integrations (planned)
  - Power BI integration approach
  - Notification systems (email, SMS)
  - Third-party calendar integration

**Acceptance Criteria**:
- [ ] All active integrations documented
- [ ] API contracts defined clearly
- [ ] Authentication flows documented
- [ ] Error handling documented
- [ ] Planned integrations noted
- [ ] Document reviewed and approved

**Assignee**: Varun, Ramya  
**Estimated Effort**: 4 days

---

#### Story 0.1.5: Complete CODING_STANDARDS.md
**Description**: Establish coding conventions for C# and TypeScript/React

**Tasks**:
- [ ] Document C# backend coding standards
  - Naming conventions (PascalCase, camelCase usage)
  - Class and interface patterns
  - CQRS command/query patterns
  - Repository pattern usage
  - Exception handling standards
  - Logging standards (Serilog patterns)
  - Async/await patterns
  - Dependency injection patterns
- [ ] Document TypeScript/React frontend coding standards
  - Component naming conventions
  - File and folder structure
  - Functional components patterns
  - Hook usage patterns
  - Context API usage
  - Form handling patterns (Formik)
  - API call patterns
  - Error handling in UI
  - Material-UI usage standards
- [ ] Document common patterns
  - DTOs and mapping patterns
  - Validation patterns (FluentValidation backend, Yup frontend)
  - Pagination patterns
  - Filtering and sorting patterns
  - Audit field handling
  - Multi-tenant data isolation
- [ ] Document code review checklist
- [ ] Document testing standards
  - Unit test naming conventions
  - Test coverage expectations (80%+)
  - Mock usage patterns
  - Integration test patterns

**Acceptance Criteria**:
- [ ] Comprehensive C# standards documented
- [ ] Comprehensive TypeScript/React standards documented
- [ ] Code examples provided for each pattern
- [ ] Code review checklist created
- [ ] Testing standards documented
- [ ] Document reviewed and approved

**Assignee**: Harshal, Koti, Aditya  
**Estimated Effort**: 3 days

---

#### Story 0.1.6: Complete DEPLOYMENT_GUIDE.md
**Description**: Document CI/CD pipeline and deployment procedures

**Tasks**:
- [ ] Document GitHub Actions workflows
  - Frontend deployment workflow (admin + tenant)
  - Backend deployment workflow
  - .NET build and test workflow
  - Auto-tagging workflow
  - Workflow triggers and conditions
- [ ] Document AWS deployment architecture
  - EC2 instance configuration
  - RDS SQL Server configuration
  - ECS/Fargate task definitions
  - ALB target groups and health checks
  - CloudFront distribution setup
  - S3 bucket configuration
- [ ] Document Docker setup
  - Dockerfile for backend
  - Docker image building process
  - ECR repository management
  - Container environment variables
- [ ] Document SQL Server Code First deployment
  - Migration generation process
  - Migration execution in CI/CD
  - Rollback procedures for migrations
- [ ] Document environment-specific configurations
  - Development environment
  - Staging environment
  - Production environment
  - Environment variables for each
- [ ] Document rollback procedures
  - Database rollback
  - Application rollback
  - Cache invalidation
  - Health check verification

**Acceptance Criteria**:
- [ ] All GitHub Actions workflows documented
- [ ] AWS infrastructure documented
- [ ] Docker setup documented
- [ ] Migration process documented
- [ ] Rollback procedures documented
- [ ] Environment configs documented
- [ ] Document reviewed and approved

**Assignee**: Varun, Harshal  
**Estimated Effort**: 3 days

---

#### Story 0.1.7: Complete PERFORMANCE_OPTIMIZATION.md
**Description**: Document current performance baseline and bottlenecks

**Tasks**:
- [ ] Measure and document current performance metrics
  - API response times (p50, p95, p99)
  - Frontend load times
  - Database query performance
  - Memory usage (backend and frontend)
  - Current test coverage percentage
- [ ] Identify and document current bottlenecks
  - Slow API endpoints (list top 10)
  - N+1 query problems
  - Large payload issues
  - Frontend rendering bottlenecks
  - Database indexing gaps
- [ ] Define TO-BE performance targets
  - API response time targets
  - Frontend load time targets
  - Database query time targets
  - Memory usage targets
  - Test coverage targets (80%+)
- [ ] Document optimization opportunities
  - Caching opportunities
  - Query optimization opportunities
  - Code splitting opportunities
  - Database indexing opportunities
- [ ] Document performance testing approach
  - Load testing tools and scripts
  - Performance monitoring setup
  - Metrics collection and analysis

**Acceptance Criteria**:
- [ ] Current metrics measured and documented
- [ ] Bottlenecks identified and prioritized
- [ ] TO-BE targets defined for all metrics
- [ ] Optimization opportunities listed
- [ ] Performance testing approach documented
- [ ] Document reviewed and approved

**Assignee**: Harshal, Koti, Shekhar  
**Estimated Effort**: 4 days

---

#### Story 0.1.8: Complete FRONTEND_STRUCTURE.md
**Description**: Document React frontend organization and patterns

**Tasks**:
- [ ] Document complete directory structure
  - `/src` folder breakdown
  - `/components` organization
  - `/contexts` usage
  - `/services` API layer
  - `/types` TypeScript definitions
  - `/utils` helper functions
  - `/hooks` custom hooks
- [ ] Document routing structure
  - Route definitions
  - Protected route patterns
  - Navigation patterns
- [ ] Document state management approach
  - Context API usage
  - Global state vs local state
  - State update patterns
- [ ] Document form handling patterns
  - Formik integration
  - Validation patterns
  - Form submission patterns
  - Error handling in forms
- [ ] Document component patterns
  - Functional component standards
  - Props interface definitions
  - Event handler patterns
  - Conditional rendering patterns
- [ ] Document styling approach
  - Material-UI theme configuration
  - Custom styling patterns
  - Responsive design approach
  - Accessibility standards

**Acceptance Criteria**:
- [ ] Complete directory tree documented
- [ ] All major components documented
- [ ] State management patterns documented
- [ ] Form handling patterns documented
- [ ] Styling approach documented
- [ ] Document reviewed and approved

**Assignee**: Aditya, Koti  
**Estimated Effort**: 3 days

---

#### Story 0.1.9: Complete BACKEND_STRUCTURE.md
**Description**: Document .NET Core backend organization and patterns

**Tasks**:
- [ ] Document complete directory structure
  - Solution structure
  - Project organization (Domain, Application, Infrastructure, API)
  - Folder conventions
- [ ] Document Clean Architecture layers
  - Domain layer (entities, value objects)
  - Application layer (use cases, DTOs, interfaces)
  - Infrastructure layer (external services, email, logging)
  - Repositories layer (data access, EF Core context)
  - API layer (controllers, middleware, configuration)
- [ ] Document CQRS implementation
  - Command patterns
  - Query patterns
  - Handler patterns using MediatR
  - Validation using FluentValidation
- [ ] Document Entity Framework setup
  - DbContext configuration
  - Entity configurations
  - Migration patterns
  - Seed data approach
- [ ] Document API controller patterns
  - Controller base class
  - Action method patterns
  - Model binding patterns
  - Response patterns
- [ ] Document authentication/authorization
  - JWT token generation and validation
  - Role-based authorization
  - Custom authorization policies
- [ ] Document error handling
  - Global exception handling
  - Error response format
  - Logging patterns

**Acceptance Criteria**:
- [ ] Complete directory tree documented
- [ ] All architecture layers explained
- [ ] CQRS patterns documented
- [ ] EF Core setup documented
- [ ] API patterns documented
- [ ] Authentication documented
- [ ] Error handling documented
- [ ] Document reviewed and approved

**Assignee**: Harshal, Koti  
**Estimated Effort**: 4 days

---

#### Story 0.1.10: Complete DEVELOPMENT_SETUP.md
**Description**: Developer onboarding guide

**Tasks**:
- [ ] Document prerequisites
  - Required software and versions
  - IDE recommendations and extensions
  - Database tools
- [ ] Document repository setup
  - Cloning the repository
  - Branch naming conventions
  - Git workflow
- [ ] Document backend setup
  - .NET SDK installation
  - Restoring NuGet packages
  - Database connection setup
  - Running migrations
  - Starting the backend API
- [ ] Document frontend setup
  - Node.js installation
  - Installing npm dependencies
  - Environment configuration
  - Starting the dev server
- [ ] Document EAR agent setup
  - Python environment setup
  - Google ADK installation
  - MCP server configuration
  - mem0 setup
  - Airtable API configuration
- [ ] Document common issues and troubleshooting
- [ ] Document testing locally
  - Running unit tests
  - Running integration tests
  - Manual testing approach

**Acceptance Criteria**:
- [ ] Prerequisites clearly listed
- [ ] Step-by-step setup instructions
- [ ] All environments covered (EDR backend, frontend, EAR agents)
- [ ] Troubleshooting section included
- [ ] New developer can set up in < 2 hours
- [ ] Document reviewed and approved

**Assignee**: Shekhar, Aditya  
**Estimated Effort**: 2 days

---

### 📊 EPIC 0.2: Performance Baseline Establishment

**Priority**: CRITICAL  
**Duration**: 1 week  
**Owner**: Harshal, Koti, Shekhar

#### Story 0.2.1: Measure Current Performance Metrics
**Description**: Establish AS-IS performance baseline

**Tasks**:
- [ ] Set up performance monitoring tools
  - Application Insights or equivalent
  - Database query profiler
  - Frontend performance monitoring
- [ ] Measure API response times
  - Run load tests on production-like data
  - Measure p50, p95, p99 for top 20 endpoints
  - Document slowest endpoints
- [ ] Measure frontend load times
  - Lighthouse audit for all major pages
  - Real user monitoring if available
  - Document slow pages
- [ ] Measure database query performance
  - Identify N+1 queries
  - Identify missing indexes
  - Measure top 10 slowest queries
- [ ] Measure memory usage
  - Backend memory consumption under load
  - Frontend memory leaks check
- [ ] Measure current test coverage
  - Run code coverage tools
  - Document untested areas

**Acceptance Criteria**:
- [ ] All metrics measured and documented
- [ ] Baseline data captured in PERFORMANCE_OPTIMIZATION.md
- [ ] Top bottlenecks identified and prioritized
- [ ] TO-BE targets defined for all metrics

**Assignee**: Harshal, Shekhar  
**Estimated Effort**: 5 days

---

### ✅ PHASE 0 COMPLETION CRITERIA

**Phase 0 is complete when:**
- [ ] All 10 knowledge base documents created and approved
- [ ] Performance baseline established and TO-BE targets defined
- [ ] All documents reviewed by technical leads
- [ ] Documents stored in `/docs` folder in repository
- [ ] Team trained on AI-DLC workflow and 7-step process

**Phase 0 Approval Gate**: Technical Lead and Product Owner sign-off required before Phase 1

---

## 🎯 PHASE 1: EDR CORE ENHANCEMENTS

**Duration**: 6-8 weeks  
**Objective**: Complete the remaining 14 priority EDR features  
**Team**: Harshal, Koti, Aditya, Shekhar  
**Prerequisites**: Phase 0 complete

### 📋 Priority Matrix

| Priority | Feature ID | Feature Name | Complexity | Duration | Owner |
|----------|-----------|--------------|------------|----------|-------|
| P0 | EDR-1 | WBS Schema Design - Multiple WBS per Project | High | 2 weeks | Harshal, Koti |
| P0 | EDR-2 | Program with Multiple Projects | High | 2 weeks | Harshal, Koti |
| P1 | EDR-3 | Sprint Management at Program Level | High | 2 weeks | Aditya |
| P1 | EDR-4 | Versioning Capability Enhancement | Medium | 1 week | Harshal |
| P1 | EDR-5 | Array-Based POST/PUT/PATCH Calls | Medium | 1 week | Harshal |
| P1 | EDR-6 | Partial WBS Update (PATCH) | Low | 3 days | Harshal, Koti |
| P1 | EDR-7 | Array-Based Multiple WBS Creation | Medium | 1 week | Harshal, Koti |
| P2 | EDR-8 | Manual Version Creation for Project | Medium | 1 week | Harshal, Koti |
| P2 | EDR-9 | Manual Sprint Plan Creation and Management | Medium | 1 week | Aditya |
| P1 | EDR-10 | Dashboard API Implementation | High | 2 weeks | Harshal, Koti |
| P2 | EDR-11 | Cash Flow Screen Design and Implementation | Medium | 1 week | Harshal, Koti |
| P2 | EDR-12 | Batch JSON to SQL Utility | Low | 3 days | Harshal |
| P2 | EDR-13 | Fix NJS Defects | Medium | 1 week | Koti |
| P1 | EDR-14 | End-to-End Testing | Medium | 1 week | Shekhar |

---

### 🏗️ EPIC 1.1: WBS Schema Design - Multiple WBS per Project (EDR-1)

**Priority**: P0  
**Duration**: 2 weeks  
**Owner**: Harshal, Koti  
**Complexity**: High

#### Story 1.1.1: Design New WBS Schema
**Description**: Design database schema to support multiple WBS structures per project

**AI-DLC STEP 1: REQUIREMENT ANALYSIS**
- **Requirement**: A single project can have multiple Work Breakdown Structures (WBS plans)
- **Business Context**: Different phases of a project may require different WBS structures, or a project may need to maintain historical WBS alongside current WBS
- **Acceptance Criteria**:
  - [ ] One project can have N WBS plans
  - [ ] Each WBS plan has a unique identifier and name
  - [ ] WBS plans can be marked as active/inactive
  - [ ] Can query all WBS plans for a project
  - [ ] Can activate/deactivate WBS plans
  - [ ] Each WBS plan maintains its own 3-level hierarchy
- **Assumptions**:
  - Only one WBS plan can be "active" at a time per project
  - Historical WBS plans remain for audit purposes
  - Switching WBS plans doesn't copy data, it switches context

**AI-DLC STEP 2: IMPACT ANALYSIS**
- **Affected Tables**:
  - `Project` table (no changes)
  - `WorkBreakdownStructure` table (add `WBSPlanId` foreign key)
  - NEW: `WBSPlan` table
- **Affected APIs**:
  - WBS CRUD endpoints need `WBSPlanId` parameter
  - Project API needs endpoint to list WBS plans
  - New WBS Plan CRUD endpoints
- **Affected Frontend Components**:
  - WBS selection dropdown
  - WBS listing page
  - WBS creation form
- **Breaking Changes**:
  - Existing WBS data needs migration to default WBS plan
  - API contracts change (WBSPlanId becomes required)
- **Dependencies**:
  - EDR-4 (versioning) may interact with this
  - Sprint management will need WBS plan awareness

**AI-DLC STEP 3: TECHNICAL DESIGN**
- **Database Schema**:
```sql
CREATE TABLE WBSPlan (
    Id INT PRIMARY KEY IDENTITY(1,1),
    ProjectId INT NOT NULL FOREIGN KEY REFERENCES Project(Id),
    Name NVARCHAR(200) NOT NULL,
    Description NVARCHAR(1000),
    IsActive BIT NOT NULL DEFAULT 0,
    CreatedBy NVARCHAR(100),
    CreatedDate DATETIME2 DEFAULT GETDATE(),
    ModifiedBy NVARCHAR(100),
    ModifiedDate DATETIME2,
    IsDeleted BIT DEFAULT 0
);

ALTER TABLE WorkBreakdownStructure
ADD WBSPlanId INT NOT NULL DEFAULT 1 
FOREIGN KEY REFERENCES WBSPlan(Id);

CREATE INDEX IX_WBSPlan_ProjectId ON WBSPlan(ProjectId);
CREATE INDEX IX_WBS_WBSPlanId ON WorkBreakdownStructure(WBSPlanId);
```

- **Migration Strategy**:
  1. Create `WBSPlan` table
  2. For each existing project, create a default WBS plan named "Default Plan"
  3. Migrate existing WBS records to reference the default plan
  4. Add foreign key constraint

- **API Endpoints**:
  - `POST /api/projects/{projectId}/wbs-plans` - Create new WBS plan
  - `GET /api/projects/{projectId}/wbs-plans` - List all WBS plans
  - `GET /api/wbs-plans/{wbsPlanId}` - Get specific WBS plan
  - `PUT /api/wbs-plans/{wbsPlanId}` - Update WBS plan
  - `DELETE /api/wbs-plans/{wbsPlanId}` - Soft delete WBS plan
  - `POST /api/wbs-plans/{wbsPlanId}/activate` - Activate WBS plan
  - Modify existing WBS endpoints to require `wbsPlanId`

- **Frontend Changes**:
  - Add WBS plan selection dropdown in Project Details page
  - Add WBS Plan Management page
  - Update WBS components to work with selected WBS plan

- **Edge Cases**:
  1. Deleting a WBS plan with existing WBS data (soft delete only)
  2. Activating a WBS plan when another is already active (auto-deactivate old one)
  3. Creating a project with no WBS plans (auto-create default)
  4. Switching WBS plans during sprint execution (validation needed)
  5. Versioning a project with multiple WBS plans (version all or selected?)

**Tasks** (AI-DLC STEP 4: IMPLEMENTATION):
- [ ] Create migration for `WBSPlan` table
- [ ] Create migration to add `WBSPlanId` to `WorkBreakdownStructure`
- [ ] Create data migration for existing WBS records
- [ ] Create `WBSPlan` entity in Domain layer
- [ ] Create `IWBSPlanRepository` interface
- [ ] Implement `WBSPlanRepository` in Repositories layer
- [ ] Create WBS Plan DTOs (CreateWBSPlanDto, UpdateWBSPlanDto, WBSPlanDto)
- [ ] Create CQRS commands: CreateWBSPlanCommand, UpdateWBSPlanCommand, DeleteWBSPlanCommand, ActivateWBSPlanCommand
- [ ] Create CQRS queries: GetWBSPlanByIdQuery, GetWBSPlansByProjectIdQuery
- [ ] Create command/query handlers
- [ ] Create `WBSPlanController` with all CRUD endpoints
- [ ] Update `WorkBreakdownStructureController` to handle WBSPlanId
- [ ] Create WBSPlanService in frontend
- [ ] Create WBSPlanSelector component
- [ ] Create WBSPlanManagement page
- [ ] Update existing WBS components

**AI-DLC STEP 5: TESTING**:
- [ ] Unit tests for WBSPlan entity
- [ ] Unit tests for WBSPlanRepository
- [ ] Unit tests for command/query handlers
- [ ] Integration tests for WBS Plan APIs
- [ ] Integration tests for WBS APIs with WBSPlanId
- [ ] E2E tests for WBS plan creation and activation
- [ ] E2E tests for switching WBS plans
- [ ] Performance tests for WBS queries with WBSPlanId filter

**AI-DLC STEP 6: CODE QUALITY AUDIT**:
- [ ] Verify adherence to CODING_STANDARDS.md
- [ ] Verify test coverage ≥ 80%
- [ ] Performance check: API response time < 500ms
- [ ] Update ARCHITECTURE.md with WBS plan concept
- [ ] Update DATABASE_SCHEMA.md with new tables
- [ ] Update API_DOCUMENTATION.md with new endpoints

**AI-DLC STEP 7: DEPLOYMENT PACKAGE**:
- [ ] Create deployment checklist
- [ ] Prepare forward migration scripts
- [ ] Prepare rollback scripts
- [ ] Document breaking changes for API consumers
- [ ] Create monitoring queries for WBS plan usage
- [ ] Test deployment on staging

**Acceptance Criteria**:
- [ ] Can create multiple WBS plans for a project
- [ ] Can activate/deactivate WBS plans
- [ ] Can view and manage all WBS plans
- [ ] Existing WBS data migrated successfully
- [ ] All tests passing with 80%+ coverage
- [ ] API response times meet targets
- [ ] Documentation updated

**Assignee**: Harshal (Backend), Koti (Frontend)  
**Estimated Effort**: 10 days

---

### 🏗️ EPIC 1.2: Program with Multiple Projects (EDR-2)

**Priority**: P0  
**Duration**: 2 weeks  
**Owner**: Harshal, Koti  
**Complexity**: High

#### Story 1.2.1: Design Program-Project Relationship
**Description**: Enable program-level management with multiple projects under one program

**AI-DLC STEP 1: REQUIREMENT ANALYSIS**
- **Requirement**: Create a program entity that can contain multiple projects
- **Business Context**: Large initiatives span multiple projects that need coordinated management
- **Acceptance Criteria**:
  - [ ] Can create a Program with name, description, dates, budget
  - [ ] Can associate multiple projects with a program
  - [ ] Can view all projects under a program
  - [ ] Program has aggregate metrics (total budget, total resources, overall status)
  - [ ] Can manage program-level milestones
  - [ ] Programs have their own access control
- **Assumptions**:
  - A project can belong to only one program (or no program)
  - Programs cannot be nested (no program hierarchy)
  - Program manager role extends project manager permissions

**AI-DLC STEP 2: IMPACT ANALYSIS**
- **Affected Tables**:
  - NEW: `Program` table
  - `Project` table (add `ProgramId` nullable foreign key)
  - User permissions table (add program-level roles)
- **Affected APIs**:
  - New Program CRUD endpoints
  - Project API modified to support ProgramId
  - Dashboard API needs program-level aggregations
- **Affected Frontend Components**:
  - New Program Management module
  - Program Dashboard
  - Project creation form (program selection)
  - Navigation menu (add Programs section)
- **Breaking Changes**:
  - None (ProgramId is nullable)
- **Dependencies**:
  - Sprint management at program level (EDR-3)
  - Dashboard needs program views (EDR-10)

**AI-DLC STEP 3: TECHNICAL DESIGN**
- **Database Schema**:
```sql
CREATE TABLE Program (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(200) NOT NULL,
    Description NVARCHAR(2000),
    StartDate DATE,
    EndDate DATE,
    TotalBudget DECIMAL(18,2),
    Status NVARCHAR(50), -- Planned, Active, On Hold, Completed, Cancelled
    ProgramManagerId INT FOREIGN KEY REFERENCES Users(Id),
    CreatedBy NVARCHAR(100),
    CreatedDate DATETIME2 DEFAULT GETDATE(),
    ModifiedBy NVARCHAR(100),
    ModifiedDate DATETIME2,
    IsDeleted BIT DEFAULT 0,
    TenantId INT -- For multi-tenant
);

ALTER TABLE Project
ADD ProgramId INT NULL FOREIGN KEY REFERENCES Program(Id);

CREATE TABLE ProgramMilestone (
    Id INT PRIMARY KEY IDENTITY(1,1),
    ProgramId INT NOT NULL FOREIGN KEY REFERENCES Program(Id),
    Name NVARCHAR(200) NOT NULL,
    Description NVARCHAR(1000),
    TargetDate DATE NOT NULL,
    ActualDate DATE NULL,
    Status NVARCHAR(50),
    CreatedBy NVARCHAR(100),
    CreatedDate DATETIME2 DEFAULT GETDATE(),
    IsDeleted BIT DEFAULT 0
);

CREATE INDEX IX_Program_Status ON Program(Status);
CREATE INDEX IX_Project_ProgramId ON Project(ProgramId);
```

- **API Endpoints**:
  - `POST /api/programs` - Create program
  - `GET /api/programs` - List all programs (with filters)
  - `GET /api/programs/{programId}` - Get program details
  - `PUT /api/programs/{programId}` - Update program
  - `DELETE /api/programs/{programId}` - Soft delete
  - `GET /api/programs/{programId}/projects` - Get all projects in program
  - `POST /api/programs/{programId}/projects/{projectId}` - Associate project
  - `DELETE /api/programs/{programId}/projects/{projectId}` - Disassociate
  - `GET /api/programs/{programId}/metrics` - Program-level metrics
  - Program milestone CRUD endpoints

- **Frontend Changes**:
  - Create Program Management module
  - Create Program Dashboard with aggregate metrics
  - Add program selection in Project creation
  - Create Program-Project association UI
  - Create Program Milestones management

**Tasks** (AI-DLC STEP 4: IMPLEMENTATION):
- [ ] Create migration for Program table
- [ ] Create migration for ProgramMilestone table
- [ ] Alter Project table to add ProgramId
- [ ] Create Program entity and ProgramMilestone entity
- [ ] Create repository interfaces and implementations
- [ ] Create DTOs for Program CRUD
- [ ] Create CQRS commands and queries for Program
- [ ] Create handlers with validation
- [ ] Create ProgramController
- [ ] Update ProjectController to handle ProgramId
- [ ] Create ProgramService in frontend
- [ ] Create Program Management pages (List, Create, Edit, Details)
- [ ] Create Program Dashboard component
- [ ] Update Project form to include Program selection
- [ ] Update navigation to include Programs

**AI-DLC STEP 5: TESTING**:
- [ ] Unit tests for Program entity
- [ ] Unit tests for repositories
- [ ] Unit tests for handlers
- [ ] Integration tests for Program APIs
- [ ] Integration tests for Program-Project association
- [ ] E2E tests for program creation and project association
- [ ] E2E tests for program dashboard metrics

**AI-DLC STEP 6: CODE QUALITY AUDIT**:
- [ ] Standards compliance check
- [ ] Test coverage ≥ 80%
- [ ] Performance validation
- [ ] Documentation updates

**AI-DLC STEP 7: DEPLOYMENT PACKAGE**:
- [ ] Deployment checklist
- [ ] Migration scripts (forward and rollback)
- [ ] Monitoring queries
- [ ] Staging validation

**Assignee**: Harshal (Backend), Koti (Frontend)  
**Estimated Effort**: 10 days

---

### 🏗️ EPIC 1.3: Sprint Management at Program Level (EDR-3)

**Priority**: P1  
**Duration**: 2 weeks  
**Owner**: Aditya  
**Complexity**: High

#### Story 1.3.1: Design Program-Level Sprint Management
**Description**: Enable sprint planning and tracking across all projects in a program

**AI-DLC STEP 1: REQUIREMENT ANALYSIS**
- **Requirement**: Create sprints at program level that span multiple projects
- **Business Context**: Agile teams working across program projects need coordinated sprint planning
- **Acceptance Criteria**:
  - [ ] Can create sprints at program level (WBS Level 4)
  - [ ] Can create user stories at sprint level (WBS Level 5)
  - [ ] User stories can be assigned to projects within the program
  - [ ] Sprint has start/end dates, goals, and velocity
  - [ ] Can track story points (planned vs actual)
  - [ ] Can visualize burndown chart at program level
  - [ ] Sprint progress affects monthly reports
  - [ ] Can move user stories between sprints

**AI-DLC STEP 2: IMPACT ANALYSIS**
- **Affected Tables**:
  - NEW: `Sprint` table (WBS Level 4)
  - NEW: `UserStory` table (WBS Level 5)
  - `WorkBreakdownStructure` table (extend to Level 4-5)
- **Affected APIs**:
  - New Sprint CRUD endpoints
  - New UserStory CRUD endpoints
  - WBS API extended for Level 4-5
  - Dashboard API for burndown charts
- **Affected Frontend**:
  - Sprint Management module
  - Sprint Board (Kanban/Agile board)
  - Burndown chart component
  - User story management UI

**AI-DLC STEP 3: TECHNICAL DESIGN**
- **Database Schema**:
```sql
CREATE TABLE Sprint (
    Id INT PRIMARY KEY IDENTITY(1,1),
    ProgramId INT NULL FOREIGN KEY REFERENCES Program(Id),
    ProjectId INT NULL FOREIGN KEY REFERENCES Project(Id),
    SprintName NVARCHAR(200) NOT NULL,
    SprintNumber INT,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    Goal NVARCHAR(1000),
    PlannedVelocity INT, -- Story points
    ActualVelocity INT,
    Status NVARCHAR(50), -- Planning, Active, Completed, Cancelled
    CreatedBy NVARCHAR(100),
    CreatedDate DATETIME2 DEFAULT GETDATE(),
    ModifiedBy NVARCHAR(100),
    ModifiedDate DATETIME2,
    IsDeleted BIT DEFAULT 0,
    CONSTRAINT CK_Sprint_Level CHECK (
        (ProgramId IS NOT NULL AND ProjectId IS NULL) OR
        (ProgramId IS NULL AND ProjectId IS NOT NULL)
    )
);

CREATE TABLE UserStory (
    Id INT PRIMARY KEY IDENTITY(1,1),
    SprintId INT NOT NULL FOREIGN KEY REFERENCES Sprint(Id),
    ProjectId INT NULL FOREIGN KEY REFERENCES Project(Id),
    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(2000),
    AcceptanceCriteria NVARCHAR(2000),
    StoryPoints INT,
    Priority NVARCHAR(50), -- High, Medium, Low
    Status NVARCHAR(50), -- To Do, In Progress, Testing, Done
    AssignedTo INT FOREIGN KEY REFERENCES Users(Id),
    CreatedBy NVARCHAR(100),
    CreatedDate DATETIME2 DEFAULT GETDATE(),
    ModifiedBy NVARCHAR(100),
    ModifiedDate DATETIME2,
    IsDeleted BIT DEFAULT 0
);

CREATE TABLE UserStoryHistory (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserStoryId INT NOT NULL FOREIGN KEY REFERENCES UserStory(Id),
    PreviousStatus NVARCHAR(50),
    NewStatus NVARCHAR(50),
    ChangedBy NVARCHAR(100),
    ChangedDate DATETIME2 DEFAULT GETDATE()
);

CREATE INDEX IX_Sprint_ProgramId ON Sprint(ProgramId);
CREATE INDEX IX_Sprint_ProjectId ON Sprint(ProjectId);
CREATE INDEX IX_UserStory_SprintId ON UserStory(SprintId);
CREATE INDEX IX_UserStory_Status ON UserStory(Status);
```

**Tasks** (AI-DLC STEP 4-7):
- [ ] Complete all 7 AI-DLC steps as documented
- [ ] Implement Sprint CRUD operations
- [ ] Implement UserStory CRUD operations
- [ ] Implement Sprint Board UI (Kanban style)
- [ ] Implement Burndown chart visualization
- [ ] Implement drag-and-drop for user stories
- [ ] Integrate with monthly progress reports

**Assignee**: Aditya  
**Estimated Effort**: 10 days

---

### 🏗️ EPIC 1.4: Versioning Capability Enhancement (EDR-4)

**Priority**: P1  
**Duration**: 1 week  
**Owner**: Harshal

**Features**:
- Automatic versioning after change control approval
- Sub-versioning before approval (draft versions)
- Move older versions to history table
- Version comparison UI

**Tasks**: Follow complete AI-DLC 7-step process  
**Estimated Effort**: 5 days

---

### 🏗️ EPIC 1.5: Array-Based API Operations (EDR-5, EDR-6, EDR-7)

**Priority**: P1  
**Duration**: 2 weeks  
**Owner**: Harshal, Koti

**Features**:
- Array-based POST for bulk creation
- Array-based PUT for bulk updates
- PATCH for partial WBS updates
- Bulk WBS creation (Level 1, 2, 3 in single call)

**Tasks**: Follow complete AI-DLC 7-step process  
**Estimated Effort**: 10 days

---

### 🏗️ EPIC 1.6: Dashboard API Implementation (EDR-10)

**Priority**: P1  
**Duration**: 2 weeks  
**Owner**: Harshal, Koti

**Features**:
- KPI calculation endpoints
- Real-time metrics (EAC, CTC, variance analysis)
- Chart data APIs
- Program and project level dashboards
- Performance optimization for aggregations

**Tasks**: Follow complete AI-DLC 7-step process  
**Estimated Effort**: 10 days

---

### 🏗️ EPIC 1.7: Remaining EDR Features (EDR-8, 9, 11, 12, 13, 14)

**Features**:
- Manual project versioning (EDR-8)
- Manual sprint management (EDR-9)
- Cash flow management (EDR-11)
- Batch JSON utility (EDR-12)
- Defect fixes (EDR-13)
- End-to-end testing (EDR-14)

**Tasks**: Each feature follows AI-DLC 7-step process  
**Estimated Effort**: 3-4 weeks

---

## 🤖 PHASE 2: EAR CORE AGENT ENHANCEMENTS

**Duration**: 6-8 weeks  
**Objective**: Enhance EAR core agents with automation capabilities  
**Team**: Varun, Ramya, Gaurav, Aditya  
**Prerequisites**: Phase 0 and Phase 1 (EDR-1, EDR-2, EDR-4) complete

### 📋 Priority Matrix

| Priority | Feature ID | Agent Name | Complexity | Duration | Owner |
|----------|-----------|------------|------------|----------|-------|
| P0 | EAR-1 | WBS Auto-Versioning Agent | High | 2 weeks | Gaurav, Varun |
| P0 | EAR-2 | Change Request Replanning Agent | High | 3 weeks | Gaurav, Varun |
| P1 | EAR-3 | Sprint Management Agent | High | 2 weeks | Aditya |
| P1 | EAR-4 | Dashboard Analytics Agent | Medium | 2 weeks | Aditya |
| P1 | EAR-5 | Notification Agent | Medium | 1 week | Aditya |
| P1 | EAR-6 | Finance Agent | Medium | 2 weeks | Gaurav |
| P0 | EAR-7 | ACE Framework Implementation | High | 2 weeks | Varun, Ramya |
| P1 | EAR-8 | HR Agent Enhancement | Medium | 1 week | Gaurav |

---

### 🤖 EPIC 2.1: WBS Auto-Versioning Agent (EAR-1)

**Priority**: P0  
**Duration**: 2 weeks  
**Owner**: Gaurav, Varun  
**Complexity**: High

#### Story 2.1.1: Design WBS Auto-Versioning Logic
**Description**: Agent automatically creates new WBS version based on triggers

**AI-DLC STEP 1: REQUIREMENT ANALYSIS**
- **Requirement**: When specific events occur, automatically create a new WBS version
- **Business Context**: Manual versioning is error-prone; automation ensures consistency
- **Triggers for Auto-Versioning**:
  - Change control request approved
  - Major milestone completed
  - Scheduled periodic versioning (e.g., monthly)
  - Significant scope change detected
- **Acceptance Criteria**:
  - [ ] Agent monitors EDR for versioning triggers
  - [ ] Agent creates new version with proper naming convention
  - [ ] Agent copies current WBS structure to new version
  - [ ] Agent updates version metadata (reason, timestamp, triggered by)
  - [ ] Agent notifies relevant stakeholders
  - [ ] Agent maintains version history
  - [ ] Agent handles failures gracefully

**AI-DLC STEP 2: IMPACT ANALYSIS**
- **Integration Points**:
  - EDR Change Control API
  - EDR Project Versioning API
  - EDR WBS API
  - MCP Server tools
- **New MCP Tools Needed**:
  - `create_project_version` tool
  - `copy_wbs_structure` tool
  - `get_change_control_approvals` tool
- **Agent Architecture**:
  - Event listener for EDR webhooks
  - Version creation logic
  - Notification logic
  - Error handling and retry logic

**AI-DLC STEP 3: TECHNICAL DESIGN**
- **Agent Flow**:
```
1. Listen for triggers (webhook or polling)
   ├─ Change control approved
   ├─ Milestone completed
   └─ Scheduled time

2. Validate trigger
   ├─ Check if versioning is needed
   └─ Check if project is in valid state

3. Create new version
   ├─ Call EDR API: POST /api/projects/{id}/versions
   ├─ Generate version number (semantic versioning)
   └─ Set version metadata

4. Copy WBS structure
   ├─ Get current WBS: GET /api/projects/{id}/wbs
   ├─ Create new WBS for new version: POST /api/projects/{versionId}/wbs
   └─ Copy all levels (1, 2, 3)

5. Update version status
   ├─ Mark new version as "Current"
   └─ Mark previous version as "Historical"

6. Notify stakeholders
   ├─ Call Notification Agent
   └─ Send emails to PM and team

7. Log completion
   └─ Record in agent memory (mem0)
```

- **MCP Tool Specifications**:
```json
{
  "name": "create_project_version",
  "description": "Creates a new version of a project",
  "inputSchema": {
    "type": "object",
    "properties": {
      "projectId": { "type": "integer" },
      "versionName": { "type": "string" },
      "reason": { "type": "string" },
      "basedOnVersionId": { "type": "integer" }
    },
    "required": ["projectId", "versionName", "reason"]
  }
}
```

**Tasks** (AI-DLC STEP 4: IMPLEMENTATION):
- [ ] Implement webhook listener in EAR host agent
- [ ] Create version creation logic using Google ADK
- [ ] Implement MCP tool calls for EDR integration
- [ ] Add error handling and retry logic
- [ ] Implement notification logic
- [ ] Add mem0 memory tracking
- [ ] Create agent configuration file
- [ ] Deploy to AWS Bedrock

**AI-DLC STEP 5: TESTING**:
- [ ] Unit tests for agent logic
- [ ] Integration tests with EDR APIs
- [ ] End-to-end tests with real triggers
- [ ] Performance tests (version creation < 2 minutes)
- [ ] Failure scenario tests

**AI-DLC STEP 6: CODE QUALITY AUDIT**:
- [ ] Code review against Python standards
- [ ] Memory usage check
- [ ] Token usage optimization (cost control)
- [ ] Documentation updates

**AI-DLC STEP 7: DEPLOYMENT PACKAGE**:
- [ ] Docker image for agent
- [ ] AWS Bedrock configuration
- [ ] Environment variables
- [ ] Monitoring dashboard queries
- [ ] Rollback procedures

**Assignee**: Gaurav (Agent Logic), Varun (Deployment)  
**Estimated Effort**: 10 days

---

### 🤖 EPIC 2.2: Change Request Replanning Agent (EAR-2)

**Priority**: P0  
**Duration**: 3 weeks  
**Owner**: Gaurav, Varun  
**Complexity**: High

#### Story 2.2.1: Design Change Request Impact Analysis
**Description**: Agent analyzes change requests and calculates project impact

**AI-DLC STEP 1: REQUIREMENT ANALYSIS**
- **Requirement**: When PM fills change request form, agent analyzes impact and creates replan
- **Business Context**: Change requests affect scope, time, cost, resources, and quality
- **Process Flow**:
  1. PM fills change request form in EDR
  2. Agent analyzes additional work hours needed
  3. Agent calculates cost, time, resource, and quality impact
  4. PM reviews and submits to client
  5. Upon approval, agent creates new WBS plan (replanning)
  6. Agent considers sprint progress and monthly reports
  7. Agent optimizes remaining work for better outcomes

- **Acceptance Criteria**:
  - [ ] Agent receives change request from EDR
  - [ ] Agent calculates time impact (additional hours)
  - [ ] Agent calculates cost impact (labor, materials, overhead)
  - [ ] Agent calculates resource impact (skill requirements, availability)
  - [ ] Agent calculates quality impact (risk assessment)
  - [ ] Agent generates impact report
  - [ ] Upon approval, agent creates new WBS version
  - [ ] Agent considers actual sprint progress vs planned
  - [ ] Agent considers monthly report data (burnrate, EAC, CTC)
  - [ ] Agent provides optimization recommendations
  - [ ] Agent handles complex scenarios (paint house example)

**Key Scenario - Paint House Example**:
```
Initial Plan: 6 months (Aug 2025 - Jan 2026), 6 houses, $30K budget
Current State (End Oct 2025): 2/6 houses done (50% behind), $12K spent
Change Request: +2 houses, +1 month, +$10K

Replanning Considerations:
- Only 2/3 planned work completed in 3 months
- Actual pace: 0.67 houses/month vs 1 house/month planned
- Cash spent: $12K vs $15K budgeted (but behind on work)
- Remaining: 4 original + 2 new = 6 houses in 4 months
- Required pace: 1.5 houses/month (vs current 0.67)
- Original profit: $6K, risk of profit erosion

Agent Must:
1. Identify the productivity gap (0.67 vs 1.0)
2. Calculate realistic completion time (6 houses / 0.67 = 9 months remaining?)
3. Recommend: hire more crew, improve processes, adjust scope
4. Show impact on profit margin
5. Provide alternatives: extend timeline, increase budget, reduce scope
6. Create optimized WBS for remaining work
```

**AI-DLC STEP 2: IMPACT ANALYSIS**
- **Required Data Sources**:
  - Change request form data
  - Current WBS structure
  - Sprint progress data (planned vs actual story points)
  - Monthly progress reports (EAC, CTC, burn rate)
  - Resource availability from HRMS
  - Historical project data for estimation
- **Integration Points**:
  - EDR Change Control API
  - EDR Sprint API
  - EDR Monthly Report API
  - EDR WBS API
  - Airtable HRMS API
  - mem0 for historical data
- **New Capabilities Needed**:
  - Predictive analytics for time/cost estimation
  - Resource optimization algorithms
  - Risk scoring algorithms
  - WBS replanning algorithms

**AI-DLC STEP 3: TECHNICAL DESIGN**
- **Agent Architecture**:
```
Change Request Replanning Agent
├─ Input Analyzer
│  ├─ Parse change request data
│  ├─ Extract scope changes
│  └─ Identify constraints
│
├─ Progress Analyzer
│  ├─ Get sprint progress (burndown data)
│  ├─ Calculate velocity (actual vs planned)
│  ├─ Get monthly reports (financial status)
│  └─ Identify productivity gaps
│
├─ Impact Calculator
│  ├─ Time Impact Calculator
│  │  ├─ Estimate additional hours using historical data
│  │  ├─ Adjust for current velocity
│  │  └─ Calculate new end date
│  │
│  ├─ Cost Impact Calculator
│  │  ├─ Calculate labor costs
│  │  ├─ Calculate material costs
│  │  ├─ Calculate overhead
│  │  └─ Update EAC (Estimate at Completion)
│  │
│  ├─ Resource Impact Calculator
│  │  ├─ Identify skill requirements
│  │  ├─ Check resource availability in HRMS
│  │  ├─ Calculate resource gaps
│  │  └─ Recommend hiring/training
│  │
│  └─ Quality Impact Calculator
│     ├─ Assess risk factors
│     ├─ Calculate risk score
│     └─ Recommend mitigation strategies
│
├─ Optimization Engine
│  ├─ Scenario Generator
│  │  ├─ Scenario 1: Baseline (accept delays)
│  │  ├─ Scenario 2: Add resources
│  │  ├─ Scenario 3: Process improvements
│  │  └─ Scenario 4: Hybrid approach
│  │
│  ├─ Cost-Benefit Analyzer
│  │  ├─ Calculate NPV for each scenario
│  │  ├─ Calculate profit margin impact
│  │  └─ Rank scenarios
│  │
│  └─ Recommendation Generator
│     └─ Select optimal scenario with justification
│
└─ WBS Replanner
   ├─ Get current WBS structure
   ├─ Adjust for completed work
   ├─ Add change request scope
   ├─ Redistribute work based on velocity
   ├─ Re-assign resources
   ├─ Update milestones and dates
   └─ Create new WBS version
```

- **Algorithms**:
```python
# Velocity Calculation
actual_velocity = completed_work / time_elapsed
planned_velocity = planned_work / planned_time
velocity_gap = (actual_velocity / planned_velocity) - 1  # negative = behind

# Adjusted Time Estimation
remaining_work = original_work - completed_work + change_request_work
adjusted_time = remaining_work / actual_velocity

# EAC Calculation
cost_to_date = actual_costs_incurred
work_completion_percentage = completed_work / (original_work + change_request_work)
eac = cost_to_date / work_completion_percentage

# Profit Margin Impact
original_profit_margin = (contract_value - original_eac) / contract_value
new_profit_margin = (new_contract_value - new_eac) / new_contract_value
profit_margin_impact = new_profit_margin - original_profit_margin
```

**Tasks** (AI-DLC STEP 4-7):
- [ ] Implement Input Analyzer module
- [ ] Implement Progress Analyzer module
- [ ] Implement Impact Calculator modules (Time, Cost, Resource, Quality)
- [ ] Implement Optimization Engine
- [ ] Implement WBS Replanner
- [ ] Integrate with mem0 for historical data
- [ ] Integrate with HRMS for resource data
- [ ] Create comprehensive test suite
- [ ] Deploy to AWS Bedrock
- [ ] Create monitoring dashboard

**Assignee**: Gaurav (Agent Logic), Varun (Integration & Deployment)  
**Estimated Effort**: 15 days

---

### 🤖 EPIC 2.3-2.8: Remaining EAR Core Agents

**Sprint Management Agent (EAR-3)**: Automates bi-weekly sprint planning based on progress  
**Dashboard Analytics Agent (EAR-4)**: Real-time dashboard updates and insights  
**Notification Agent (EAR-5)**: Manages all stakeholder communications  
**Finance Agent (EAR-6)**: Financial tracking, forecasting, and reporting  
**ACE Framework Implementation (EAR-7)**: Optimize agent performance using ACE  
**HR Agent Enhancement (EAR-8)**: Enhanced resource allocation and forecasting

**Each follows complete AI-DLC 7-step process**

---

## 🚀 PHASE 3: EAR EXTENSION AGENTS DEVELOPMENT

**Duration**: 8-10 weeks  
**Objective**: Build industry-specific agents for Querentia clients  
**Team**: Varun, Ramya  
**Prerequisites**: Phase 2 complete

### 🎯 Extension Agent Categories

1. **Software Development Agents**
   - Requirements analysis agent
   - Architecture design agent
   - Code generation agent
   - Testing agent
   - DevOps agent

2. **Construction Project Agents**
   - Site analysis agent
   - Material procurement agent
   - Safety compliance agent

3. **Consulting Project Agents**
   - Research agent
   - Report generation agent
   - Presentation creation agent

**Each agent follows AI-DLC 7-step process**

---

## 🔧 PHASE 4: DEVOPS & CI/CD OPTIMIZATION

**Duration**: 3-4 weeks  
**Objective**: Streamline deployment, reduce costs, optimize performance  
**Team**: Varun, Harshal

### 📋 Optimization Areas

1. **CI/CD Pipeline Enhancement**
   - Optimize GitHub Actions workflows
   - Implement blue-green deployment
   - Add automated rollback triggers
   - Optimize Docker image sizes
   - Implement caching strategies

2. **AWS Infrastructure Optimization**
   - Implement auto-scaling for ECS
   - Optimize RDS instance sizing
   - Implement CloudWatch alarms
   - Set up cost alerts
   - Optimize Bedrock token usage

3. **Multi-