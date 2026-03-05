# Backend Test Failures — Developer Quick Fix Guide

This document outlines the **13 backend test failures** that occur when running the full regression suite (`dotnet test backend/EDR.API.Tests/EDR.API.Tests.csproj --filter "FullyQualifiedName~Regression"`).

**Good news:** All 13 failures are caused by just **two specific bugs**. Fixing these two issues will bring the backend regression pass rate to 100%.

---

## ❓ Why do these fail in Regression Tests but pass in Unit Tests?

You might wonder why these tests fail now, even if similar Unit Tests pass. 

**Unit Tests** usually test isolated methods, often mocking the database (so database constraints aren't enforced) and bypassing the HTTP request/response pipeline (so JSON serialization doesn't occur).

**Regression/Integration Tests**, however, spin up a real test web server and hit the actual API endpoints, storing data in an Entity Framework instance. This means:
1.  **Serialization is triggered:** Data actually gets converted to JSON, which exposes circular reference loop errors that unit tests miss.
2.  **Constraints are enforced:** Real database rules (like unique constraints) are hit, especially when automated tests insert rows extremely fast.

---

## Bug 1: JSON Circular Reference Loop (8 Failures)

### The Issue
When requesting a Project (e.g., `GET /api/Project/{id}`), the API attempts to serialize the Project to JSON. However, the Project object contains a reference to its `Program`. The `Program` object, in turn, contains a list of its child `Projects`. This creates an infinite loop: `Project -> Program -> Projects -> Program...` which causes the JSON serializer to crash with a "circular reference" error.

### Affected Tests (8 Total)
These tests fail because they try to `POST`/`PUT` a Project, and the API attempts to return the created/updated linked entity in the response.
1.  `ProjectLifecycleRegressionTests` - 3 failing tests
2.  `MultiTenantRegressionTests` - 1 failing test
3.  `WBSWorkflowRegressionTests` - 1 failing test
4.  `SprintTaskRegressionTests` - 1 failing test
5.  `FinancialRegressionTests` - 1 failing test
6.  `UtilityEndpointsRegressionTests` - 1 failing test

### How to Fix
There are two ways to solve this. **Option A is the fastest, Option B is best practice.**

**Option A: The Quick Fix ([JsonIgnore])**
1.  Open `backend/src/EDR.Domain/Entities/Program.cs`
2.  Find the `public ICollection<Project> Projects { get; set; }` property.
3.  Add the `[System.Text.Json.Serialization.JsonIgnore]` attribute right above it so the serializer skips it when serializing a Program.

**Option B: The Best Practice Fix (DTOs)**
1.  Instead of returning the raw Entity Framework `Project` model directly from the Controller, map it to a `ProjectResponseDTO` that only includes flat properties and IDs (e.g., `ProgramId`), rather than the full nested `Program` object.

---

## Bug 2: Correspondence Unique Constraint Violation (5 Failures)

### The Issue
There is a database constraint (or EF Core configuration) that enforces **only one inward correspondence per project**. When the automated tests run rapidly in parallel, they attempt to create multiple correspondence entries for the same test project, violating this unique constraint and throwing an exception.

### Affected Tests (5 Total)
*   All 5 tests in `CorrespondenceWorkflowRegressionTests.cs`

### How to Fix

**Update Entity Framework Configuration**
Since it has been confirmed that **multiple inward correspondences per project are allowed**, the database unique constraint must be removed.

1.  Open the EF Core Entity Configuration for `CorrespondenceInward` (likely `backend/src/EDR.Infrastructure.Database/Configurations/CorrespondenceInwardConfiguration.cs` or within the `DbContext`).
2.  Locate the index configuration for `ProjectId` that is enforcing uniqueness.
3.  Remove `.IsUnique()` from the index configuration, or adjust the constraint to allow multiple records per project.
4.  Generate and apply a new EF Core migration (`dotnet ef migrations add RemoveCorrespondenceUniqueConstraint`).
