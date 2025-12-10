---
inclusion: always
---

# Testing Resilience Rules for AI-DLC Step 5

## Core Principle
**NEVER abandon testing due to technical issues. Adapt, persist, and find alternative paths to validation.**

## Failure Response Protocol

### Level 1: Immediate Retry (0-2 failures)
When a test fails, immediately:
- Retry the same test with slight variations
- Check for transient issues (network timeouts, timing issues)
- Verify test environment is stable
- Check if services are running (dev server, database)

### Level 2: Alternative Approach (3-5 failures)
If retries fail, switch strategies:
- **E2E fails?** → Try integration tests
- **Integration fails?** → Try unit tests
- **Live API fails?** → Use mock data
- **Full workflow fails?** → Test individual components
- **Database fails?** → Verify schema and run migrations

### Level 3: Diagnostic Mode (6-8 failures)
If alternative approaches fail, diagnose systematically:
- Run environment health checks
- Test prerequisites (auth, database connection, API availability)
- Test simpler scenarios first (GET before POST)
- Build up from known working tests
- Document specific technical blockers with error messages

### Level 4: Structured Escalation (9+ failures only)
Only escalate after exhausting all options:
- Document ALL attempted approaches with results
- Provide specific technical root cause with error logs
- Suggest concrete manual intervention points
- Provide manual test plan as fallback
- **DO NOT** write summary markdown and quit

## Mandatory Pre-Escalation Checklist

Before escalating or giving up, verify:

- [ ] Attempted at least 3 different testing approaches
- [ ] Verified all environment prerequisites (server running, DB connected, auth working)
- [ ] Tested simpler scenarios successfully (basic CRUD operations)
- [ ] Documented specific technical root cause with error messages
- [ ] Provided actionable next steps for human intervention
- [ ] Created manual test plan as fallback
- [ ] Verified code compiles without errors
- [ ] Ran static analysis and linting

## Testing Fallback Hierarchy

```
Level 1: E2E Tests (Full User Workflow)
         ↓ (if fails)
Level 2: Integration Tests (API + Database)
         ↓ (if fails)
Level 3: Unit Tests (Business Logic)
         ↓ (if fails)
Level 4: Compilation + Static Analysis + Linting
         ↓ (if fails)
Level 5: Code Review + Manual Test Plan
         ↓ (only then)
Level 6: Escalation with detailed diagnostics
```

## Environment Health Checks

Before starting any test suite, verify:

```bash
# Backend health
✓ Backend server is running (check port 5245)
✓ Database connection is working
✓ Migrations are up to date
✓ Authentication endpoints respond

# Frontend health
✓ Frontend dev server is running (check port 5173)
✓ Can reach backend API
✓ No compilation errors
✓ Dependencies installed
```

## Anti-Patterns to Avoid

❌ **NEVER** write "TESTING_SUMMARY.md" after first failure
❌ **NEVER** give up without trying at least 3 alternative approaches
❌ **NEVER** escalate without diagnosing root cause
❌ **NEVER** leave tests in broken state without fallback validation
❌ **NEVER** quit without providing manual test steps
❌ **NEVER** assume environment is ready without verification

## Resilient Testing Workflow

### Phase 1: Pre-Test Validation (MANDATORY)
```
1. Check if backend is running
2. Check if frontend is running
3. Verify database connectivity
4. Test authentication endpoint
5. Run a simple health check API call
```

### Phase 2: Progressive Testing
```
1. Start with simplest test (GET endpoint)
2. Move to CREATE operations
3. Then UPDATE operations
4. Then complex workflows
5. Document what works at each level
```

### Phase 3: Failure Recovery
```
When test fails:
1. Capture exact error message
2. Identify failure category (network, auth, validation, etc.)
3. Try alternative approach for that category
4. Document what was tried and result
5. Move to next fallback level
```

### Phase 4: Partial Success Documentation
```
Even if full E2E fails, document:
- What tests DID pass
- What functionality IS verified
- What coverage WAS achieved
- What manual testing is needed
- Specific blockers preventing full automation
```

## Success Criteria Flexibility

### Ideal Success (100%)
- All E2E tests pass
- All integration tests pass
- All unit tests pass
- Coverage ≥80%

### Acceptable Success (75%)
- Integration tests pass
- Unit tests pass
- Coverage ≥80%
- Manual E2E test plan provided

### Minimum Success (50%)
- Unit tests pass
- Code compiles without errors
- Static analysis passes
- Comprehensive manual test plan provided

### Escalation Threshold (<50%)
- Only if unit tests fail repeatedly
- Only if code doesn't compile
- Only after trying all alternatives
- Must provide detailed diagnostics

## Real-World Testing Mindset

**Think like a professional QA engineer:**

✅ "This approach didn't work, let me try another angle"
✅ "I'll test the components individually first"
✅ "Let me verify the environment is set up correctly"
✅ "I'll document what works and what doesn't"
✅ "I'll provide manual test steps as backup"

❌ "One test failed, I give up"
❌ "Environment issues mean I can't test"
❌ "I'll just write a summary and move on"

## Practical Examples

### Example 1: E2E Test Fails
```
❌ Bad Response:
"E2E test failed due to timeout. Writing summary."

✅ Good Response:
"E2E test failed due to timeout. Let me:
1. Check if dev server is running
2. Try with longer timeout
3. Test the API endpoint directly (integration test)
4. If that works, test UI component in isolation
5. Document what level of testing succeeded"
```

### Example 2: API Integration Test Fails
```
❌ Bad Response:
"API returned 500 error. Cannot continue testing."

✅ Good Response:
"API returned 500 error. Let me:
1. Check the error logs for root cause
2. Verify database connection
3. Test with simpler request payload
4. Try the endpoint with Postman/curl
5. Fall back to unit testing the handler logic
6. Document the specific API issue for manual fix"
```

### Example 3: Database Connection Fails
```
❌ Bad Response:
"Database connection failed. Testing impossible."

✅ Good Response:
"Database connection failed. Let me:
1. Check if SQL Server is running
2. Verify connection string
3. Test with simple query
4. Check if migrations are applied
5. Fall back to unit tests with mocked repository
6. Provide manual database setup steps"
```

## Testing Report Requirements

Every testing phase must produce:

1. **What Was Tested**: Specific features and scenarios
2. **What Passed**: Successful test cases with evidence
3. **What Failed**: Failed test cases with error messages
4. **What Was Tried**: All alternative approaches attempted
5. **Coverage Achieved**: Actual test coverage percentage
6. **Manual Test Plan**: Steps for human verification
7. **Blockers**: Specific technical issues preventing automation
8. **Next Steps**: Actionable recommendations

## Integration with AI-DLC Step 5

This resilience framework enhances Step 5 (Testing) by:

- Ensuring testing never completely fails
- Providing multiple validation levels
- Documenting partial success
- Creating actionable manual test plans
- Maintaining professional QA standards

## Remember

**A professional tester doesn't quit when tests fail—they adapt their strategy and find alternative validation methods.**

Your job is to validate the code works, not to give up at the first obstacle.
