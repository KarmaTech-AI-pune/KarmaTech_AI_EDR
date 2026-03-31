# KarmaTech AI EDR (Enterprise Digital Runner)

![Version](https://img.shields.io/badge/version-1.3.1-blue.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)
![Frontend](https://img.shields.io/badge/frontend-React_18_MUI-blue.svg)
![Backend](https://img.shields.io/badge/backend-.NET_8_&_Express-purple.svg)

## 📖 Welcome to KarmaTech AI EDR

This is the **Master Reference Document** for the KarmaTech AI EDR (Enterprise Digital Runner) application. It is designed to provide comprehensive onboarding and architectural insight for both human developers and autonomous AI agents (like Claude working via the 7-step AI-DLC process).

This document synthesizes information from across the codebase. For detailed deep-dives, please see the [Documentation Index](#14-documentation-index) mapping to the `/Documentation` folder.

---

## Table of Contents

1.  [Business Overview](#1-business-overview)
2.  [Key Benefits & Value Proposition](#2-key-benefits--value-proposition)
3.  [Feature Summary by Module](#3-feature-summary-by-module)
4.  [Technology Stack](#4-technology-stack)
5.  [Architecture Overview](#5-architecture-overview)
6.  [Project Structure](#6-project-structure)
7.  [Getting Started / Setup](#7-getting-started--setup)
8.  [Development Workflow & Standards](#8-development-workflow--standards)
9.  [Authentication & Authorization](#9-authentication--authorization)
10. [CI/CD & Deployment](#10-cicd--deployment)
11. [Testing Framework](#11-testing-framework)
12. [Database Overview](#12-database-overview)
13. [API Quick Reference](#13-api-quick-reference)
14. [Documentation Index](#14-documentation-index)

---

## 1. Business Overview

**KarmaTech AI EDR** is a comprehensive, SaaS-based project management platform engineered specifically to handle the entire lifecycle of enterprise and infrastructure projects—from initial opportunity identification through to final project closure.

### Problem Statement
Large engineering and consulting firms struggle with fragmented tools. They use separate systems for CRM (opportunities), financial estimation (bids), project execution (schedules/WBS), and monthly reporting. This leads to data silos, risky manual data entry, and poor visibility for regional directors into actual project profitability (NPV / EAC) versus original bids.

### The Solution
EDR provides a singlePane-of-glass solution. An opportunity flows seamlessly into a Bid, which is evaluated via a formal Go/No-Go process. Once won, it transitions into a "Job Start", where the Work Breakdown Structure (WBS) and Resource allocations are locked in. Finally, Monthly Progress reports track actual spend against the baseline, calculating powerful metrics like Cost To Complete (CTC) and Estimate At Completion (EAC) automatically.

---

## 2. Key Benefits & Value Proposition

*   **End-to-End Lifecycle:** Unifies Sales (BD), Planning (WBS/Job Start), Execution (Monthly Progress/Sprints), and Delivery (Closure).
*   **Approval Workflows:** Built-in state-machine workflows for critical transitions (e.g., submitting a Bid for Review, approving a Project Change Order).
*   **Multi-Tenancy Ready:** Role-Based (RBAC) and Permission-Based (PBAC) access control designed for scaling across organizational groups or client tenants.
*   **Granular Financials:** Deep tracking of Manpower (planned vs. consumed hours at specific cost rates), Subconsultant fees, and out-of-pocket expenses (ODCs).
*   **Comprehensive Audit:** Entity Framework interceptors automatically log the "Who, What, When, and Why" (including before/after JSON states) for every database mutation.
*   **Agile Methodologies:** Integrated Sprint Planning and Kanban boards specifically for software/design deliverables within larger infrastructure projects.

---

## 3. Feature Summary by Module

The application is divided into six major modules containing 28 core CQRS-driven features.

| Module | Core Features | Purpose |
| ------ | ------------- | ------- |
| **Business Development (BD)** | Opportunity Tracking, Bid Preparation | Track the pipeline, estimate fees (Gross/Net), manage bid submission deadlines. |
| | Go/No-Go Decision | Multi-criteria scoring workflow to formally decide if a bid should be pursued. |
| | Check Review | Quality assurance tracking for bid documents. |
| | Job Start Form | Officially kicks off a won project, establishing the financial and resource baselines prior to execution. |
| **Project Management (PM)** | Projects CRUD | Core metadata (Dates, PM assigned, Region, Status). |
| | Work Breakdown Structure (WBS) | Hierarchical task management (up to Level 4) with assigned manpower and cost rates to build the budget. |
| | Monthly Progress | Deep financial reporting comparing Actuals against Budget. Calculates Earned Value metrics, CTC, and EAC. |
| | Cashflow & Scheduling | NPV, Profitability tracking, and visual Gantt chart tracking. |
| | Change Control | Formal workflow for processing Change Orders affecting scope/cost/time. |
| | Project Closure | Capturing lessons learned, client feedback, and finalizing the project status. |
| **Correspondence** | Inward / Outward | Formal tracking of letters, submittals, and official project communications. |
| | Input Register | Tracking documents received from clients/subconsultants. |
| **Sprint Planning** | Sprint Plans, Tasks, Subtasks | Traditional Agile/Scrum task management mapped to specific WBS elements. |
| | Kanban Board | Visual To Do -> In Progress -> Testing -> Done workflows for sprint items. |
| | Comments / Collaboration | Threaded discussions attached directly to subtasks. |
| **Administration** | Users, Roles, Permissions | Identity management and granular access control mapping. |
| | Tenants & Subscriptions | Multi-tenant segmentation and feature-flag gating for SaaS tiers. |
| | System Settings | Global configuration parameters. |
| **Cross-Cutting** | Audit System | Transparent history logging of all data mutations across the app. |
| | Email Notifications | Automated alerts for workflow transitions via MailKit (SMTP). |
| | Excel Export | Server-side generation of complex financial/progress reports via ClosedXML. |

---

## 4. Technology Stack

EDR uses a modern **Three-Tier Architecture** featuring a highly-typed dual-backend approach.

### Frontend Stack (React SPA)
| Technology | Version | Purpose |
| ---------- | ------- | ------- |
| **React** | 18.3.1 | Core UI Framework |
| **TypeScript** | 5.5.3 | Static typing for JavaScript |
| **Vite** | 5.4.8 | High-speed build tool and dev server |
| **Material-UI (MUI)**| 6.5.0 | Comprehensive Component Library |
| **React Router** | 7.6.1 | Client-side routing |
| **Formik + Yup/Zod** | 2.4 / 3.25 | Complex form state management and schema validation |
| **Axios** | 1.7.7 | REST API Client with JWT Interceptors |
| **Recharts / Gantt**| 2.15 / 1.3 | Data visualization and schedule mapping |

### Primary Backend Stack (C# .NET)
*Drives 95% of business logic and all relational data.*
| Technology | Version | Purpose |
| ---------- | ------- | ------- |
| **ASP.NET Core** | 8.0 | High-performance Web API framework |
| **Entity Framework Core**| 8.0.10 | Mature ORM for SQL Server |
| **MediatR** | 12.4.1 | Implementation of the CQRS Pattern |
| **AutoMapper** | 12.0.1 | DTO to Entity object mapping |
| **ASP.NET Identity**| 8.0 | Robust authentication and security foundation |
| **MailKit** | 4.11.0 | Email dispatch system |

### Secondary Backend Stack (Node.js)
*Complementary services for alternative data models or fast prototyping.*
| Technology | Version | Purpose |
| ---------- | ------- | ------- |
| **Express.js** | 4.21.2 | Lightweight Web Framework |
| **TypeScript** | 5.7.2 | Static typing |
| **Mongoose** | 8.9.3 | MongoDB ODM for NoSQL document storage |

### Database & Infrastructure
| Technology | Purpose |
| ---------- | ------- |
| **SQL Server** | Primary relational datastore (85+ heavily normalized tables). Handles all financial, workflow, and PM data. |
| **MongoDB Atlas**| Cloud NoSQL datastore for high-velocity unstructured data and secondary schemas. |
| **IIS** | Production web hosting environment for Windows Server. |

---

## 5. Architecture Overview

EDR implements **Clean Architecture**, strictly separating concerns.

### Tiered Architecture
```text
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  React 18.3 + TypeScript + Material-UI + Vite (SPA)        │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS/REST API (Axios)
                       │ JWT Bearer Token Headers
┌──────────────────────┴──────────────────────────────────────┐
│                  APPLICATION LAYER                           │
│  ┌──────────────────────┐    ┌──────────────────────┐      │
│  │  C# .NET Core 8.0    │    │  Node.js/Express     │      │
│  │  - ASP.NET API       │    │  - Express Routes    │      │
│  │  - CQRS (Commands)   │    │  - Auth Middleware   │      │
│  │  - Domain Services   │    │                      │      │
│  └──────────┬───────────┘    └──────────┬───────────┘      │
└─────────────┼────────────────────────────┼──────────────────┘
              │                            │
┌─────────────┴────────────────────────────┴──────────────────┐
│                    DATA LAYER                                │
│  ┌──────────────────────┐    ┌──────────────────────┐      │
│  │ Microsoft SQL Server │    │  MongoDB Atlas       │      │
│  │(Entity Framework Core│    │  (Mongoose ODM)      │      │
│  └──────────────────────┘    └──────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Clean Architecture Layers (within .NET)
1.  **NJSAPI (Presentation):** Controllers, Routing, Middleware (Auth, CORS, Compression), Swagger.
2.  **NJS.Application (Business Logic):** CQRS Handlers, DTOs, Validation, Workflow Strategies, Email Service.
3.  **NJS.Domain (Core):** Entities (Models), Enums, DbContext configuration. Knows nothing about outer layers.
4.  **NJS.Repositories (Data Access):** Concrete implementations of Repository interfaces fetching from EF Core.
5.  **NJS.Infrastructure:** Database migrations, seeding, external provider integrations.

---

## 6. Project Structure

```text
KarmaTech_AI_EDR/
├── backend/                       # Primary C# .NET 8 Backend
│   ├── src/
│   │   ├── NJSAPI/                # 1. API Proj (Controllers, Program.cs)
│   │   ├── NJS.Application/       # 2. App Proj (CQRS, DTOs, Services)
│   │   ├── NJS.Domain/            # 3. Domain Proj (Entities, DbContext, Migrations)
│   │   ├── NJS.Infrastructure/    # 4. Infra Proj (Email impl)
│   ├── NJS.Repositories/          # 5. Repo Proj (EF Core Data Access)
│   ├── NJS.API.Tests/             # Integration Tests
│   ├── NJS.Domain.Tests/          # Unit Tests
│   ├── Database/Input/            # SQL init / Seed scripts
│   └── NJS_backend.sln            # Visual Studio Solution
│
├── frontend/                      # React SPA
│   ├── src/
│   │   ├── api/                   # Axios instances
│   │   ├── components/            # Reusable UI (Buttons, Dialogs, Tables)
│   │   ├── features/              # Complex domain components (e.g. WBS, Cashflow)
│   │   ├── pages/                 # Top-level Route views
│   │   ├── services/              # API wrapper functions calling the backend
│   │   ├── types/                 # TypeScript interfaces mapped to backend DTOs
│   │   └── index.css              # Global styles
│   └── package.json               # Frontend dependencies & scripts
│
├── node-backend/                  # Secondary Node.js API
│   ├── src/
│   │   ├── controllers/           # Express route handlers
│   │   ├── models/                # Mongoose NoSQL Schemas
│   │   └── routes/                # Express routing definition
│   └── package.json               # Node dependencies
│
├── Documentation/                 # Detailed Technical Docs (See Section 14)
├── deployment/                    # Configuration for environments
├── .github/workflows/             # 16 CI/CD GitHub Actions pipelines
├── CHANGELOG.md                   # Automated release notes
└── VERSION                        # Single Source of Truth for App Version
```

---

## 7. Getting Started / Setup

### Prerequisites
*   [.NET 8.0 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)
*   [Node.js](https://nodejs.org/) (v18+)
*   [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) (Express, Developer, or Standard)
*   PowerShell (for setup scripts)

### Automatic Setup
From the repository root, you can run the provided PowerShell script to build both frontend and backend automatically:
```powershell
.\restore-and-build.ps1
```

### Manual Setup - Primary Backend (.NET)
1.  Navigate to the API folder and restore Nuget packages:
    ```bash
    cd backend/src/NJSAPI
    dotnet restore
    ```
2.  Update Database connection string:
    *   Open `backend/src/NJSAPI/appsettings.json`
    *   Set `ConnectionStrings:AppDbConnection` to point to your local SQL Server instance. Default uses Windows Auth (`Trusted_Connection=True`).
    *   If you don't have the DB yet, create it and run migrations from the Domain project:
        ```bash
        cd ../NJS.Domain
        dotnet ef database update --startup-project ../NJSAPI
        ```
3.  Run the API (starts on `http://localhost:5245`):
    ```bash
    cd ../NJSAPI
    dotnet run
    ```
    *Swagger UI will be available at `http://localhost:5245/swagger`*

### Manual Setup - Frontend (React)
1.  Navigate to frontend and install NPM packages:
    ```bash
    cd frontend
    npm install
    ```
2.  Start the Vite dev server (starts on `http://localhost:5173`):
    ```bash
    npm run dev
    ```

### Manual Setup - Node Backend (Optional)
If working on the complementary NoSQL features:
1.  Navigate and install:
    ```bash
    cd node-backend
    npm install
    ```
2.  Start development server (starts on `http://localhost:3000`):
    ```bash
    npm run dev
    ```

---

## 8. Development Workflow & Standards

EDR mandates strict coding standards. Adherence is non-negotiable for AI agents generating code. Please refer to `Documentation/CODING_STANDARDS.md` for exhaustive details.

### Fast Rules for Agents:
1.  **C# Code:** Use `PascalCase` for Classes/Methods/Properties. Use `_camelCase` for private fields. Always use `Async` suffixes for asynchronous methods.
2.  **React Code:** Use `PascalCase` for Components (Functional components ONLY). Use `camelCase` for functions/variables. Extract complex state into Custom Hooks (`use...()`).
3.  **CQRS Pattern:** Do not inject Repositories directly into MVC Controllers. Controllers should only dispatch Commands/Queries via MediatR.
4.  **Database Actions:** *Never* write raw SQL strings. Always use Entity Framework LINQ or EF Migrations.
5.  **Paths:** Always output absolute paths when generating tools/scripts unless the context is strictly relative to a known working directory.

---

## 9. Authentication & Authorization

EDR secures data utilizing comprehensive JWT and Role-Based mechanisms.

*   **Authentication:** Controlled entirely by ASP.NET Core Identity on the `.NET` backend.
*   **Token:** A signed JWT spanning 3 hours is issued upon successful login at `POST /api/user/login`.
*   **Client Management:** Axios interceptors (frontend) automatically attach `Bearer {token}` to all subsequent requests.
*   **Authorization (RBAC & PBAC):**
    *   **Roles:** Hardcoded hierarchical roles (`Admin`, `Manager`, `User`).
    *   **Permissions:** Granular string claims encoded in the JWT (e.g., `EDIT_BUSINESS_DEVELOPMENT`, `APPROVE_PROJECT`).
    *   **Guards:** Backend uses `[Authorize(Policy = "RequireAdminRole")]`, frontend uses `<ProtectedRoute requiredPermission="...">` wrappers.

---

## 10. CI/CD & Deployment

Automation is driven heavily via 16 GitHub Actions workflows located in `.github/workflows/`.

*   **Trigger Mechanism:** PRs to `main`/`master` trigger testing. Pushes to `main` trigger deployment tagging.
*   **Automatic Versioning:** `create-release-tags.yml` reads conventional commits to bump versions automatically, maintaining the `VERSION` file and `CHANGELOG.md` exactly in sync.
*   **Multi-tenant Configs:** Scripts exist to build distinct frontend distributions for different tenants (`npm run build:tenant1`, `npm run build:tenant2`).
*   **Deployment Target:** Production application is primarily configured to run on Windows Server IIS (`deploy-production-with-tags.yml`), though Docker/K8s scaffolding exists in `/k8s/`.

---

## 11. Testing Framework

The system utilizes extensive regression testing.

### Backend Testing
*   **Unit Tests:** xUnit testing logic in `NJS.Domain.Tests` focusing heavily on Services and CQRS logic.
*   **Integration Tests:** API Controllers tested in `NJS.API.Tests`.
*   **Test Scripts:** `Run-Regression-Tests.ps1` automates DB migrations, API startup, and endpoint hitting.

### Frontend & E2E Testing
*   **Unit Testing:** `Vitest` and React Testing Library for component isolation.
*   **End-to-End Testing:** `Playwright` automated browser testing targeting critical flows (`npm run test:e2e`). Validates Routing, multi-step Forms (WBS), and complex table rendering.

---

## 12. Database Overview

The system heavily relies on a massive relational schema handling complex engineering finance concepts. Refer to `Documentation/DATABASE_SCHEMA.md` for exhaustive ERDs and column definitions.

*   **Size:** The SQL Server database (`KarmaTechAI_SAAS`) contains 85+ highly normalized entities.
*   **Key Relationships:** Everything centers around the `Project` entity (1:N to WBS, 1:N to MonthlyProgress, 1:N to Change Control).
*   **Audit Logging:** Through EF Core interceptors (`AuditSaveChangesInterceptor.cs`), any `INSERT`, `UPDATE`, or `DELETE` creates a JSON record in the `AuditLogs` table documenting the exact data change, timestamp, and User GUID.
*   **Migration Management:** Always track DB changes incrementally. Use:
    ```bash
    dotnet ef migrations add <Descriptive_Name> --startup-project ../NJSAPI
    ```

---

## 13. API Quick Reference

The C# Backend exposes RESTful endpoints mostly grouped around domains. (See `Documentation/API_DOCUMENTATION.md` for full payloads).

| Base Route | Description |
| ---------- | ----------- |
| `/api/user` | Auth (Login, Register), User CRUD, Password management. |
| `/api/role` | RBAC mapping and Permission retrieval. |
| `/api/projects` | Core Project creation and metadata. |
| `/api/opportunities` | Business Development (Sales) pipeline. Includes Bid Prep. |
| `/api/gonogo` | Decision scoring workflow for Opportunities. |
| `/api/wbs` | WBS hierarchical task lists and Resource baselines. |
| `/api/monthlyprogress`| Core financial tracking (CTC/EAC). Pulls Actuals against WBS planned budget. |
| `/api/projectclosure`| Finalize a project stage. |
| `/api/changecontrol` | Submit/Approve financial/scope changes to an active project. |

---

## 14. Documentation Index

This `README.md` acts as a high-level overview. All developers (and AI agents) must refer to the exhaustive documents located in the `Documentation/` directory for deep-dives into specific sub-systems:

*   🏛️ `ARCHITECTURE.md` (750+ lines) - Deep dive into patterns, scaling, auth flows, and security.
*   🗄️ `DATABASE_SCHEMA.md` (1000+ lines) - Master Entity Relationship Diagrams, table schemas, relationships.
*   📑 `FEATURE_INVENTORY.md` (850+ lines) - Exhaustive mapping of every Frontend Component to every Backend CQRS Handler and Entity.
*   💻 `BACKEND_STRUCTURE.md` (1600+ lines) - Class-level breakdown of the C# app, directory trees, file routing.
*   🔌 `API_DOCUMENTATION.md` (1500+ lines) - Complete Swagger-like documentation of endpoints, payloads, and response codes.
*   📏 `CODING_STANDARDS.md` (1700+ lines) - Mandatory styling, naming conventions, Hooks usage, LINQ optimization, and Git commit formats.
*   🤖 `README.md` (in `/Documentation/`) - Guide on how EDR's "Autonomous Agent System" utilizes the AI-DLC 7-step process.

---

*Maintained by the KarmaTech AI Architecture Team. Last updated during Version 1.3.1.*
