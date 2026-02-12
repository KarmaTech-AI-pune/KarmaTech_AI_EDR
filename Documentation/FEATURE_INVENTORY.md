# EDR Application Feature Inventory

## Overview

This document provides a comprehensive catalog of all features in the EDR (KarmaTech AI) application, organized by module. It serves as the master reference for understanding the application's scope and capabilities.

**Last Updated:** November 28, 2025

## Summary Statistics

| Category | Count |
|----------|-------|
| CQRS Modules | 28 |
| Database Entities | 87 |
| Frontend Pages | 24 |
| Frontend Components | 100+ |
| API Services | 35 |
| Commands | 75+ |
| Queries | 60+ |
| Handlers | 135+ |

---

## Table of Contents

1. [Project Management Module](#1-project-management-module)
2. [Business Development Module](#2-business-development-module)
3. [Administrative Module](#3-administrative-module)
4. [Correspondence Module](#4-correspondence-module)
5. [Sprint Planning Module](#5-sprint-planning-module)
6. [Cross-Cutting Features](#6-cross-cutting-features)

---

## 1. Project Management Module

### 1.1 Projects Feature

**Purpose:** Core project CRUD operations and management

#### Backend Components

| Type | Files |
|------|-------|
| **Commands** | CreateProjectCommand, DeleteProjectCommand, UpdateProjectCommand, UpdateProjectBudgetCommand |
| **Queries** | GetAllProjectsQuery, GetProjectByIdQuery, GetProjectByUserIdQuery, GetProjectBudgetHistoryQuery |
| **Handlers** | CreateProjectCommandHandler, DeleteProjectCommandHandler, GetAllProjectsQueryHandler, GetProjectByIdQueryHandler, GetProjectByUserIdQueryHandler, UpdateProjectCommandHandler, UpdateProjectBudgetCommandHandler, GetProjectBudgetHistoryQueryHandler |
| **Validators** | GetProjectBudgetHistoryQueryValidator, UpdateProjectBudgetCommandValidator |

#### Database Entities
- `Project` - Main project entity
- `ProjectBudgetChangeHistory` - Budget change tracking
- `ProjectResource` - Project resource allocation
- `Region` - Geographic regions

#### Frontend Components
- **Pages:** ProjectManagement.tsx, ProjectDetails.tsx, ProjectOverview.tsx, ProjectDocuments.tsx, ProjectForms.tsx, ProjectTimeline.tsx, ProjectBudgetHistory.tsx
- **Components:** ProjectItem.tsx, ProjectFilter.tsx, ProjectManagementProjectList.tsx, ProjectInitializationDialog.tsx, BudgetUpdateDialog.tsx, BudgetChangeTimeline.tsx
- **Services:** projectApi.tsx, projectBudgetApi.ts

---

### 1.2 Work Breakdown Structure (WBS) Feature

**Purpose:** Hierarchical task breakdown and resource planning

#### Backend Components

| Type | Files |
|------|-------|
| **Commands** | AddWBSTaskCommand, CreateWBSOptionCommand, CreateWBSTaskCommand, DeleteWBSOptionCommand, DeleteWBSTaskCommand, SetWBSCommand, UpdateWBSOptionCommand, UpdateWBSTaskCommand, WBSVersionCommands (Activate, Create, Delete) |
| **Queries** | GetApprovedWBSQuery, GetWBSByProjectIdQuery, GetWBSLevel1OptionsQuery, GetWBSLevel2OptionsQuery, GetWBSLevel3OptionsQuery, GetWBSOptionsQuery, GetWBSResourceDataQuery, GetWBSTaskByIdQuery, GetWBSTasksQuery, GetWBSVersionsQuery, GetManpowerResourcesWithPlannedHoursQuery, GetLatestWBSVersionQuery |
| **Handlers** | 23 handlers for all commands and queries |

#### Database Entities
- `WorkBreakdownStructure` - Main WBS entity
- `WBSTask` - Individual tasks
- `WBSTaskLevel` - Task hierarchy levels
- `WBSOption` - WBS configuration options
- `WBSHistory` - Change history
- `WBSVersionHistory` - Version tracking
- `WBSVersionWorkflowHistory` - Workflow state history
- `WBSTaskVersionHistory` - Task version tracking
- `WBSTaskPlannedHour` - Planned hours per task
- `WBSTaskPlannedHourHeader` - Planned hours header
- `WBSTaskPlannedHourVersionHistory` - Planned hours versioning
- `UserWBSTask` - User-task assignments
- `UserWBSTaskVersionHistory` - Assignment versioning

#### Frontend Components
- **Pages:** WBS/ folder
- **Components:** WBSChart.tsx, WorkBreakdownStructureForm.tsx, WBSFormDialog.tsx, WBSItemRow.tsx, WBSLevelTable.tsx, ActionButton.tsx, AddItemButton.tsx, DeleteWBSDialog.tsx
- **Services:** wbsApi.tsx, wbsHeaderApi.tsx, wbsWorkflowApi.tsx

---

### 1.3 Monthly Progress Feature

**Purpose:** Monthly project progress tracking and reporting

#### Backend Components

| Type | Files |
|------|-------|
| **Commands** | CreateMonthlyProgressCommand, DeleteMonthlyProgressCommand, UpdateMonthlyProgressCommand, UpdateManpowerPlanningCommand |
| **Queries** | GetAllMonthlyProgressQuery, GetMonthlyProgressByProjectIdQuery, GetMonthlyProgressByProjectYearMonthQuery |
| **Handlers** | 7 handlers for all operations |

#### Database Entities
- `MonthlyProgress` - Main progress entity
- `ManpowerPlanning` - Resource planning
- `ProgressDeliverable` - Deliverable tracking
- `FinancialDetails` - Financial metrics
- `Schedule` - Schedule tracking
- `ProgrammeSchedule` - Programme-level scheduling
- `CurrentMonthAction` - Current month actions
- `LastMonthAction` - Previous month actions
- `EarlyWarning` - Risk warnings
- `Limitations` - Project limitations
- `PercentCompleteOnCosts` - Cost completion tracking
- `CTCEAC` - Cost tracking
- `CurrentBudgetInMIS` - MIS budget data
- `OriginalBudget` - Original budget baseline
- `BudgetTable` - Budget breakdown

#### Frontend Components
- **Components:** MonthlyReports.tsx, MonthlyReportDialog.tsx, MonthlyProgresscomponents/ folder
- **Services:** monthlyProgressApi.tsx, monthlyProgressDataService.ts

---

### 1.4 Project Closure Feature

**Purpose:** Project closure workflow and documentation

#### Backend Components

| Type | Files |
|------|-------|
| **Commands** | CreateProjectClosureCommand, DeleteProjectClosureCommand, UpdateProjectClosureCommand |
| **Queries** | GetAllProjectClosuresQuery, GetProjectClosureByIdQuery, GetProjectClosureByProjectIdQuery, GetProjectClosuresByProjectIdQuery |
| **Handlers** | 7 handlers for all operations |

#### Database Entities
- `ProjectClosure` - Main closure entity
- `ProjectClosureWorkflowHistory` - Workflow tracking

#### Frontend Components
- **Pages:** ProjectClosure.tsx
- **Components:** ProjectClosureForm.tsx, ProjectClosureWorkflow.tsx, projectClosure/ folder
- **Services:** projectClosureApi.ts

---

### 1.5 Cashflow Feature

**Purpose:** Project cashflow management and forecasting

#### Backend Components

| Type | Files |
|------|-------|
| **Commands** | CreateCashflowCommand, DeleteCashflowCommand, UpdateCashflowCommand |
| **Queries** | GetAllCashflowsQuery, GetCashflowQuery |
| **Handlers** | 5 handlers for all operations |

#### Database Entities
- `Cashflow` - Cashflow data

#### Frontend Components
- **Components:** CashflowChart.tsx
- **Services:** (integrated in projectApi.tsx)

---

### 1.6 Project Schedule Feature

**Purpose:** Project scheduling and Gantt chart visualization

#### Backend Components

| Type | Files |
|------|-------|
| **Commands** | CreateProjectScheduleCommand |
| **Queries** | GetProjectScheduleQuery |
| **Handlers** | 2 handlers |

#### Database Entities
- `Schedule` - Schedule data
- `ProgrammeSchedule` - Programme scheduling
- `todoProjectSchedule` - Task scheduling

#### Frontend Components
- **Components:** GanttChart.tsx
- **Services:** (integrated in projectApi.tsx)

---

### 1.7 Change Control Feature

**Purpose:** Project change request management and approval workflow

#### Backend Components

| Type | Files |
|------|-------|
| **Commands** | CreateChangeControlCommand, DeleteChangeControlCommand, UpdateChangeControlCommand |
| **Queries** | GetAllChangeControlsQuery, GetChangeControlByIdQuery, GetChangeControlsByProjectIdQuery |
| **Handlers** | 6 handlers for all operations |

#### Database Entities
- `ChangeControl` - Change control records
- `ChangeControlWorkflowHistory` - Workflow tracking
- `ChangeOrder` - Change orders

#### Frontend Components
- **Components:** ChangeControlForm.tsx, ChangeControlWorkflow.tsx, ChangeControlcomponents/ folder
- **Services:** changeControlApi.tsx

---

### 1.8 PM Workflow Feature

**Purpose:** Project management workflow state machine

#### Backend Components

| Type | Files |
|------|-------|
| **Commands** | ApproveCommand, RequestChangesCommand, SendToApprovalCommand, SendToReviewCommand |
| **Queries** | GetWorkflowHistoryQuery |
| **Handlers** | 9 handlers (including legacy versions) |

#### Database Entities
- `PMWorkflowStatus` - Workflow status definitions
- `WorkflowEntry` - Workflow entries

#### Frontend Components
- **Components:** ProjectTrackingWorkflow.tsx, SendForApproval.tsx, SendForReview.tsx, DecideApproval.tsx, DecideReview.tsx, WorkflowHistoryDisplay.tsx
- **Dialogs:** SendForReviewDialog.tsx, DecideApprovalDialog.tsx, DecideReviewDialog.tsx

---

## 2. Business Development Module

### 2.1 Opportunity Tracking Feature

**Purpose:** Sales opportunity pipeline management

#### Backend Components

| Type | Files |
|------|-------|
| **Commands** | CreateOpportunityTrackingCommand, DeleteOpportunityTrackingCommand, UpdateOpportunityTrackingCommand, OppertunityWorkflowCommand, RejectOpportunityCommand |
| **Queries** | GetAllOpportunityTrackingsQuery, GetOpportunityTrackingByIdQuery, GetOpportunityTrackingsByBidManagerQuery, GetOpportunityTrackingsByRegionalDirectorQuery, GetOpportunityTrackingsByRegionalManagerQuery |
| **Handlers** | 12 handlers including workflow handlers |

#### Database Entities
- `OpportunityTracking` - Main opportunity entity
- `OpportunityStatus` - Status definitions
- `OpportunityHistory` - Status change history

#### Frontend Components
- **Pages:** BusinessDevelopment.tsx, BusinessDevelopmentDashboard.tsx, BusinessDevelopmentDetails.tsx, BOverview.tsx, BForms.tsx, BDocuments.tsx, BTimeline.tsx
- **Components:** OpportunityForm.tsx, OpportunityItem.tsx, OpportunityList.tsx, OpportunityTrackingWorkflow.tsx
- **Services:** opportunityApi.tsx

---

### 2.2 Bid Preparation Feature

**Purpose:** Bid document preparation and version management

#### Backend Components

| Type | Files |
|------|-------|
| **Commands** | ApproveBidPreparationCommand, SubmitBidPreparationCommand, UpdateBidPreparationCommand |
| **Queries** | GetBidPreparationQuery, GetBidVersionHistoryQuery |
| **Handlers** | 5 handlers |

#### Database Entities
- `BidPreparation` - Bid preparation data
- `Pricing` - Pricing information
- `ContractAndCost` - Contract and cost details

#### Frontend Components
- **Components:** BidPreparationForm.tsx, BidVersionHistory.tsx
- **Services:** (integrated in opportunityApi.tsx)

---

### 2.3 Go/No-Go Decision Feature

**Purpose:** Opportunity evaluation and decision workflow

#### Backend Components

| Type | Files |
|------|-------|
| **Commands** | CreateGoNoGoDecisionHeaderCommand, HeaderInfoCommand, MetaDataCommand, ScoringCriteriaCommand, SummaryCommand |
| **Handlers** | CreateGoNoGoDecisionHeaderHandler, CreateGoNoGoDecisionTransactionHandler |

#### Database Entities
- `GoNoGoDecision` - Decision records
- `GoNoGoDecisionHeader` - Decision headers
- `GoNoGoDecisionOpportunity` - Opportunity linkage
- `GoNoGoDecisionTransaction` - Transaction records
- `GoNoGoVersion` - Version tracking
- `ScoringCriteria` - Evaluation criteria
- `ScoringDescriptions` - Criteria descriptions
- `ScoringDescriptionSummarry` - Summary scores
- `ScoreRange` - Score ranges

#### Frontend Components
- **Components:** GoNoGoForm.tsx, GoNoGoFormWrapper.tsx, GoNoGoApprovalStatus.tsx, GoNoGoVersionHistory.tsx, GoNoGoWidget.tsx
- **Services:** goNoGoApi.tsx, goNoGoOpportunityApi.tsx, scoringDescriptionApi.tsx

---

### 2.4 Job Start Form Feature

**Purpose:** Project initiation and resource allocation

#### Backend Components

| Type | Files |
|------|-------|
| **Commands** | AddJobStartFormCommand, CreateJobStartFormCommand, DeleteJobStartFormCommand, UpdateJobStartFormCommand |
| **Queries** | GetAllJobStartFormByProjectIdQuery, GetJobStartFormByIdQuery, GetJobStartFormByProjectIdQuery |
| **Handlers** | 7 handlers |

#### Database Entities
- `JobStartForm` - Main form entity
- `JobStartFormHeader` - Form headers
- `JobStartFormHistory` - Change history
- `JobStartFormResource` - Resource allocation
- `JobStartFormSelection` - Form selections

#### Frontend Components
- **Components:** JobStartForm.tsx, jobstartFormComponent/ folder
- **Services:** jobStartFormApi.ts, jobStartFormHeaderApi.tsx

---

### 2.5 Check Review Feature

**Purpose:** Quality check and review process

#### Backend Components

| Type | Files |
|------|-------|
| **Commands** | CreateCheckReviewCommand, DeleteCheckReviewCommand, UpdateCheckReviewCommand |
| **Queries** | GetCheckReviewByIdQuery, GetCheckReviewsByProjectQuery |
| **Handlers** | 6 handlers including email notification |
| **Notifications** | CheckReviewStatusEmailNotification |

#### Database Entities
- `CheckReview` - Review records

#### Frontend Components
- **Components:** CheckReviewForm.tsx, CheckReviewcomponents/ folder
- **Services:** (integrated in opportunityApi.tsx)

---

## 3. Administrative Module

### 3.1 User Management Feature

**Purpose:** User CRUD and profile management

#### Backend Components

| Type | Files |
|------|-------|
| **Commands** | CreateUserCommand, DeleteUserCommand, UpdateUserCommand, UpdateRolePermissionsCommand |
| **Queries** | GetAllUsersQuery, GetUserByIdQuery, GetUsersByRoleNameQuery |
| **Handlers** | 14 handlers |

#### Database Entities
- `User` - User entity (extends ASP.NET Identity)
- `TenantUser` - Tenant-user relationship
- `TwoFactorCode` - 2FA codes

#### Frontend Components
- **Pages:** Users.tsx, UserProfile.tsx
- **Components:** UsersManagement.tsx, users/ folder
- **Services:** userApi.tsx, twoFactorApi.tsx, manager2FAApi.tsx

---

### 3.2 Roles & Permissions Feature

**Purpose:** Role-based access control (RBAC)

#### Backend Components

| Type | Files |
|------|-------|
| **Commands** | CreateRoleCommands, DeleteRoleCommand, CreatePermissionCommand, DeletePermissionCommand, UpdatePermissionCommand |
| **Queries** | GetAllRolesQuery, GetAllRolesWithPermissionsQuery, GetRoleByNameQuery, GetRolePermissionsQuery, GetRolesByUserIdQuery, GetAllPermissionsQuery, GetPermissionByIdQuery, GetPermissionsByGroupedByCategoryQuery |
| **Handlers** | 15+ handlers |

#### Database Entities
- `Role` - Role definitions
- `Permission` - Permission definitions
- `RolePermission` - Role-permission mapping

#### Frontend Components
- **Pages:** Roles.tsx
- **Components:** RolesManagement.tsx
- **Services:** rolesApi.tsx

---

### 3.3 Tenant Management Feature

**Purpose:** Multi-tenancy support

#### Backend Components

| Type | Files |
|------|-------|
| **Commands** | CreateTenantCommand, DeleteTenantCommand, UpdateTenantCommand |
| **Queries** | GetAllTenantsQuery, GetTenantByIdQuery |
| **Handlers** | 5 handlers |

#### Database Entities
- `Tenant` - Tenant entity
- `TenantDatabase` - Tenant database configuration
- `TenantUser` - Tenant-user mapping

#### Frontend Components
- **Components:** TenantManagement.tsx, TenantUsersManagement.tsx
- **Services:** tenantApi.tsx, tenantService.ts

---

### 3.4 System Settings Feature

**Purpose:** Application configuration

#### Backend Components
- Settings entity and configuration

#### Database Entities
- `Settings` - System settings

#### Frontend Components
- **Pages:** GeneralSettings.tsx
- **Components:** SystemSettings.tsx

---

### 3.5 Subscription Management Feature

**Purpose:** SaaS subscription and feature gating

#### Backend Components

| Type | Files |
|------|-------|
| **Queries** | GetAllSubscriptionFeaturesQuery |
| **Handlers** | GetAllSubscriptionFeaturesQueryHandler |

#### Database Entities
- `SubscriptionPlan` - Subscription plans
- `SubscriptionPlanFeature` - Plan features
- `Feature` - Feature definitions

#### Frontend Components
- **Components:** SubscriptionManagement.tsx, BillingManagement.tsx, FeatureGate.tsx
- **Services:** subscriptionApi.tsx

---

### 3.6 Audit Logging Feature

**Purpose:** System audit trail

#### Database Entities
- `AuditLog` - Audit log entries

#### Backend Components
- AuditObserverInitializer.cs
- Audit interceptors in NJS.Domain

---

## 4. Correspondence Module

### 4.1 Inward Correspondence Feature

**Purpose:** Incoming correspondence tracking

#### Backend Components

| Type | Files |
|------|-------|
| **Commands** | CreateCorrespondenceInwardCommand, DeleteCorrespondenceInwardCommand, UpdateCorrespondenceInwardCommand |
| **Queries** | GetAllCorrespondenceInwardsQuery, GetCorrespondenceInwardByIdQuery, GetCorrespondenceInwardsByProjectQuery |
| **Handlers** | 6 handlers |

#### Database Entities
- `CorrespondenceInward` - Inward correspondence

#### Frontend Components
- **Components:** CorrespondenceForm.tsx (inward mode), Correspondancecomponents/ folder
- **Services:** correspondenceApi.ts

---

### 4.2 Outward Correspondence Feature

**Purpose:** Outgoing correspondence tracking

#### Backend Components

| Type | Files |
|------|-------|
| **Commands** | CreateCorrespondenceOutwardCommand, DeleteCorrespondenceOutwardCommand, UpdateCorrespondenceOutwardCommand |
| **Queries** | GetAllCorrespondenceOutwardsQuery, GetCorrespondenceOutwardByIdQuery, GetCorrespondenceOutwardsByProjectQuery |
| **Handlers** | 6 handlers |

#### Database Entities
- `CorrespondenceOutward` - Outward correspondence

#### Frontend Components
- **Components:** CorrespondenceForm.tsx (outward mode)
- **Services:** correspondenceApi.ts

---

### 4.3 Input Register Feature

**Purpose:** Document input tracking

#### Backend Components

| Type | Files |
|------|-------|
| **Commands** | CreateInputRegisterCommand, DeleteInputRegisterCommand, UpdateInputRegisterCommand |
| **Queries** | GetAllInputRegistersQuery, GetInputRegisterByIdQuery, GetInputRegistersByProjectQuery |
| **Handlers** | 6 handlers |

#### Database Entities
- `InputRegister` - Input register entries

#### Frontend Components
- **Components:** InputRegisterForm.tsx, InputRegisterformcomponents/ folder
- **Services:** (integrated in correspondenceApi.ts)

---

## 5. Sprint Planning Module

### 5.1 Sprint Plans Feature

**Purpose:** Sprint planning and management

#### Backend Components

| Type | Files |
|------|-------|
| **Commands** | CreateSingleSprintPlanCommand, UpdateSingleSprintPlanCommand |
| **Queries** | GetSingleSprintPlanQuery |
| **Handlers** | 3 handlers |

#### Database Entities
- `SprintPlan` - Sprint plan entity

---

### 5.2 Sprint Tasks Feature

**Purpose:** Sprint task management

#### Backend Components

| Type | Files |
|------|-------|
| **Commands** | CreateSprintTaskCommand, UpdateSprintTaskCommand, DeleteSprintTaskCommand, CreateSprintSubtaskCommand, UpdateSprintSubtaskCommand, DeleteSprintSubtaskCommand, AddSprintTaskCommentCommand, UpdateSprintTaskCommentCommand, DeleteSprintTaskCommentCommand |
| **Queries** | GetSingleSprintTaskQuery, GetSprintTasksByProjectIdQuery, GetAllSprintSubtasksByTaskIdQuery, GetSprintSubtaskByIdQuery, GetSprintTaskCommentQuery, GetSprintTaskCommentByIdQuery, GetSprintTaskCommentsByTaskIdQuery |
| **Handlers** | 16 handlers |

#### Database Entities
- `SprintTask` - Sprint tasks
- `SprintSubtask` - Subtasks
- `SprintTaskComment` - Task comments
- `SprintSubtaskComment` - Subtask comments

#### Frontend Components
- **Components:** todolist/ folder (IssueCard.tsx, SubtaskItem.tsx, SubtaskList.tsx, TodolistColumn.tsx, TodolistHeader.tsx)

---

### 5.3 Sprint Subtask Comments Feature

**Purpose:** Subtask comment management

#### Backend Components

| Type | Files |
|------|-------|
| **Commands** | AddSprintSubtaskCommentCommand, UpdateSprintSubtaskCommentCommand, DeleteSprintSubtaskCommentCommand |
| **Queries** | GetSprintSubtaskCommentByIdQuery, GetSprintSubtaskCommentsBySubtaskIdQuery |
| **Handlers** | 5 handlers |

---

## 6. Cross-Cutting Features

### 6.1 Authentication & Authorization

**Purpose:** User authentication and access control

#### Backend Components
- ASP.NET Core Identity integration
- JWT token authentication
- Permission-based authorization

#### Database Entities
- ASP.NET Identity tables (AspNetUsers, AspNetRoles, etc.)
- `TwoFactorCode` - 2FA support

#### Frontend Components
- **Pages:** LoginScreen.tsx, EnhancedLoginScreen.tsx, Signup.tsx, ForgotPassword.tsx, ResetPassword.tsx
- **Components:** OTPVerification.tsx, PasswordChangeDropdown.tsx
- **Services:** authApi.tsx, enhancedAuthApi.tsx, passwordApi.tsx

---

### 6.2 Email Service

**Purpose:** Email notifications and communications

#### Backend Components

| Type | Files |
|------|-------|
| **Commands** | SendEmailCommand |
| **Notifications** | OpportunityStatusEmailNotification, UserRegistrationEmailNotification, CheckReviewStatusEmailNotification |

#### Database Entities
- `FailedEmailLog` - Failed email tracking

---

### 6.3 Account Creation

**Purpose:** New account registration

#### Backend Components

| Type | Files |
|------|-------|
| **Commands** | CreateAccountCommand |
| **Handlers** | CreateAccountCommandHandler |

#### Database Entities
- `CreateAccount` - Account creation records

---

### 6.4 Measurement Units

**Purpose:** Unit of measure management

#### Backend Components

| Type | Files |
|------|-------|
| **Commands** | CreateMeasurementUnitCommand, DeleteMeasurementUnitCommand, UpdateMeasurementUnitCommand |
| **Queries** | GetAllMeasurementUnitsQuery, GetMeasurementUnitByIdQuery |
| **Handlers** | 5 handlers |

#### Database Entities
- `MeasurementUnit` - Measurement units

---

### 6.5 Feature Flags

**Purpose:** Feature toggle management

#### Backend Components

| Type | Files |
|------|-------|
| **Commands** | CreateFeatureCommand |
| **Queries** | GetAllFeaturesQuery |
| **Handlers** | 2 handlers |

#### Database Entities
- `Feature` - Feature definitions

---

### 6.6 Dashboard & Widgets

**Purpose:** Application dashboard and data visualization

#### Frontend Components
- **Pages:** Home.tsx
- **Components:** Dashboard.tsx, dashboard/ folder (BusinessDevelopmentCharts.tsx, CashflowChart.tsx, DashboardHeader.tsx, DashboardLayout.tsx, MetricCard.tsx, MetricsGrid.tsx, MilestoneBillingTracker.tsx, NPVProfitability.tsx, PendingApprovals.tsx, PriorityProjectsPanel.tsx, ProjectCard.tsx, ProjectStatusPieChart.tsx, RegionalPortfolio.tsx, TaskPriorityMatrix.tsx)
- **Widgets:** BusinessDevelopmentWidget.tsx, DecisionWidget.tsx, GoNoGoWidget.tsx, HistoryWidget.tsx, ProjectHeaderWidget.tsx

---

### 6.7 Navigation & Layout

**Purpose:** Application navigation and layout structure

#### Frontend Components
- **Components:** Layout.tsx, Navbar.tsx, SideMenu.tsx, BDSideMenu.tsx, NotificationCenter.tsx
- **Services:** historyLoggingService.tsx

---

### 6.8 Excel Export

**Purpose:** Data export to Excel format

#### Frontend Components
- **Services:** excelExportService.ts

---

### 6.9 Migration Management

**Purpose:** Database migration management

#### Frontend Components
- **Pages:** MigrationManagement.tsx
- **Services:** migrationService.ts

#### Database Entities
- `MigrationResult` - Migration tracking

---

## Entity Relationship Summary

### Core Relationships

```
Project (1) ──────────── (N) MonthlyProgress
Project (1) ──────────── (N) WorkBreakdownStructure
Project (1) ──────────── (N) ProjectClosure
Project (1) ──────────── (N) ChangeControl
Project (1) ──────────── (N) Cashflow
Project (1) ──────────── (N) CorrespondenceInward
Project (1) ──────────── (N) CorrespondenceOutward
Project (1) ──────────── (N) InputRegister
Project (1) ──────────── (N) SprintTask

OpportunityTracking (1) ── (N) OpportunityHistory
OpportunityTracking (1) ── (1) BidPreparation
OpportunityTracking (1) ── (N) GoNoGoDecision
OpportunityTracking (1) ── (N) JobStartForm
OpportunityTracking (1) ── (N) CheckReview

User (1) ─────────────── (N) Role (via RolePermission)
Role (1) ─────────────── (N) Permission (via RolePermission)
Tenant (1) ────────────── (N) TenantUser
Tenant (1) ────────────── (1) TenantDatabase

WorkBreakdownStructure (1) ── (N) WBSTask
WBSTask (1) ──────────────── (N) WBSTask (self-referencing hierarchy)
WBSTask (1) ──────────────── (N) WBSTaskPlannedHour

SprintTask (1) ────────────── (N) SprintSubtask
SprintTask (1) ────────────── (N) SprintTaskComment
SprintSubtask (1) ─────────── (N) SprintSubtaskComment
```

---

## API Endpoint Summary

### Project Management Endpoints
- `GET/POST /api/projects` - Project CRUD
- `GET/PUT/DELETE /api/projects/{id}` - Single project operations
- `GET/POST /api/projects/{id}/budget` - Budget management
- `GET /api/projects/{id}/budget-history` - Budget history

### WBS Endpoints
- `GET/POST /api/wbs` - WBS operations
- `GET/PUT/DELETE /api/wbs/{id}` - Single WBS operations
- `GET/POST /api/wbs/tasks` - Task management
- `GET/POST /api/wbs/options` - WBS options
- `GET/POST /api/wbs/versions` - Version management

### Business Development Endpoints
- `GET/POST /api/opportunities` - Opportunity CRUD
- `GET/PUT/DELETE /api/opportunities/{id}` - Single opportunity
- `POST /api/opportunities/{id}/workflow` - Workflow transitions
- `GET/POST /api/bidpreparation` - Bid preparation
- `GET/POST /api/gonogo` - Go/No-Go decisions
- `GET/POST /api/jobstartform` - Job start forms
- `GET/POST /api/checkreview` - Check reviews

### Administrative Endpoints
- `GET/POST /api/users` - User management
- `GET/POST /api/roles` - Role management
- `GET/POST /api/permissions` - Permission management
- `GET/POST /api/tenants` - Tenant management

### Correspondence Endpoints
- `GET/POST /api/correspondence/inward` - Inward correspondence
- `GET/POST /api/correspondence/outward` - Outward correspondence
- `GET/POST /api/inputregister` - Input register

---

## Frontend Service Summary

| Service | Purpose |
|---------|---------|
| authApi.tsx | Authentication |
| projectApi.tsx | Project operations |
| projectBudgetApi.ts | Budget management |
| wbsApi.tsx | WBS operations |
| opportunityApi.tsx | Opportunity tracking |
| goNoGoApi.tsx | Go/No-Go decisions |
| jobStartFormApi.ts | Job start forms |
| correspondenceApi.ts | Correspondence |
| userApi.tsx | User management |
| rolesApi.tsx | Role management |
| tenantApi.tsx | Tenant management |
| changeControlApi.tsx | Change control |
| projectClosureApi.ts | Project closure |
| monthlyProgressApi.tsx | Monthly progress |

---

## Navigation Index

### By Module
- [Project Management](#1-project-management-module)
- [Business Development](#2-business-development-module)
- [Administrative](#3-administrative-module)
- [Correspondence](#4-correspondence-module)
- [Sprint Planning](#5-sprint-planning-module)
- [Cross-Cutting](#6-cross-cutting-features)

### By Feature Type
- **CRUD Features:** Projects, Users, Roles, Tenants, Opportunities
- **Workflow Features:** PM Workflow, Opportunity Workflow, Change Control, Project Closure
- **Reporting Features:** Monthly Progress, Dashboard, Excel Export
- **Planning Features:** WBS, Sprint Planning, Cashflow

---

*This document is auto-generated as part of the AI-DLC documentation process.*
