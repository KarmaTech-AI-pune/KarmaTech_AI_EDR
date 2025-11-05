# DATABASE SCHEMA

## Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           CORE ENTITIES                                         │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐          ┌──────────────┐          ┌──────────────┐
│    Region    │          │   Project    │          │     User     │
├──────────────┤   1:N    ├──────────────┤   N:M    ├──────────────┤
│ RegionId (PK)│◄─────────│ ProjectId(PK)│◄─────────│ Id (PK)      │
│ RegionName   │          │ ProjectName  │          │ UserName     │
│ CreatedAt    │          │ RegionId (FK)│          │ Email        │
└──────────────┘          │ StartDate    │          │ FirstName    │
                          │ EndDate      │          │ LastName     │
                          │ Status       │          │ Avatar       │
                          │ EstimatedCost│          │ LastLogin    │
                          └──────┬───────┘          └──────┬───────┘
                                 │                         │
                                 │                         │
                        ┌────────┴────────┐       ┌────────┴────────┐
                        │                 │       │                 │
                        │                 │       │                 │

┌─────────────────────────────────────────────────────────────────────────────────┐
│                      BUSINESS DEVELOPMENT                                       │
└─────────────────────────────────────────────────────────────────────────────────┘

┌───────────────────┐      ┌───────────────────┐      ┌──────────────────┐
│ OpportunityStatus │  1:N │OpportunityTracking│  1:N │OpportunityHistory│
├───────────────────┤◄─────├───────────────────┤──────┤──────────────────┤
│ StatusId (PK)     │      │ OpportunityId(PK) │      │HistoryId (PK)    │
│ StatusName        │      │ Title             │      │ OpportunityId(FK)│
│ Description       │      │ Description       │      │ StatusId (FK)    │
└───────────────────┘      │ BidFees           │      │ ActionBy (FK)    │
                           │ GrossRevenue      │      │ ActionDate       │
                           │ StatusId (FK)     │      │ Comments         │
                           └─────────┬─────────┘      └──────────────────┘
                                     │
                                     │ 1:1
                                     ▼
                          ┌───────────────────┐      ┌──────────────────┐
                          │  BidPreparation   │  1:N │BidVersionHistory │
                          ├───────────────────┤──────┤──────────────────┤
                          │ Id (PK)           │      │ Id (PK)          │
                          │ OpportunityId(FK) │      │ BidPrepId (FK)   │
                          │ UserId (FK)       │      │ VersionNumber    │
                          │ DocumentsJSON     │      │ DocumentsJSON    │
                          │ Status            │      │ ModifiedBy       │
                          │ CreatedAt         │      │ ModifiedAt       │
                          └───────────────────┘      └──────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                         GO/NO-GO DECISION                                       │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐     ┌─────────────────────┐     ┌──────────────────┐
│  GoNoGoDecisionHdr   │ 1:N │GoNoGoDecisionTxn    │ N:1 │ ScoringCriteria  │
├──────────────────────┤─────├─────────────────────┤─────├──────────────────┤
│ Id (PK)              │     │ Id (PK)             │     │ Id (PK)          │
│ OpportunityId (FK)   │     │ HeaderId (FK)       │     │ CriteriaName     │
│ TypeOfClient         │     │ CriteriaId (FK)     │     │ Description      │
│ RegionalBDHead       │     │ Score               │     │ MaxScore         │
│ CreatedAt            │     │ Comments            │     │ Category         │
└──────────┬───────────┘     └─────────────────────┘     └──────────────────┘
           │
           │ 1:N
           ▼
┌──────────────────────┐     ┌─────────────────────┐
│   GoNoGoVersion      │     │    ScoreRange       │
├──────────────────────┤     ├─────────────────────┤
│ Id (PK)              │     │ Id (PK)             │
│ HeaderId (FK)        │     │ MinScore            │
│ VersionNumber        │     │ MaxScore            │
│ CreatedBy            │     │ Recommendation      │
│ CreatedAt            │     │ Description         │
└──────────────────────┘     └─────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                   WORK BREAKDOWN STRUCTURE (WBS)                                │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐     ┌─────────────────────┐     ┌──────────────────┐
│WorkBreakdownStructure│ 1:N │     WBSTask         │ N:M │   UserWBSTask    │
├──────────────────────┤─────├─────────────────────┤─────├──────────────────┤
│ Id (PK)              │     │ TaskId (PK)         │     │ Id (PK)          │
│ ProjectId (FK)       │     │ WBSId (FK)          │     │ WBSTaskId (FK)   │
│ CreatedBy            │     │ ParentId (FK) SELF  │     │ UserId (FK)      │
│ CreatedAt            │     │ TaskName            │     │ Hours            │
└──────────────────────┘     │ EstimatedBudget     │     │ CostRate         │
                             │ StartDate           │     │ TotalCost        │
                             │ EndDate             │     │ ResourceRole     │
                             └─────────┬───────────┘     └──────────────────┘
                                       │
                                       │ 1:N
                                       ▼
                             ┌─────────────────────┐
                             │WBSTaskMonthlyHourHdr│
                             ├─────────────────────┤
                             │ Id (PK)             │
                             │ WBSTaskId (FK)      │
                             │ Month               │
                             │ Year                │
                             └─────────┬───────────┘
                                       │ 1:N
                                       ▼
                             ┌─────────────────────┐
                             │ WBSTaskMonthlyHour  │
                             ├─────────────────────┤
                             │ Id (PK)             │
                             │ HeaderId (FK)       │
                             │ Hours               │
                             │ Date                │
                             └─────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                        JOB START FORM                                           │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐     ┌─────────────────────┐
│   JobStartFormHdr    │ 1:1 │   JobStartForm      │
├──────────────────────┤─────├─────────────────────┤
│ Id (PK)              │     │ FormId (PK)         │
│ FormId (FK)          │     │ ProjectId (FK)      │
│ ProjectId (FK)       │     │ WBSId (FK)          │
│ StatusId (FK)        │     │ GrandTotal          │
│ SubmittedBy          │     │ Profit              │
│ ApprovedBy           │     │ ProfitPercentage    │
└──────────┬───────────┘     └─────────┬───────────┘
           │                           │
           │ 1:N                       │ 1:N
           ▼                           ├──────────────┬──────────────┐
┌──────────────────────┐               │              │              │
│JobStartFormHistory   │               ▼              ▼              ▼
├──────────────────────┤     ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Id (PK)              │     │JSF Selection │ │JSF Resource  │ │              │
│ HeaderId (FK)        │     ├──────────────┤ ├──────────────┤ │              │
│ StatusId (FK)        │     │SelectionId(PK│ │ResourceId(PK)│ │              │
│ ActionBy (FK)        │     │FormId (FK)   │ │FormId (FK)   │ │              │
│ Action               │     │Level1        │ │ResourceName  │ │              │
│ Comments             │     │Level2        │ │Rate          │ │              │
└──────────────────────┘     │Level3        │ │Units         │ │              │
                             └──────────────┘ │BudgetedCost  │ │              │
                                              └──────────────┘ │              │

┌─────────────────────────────────────────────────────────────────────────────────┐
│                       MONTHLY PROGRESS                                          │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│  MonthlyProgress     │
├──────────────────────┤
│ ProgressId (PK)      │
│ ProjectId (FK)       │
│ Month                │
│ Year                 │
│ ManpowerTotal        │
└──────────┬───────────┘
           │
           │ 1:1 relationships
           ├────────────┬────────────┬────────────┬────────────┐
           ▼            ▼            ▼            ▼            ▼
┌──────────────┐ ┌──────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│FinancialDtls │ │ContractAndCst│ │  CTCEAC  │ │ Schedule │ │BudgetTbl │
├──────────────┤ ├──────────────┤ ├──────────┤ ├──────────┤ ├──────────┤
│ Id (PK)      │ │ Id (PK)      │ │ Id (PK)  │ │ Id (PK)  │ │ Id (PK)  │
│ ProgressId   │ │ ProgressId   │ │Progress  │ │Progress  │ │Progress  │
│ BudgetOdcs   │ │ PriorCumOdc  │ │CtcODC    │ │PlannedSt │ │          │
│ BudgetStaff  │ │ ActualOdc    │ │CtcStaff  │ │ActualSt  │ │          │
│ FeeTotal     │ │ TotalCumOdc  │ │EacOdc    │ │PlannedEn │ │          │
└──────────────┘ └──────────────┘ └──────────┘ └──────────┘ └─┬────────┘
                                                                │ 1:1
           │                                                    ├──────┬──────┐
           │ 1:N relationships                                  ▼      ▼      ▼
           ├────────┬─────────┬──────────┬──────────┬────────┬────────┬──────┬───
           ▼        ▼         ▼          ▼          ▼        ▼        ▼      ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│Manpower  │ │Progress  │ │Change    │ │Programme │ │Early     │ │LastMonth │
│Planning  │ │Deliverble│ │Order     │ │Schedule  │ │Warning   │ │Action    │
├──────────┤ ├──────────┤ ├──────────┤ ├──────────┤ ├──────────┤ ├──────────┤
│ Id (PK)  │ │ Id (PK)  │ │ Id (PK)  │ │ Id (PK)  │ │ Id (PK)  │ │ Id (PK)  │
│ProgressI│ │ProgressI │ │ProgressI │ │ProgressI │ │ProgressI │ │ProgressI │
│ Planned  │ │ Delivera │ │ ChangeNo │ │ Milestone│ │ IssueDesc│ │ Action   │
│ Consumed │ │ Payment  │ │ Cost     │ │ PlannedDt│ │ Impact   │ │ Status   │
└──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                   PROJECT CLOSURE & CHANGE CONTROL                              │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐     ┌─────────────────────┐
│  ProjectClosure      │     │  ChangeControl      │
├──────────────────────┤     ├─────────────────────┤
│ Id (PK)              │     │ Id (PK)             │
│ ProjectId (FK)       │     │ ProjectId (FK)      │
│ WorkflowStatusId(FK) │     │ WorkflowStatusId(FK)│
│ ClientFeedback       │     │ Originator          │
│ LessonsLearned       │     │ Description         │
│ Positives            │     │ CostImpact          │
└──────────┬───────────┘     │ TimeImpact          │
           │                 │ ResourcesImpact     │
           │ 1:N             └─────────┬───────────┘
           ▼                           │ 1:N
┌──────────────────────┐               ▼
│ProjectClosureWFHist  │     ┌─────────────────────┐
├──────────────────────┤     │ChangeControlWFHist  │
│ Id (PK)              │     ├─────────────────────┤
│ ClosureId (FK)       │     │ Id (PK)             │
│ StatusId (FK)        │     │ ChangeControlId(FK) │
│ ActionBy (FK)        │     │ StatusId (FK)       │
│ AssignedToId (FK)    │     │ ActionBy (FK)       │
│ Action               │     │ AssignedToId (FK)   │
│ Comments             │     │ Action              │
│ ActionDate           │     │ Comments            │
└──────────────────────┘     └─────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                      CORRESPONDENCE & DOCUMENTS                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐     ┌─────────────────────┐     ┌──────────────────┐
│   InputRegister      │     │CorrespondenceInward │     │CorrespOutward    │
├──────────────────────┤     ├─────────────────────┤     ├──────────────────┤
│ Id (PK)              │     │ Id (PK)             │     │ Id (PK)          │
│ ProjectId (FK)       │     │ ProjectId (FK)      │     │ ProjectId (FK)   │
│ DataReceived         │     │ IncomingLetterNo    │     │ LetterNo         │
│ ReceivedFrom         │     │ NjsInwardNo         │     │ To               │
│ ReceivedDate         │     │ From                │     │ Date             │
│ FilesFormat          │     │ Date                │     │ Subject          │
│ Custodian            │     │ Subject             │     │ Acknowledgement  │
└──────────────────────┘     └─────────────────────┘     └──────────────────┘

┌──────────────────────┐
│    CheckReview       │
├──────────────────────┤
│ Id (PK)              │
│ ProjectId (FK)       │
│ ActivityNo           │
│ ActivityName         │
│ Objective            │
│ CheckedBy            │
│ ApprovedBy           │
│ Completion           │
└──────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                     ROLES, PERMISSIONS & AUDIT                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐          ┌──────────────┐          ┌──────────────┐
│     Role     │   1:N    │RolePermission│   N:1    │  Permission  │
├──────────────┤◄─────────├──────────────┤─────────►├──────────────┤
│ Id (PK)      │          │ Id (PK)      │          │ Id (PK)      │
│ Name         │          │ RoleId (FK)  │          │ Name         │
│ Description  │          │ PermissionId │          │ Description  │
└──────────────┘          └──────────────┘          └──────────────┘

┌──────────────────────┐
│     AuditLog         │
├──────────────────────┤
│ Id (PK)              │
│ EntityName           │
│ Action               │
│ EntityId             │
│ OldValues (JSON)     │
│ NewValues (JSON)     │
│ ChangedBy            │
│ ChangedAt            │
│ IpAddress            │
│ UserAgent            │
└──────────────────────┘

┌──────────────────────┐
│  PMWorkflowStatus    │
├──────────────────────┤
│ Id (PK)              │
│ StatusName           │
│ StatusType           │
│ Description          │
│ IsActive             │
└──────────────────────┘
```

## Table Definitions

### Core Tables

#### AspNetUsers (User)
ASP.NET Core Identity table extended with custom properties

| Column Name | Data Type | Null | Primary Key | Foreign Key | Index | Description |
|------------|-----------|------|-------------|-------------|-------|-------------|
| Id | nvarchar(450) | NOT NULL | ✓ | | ✓ | User unique identifier (GUID) |
| UserName | nvarchar(256) | NULL | | | ✓ | Username for login |
| NormalizedUserName | nvarchar(256) | NULL | | | ✓ | Normalized username |
| Email | nvarchar(256) | NULL | | | ✓ | User email address |
| NormalizedEmail | nvarchar(256) | NULL | | | ✓ | Normalized email |
| EmailConfirmed | bit | NOT NULL | | | | Email verification status |
| PasswordHash | nvarchar(MAX) | NULL | | | | Hashed password |
| SecurityStamp | nvarchar(MAX) | NULL | | | | Security token |
| ConcurrencyStamp | nvarchar(MAX) | NULL | | | | Concurrency control |
| PhoneNumber | nvarchar(MAX) | NULL | | | | Contact number |
| PhoneNumberConfirmed | bit | NOT NULL | | | | Phone verification |
| TwoFactorEnabled | bit | NOT NULL | | | | 2FA enabled flag |
| LockoutEnd | datetimeoffset(7) | NULL | | | | Account lockout end |
| LockoutEnabled | bit | NOT NULL | | | | Lockout enabled flag |
| AccessFailedCount | int | NOT NULL | | | | Failed login attempts |
| FirstName | nvarchar(100) | NULL | | | | User first name |
| LastName | nvarchar(100) | NULL | | | | User last name |
| Avatar | nvarchar(500) | NULL | | | | Avatar image URL |
| LastLogin | datetime | NULL | | | | Last login timestamp |
| IsActive | bit | NOT NULL | | | | Account active status |
| CreatedAt | datetime | NOT NULL | | | | Record creation date |
| UpdatedAt | datetime | NULL | | | | Last update date |

#### Project
Main project entity

| Column Name | Data Type | Null | Primary Key | Foreign Key | Index | Description |
|------------|-----------|------|-------------|-------------|-------|-------------|
| ProjectId | int | NOT NULL | ✓ | | ✓ | Auto-increment PK |
| ProjectName | nvarchar(255) | NOT NULL | | | ✓ | Project name |
| ProjectNumber | nvarchar(50) | NULL | | | ✓ | Unique project number |
| Description | nvarchar(MAX) | NULL | | | | Project description |
| StartDate | datetime | NULL | | | | Project start date |
| EndDate | datetime | NULL | | | | Project end date |
| Status | nvarchar(50) | NULL | | | ✓ | Project status |
| EstimatedProjectCost | decimal(18,2) | NOT NULL | | | | Estimated cost |
| EstimatedProjectFee | decimal(18,2) | NOT NULL | | | | Estimated fee |
| ProjectManager | nvarchar(100) | NULL | | | | PM name |
| RegionId | int | NULL | | Region.RegionId | ✓ | Region FK |
| CreatedAt | datetime | NOT NULL | | | | Creation timestamp |
| UpdatedAt | datetime | NULL | | | | Update timestamp |
| CreatedBy | nvarchar(100) | NULL | | | | Creator user ID |
| UpdatedBy | nvarchar(100) | NULL | | | | Last updater user ID |

#### Region
Geographic regions

| Column Name | Data Type | Null | Primary Key | Foreign Key | Index | Description |
|------------|-----------|------|-------------|-------------|-------|-------------|
| RegionId | int | NOT NULL | ✓ | | ✓ | Auto-increment PK |
| RegionName | nvarchar(100) | NOT NULL | | | ✓ | Region name |
| Description | nvarchar(500) | NULL | | | | Region description |
| IsActive | bit | NOT NULL | | | | Active flag |
| CreatedAt | datetime | NOT NULL | | | | Creation timestamp |

### Business Development Tables

#### OpportunityTracking
Business opportunity tracking

| Column Name | Data Type | Null | Primary Key | Foreign Key | Index | Description |
|------------|-----------|------|-------------|-------------|-------|-------------|
| OpportunityId | int | NOT NULL | ✓ | | ✓ | Auto-increment PK |
| Title | nvarchar(255) | NOT NULL | | | ✓ | Opportunity title |
| Description | nvarchar(MAX) | NULL | | | | Detailed description |
| Client | nvarchar(200) | NULL | | | | Client name |
| BidFees | decimal(18,2) | NULL | | | | Bid preparation fees |
| Emd | decimal(18,2) | NULL | | | | Earnest Money Deposit |
| PercentageChanceOfProjectHappening | decimal(5,2) | NULL | | | | Success probability % |
| PercentageChanceOfNJSSuccess | decimal(5,2) | NULL | | | | Win probability % |
| GrossRevenue | decimal(18,2) | NULL | | | | Estimated revenue |
| NetNJSRevenue | decimal(18,2) | NULL | | | | Net revenue estimate |
| BidSubmissionDate | datetime | NULL | | | ✓ | Submission deadline |
| StatusId | int | NULL | | OpportunityStatus.StatusId | ✓ | Current status FK |
| ApprovalManagerId | nvarchar(450) | NULL | | AspNetUsers.Id | | Approval manager FK |
| ReviewManagerId | nvarchar(450) | NULL | | AspNetUsers.Id | | Review manager FK |
| CreatedBy | nvarchar(450) | NULL | | AspNetUsers.Id | | Creator user FK |
| UpdatedBy | nvarchar(450) | NULL | | AspNetUsers.Id | | Updater user FK |
| CreatedAt | datetime | NOT NULL | | | | Creation timestamp |
| UpdatedAt | datetime | NULL | | | | Update timestamp |

#### OpportunityStatus
Opportunity workflow statuses

| Column Name | Data Type | Null | Primary Key | Foreign Key | Index | Description |
|------------|-----------|------|-------------|-------------|-------|-------------|
| StatusId | int | NOT NULL | ✓ | | ✓ | Auto-increment PK |
| StatusName | nvarchar(50) | NOT NULL | | | ✓ | Status name |
| Description | nvarchar(255) | NULL | | | | Status description |
| DisplayOrder | int | NOT NULL | | | | Sort order |
| IsActive | bit | NOT NULL | | | | Active flag |

**Sample Data**:
```sql
INSERT INTO OpportunityStatus (StatusName, Description, DisplayOrder, IsActive)
VALUES
  ('Draft', 'Initial draft state', 1, 1),
  ('Submitted for Review', 'Awaiting review', 2, 1),
  ('Under Review', 'Being reviewed', 3, 1),
  ('Approved', 'Approved opportunity', 4, 1),
  ('Rejected', 'Rejected opportunity', 5, 1),
  ('Won', 'Won the opportunity', 6, 1),
  ('Lost', 'Lost the opportunity', 7, 1);
```

#### OpportunityHistory
Audit trail for opportunities

| Column Name | Data Type | Null | Primary Key | Foreign Key | Index | Description |
|------------|-----------|------|-------------|-------------|-------|-------------|
| HistoryId | int | NOT NULL | ✓ | | ✓ | Auto-increment PK |
| OpportunityId | int | NOT NULL | | OpportunityTracking.OpportunityId | ✓ | Opportunity FK |
| StatusId | int | NOT NULL | | OpportunityStatus.StatusId | ✓ | Status FK |
| ActionBy | nvarchar(450) | NOT NULL | | AspNetUsers.Id | ✓ | User who performed action |
| ActionDate | datetime | NOT NULL | | | ✓ | Action timestamp |
| Comments | nvarchar(MAX) | NULL | | | | Action comments |

#### BidPreparation
Bid document management

| Column Name | Data Type | Null | Primary Key | Foreign Key | Index | Description |
|------------|-----------|------|-------------|-------------|-------|-------------|
| Id | int | NOT NULL | ✓ | | ✓ | Auto-increment PK |
| OpportunityId | int | NOT NULL | | OpportunityTracking.OpportunityId | ✓ | Opportunity FK |
| UserId | nvarchar(450) | NOT NULL | | AspNetUsers.Id | ✓ | Responsible user FK |
| DocumentCategoriesJson | nvarchar(MAX) | NULL | | | | JSON document structure |
| Status | nvarchar(50) | NULL | | | | Bid status |
| Comments | nvarchar(MAX) | NULL | | | | Comments |
| CreatedBy | nvarchar(450) | NULL | | AspNetUsers.Id | | Creator FK |
| UpdatedBy | nvarchar(450) | NULL | | AspNetUsers.Id | | Updater FK |
| CreatedAt | datetime | NOT NULL | | | | Creation timestamp |
| UpdatedAt | datetime | NULL | | | | Update timestamp |

#### BidVersionHistory
Bid version control

| Column Name | Data Type | Null | Primary Key | Foreign Key | Index | Description |
|------------|-----------|------|-------------|-------------|-------|-------------|
| Id | int | NOT NULL | ✓ | | ✓ | Auto-increment PK |
| BidPreparationId | int | NOT NULL | | BidPreparation.Id | ✓ | Bid FK |
| VersionNumber | int | NOT NULL | | | | Version number |
| DocumentCategoriesJson | nvarchar(MAX) | NULL | | | | Snapshot of documents |
| Comments | nvarchar(MAX) | NULL | | | | Version comments |
| ModifiedBy | nvarchar(450) | NOT NULL | | AspNetUsers.Id | | Modifier FK |
| ModifiedAt | datetime | NOT NULL | | | | Modification timestamp |

### Go/No-Go Decision Tables

#### GoNoGoDecisionHeader
Go/No-Go decision header

| Column Name | Data Type | Null | Primary Key | Foreign Key | Index | Description |
|------------|-----------|------|-------------|-------------|-------|-------------|
| Id | int | NOT NULL | ✓ | | ✓ | Auto-increment PK |
| OpportunityId | int | NOT NULL | | OpportunityTracking.OpportunityId | ✓ | Opportunity FK |
| TypeOfClient | nvarchar(100) | NULL | | | | Client type |
| RegionalBDHead | nvarchar(100) | NULL | | | | Regional head |
| CreatedBy | nvarchar(450) | NULL | | AspNetUsers.Id | | Creator FK |
| CreatedAt | datetime | NOT NULL | | | | Creation timestamp |
| UpdatedAt | datetime | NULL | | | | Update timestamp |

#### GoNoGoDecisionTransaction
Decision scoring transactions

| Column Name | Data Type | Null | Primary Key | Foreign Key | Index | Description |
|------------|-----------|------|-------------|-------------|-------|-------------|
| Id | int | NOT NULL | ✓ | | ✓ | Auto-increment PK |
| GoNoGoDecisionHeaderId | int | NOT NULL | | GoNoGoDecisionHeader.Id | ✓ | Header FK |
| ScoringCriteriaId | int | NOT NULL | | ScoringCriteria.Id | ✓ | Criteria FK |
| Score | int | NOT NULL | | | | Assigned score |
| Comments | nvarchar(MAX) | NULL | | | | Scoring comments |

#### ScoringCriteria
Scoring criteria definitions

| Column Name | Data Type | Null | Primary Key | Foreign Key | Index | Description |
|------------|-----------|------|-------------|-------------|-------|-------------|
| Id | int | NOT NULL | ✓ | | ✓ | Auto-increment PK |
| CriteriaName | nvarchar(255) | NOT NULL | | | | Criteria name |
| Description | nvarchar(MAX) | NULL | | | | Description |
| MaxScore | int | NOT NULL | | | | Maximum score |
| Category | nvarchar(100) | NULL | | | | Criteria category |
| DisplayOrder | int | NOT NULL | | | | Sort order |
| IsActive | bit | NOT NULL | | | | Active flag |

**Sample Data**:
```sql
INSERT INTO ScoringCriteria (CriteriaName, Description, MaxScore, Category, DisplayOrder, IsActive)
VALUES
  ('Client Relationship', 'Existing relationship with client', 10, 'Business', 1, 1),
  ('Technical Capability', 'Technical expertise for project', 10, 'Technical', 2, 1),
  ('Financial Viability', 'Project financial attractiveness', 10, 'Financial', 3, 1),
  ('Resource Availability', 'Availability of required resources', 10, 'Resources', 4, 1),
  ('Strategic Alignment', 'Alignment with company strategy', 10, 'Strategic', 5, 1),
  ('Risk Assessment', 'Overall project risk level', 10, 'Risk', 6, 1);
```

#### ScoreRange
Scoring range recommendations

| Column Name | Data Type | Null | Primary Key | Foreign Key | Index | Description |
|------------|-----------|------|-------------|-------------|-------|-------------|
| Id | int | NOT NULL | ✓ | | ✓ | Auto-increment PK |
| MinScore | int | NOT NULL | | | | Minimum score |
| MaxScore | int | NOT NULL | | | | Maximum score |
| Recommendation | nvarchar(50) | NOT NULL | | | | GO / NO-GO |
| Description | nvarchar(255) | NULL | | | | Range description |

**Sample Data**:
```sql
INSERT INTO ScoreRange (MinScore, MaxScore, Recommendation, Description)
VALUES
  (0, 30, 'NO-GO', 'Do not pursue this opportunity'),
  (31, 50, 'CAUTION', 'Proceed with caution, additional analysis required'),
  (51, 100, 'GO', 'Strong opportunity, proceed with bid');
```

#### GoNoGoVersion
Decision version history

| Column Name | Data Type | Null | Primary Key | Foreign Key | Index | Description |
|------------|-----------|------|-------------|-------------|-------|-------------|
| Id | int | NOT NULL | ✓ | | ✓ | Auto-increment PK |
| GoNoGoDecisionHeaderId | int | NOT NULL | | GoNoGoDecisionHeader.Id | ✓ | Header FK |
| VersionNumber | int | NOT NULL | | | | Version number |
| TotalScore | int | NOT NULL | | | | Total score |
| Recommendation | nvarchar(50) | NULL | | | | GO/NO-GO |
| CreatedBy | nvarchar(450) | NULL | | AspNetUsers.Id | | Creator FK |
| CreatedAt | datetime | NOT NULL | | | | Creation timestamp |

### Work Breakdown Structure Tables

#### WorkBreakdownStructure
WBS root entity

| Column Name | Data Type | Null | Primary Key | Foreign Key | Index | Description |
|------------|-----------|------|-------------|-------------|-------|-------------|
| Id | int | NOT NULL | ✓ | | ✓ | Auto-increment PK |
| ProjectId | int | NOT NULL | | Project.ProjectId | ✓ | Project FK |
| CreatedBy | nvarchar(450) | NULL | | AspNetUsers.Id | | Creator FK |
| CreatedAt | datetime | NOT NULL | | | | Creation timestamp |
| UpdatedAt | datetime | NULL | | | | Update timestamp |

#### WBSTask
WBS task hierarchy

| Column Name | Data Type | Null | Primary Key | Foreign Key | Index | Description |
|------------|-----------|------|-------------|-------------|-------|-------------|
| TaskId | int | NOT NULL | ✓ | | ✓ | Auto-increment PK |
| WorkBreakdownStructureId | int | NOT NULL | | WorkBreakdownStructure.Id | ✓ | WBS FK |
| ParentId | int | NULL | | WBSTask.TaskId | ✓ | Parent task FK (self-ref) |
| TaskName | nvarchar(255) | NOT NULL | | | | Task name |
| TaskLevel | int | NOT NULL | | | | Hierarchy level |
| EstimatedBudget | decimal(18,2) | NULL | | | | Estimated budget |
| EstimatedHours | decimal(18,2) | NULL | | | | Estimated hours |
| StartDate | datetime | NULL | | | | Task start date |
| EndDate | datetime | NULL | | | | Task end date |
| Status | nvarchar(50) | NULL | | | | Task status |
| CreatedAt | datetime | NOT NULL | | | | Creation timestamp |

#### UserWBSTask
User-task assignment

| Column Name | Data Type | Null | Primary Key | Foreign Key | Index | Description |
|------------|-----------|------|-------------|-------------|-------|-------------|
| Id | int | NOT NULL | ✓ | | ✓ | Auto-increment PK |
| WBSTaskId | int | NOT NULL | | WBSTask.TaskId | ✓ | Task FK |
| UserId | nvarchar(450) | NULL | | AspNetUsers.Id | ✓ | User FK |
| ResourceRoleId | int | NULL | | | | Resource role |
| Hours | decimal(18,2) | NULL | | | | Assigned hours |
| CostRate | decimal(18,2) | NULL | | | | Cost per hour |
| TotalCost | decimal(18,2) | NULL | | | | Calculated cost |

#### WBSOption
Dropdown options for WBS

| Column Name | Data Type | Null | Primary Key | Foreign Key | Index | Description |
|------------|-----------|------|-------------|-------------|-------|-------------|
| Id | int | NOT NULL | ✓ | | ✓ | Auto-increment PK |
| Value | nvarchar(100) | NOT NULL | | | ✓ | Option value |
| Label | nvarchar(255) | NOT NULL | | | | Display label |
| Level | int | NOT NULL | | | ✓ | Hierarchy level |
| ParentValue | nvarchar(100) | NULL | | | ✓ | Parent option |
| FormType | nvarchar(50) | NOT NULL | | | ✓ | Form type |

**Sample Data**:
```sql
INSERT INTO WBSOption (Value, Label, Level, ParentValue, FormType)
VALUES
  ('design', 'Design', 1, NULL, 'JSF'),
  ('construction', 'Construction', 1, NULL, 'JSF'),
  ('preliminary', 'Preliminary Design', 2, 'design', 'JSF'),
  ('detailed', 'Detailed Design', 2, 'design', 'JSF');
```

### Job Start Form Tables

#### JobStartForm
Job start form main entity

| Column Name | Data Type | Null | Primary Key | Foreign Key | Index | Description |
|------------|-----------|------|-------------|-------------|-------|-------------|
| FormId | int | NOT NULL | ✓ | | ✓ | Auto-increment PK |
| ProjectId | int | NOT NULL | | Project.ProjectId | ✓ | Project FK |
| WorkBreakdownStructureId | int | NULL | | WorkBreakdownStructure.Id | ✓ | WBS FK |
| GrandTotal | decimal(18,2) | NULL | | | | Total project cost |
| Profit | decimal(18,2) | NULL | | | | Profit amount |
| ProfitPercentage | decimal(18,2) | NULL | | | | Profit percentage |
| ProjectFees | decimal(18,2) | NULL | | | | Project fees |
| ServiceTaxAmount | decimal(18,2) | NULL | | | | Service tax |
| ServiceTaxPercentage | decimal(5,2) | NULL | | | | Tax percentage |
| TotalExpenses | decimal(18,2) | NULL | | | | Total expenses |
| TotalTimeCost | decimal(18,2) | NULL | | | | Time cost |
| TotalProjectFees | decimal(18,2) | NULL | | | | Total fees |
| CreatedAt | datetime | NOT NULL | | | | Creation timestamp |

#### JobStartFormSelection
Form selections (WBS levels)

| Column Name | Data Type | Null | Primary Key | Foreign Key | Index | Description |
|------------|-----------|------|-------------|-------------|-------|-------------|
| SelectionId | int | NOT NULL | ✓ | | ✓ | Auto-increment PK |
| FormId | int | NOT NULL | | JobStartForm.FormId | ✓ | Form FK |
| Level1 | nvarchar(100) | NULL | | | | Level 1 selection |
| Level2 | nvarchar(100) | NULL | | | | Level 2 selection |
| Level3 | nvarchar(100) | NULL | | | | Level 3 selection |
| Level4 | nvarchar(100) | NULL | | | | Level 4 selection |

#### JobStartFormResource
Resource assignments

| Column Name | Data Type | Null | Primary Key | Foreign Key | Index | Description |
|------------|-----------|------|-------------|-------------|-------|-------------|
| ResourceId | int | NOT NULL | ✓ | | ✓ | Auto-increment PK |
| FormId | int | NOT NULL | | JobStartForm.FormId | ✓ | Form FK |
| SelectionId | int | NULL | | JobStartFormSelection.SelectionId | | Selection FK |
| ResourceName | nvarchar(255) | NULL | | | | Resource name |
| Rate | decimal(18,2) | NULL | | | | Hourly rate |
| Units | decimal(18,2) | NULL | | | | Number of units |
| BudgetedCost | decimal(18,2) | NULL | | | | Budgeted cost |

#### JobStartFormHeader
Form workflow header

| Column Name | Data Type | Null | Primary Key | Foreign Key | Index | Description |
|------------|-----------|------|-------------|-------------|-------|-------------|
| Id | int | NOT NULL | ✓ | | ✓ | Auto-increment PK |
| FormId | int | NOT NULL | | JobStartForm.FormId | ✓ | Form FK |
| ProjectId | int | NOT NULL | | Project.ProjectId | ✓ | Project FK |
| StatusId | int | NOT NULL | | PMWorkflowStatus.Id | ✓ | Status FK |
| SubmittedBy | nvarchar(450) | NULL | | AspNetUsers.Id | | Submitter FK |
| ApprovedBy | nvarchar(450) | NULL | | AspNetUsers.Id | | Approver FK |
| SubmittedAt | datetime | NULL | | | | Submission time |
| ApprovedAt | datetime | NULL | | | | Approval time |

#### JobStartFormHistory
Form workflow history

| Column Name | Data Type | Null | Primary Key | Foreign Key | Index | Description |
|------------|-----------|------|-------------|-------------|-------|-------------|
| Id | int | NOT NULL | ✓ | | ✓ | Auto-increment PK |
| JobStartFormHeaderId | int | NOT NULL | | JobStartFormHeader.Id | ✓ | Header FK |
| StatusId | int | NOT NULL | | PMWorkflowStatus.Id | ✓ | Status FK |
| ActionBy | nvarchar(450) | NOT NULL | | AspNetUsers.Id | ✓ | User FK |
| AssignedToId | nvarchar(450) | NULL | | AspNetUsers.Id | | Assigned user FK |
| Action | nvarchar(50) | NOT NULL | | | | Action type |
| Comments | nvarchar(MAX) | NULL | | | | Action comments |
| ActionDate | datetime | NOT NULL | | | | Action timestamp |

### Monthly Progress Tables

#### MonthlyProgress
Monthly progress report

| Column Name | Data Type | Null | Primary Key | Foreign Key | Index | Description |
|------------|-----------|------|-------------|-------------|-------|-------------|
| ProgressId | int | NOT NULL | ✓ | | ✓ | Auto-increment PK |
| ProjectId | int | NOT NULL | | Project.ProjectId | ✓ | Project FK |
| Month | int | NOT NULL | | | ✓ | Report month (1-12) |
| Year | int | NOT NULL | | | ✓ | Report year |
| ManpowerTotal | decimal(18,2) | NULL | | | | Total manpower |
| CreatedBy | nvarchar(450) | NULL | | AspNetUsers.Id | | Creator FK |
| CreatedAt | datetime | NOT NULL | | | | Creation timestamp |
| UpdatedAt | datetime | NULL | | | | Update timestamp |

**Composite Index**: `IX_MonthlyProgress_Project_Month_Year` on `(ProjectId, Month, Year)`

#### FinancialDetails
Financial details (1:1 with MonthlyProgress)

| Column Name | Data Type | Null | Primary Key | Foreign Key | Index | Description |
|------------|-----------|------|-------------|-------------|-------|-------------|
| Id | int | NOT NULL | ✓ | | ✓ | Auto-increment PK |
| MonthlyProgressId | int | NOT NULL | | MonthlyProgress.ProgressId | ✓ UNIQUE | Progress FK |
| BudgetOdcs | decimal(18,2) | NULL | | | | Budget ODCs |
| BudgetStaff | decimal(18,2) | NULL | | | | Budget staff |
| BudgetSubTotal | decimal(18,2) | NULL | | | | Budget subtotal |
| FeeTotal | decimal(18,2) | NULL | | | | Fee total |
| Net | decimal(18,2) | NULL | | | | Net amount |
| ServiceTax | decimal(18,2) | NULL | | | | Service tax |

#### ContractAndCost
Contract and cost tracking (1:1 with MonthlyProgress)

| Column Name | Data Type | Null | Primary Key | Foreign Key | Index | Description |
|------------|-----------|------|-------------|-------------|-------|-------------|
| Id | int | NOT NULL | ✓ | | ✓ | Auto-increment PK |
| MonthlyProgressId | int | NOT NULL | | MonthlyProgress.ProgressId | ✓ UNIQUE | Progress FK |
| PriorCumulativeOdc | decimal(18,2) | NULL | | | | Prior cumulative ODC |
| PriorCumulativeStaff | decimal(18,2) | NULL | | | | Prior cumulative staff |
| PriorCumulativeTotal | decimal(18,2) | NULL | | | | Prior cumulative total |
| ActualOdc | decimal(18,2) | NULL | | | | Actual ODC this month |
| ActualStaff | decimal(18,2) | NULL | | | | Actual staff this month |
| ActualSubtotal | decimal(18,2) | NULL | | | | Actual subtotal |
| TotalCumulativeOdc | decimal(18,2) | NULL | | | | Total cumulative ODC |
| TotalCumulativeStaff | decimal(18,2) | NULL | | | | Total cumulative staff |
| TotalCumulativeCost | decimal(18,2) | NULL | | | | Total cumulative cost |

#### CTCEAC
Cost To Complete and Estimate At Completion (1:1 with MonthlyProgress)

| Column Name | Data Type | Null | Primary Key | Foreign Key | Index | Description |
|------------|-----------|------|-------------|-------------|-------|-------------|
| Id | int | NOT NULL | ✓ | | ✓ | Auto-increment PK |
| MonthlyProgressId | int | NOT NULL | | MonthlyProgress.ProgressId | ✓ UNIQUE | Progress FK |
| CtcODC | decimal(18,2) | NULL | | | | Cost to complete ODC |
| CtcStaff | decimal(18,2) | NULL | | | | Cost to complete staff |
| CtcSubtotal | decimal(18,2) | NULL | | | | CTC subtotal |
| ActualctcODC | decimal(18,2) | NULL | | | | Actual CTC ODC |
| ActualCtcStaff | decimal(18,2) | NULL | | | | Actual CTC staff |
| ActualCtcSubtotal | decimal(18,2) | NULL | | | | Actual CTC subtotal |
| EacOdc | decimal(18,2) | NULL | | | | EAC ODC |
| EacStaff | decimal(18,2) | NULL | | | | EAC staff |
| TotalEAC | decimal(18,2) | NULL | | | | Total EAC |
| GrossProfitPercentage | decimal(18,2) | NULL | | | | Gross profit % |

#### Schedule
Schedule tracking (1:1 with MonthlyProgress)

| Column Name | Data Type | Null | Primary Key | Foreign Key | Index | Description |
|------------|-----------|------|-------------|-------------|-------|-------------|
| Id | int | NOT NULL | ✓ | | ✓ | Auto-increment PK |
| MonthlyProgressId | int | NOT NULL | | MonthlyProgress.ProgressId | ✓ UNIQUE | Progress FK |
| PlannedStartDate | datetime | NULL | | | | Planned start |
| ActualStartDate | datetime | NULL | | | | Actual start |
| PlannedEndDate | datetime | NULL | | | | Planned end |
| ForecastEndDate | datetime | NULL | | | | Forecast end |
| PercentComplete | decimal(5,2) | NULL | | | | Completion % |

#### ManpowerPlanning
Manpower planning (1:N with MonthlyProgress)

| Column Name | Data Type | Null | Primary Key | Foreign Key | Index | Description |
|------------|-----------|------|-------------|-------------|-------|-------------|
| Id | int | NOT NULL | ✓ | | ✓ | Auto-increment PK |
| MonthlyProgressId | int | NOT NULL | | MonthlyProgress.ProgressId | ✓ | Progress FK |
| ResourceType | nvarchar(100) | NULL | | | | Resource type |
| Planned | decimal(18,2) | NULL | | | | Planned hours |
| Consumed | decimal(18,2) | NULL | | | | Consumed hours |
| Balance | decimal(18,2) | NULL | | | | Remaining hours |
| NextMonthPlanning | decimal(18,2) | NULL | | | | Next month plan |

#### ProgressDeliverable
Progress deliverables (1:N with MonthlyProgress)

| Column Name | Data Type | Null | Primary Key | Foreign Key | Index | Description |
|------------|-----------|------|-------------|-------------|-------|-------------|
| Id | int | NOT NULL | ✓ | | ✓ | Auto-increment PK |
| MonthlyProgressId | int | NOT NULL | | MonthlyProgress.ProgressId | ✓ | Progress FK |
| DeliverableName | nvarchar(255) | NULL | | | | Deliverable name |
| PlannedDate | datetime | NULL | | | | Planned date |
| ActualDate | datetime | NULL | | | | Actual date |
| PaymentDue | decimal(18,2) | NULL | | | | Payment due |
| Status | nvarchar(50) | NULL | | | | Status |

#### ChangeOrder
Change orders (1:N with MonthlyProgress)

| Column Name | Data Type | Null | Primary Key | Foreign Key | Index | Description |
|------------|-----------|------|-------------|-------------|-------|-------------|
| Id | int | NOT NULL | ✓ | | ✓ | Auto-increment PK |
| MonthlyProgressId | int | NOT NULL | | MonthlyProgress.ProgressId | ✓ | Progress FK |
| ChangeOrderNumber | nvarchar(50) | NULL | | | | CO number |
| Description | nvarchar(MAX) | NULL | | | | Description |
| Cost | decimal(18,2) | NULL | | | | Cost impact |
| Fee | decimal(18,2) | NULL | | | | Fee impact |
| ContractTotal | decimal(18,2) | NULL | | | | New contract total |
| Status | nvarchar(50) | NULL | | | | CO status |

### Project Closure & Change Control Tables

#### ProjectClosure
Project closure documentation

| Column Name | Data Type | Null | Primary Key | Foreign Key | Index | Description |
|------------|-----------|------|-------------|-------------|-------|-------------|
| Id | int | NOT NULL | ✓ | | ✓ | Auto-increment PK |
| ProjectId | int | NOT NULL | | Project.ProjectId | ✓ | Project FK |
| WorkflowStatusId | int | NULL | | PMWorkflowStatus.Id | ✓ | Status FK |
| ClientFeedback | nvarchar(1000) | NULL | | | | Client feedback |
| SuccessCriteria | nvarchar(1000) | NULL | | | | Success criteria |
| LessonsLearned | nvarchar(1000) | NULL | | | | Lessons learned |
| Positives | nvarchar(1000) | NULL | | | | Positive outcomes |
| CreatedBy | nvarchar(100) | NULL | | | | Creator |
| UpdatedBy | nvarchar(100) | NULL | | | | Updater |
| CreatedAt | datetime | NOT NULL | | | | Creation timestamp |
| UpdatedAt | datetime | NULL | | | | Update timestamp |

*(Note: ProjectClosure has 60+ text fields for comprehensive closure documentation. Only key fields shown for brevity.)*

#### ProjectClosureWorkflowHistory
Closure workflow history

| Column Name | Data Type | Null | Primary Key | Foreign Key | Index | Description |
|------------|-----------|------|-------------|-------------|-------|-------------|
| Id | int | NOT NULL | ✓ | | ✓ | Auto-increment PK |
| ProjectClosureId | int | NOT NULL | | ProjectClosure.Id | ✓ | Closure FK |
| StatusId | int | NOT NULL | | PMWorkflowStatus.Id | ✓ | Status FK |
| ActionBy | nvarchar(450) | NOT NULL | | AspNetUsers.Id | ✓ | User FK |
| AssignedToId | nvarchar(450) | NULL | | AspNetUsers.Id | | Assigned user FK |
| Action | nvarchar(50) | NOT NULL | | | | Action type |
| Comments | nvarchar(MAX) | NULL | | | | Comments |
| ActionDate | datetime | NOT NULL | | | | Action timestamp |

#### ChangeControl
Change control requests

| Column Name | Data Type | Null | Primary Key | Foreign Key | Index | Description |
|------------|-----------|------|-------------|-------------|-------|-------------|
| Id | int | NOT NULL | ✓ | | ✓ | Auto-increment PK |
| ProjectId | int | NOT NULL | | Project.ProjectId | ✓ | Project FK |
| WorkflowStatusId | int | NULL | | PMWorkflowStatus.Id | ✓ | Status FK |
| Originator | nvarchar(100) | NOT NULL | | | | Change originator |
| Description | nvarchar(500) | NOT NULL | | | | Change description |
| CostImpact | nvarchar(255) | NULL | | | | Cost impact |
| TimeImpact | nvarchar(255) | NULL | | | | Time impact |
| ResourcesImpact | nvarchar(255) | NULL | | | | Resource impact |
| QualityImpact | nvarchar(255) | NULL | | | | Quality impact |
| ChangeOrderStatus | nvarchar(100) | NULL | | | | CO status |
| ClientApprovalStatus | nvarchar(100) | NULL | | | | Client approval |
| ClaimSituation | nvarchar(255) | NULL | | | | Claim situation |
| CreatedBy | nvarchar(100) | NULL | | | | Creator |
| CreatedAt | datetime | NOT NULL | | | | Creation timestamp |

#### ChangeControlWorkflowHistory
Change control workflow history

| Column Name | Data Type | Null | Primary Key | Foreign Key | Index | Description |
|------------|-----------|------|-------------|-------------|-------|-------------|
| Id | int | NOT NULL | ✓ | | ✓ | Auto-increment PK |
| ChangeControlId | int | NOT NULL | | ChangeControl.Id | ✓ | Change control FK |
| StatusId | int | NOT NULL | | PMWorkflowStatus.Id | ✓ | Status FK |
| ActionBy | nvarchar(450) | NOT NULL | | AspNetUsers.Id | ✓ | User FK |
| AssignedToId | nvarchar(450) | NULL | | AspNetUsers.Id | | Assigned user FK |
| Action | nvarchar(50) | NOT NULL | | | | Action type |
| Comments | nvarchar(MAX) | NULL | | | | Comments |
| ActionDate | datetime | NOT NULL | | | | Action timestamp |

### Roles, Permissions & Workflow Tables

#### AspNetRoles (Role)
Roles table

| Column Name | Data Type | Null | Primary Key | Foreign Key | Index | Description |
|------------|-----------|------|-------------|-------------|-------|-------------|
| Id | nvarchar(450) | NOT NULL | ✓ | | ✓ | Role ID (GUID) |
| Name | nvarchar(256) | NULL | | | ✓ | Role name |
| NormalizedName | nvarchar(256) | NULL | | | ✓ | Normalized name |
| ConcurrencyStamp | nvarchar(MAX) | NULL | | | | Concurrency token |

**Sample Data**:
```sql
INSERT INTO AspNetRoles (Id, Name, NormalizedName)
VALUES
  (NEWID(), 'Admin', 'ADMIN'),
  (NEWID(), 'Manager', 'MANAGER'),
  (NEWID(), 'User', 'USER');
```

#### Permission
Permissions table

| Column Name | Data Type | Null | Primary Key | Foreign Key | Index | Description |
|------------|-----------|------|-------------|-------------|-------|-------------|
| Id | int | NOT NULL | ✓ | | ✓ | Auto-increment PK |
| Name | nvarchar(100) | NOT NULL | | | ✓ UNIQUE | Permission name |
| Description | nvarchar(255) | NULL | | | | Description |
| Category | nvarchar(50) | NULL | | | | Permission category |

**Sample Data**:
```sql
INSERT INTO Permission (Name, Description, Category)
VALUES
  ('EDIT_BUSINESS_DEVELOPMENT', 'Edit business development opportunities', 'Business Development'),
  ('DELETE_BUSINESS_DEVELOPMENT', 'Delete opportunities', 'Business Development'),
  ('APPROVE_BUSINESS_DEVELOPMENT', 'Approve opportunities', 'Business Development'),
  ('VIEW_BUSINESS_DEVELOPMENT', 'View opportunities', 'Business Development'),
  ('EDIT_PROJECT', 'Edit project details', 'Project Management'),
  ('DELETE_PROJECT', 'Delete projects', 'Project Management'),
  ('APPROVE_PROJECT', 'Approve projects', 'Project Management'),
  ('VIEW_PROJECT', 'View projects', 'Project Management'),
  ('SUBMIT_FOR_APPROVAL', 'Submit items for approval', 'Workflow'),
  ('SYSTEM_ADMIN', 'System administration', 'Administration');
```

#### RolePermission
Role-Permission mapping (junction table)

| Column Name | Data Type | Null | Primary Key | Foreign Key | Index | Description |
|------------|-----------|------|-------------|-------------|-------|-------------|
| Id | int | NOT NULL | ✓ | | ✓ | Auto-increment PK |
| RoleId | nvarchar(450) | NOT NULL | | AspNetRoles.Id | ✓ | Role FK |
| PermissionId | int | NOT NULL | | Permission.Id | ✓ | Permission FK |

**Composite Index**: `IX_RolePermission_Role_Permission` on `(RoleId, PermissionId)` UNIQUE

#### PMWorkflowStatus
Workflow statuses

| Column Name | Data Type | Null | Primary Key | Foreign Key | Index | Description |
|------------|-----------|------|-------------|-------------|-------|-------------|
| Id | int | NOT NULL | ✓ | | ✓ | Auto-increment PK |
| StatusName | nvarchar(50) | NOT NULL | | | ✓ | Status name |
| StatusType | nvarchar(50) | NULL | | | ✓ | Workflow type |
| Description | nvarchar(255) | NULL | | | | Description |
| IsActive | bit | NOT NULL | | | | Active flag |
| DisplayOrder | int | NOT NULL | | | | Sort order |

**Sample Data**:
```sql
INSERT INTO PMWorkflowStatus (StatusName, StatusType, Description, IsActive, DisplayOrder)
VALUES
  ('Draft', 'JobStartForm', 'Initial draft state', 1, 1),
  ('Submitted', 'JobStartForm', 'Submitted for approval', 1, 2),
  ('Approved', 'JobStartForm', 'Approved by manager', 1, 3),
  ('Rejected', 'JobStartForm', 'Rejected', 1, 4),
  ('Draft', 'ChangeControl', 'Change request draft', 1, 1),
  ('Under Review', 'ChangeControl', 'Being reviewed', 1, 2),
  ('Approved', 'ChangeControl', 'Change approved', 1, 3),
  ('Draft', 'ProjectClosure', 'Closure draft', 1, 1),
  ('Submitted', 'ProjectClosure', 'Submitted for approval', 1, 2),
  ('Closed', 'ProjectClosure', 'Project closed', 1, 3);
```

### Audit & Logging Tables

#### AuditLog
Comprehensive audit trail

| Column Name | Data Type | Null | Primary Key | Foreign Key | Index | Description |
|------------|-----------|------|-------------|-------------|-------|-------------|
| Id | int | NOT NULL | ✓ | | ✓ | Auto-increment PK |
| EntityName | nvarchar(100) | NOT NULL | | | ✓ | Entity type |
| Action | nvarchar(50) | NOT NULL | | | ✓ | INSERT/UPDATE/DELETE |
| EntityId | nvarchar(50) | NOT NULL | | | ✓ | Entity ID |
| OldValues | nvarchar(MAX) | NOT NULL | | | | JSON old values |
| NewValues | nvarchar(MAX) | NOT NULL | | | | JSON new values |
| ChangedBy | nvarchar(100) | NOT NULL | | | ✓ | User who changed |
| ChangedAt | datetime | NOT NULL | | | ✓ | Change timestamp |
| Reason | nvarchar(500) | NULL | | | | Change reason |
| IpAddress | nvarchar(50) | NULL | | | | Client IP |
| UserAgent | nvarchar(500) | NULL | | | | Browser user agent |

**Composite Index**: `IX_AuditLog_Entity` on `(EntityName, EntityId)`

**Sample Data**:
```sql
INSERT INTO AuditLog (EntityName, Action, EntityId, OldValues, NewValues, ChangedBy, ChangedAt, IpAddress)
VALUES
  ('Project', 'UPDATE', '1',
   '{"ProjectName":"Old Name","Status":"Active"}',
   '{"ProjectName":"New Name","Status":"Active"}',
   'user@example.com',
   GETDATE(),
   '192.168.1.1');
```

#### FailedEmailLog
Failed email tracking

| Column Name | Data Type | Null | Primary Key | Foreign Key | Index | Description |
|------------|-----------|------|-------------|-------------|-------|-------------|
| Id | int | NOT NULL | ✓ | | ✓ | Auto-increment PK |
| ToEmail | nvarchar(255) | NOT NULL | | | | Recipient email |
| Subject | nvarchar(500) | NOT NULL | | | | Email subject |
| Body | nvarchar(MAX) | NULL | | | | Email body |
| ErrorMessage | nvarchar(MAX) | NULL | | | | Error details |
| AttemptedAt | datetime | NOT NULL | | | ✓ | Attempt timestamp |
| RetryCount | int | NOT NULL | | | | Retry attempts |

## Important Stored Procedures

No stored procedures are currently defined. All data operations are performed via Entity Framework Core LINQ queries.

## Migration History

The application uses EF Core Code-First migrations. Migration files are located in:
`backend/src/NJS.Domain/Migrations/`

### Key Migrations

```
20241001000000_InitialCreate.cs - Initial database schema
20241002000000_AddBidPreparation.cs - Bid preparation tables
20241003000000_AddGoNoGoDecision.cs - Go/No-Go decision tables
20241005000000_AddWBS.cs - Work breakdown structure
20241008000000_AddJobStartForm.cs - Job start form
20241010000000_AddMonthlyProgress.cs - Monthly progress reporting
20241012000000_AddProjectClosure.cs - Project closure
20241015000000_AddAuditLog.cs - Audit logging
20241018000000_AddChangeControl.cs - Change control
20241020000000_AddWorkflowHistory.cs - Workflow history tables
```

### Applying Migrations

```bash
# From the NJSAPI project directory
cd backend/src/NJSAPI

# Update database to latest migration
dotnet ef database update --project ../NJS.Domain

# Generate SQL script for production
dotnet ef migrations script --output migration.sql --project ../NJS.Domain
```

## Database Constraints Summary

### Primary Keys
All tables have a single-column auto-increment primary key (except junction tables and ASP.NET Identity tables).

### Foreign Keys
- **Cascade Delete**: Used for parent-child relationships where children are meaningless without parent
  - Example: `MonthlyProgress` → `FinancialDetails`
- **Restrict Delete**: Used to prevent orphaned records
  - Example: `WBSTask` self-referencing parent-child
  - Example: Workflow history tables
- **Set Null**: Used for optional relationships
  - Example: `User` → `UserWBSTask`

### Unique Constraints
- Email addresses in `AspNetUsers`
- Permission names in `Permission`
- Composite unique: `RolePermission(RoleId, PermissionId)`
- Composite unique: `MonthlyProgress(ProjectId, Month, Year)`

### Check Constraints
No explicit check constraints defined. Validation performed at application layer.

### Default Values
- `CreatedAt`: Current timestamp (applied via EF Core)
- `IsActive`: `true` (bit fields default to 1)
- `DisplayOrder`: 0

## Indexes Summary

### Clustered Indexes
All tables have a clustered index on the primary key.

### Non-Clustered Indexes

**High Priority (Query Performance)**:
- `AspNetUsers.Email`
- `AspNetUsers.UserName`
- `Project.ProjectNumber`
- `Project.Status`
- `Project.RegionId`
- `OpportunityTracking.StatusId`
- `MonthlyProgress(ProjectId, Month, Year)` - Composite
- `AuditLog(EntityName, EntityId)` - Composite
- `RolePermission(RoleId, PermissionId)` - Composite

**Medium Priority (Foreign Keys)**:
- All foreign key columns have indexes for join performance

**Low Priority (Optional)**:
- `WBSOption.FormType`
- `WBSOption.Level`
- `WBSOption.ParentValue`

---

**Document Version**: 1.0
**Last Updated**: 2025-10-30
**Maintained By**: Business Analyst Team
