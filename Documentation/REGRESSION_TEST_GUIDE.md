# Regression Test Guide

## Overview

Regression tests verify that **critical business workflows** survive code changes. They differ from unit tests (which test isolated functions) and integration tests (which test API pipeline wiring). Regression tests exercise **end-to-end workflows, cross-entity data integrity, and state transitions**.

## Quick Start

### Run All Regression Tests
```powershell
.\Run-Regression-Tests.ps1
```

### Run Backend Only
```powershell
dotnet test backend/EDR_backend.sln --filter "FullyQualifiedName~Regression" --verbosity normal
```

### Run Frontend Only
```powershell
cd frontend
npx vitest run test/regression/ --reporter=verbose
```

### Run E2E Only
```powershell
cd frontend
npx playwright test e2e/tests/regression/ --reporter=html
```

---

## Test Organization

| Layer | Location | Test Framework | Naming Convention |
|-------|----------|----------------|-------------------|
| Backend | `backend/EDR.API.Tests/Regression/` | xUnit + Moq | `*RegressionTests.cs` |
| Frontend | `frontend/test/regression/` | Vitest + Testing Library | `*.regression.test.tsx` |
| E2E | `frontend/e2e/tests/regression/` | Playwright | `*.regression.spec.ts` |

## Writing New Regression Tests

### When to Add

- **After fixing a bug**: Always add a regression test that would have caught the bug
- **After major refactoring**: Verify existing workflows still work
- **Before a release**: Add tests for new features to prevent future regressions
- **When touching cross-entity logic**: E.g., changes to Projects that might affect Sprints

### Backend Pattern

```csharp
namespace EDR.API.Tests.Regression
{
    public class MyFeatureRegressionTests : IntegrationTestBase
    {
        [Fact]
        public async Task Workflow_StepSequence_ExpectedOutcome()
        {
            // Arrange: seed prerequisite data
            var seed = await SeedDatabaseAsync();

            // Act: perform the workflow
            var response = await Client.PostAsJsonAsync("/api/...", dto);
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);

            // Assert: verify data integrity
            var get = await Client.GetAsync("/api/...");
            Assert.Equal(HttpStatusCode.OK, get.StatusCode);
        }
    }
}
```

### Frontend Pattern

```tsx
describe('Feature Regression Tests', () => {
  it('workflow produces expected UI state', async () => {
    renderWithProviders(<Component />);
    // Interact and assert
  });
});
```

## CI/CD Integration

Regression tests run automatically via `.github/workflows/regression-tests.yml`:
- **On PRs** to `master`
- **Nightly** at 2:00 AM UTC
- **Manual trigger** via GitHub Actions UI

### Reports
- Backend: TRX files in `backend/EDR.API.Tests/TestResults/`
- Frontend: Console output
- E2E: HTML report in `frontend/playwright-report/`
