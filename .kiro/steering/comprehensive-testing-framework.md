---
inclusion: always
---

---
inclusion: fileMatch
fileMatchPattern: '**/*test*|**/*spec*|**/Tests/**|**/test/**|**/*.test.*|**/*.spec.*'
---

# Comprehensive Testing Framework for AI-DLC Step 5

## Testing Suite Overview

Step 5 of AI-DLC must include a **comprehensive testing strategy** that goes beyond just unit tests. Here's the complete testing framework:

## 1. Unit Tests (Foundation Layer)

### Backend Unit Tests
```csharp
// Example: ChangeProjectStatusHandlerTests.cs
[Fact]
public async Task Handle_ValidStatusChange_CreatesHistoryAndUpdatesProject()
{
    // Arrange - Setup mocks and test data
    // Act - Execute the method under test
    // Assert - Verify expected outcomes
}

[Theory]
[InlineData("Planning", "Active")]
[InlineData("Active", "On Hold")]
[InlineData("On Hold", "Completed")]
public async Task Handle_ValidStatusTransitions_ShouldSucceed(string oldStatus, string newStatus)
{
    // Test all valid status transitions
}
```

### Frontend Unit Tests
```typescript
// Example: ProjectStatusHistoryTimeline.test.tsx
describe('ProjectStatusHistoryTimeline', () => {
  it('should render timeline items correctly', () => {
    // Test component rendering
  });

  it('should display correct status colors', () => {
    // Test visual indicators
  });

  it('should handle empty history gracefully', () => {
    // Test edge cases
  });
});
```

**Coverage Target**: ≥80% for all new code

## 2. Integration Tests (API Layer)

### API Integration Tests
```csharp
// Example: ProjectStatusHistoryApiTests.cs
[Test]
public async Task POST_ChangeProjectStatus_ShouldCreateHistoryRecord()
{
    // Arrange
    var client = _factory.CreateClient();
    var request = new ChangeProjectStatusRequest
    {
        NewStatus = "Active",
        Reason = "Integration test"
    };

    // Act
    var response = await client.PostAsJsonAsync($"/api/projects/1/status", request);

    // Assert
    response.StatusCode.Should().Be(HttpStatusCode.OK);
    
    // Verify database state
    var history = await _dbContext.ProjectStatusHistory
        .Where(h => h.ProjectId == 1)
        .OrderByDescending(h => h.ChangedDate)
        .FirstOrDefaultAsync();
    
    history.Should().NotBeNull();
    history.NewStatus.Should().Be("Active");
}

[Test]
public async Task GET_ProjectStatusHistory_ShouldReturnOrderedHistory()
{
    // Test API endpoint returns correct data format and order
}
```

### Database Integration Tests
```csharp
[Test]
public async Task ProjectStatusHistory_DatabaseConstraints_ShouldEnforce()
{
    // Test foreign key constraints
    // Test check constraints (OldStatus != NewStatus)
    // Test index performance
}
```

## 3. End-to-End (E2E) Tests

### User Workflow Tests
```typescript
// Example: project-status-change.e2e.ts
describe('Project Status Change Workflow', () => {
  it('should allow user to change project status through UI', async () => {
    // 1. Navigate to project details page
    await page.goto('/projects/1');
    
    // 2. Click status change button
    await page.click('[data-testid="change-status-button"]');
    
    // 3. Select new status from dropdown
    await page.selectOption('[data-testid="status-select"]', 'Active');
    
    // 4. Enter reason
    await page.fill('[data-testid="reason-input"]', 'E2E test status change');
    
    // 5. Submit change
    await page.click('[data-testid="submit-button"]');
    
    // 6. Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // 7. Verify history timeline updated
    await expect(page.locator('[data-testid="timeline-item"]').first()).toContainText('Active');
  });

  it('should display validation errors for invalid inputs', async () => {
    // Test form validation
  });
});
```

## 4. Performance Tests

### API Performance Tests
```csharp
[Test]
public async Task ChangeProjectStatus_PerformanceTest_ShouldMeetSLA()
{
    var stopwatch = Stopwatch.StartNew();
    
    // Execute API call
    var response = await client.PostAsJsonAsync("/api/projects/1/status", request);
    
    stopwatch.Stop();
    
    // Assert response time < 500ms (SLA requirement)
    stopwatch.ElapsedMilliseconds.Should().BeLessThan(500);
    response.StatusCode.Should().Be(HttpStatusCode.OK);
}

[Test]
public async Task GetProjectStatusHistory_LoadTest_ShouldHandleConcurrentRequests()
{
    // Test concurrent API calls
    var tasks = Enumerable.Range(1, 100)
        .Select(_ => client.GetAsync("/api/projects/1/status-history"))
        .ToArray();
    
    var responses = await Task.WhenAll(tasks);
    
    // All requests should succeed
    responses.All(r => r.IsSuccessStatusCode).Should().BeTrue();
}
```

### Database Performance Tests
```sql
-- Test query performance with large datasets
DECLARE @StartTime DATETIME2 = GETDATE();

SELECT * FROM ProjectStatusHistory 
WHERE ProjectId = 1 
ORDER BY ChangedDate DESC;

DECLARE @EndTime DATETIME2 = GETDATE();
DECLARE @Duration INT = DATEDIFF(MILLISECOND, @StartTime, @EndTime);

-- Assert query executes in < 100ms
IF @Duration > 100
    THROW 50000, 'Query performance below threshold', 1;
```

## 5. Security Tests

### Authentication Tests
```csharp
[Test]
public async Task ChangeProjectStatus_WithoutAuthentication_ShouldReturn401()
{
    var client = _factory.CreateClient();
    // Don't add Authorization header
    
    var response = await client.PostAsJsonAsync("/api/projects/1/status", request);
    
    response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
}

[Test]
public async Task ChangeProjectStatus_WithInsufficientPermissions_ShouldReturn403()
{
    var client = _factory.CreateClientWithUser("user-without-permissions");
    
    var response = await client.PostAsJsonAsync("/api/projects/1/status", request);
    
    response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
}
```

### Input Validation Tests
```csharp
[Theory]
[InlineData("", "Empty status should be rejected")]
[InlineData("InvalidStatus", "Invalid status should be rejected")]
[InlineData(null, "Null status should be rejected")]
public async Task ChangeProjectStatus_InvalidInput_ShouldReturn400(string invalidStatus, string reason)
{
    var request = new ChangeProjectStatusRequest { NewStatus = invalidStatus };
    
    var response = await client.PostAsJsonAsync("/api/projects/1/status", request);
    
    response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
}
```

## 6. Accessibility Tests

### Frontend Accessibility Tests
```typescript
describe('Accessibility Tests', () => {
  it('should meet WCAG 2.1 AA standards', async () => {
    await page.goto('/projects/1');
    
    const accessibilityResults = await new AxePuppeteer(page).analyze();
    
    expect(accessibilityResults.violations).toHaveLength(0);
  });

  it('should support keyboard navigation', async () => {
    await page.goto('/projects/1');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab'); // Focus on status change button
    await page.keyboard.press('Enter'); // Open dialog
    await page.keyboard.press('Tab'); // Focus on status select
    await page.keyboard.press('ArrowDown'); // Navigate options
  });
});
```

## 7. Cross-Browser Compatibility Tests

```typescript
describe('Cross-Browser Tests', () => {
  ['chromium', 'firefox', 'webkit'].forEach(browserName => {
    it(`should work correctly in ${browserName}`, async () => {
      const browser = await playwright[browserName].launch();
      const page = await browser.newPage();
      
      // Test core functionality in each browser
      await page.goto('/projects/1');
      // ... test critical user flows
      
      await browser.close();
    });
  });
});
```

## 8. Load/Stress Tests

```csharp
[Test]
public async Task ProjectStatusHistory_LoadTest_ShouldHandleHighVolume()
{
    // Simulate 1000 concurrent status changes
    var tasks = Enumerable.Range(1, 1000)
        .Select(i => ChangeProjectStatusAsync(i))
        .ToArray();
    
    var results = await Task.WhenAll(tasks);
    
    // Verify all operations succeeded
    results.All(r => r.IsSuccess).Should().BeTrue();
    
    // Verify database consistency
    var historyCount = await _dbContext.ProjectStatusHistory.CountAsync();
    historyCount.Should().Be(1000);
}
```

## Detailed Testing Report Template

### Test Execution Report Structure

```markdown
# Test Execution Report - Project Status History Feature

## Executive Summary
- **Feature**: Project Status Change History Tracking
- **Test Execution Date**: 2024-11-12
- **Overall Status**: ✅ PASSED / ❌ FAILED
- **Test Coverage**: 87% (Target: ≥80%)
- **Critical Issues**: 0
- **Recommendations**: 3

## Test Results Summary

| Test Category | Total | Passed | Failed | Skipped | Coverage |
|---------------|-------|--------|--------|---------|----------|
| Unit Tests | 25 | 25 | 0 | 0 | 89% |
| Integration Tests | 12 | 12 | 0 | 0 | 85% |
| E2E Tests | 8 | 7 | 1 | 0 | N/A |
| Performance Tests | 5 | 5 | 0 | 0 | N/A |
| Security Tests | 10 | 10 | 0 | 0 | N/A |
| Accessibility Tests | 4 | 4 | 0 | 0 | N/A |

## Performance Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| API Response Time | <500ms | 145ms | ✅ PASS |
| Database Query Time | <100ms | 23ms | ✅ PASS |
| Frontend Load Time | <3s | 1.2s | ✅ PASS |
| Concurrent Users | 100 | 150 | ✅ PASS |

## Security Assessment

| Security Check | Status | Notes |
|----------------|--------|-------|
| Authentication | ✅ PASS | JWT validation working |
| Authorization | ✅ PASS | Role-based access enforced |
| Input Validation | ✅ PASS | All inputs sanitized |
| SQL Injection | ✅ PASS | Parameterized queries used |
| XSS Protection | ✅ PASS | Output encoding implemented |

## Failed Tests Analysis

### E2E Test Failure
- **Test**: "Should display validation errors for invalid inputs"
- **Failure Reason**: Validation message not displayed within 5s timeout
- **Impact**: Low - Functionality works, UI feedback delayed
- **Recommendation**: Increase timeout or optimize validation response

## Code Quality Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Code Coverage | ≥80% | 87% | ✅ PASS |
| Cyclomatic Complexity | <10 | 6.2 | ✅ PASS |
| Code Duplication | <5% | 2.1% | ✅ PASS |
| Technical Debt | <2h | 0.5h | ✅ PASS |

## Recommendations

### High Priority
1. **Fix E2E Timeout Issue**: Optimize validation response time or adjust timeout
2. **Add More Edge Case Tests**: Test with extremely large datasets (1M+ records)

### Medium Priority
3. **Performance Monitoring**: Add APM monitoring for production deployment
4. **Accessibility Enhancement**: Add screen reader testing

### Low Priority
5. **Test Automation**: Integrate tests into CI/CD pipeline
6. **Documentation**: Add test case documentation for future maintenance

## Deployment Readiness

✅ **READY FOR DEPLOYMENT**

- All critical tests passing
- Performance requirements met
- Security standards compliant
- Code quality standards met
- Documentation complete

## Sign-off

- **QA Lead**: [Name] - Approved ✅
- **Security Review**: [Name] - Approved ✅
- **Performance Review**: [Name] - Approved ✅
- **Product Owner**: [Name] - Approved ✅
```

## Test Automation Integration

```yaml
# .github/workflows/ai-dlc-testing.yml
name: AI-DLC Feature Testing Pipeline

on:
  push:
    branches: [ feature/* ]

jobs:
  test-suite:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup .NET
        uses: actions/setup-dotnet@v3
        with:
          dotnet-version: '8.0'
          
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Run Unit Tests
        run: dotnet test --collect:"XPlat Code Coverage"
        
      - name: Run Integration Tests
        run: dotnet test --filter Category=Integration
        
      - name: Run E2E Tests
        run: npm run test:e2e
        
      - name: Run Performance Tests
        run: npm run test:performance
        
      - name: Generate Test Report
        run: |
          dotnet tool install -g dotnet-reportgenerator-globaltool
          reportgenerator -reports:**/coverage.cobertura.xml -targetdir:TestResults -reporttypes:Html
          
      - name: Upload Test Results
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: TestResults/
```

This comprehensive testing framework ensures that Step 5 of AI-DLC produces thorough, reliable, and actionable test results for management review.