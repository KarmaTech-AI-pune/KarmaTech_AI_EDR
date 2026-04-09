# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-02-16

### ✨ Features
- **Program Management**: Comprehensive tools for managing programs, objectives, and key results.
- **Sprint Management**: New capabilities for sprint planning, tracking, and execution.

### 🐛 Bug Fixes
- Resolved issue with task assignment notifications impacting team workflow.
- Fixed data synchronization lag in project dashboard metrics.
- Corrected responsive layout glitches on mobile views for the reporting module.
- Patched security vulnerability in user session handling.

## [Unreleased]

## [1.5.0] - 2026-04-09

### ✨ Features
- **Multi-Tenant Architecture & Billing**: Implemented robust multi-tenant architecture with subscription management, Razorpay billing integration, PDF invoice generation, and email notification service.
- **Project & Task Management**: Added `TimeTrackingWidget` and `IssueDetailModal` for advanced task time management. Implemented `WorkBreakdownStructureForm` and comprehensive WBS CQRS handlers.
- **Dashboard & UI Enhancements**: Added task priority matrix and gross profit tracking to dashboard. Implemented loading states for admin components and password visibility toggle in UserDialog.
- **Database & Architecture**: Introduced comprehensive EF Core database context, initial schema migrations, and `SeedExtensions` for default tenant, roles, and permissions initialization.

### 🐛 Bug Fixes
- **Performance**: Removed redundant API calls to improve application responsiveness.
- **Cost Calculation**: Fixed `CostToCompleteAndEAC` handling of null `expectedGrossProfitPercentage` values.
- **General**: Addressed remaining hours calculation issues and resolved various frontend TypeScript integration errors.

### 🚀 Improvements
- **Testing**: Added resilient E2E testing with robust async selectors. Refactored `CostToCompleteAndEAC` core tests for comprehensive coverage, and integrated updated test suites in GitHub Actions.

## [1.4.0] - 2026-03-26

### ✨ Features
- **Architecture & Infrastructure**: Added `TenantMigrationService` for executing PostgreSQL database migrations across tenants.
- **Task Management**: Enhanced task management capabilities by implementing UI for user assignments and planned hours, including clearing duplicates.
- **Documentation**: Added comprehensive EDR application `README.md` documentation encompassing technical architecture, setup processes, and business logic mapping.
## [1.3.0] - 2026-03-04

### ✨ Features
- **Cash Flow Management** (`29c45267`, `2d6f8ecb`, `8927c05b`, `e6d6b53d`, `110273f5`): Introduced a full end-to-end Cash Flow module including backend API implementation, revenue calculation with progress deliverables, NPV and profitability analysis, and a dedicated frontend Cash Flow page with real-time dashboard data fetching.
- **Testing & Quality Assurance** (`10178566`, `13e5d3ba`, `1587462d`, `89ba6fdb`, `685b8115`): Implemented a comprehensive regression testing suite covering frontend, backend (WBS, job, opportunity, etc.), and E2E scenarios. Added extensive unit and integration tests for Sprint, ProgramSprint, SprintDailyProgress, and SprintTask controllers.
- **CI/CD & Automation** (`0a07d827`, `94c47571`): Set up automated release management hooks and new CI/CD workflows for frontend and backend testing on PRs to master.
- **Database & Architecture** (`96122ca4`, `66a2d530`, `d8dc31f7`, `aa4ca306`): Added PostgreSQL integration (updated dev connection string), added baseline migration, and introduced initial database seed data for features.
- **API Enhancements** (`1f5b6d03`, `20e69e8f`): Added a new level 3 task API and implemented full feature retrieval upon admin login.
- **Project Structure** (`733b01de`, `8533853d`): Renamed application references from EDR to Kiro/dev and updated corresponding frontend dependencies.

### Added
- Automatic versioning system based on conventional commits
- Dynamic version display in LoginScreen.tsx
- Version API endpoints for backend
- Comprehensive version management across frontend and backend
- Release notes generation from commit messages

### Changed
- Replaced hardcoded version "1.11.11" with dynamic version injection
- Updated build process to include version information
- Enhanced GitHub Actions workflow with conventional commit parsing

### 🐛 Bug Fixes
- Fixed a null reference error in the dashboard by adding optional chaining (`df8f71cf`).
- Resolved a tenant creation issue and removed an unnecessary tenant ID filter (`a50d3858`, `6fac171d`).
- Fixed various build errors and test case compatibility issues (`d0652be4`, `6164db14`, `e3f3930c`, `b4a970b5`).
- Cleaned up the codebase by removing unused folders (e.g., NJSEI) and duplicate files (`5429b29f`, `7416798c`).
- Version synchronization across all application components
- Build-time version injection for consistent version display

---

*This changelog is automatically updated by the version management system.*