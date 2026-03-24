# 🎯 Frontend 100% Unit Test Coverage - Action Plan V2

**Date:** March 17, 2026  
**Current Status:** 347 test files | 3532 tests | 257 failing ❌  
**Target:** 100% coverage | All tests passing ✅  
**Timeline:** 2-3 weeks

---

## 📊 Current Situation Analysis

### Test Execution Summary
- **Total Test Files:** 347
- **Passing Files:** 300 (86.5%)
- **Failing Files:** 47 (13.5%)
- **Total Tests:** 3532
- **Passing Tests:** 3275 (92.7%)
- **Failing Tests:** 257 (7.3%)
- **Errors:** 25 critical errors

### Critical Issues Identified
1. ❌ **257 failing tests** - Need immediate fixes
2. ❌ **25 critical errors** - Blocking test execution
3. ⚠️ **Coverage gaps** - Some files still untested
4. ⚠️ **Flaky tests** - Async/timing issues

---

## 🚀 3-Phase Execution Plan

### **PHASE 1: Fix Failing Tests (Week 1)** 🔧
**Goal:** Get all 3532 tests passing  
**Duration:** 5-7 days  
**Priority:** CRITICAL

### **PHASE 2: Add Missing Tests (Week 2)** 📝
**Goal:** Cover untested files and branches  
**Duration:** 5-7 days  
**Priority:** HIGH

### **PHASE 3: Achieve 100% Coverage (Week 3)** 🎯
**Goal:** 100% statements, branches, functions, lines  
**Duration:** 3-5 days  
**Priority:** MEDIUM

---

## 📋 PHASE 1: Fix Failing Tests (CRITICAL)

### Step 1.1: Categorize Failing Tests (Day 1)

Run detailed analysis to categorize failures:

```bash
# Generate detailed failure report
npm run test 2>&1 | Out-File -FilePath test-failures.log

# Analyze failure patterns
```

**Expected Failure Categories:**
1. **Async/Timing Issues** (~40% of failures)
   - Missing `waitFor` calls
   - Improper async/await handling
   - Race conditions

2. **Mock Configuration Issues** (~30% of failures)
   - Incorrect API mocks
   - Missing mock implementations
   - Mock data mismatches

3. **Component Rendering Issues** (~20% of failures)
   - Missing context providers
   - Undefined props
   - Router configuration

4. **Import/Export Issues** (~10% of failures)
   - Circular dependencies
   - Missing exports
   - Type mismatches

### Step 1.2: Fix Critical Errors (Day 1-2)

**Priority 1: Fix 25 Critical Errors**

Common error patterns and fixes:

#### Error Pattern 1: Async Timeout
```typescript
// ❌ BEFORE (Failing)
it('should load data', () => {
  render(<Component />);
  expect(screen.getByText('Data')).toBeInTheDocument();
});

// ✅ AFTER (Fixed)
it('should load data', async () => {
  render(<Component />);
  await waitFor(() => {
    expect(screen.getByText('Data')).toBeInTheDocument();
  });
});
```

#### Error Pattern 2: Missing Mock
```typescript
// ❌ BEFORE (Failing)
it('should call API', () => {
  render(<Component />);
});

// ✅ AFTER (Fixed)
beforeEach(() => {
  vi.mock('../services/api');
  mockApi.fetchData.mockResolvedValue({ data: [] });
});

it('should call API', async () => {
  render(<Component />);
  await waitFor(() => {
    expect(mockApi.fetchData).toHaveBeenCalled();
  });
});
```

#### Error Pattern 3: Missing Context
```typescript
// ❌ BEFORE (Failing)
it('should render', () => {
  render(<Component />);
});

// ✅ AFTER (Fixed)
it('should render', () => {
  render(
    <AuthProvider>
      <RouterProvider>
        <Component />
      </RouterProvider>
    </AuthProvider>
  );
});
```

### Step 1.3: Fix Failing Test Files (Day 2-5)

**Systematic Approach:**

```bash
# Fix tests file by file
npm run test src/components/forms/CorrespondenceForm.test.tsx
npm run test src/components/forms/GoNoGoForm.test.tsx
npm run test src/components/adminpanel/TenantUsersManagement.test.tsx
# ... continue for all 47 failing files
```

**Daily Target:** Fix 10-12 test files per day

**Checklist per file:**
- [ ] All async operations use `waitFor`
- [ ] All API calls are properly mocked
- [ ] All context providers are included
- [ ] All imports are correct
- [ ] All props are provided
- [ ] All user events use `userEvent` library
- [ ] No console errors/warnings

### Step 1.4: Verify All Tests Pass (Day 6-7)

```bash
# Run full test suite
npm run test

# Expected output:
# ✅ Test Files: 347 passed
# ✅ Tests: 3532 passed
# ✅ Errors: 0
```

**Success Criteria:**
- ✅ 0 failing tests
- ✅ 0 critical errors
- ✅ All tests complete in < 5 minutes
- ✅ No flaky tests (run 3 times to verify)

---

## 📝 PHASE 2: Add Missing Tests

### Step 2.1: Identify Coverage Gaps (Day 8)

```bash
# Generate coverage report
npm run test -- --coverage

# Analyze uncovered files
```

**Expected Gaps:**
1. **Untested Files** - Files with 0% coverage
2. **Partial Coverage** - Files with < 80% coverage
3. **Uncovered Branches** - If/else statements not tested
4. **Uncovered Functions** - Functions never called in tests

### Step 2.2: Create Missing Test Files (Day 9-12)

**Priority Order:**

#### Priority 1: Critical Business Logic
```
src/services/
├── authService.ts (if not 100%)
├── projectService.ts (if not 100%)
├── budgetService.ts (if not 100%)
└── workflowService.ts (if not 100%)
```

#### Priority 2: Complex Components
```
src/components/
├── forms/ (any missing tests)
├── dialogbox/ (any missing tests)
└── project/ (any missing tests)
```

#### Priority 3: Utility Functions
```
src/utils/
├── validation.ts (if not 100%)
├── formatting.ts (if not 100%)
└── calculations.ts (if not 100%)
```

#### Priority 4: Type Guards & Validators
```
src/types/
├── guards.ts (if exists)
└── validators.ts (if exists)
```

### Step 2.3: Test Template for New Files

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentName } from './ComponentName';

// Mock dependencies
vi.mock('../services/api');

describe('ComponentName', () => {
  beforeEach(() => {
    // Setup mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<ComponentName />);
      expect(screen.getByRole('heading')).toBeInTheDocument();
    });

    it('should render with custom props', () => {
      render(<ComponentName title="Custom" />);
      expect(screen.getByText('Custom')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should handle button click', async () => {
      const user = userEvent.setup();
      const onClickMock = vi.fn();
      
      render(<ComponentName onClick={onClickMock} />);
      
      await user.click(screen.getByRole('button'));
      
      expect(onClickMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Data Loading', () => {
    it('should load data on mount', async () => {
      mockApi.fetchData.mockResolvedValue({ data: [] });
      
      render(<ComponentName />);
      
      await waitFor(() => {
        expect(mockApi.fetchData).toHaveBeenCalled();
      });
    });

    it('should handle loading errors', async () => {
      mockApi.fetchData.mockRejectedValue(new Error('Failed'));
      
      render(<ComponentName />);
      
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty data', () => {
      render(<ComponentName data={[]} />);
      expect(screen.getByText(/no data/i)).toBeInTheDocument();
    });

    it('should handle null props', () => {
      render(<ComponentName data={null} />);
      expect(screen.getByText(/no data/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<ComponentName />);
      expect(screen.getByRole('button')).toHaveAccessibleName();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<ComponentName />);
      
      await user.tab();
      expect(screen.getByRole('button')).toHaveFocus();
    });
  });
});
```

---

## 🎯 PHASE 3: Achieve 100% Coverage

### Step 3.1: Branch Coverage (Day 13-14)

**Target:** Cover all if/else, switch, ternary statements

```typescript
// Example: Testing all branches
describe('calculateDiscount', () => {
  it('should return 10% for regular customers', () => {
    expect(calculateDiscount('regular', 100)).toBe(10);
  });

  it('should return 20% for premium customers', () => {
    expect(calculateDiscount('premium', 100)).toBe(20);
  });

  it('should return 0% for invalid customer type', () => {
    expect(calculateDiscount('invalid', 100)).toBe(0);
  });

  it('should handle zero amount', () => {
    expect(calculateDiscount('regular', 0)).toBe(0);
  });

  it('should handle negative amount', () => {
    expect(calculateDiscount('regular', -100)).toBe(0);
  });
});
```

### Step 3.2: Function Coverage (Day 14-15)

**Target:** Call every function at least once

```bash
# Identify uncalled functions
npm run test -- --coverage --reporter=json

# Review coverage/coverage-final.json
# Look for functions with 0 hits
```

### Step 3.3: Statement Coverage (Day 15-16)

**Target:** Execute every line of code

**Common Uncovered Statements:**
1. Error handlers (catch blocks)
2. Default values
3. Cleanup functions
4. Edge case handlers

```typescript
// Example: Testing error handlers
describe('Error Handling', () => {
  it('should handle network errors', async () => {
    mockApi.fetchData.mockRejectedValue(new Error('Network error'));
    
    render(<Component />);
    
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('should handle validation errors', async () => {
    mockApi.fetchData.mockRejectedValue({ 
      response: { data: { message: 'Validation failed' } }
    });
    
    render(<Component />);
    
    await waitFor(() => {
      expect(screen.getByText('Validation failed')).toBeInTheDocument();
    });
  });
});
```

### Step 3.4: Line Coverage (Day 16-17)

**Target:** 100% line coverage

```bash
# Generate detailed line coverage
npm run test -- --coverage --reporter=html

# Open coverage/index.html
# Review red (uncovered) lines
# Add tests to cover them
```

### Step 3.5: Final Verification (Day 17-18)

```bash
# Run full test suite with coverage
npm run test -- --coverage

# Expected output:
# ✅ Statements: 100%
# ✅ Branches: 100%
# ✅ Functions: 100%
# ✅ Lines: 100%
# ✅ Test Files: 347+ passed
# ✅ Tests: 3532+ passed
```

---

## 🛠️ Tools & Scripts

### Script 1: Run Tests by Category

```bash
# Test specific folder
npm run test src/components/
npm run test src/services/
npm run test src/pages/

# Test specific pattern
npm run test -- --testNamePattern="should render"
npm run test -- --testNamePattern="should handle error"
```

### Script 2: Watch Mode for Development

```bash
# Watch mode for active development
npm run test:watch

# Watch specific file
npm run test:watch ComponentName.test.tsx
```

### Script 3: Coverage Report Generation

```bash
# Generate HTML coverage report
npm run test -- --coverage --reporter=html

# Generate JSON coverage report
npm run test -- --coverage --reporter=json

# Generate text summary
npm run test -- --coverage --reporter=text
```

### Script 4: Find Untested Files

```powershell
# PowerShell script to find files without tests
Get-ChildItem -Path src -Recurse -Filter "*.tsx" -Exclude "*.test.tsx","*.spec.tsx" | 
  Where-Object { 
    $testFile = $_.FullName -replace '\.tsx$', '.test.tsx'
    -not (Test-Path $testFile)
  } | 
  Select-Object FullName
```

---

## 📊 Progress Tracking

### Daily Checklist Template

```markdown
## Day X Progress

### Tests Fixed
- [ ] File 1: ComponentName.test.tsx (X tests fixed)
- [ ] File 2: ComponentName.test.tsx (X tests fixed)
- [ ] File 3: ComponentName.test.tsx (X tests fixed)

### Coverage Improvement
- Statements: X% → Y%
- Branches: X% → Y%
- Functions: X% → Y%
- Lines: X% → Y%

### Blockers
- Issue 1: Description
- Issue 2: Description

### Next Day Plan
- Task 1
- Task 2
- Task 3
```

### Weekly Milestone Tracker

```markdown
## Week 1: Fix Failing Tests
- [ ] Day 1: Categorize failures (257 tests)
- [ ] Day 2: Fix critical errors (25 errors)
- [ ] Day 3-5: Fix failing files (47 files)
- [ ] Day 6-7: Verify all pass (0 failures)

## Week 2: Add Missing Tests
- [ ] Day 8: Identify gaps
- [ ] Day 9-10: Test critical logic
- [ ] Day 11-12: Test complex components
- [ ] Day 13-14: Test utilities

## Week 3: Achieve 100%
- [ ] Day 15-16: Branch coverage
- [ ] Day 17: Function coverage
- [ ] Day 18: Statement coverage
- [ ] Day 19: Line coverage
- [ ] Day 20: Final verification
```

---

## 🚨 Common Issues & Solutions

### Issue 1: Async Tests Timing Out

**Problem:**
```typescript
// ❌ Test times out
it('should load data', () => {
  render(<Component />);
  expect(screen.getByText('Data')).toBeInTheDocument();
});
```

**Solution:**
```typescript
// ✅ Use waitFor
it('should load data', async () => {
  render(<Component />);
  await waitFor(() => {
    expect(screen.getByText('Data')).toBeInTheDocument();
  }, { timeout: 3000 });
});
```

### Issue 2: Mock Not Working

**Problem:**
```typescript
// ❌ Mock not applied
vi.mock('../services/api');
it('should call API', () => {
  // Mock not working
});
```

**Solution:**
```typescript
// ✅ Proper mock setup
vi.mock('../services/api', () => ({
  default: {
    fetchData: vi.fn()
  }
}));

beforeEach(() => {
  mockApi.fetchData.mockResolvedValue({ data: [] });
});
```

### Issue 3: Component Not Rendering

**Problem:**
```typescript
// ❌ Missing providers
it('should render', () => {
  render(<Component />);
  // Error: useAuth must be used within AuthProvider
});
```

**Solution:**
```typescript
// ✅ Include all providers
const renderWithProviders = (component) => {
  return render(
    <AuthProvider>
      <ThemeProvider>
        <RouterProvider>
          {component}
        </RouterProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

it('should render', () => {
  renderWithProviders(<Component />);
  expect(screen.getByRole('heading')).toBeInTheDocument();
});
```

### Issue 4: Flaky Tests

**Problem:**
```typescript
// ❌ Sometimes passes, sometimes fails
it('should update state', () => {
  render(<Component />);
  fireEvent.click(screen.getByRole('button'));
  expect(screen.getByText('Updated')).toBeInTheDocument();
});
```

**Solution:**
```typescript
// ✅ Use userEvent and waitFor
it('should update state', async () => {
  const user = userEvent.setup();
  render(<Component />);
  
  await user.click(screen.getByRole('button'));
  
  await waitFor(() => {
    expect(screen.getByText('Updated')).toBeInTheDocument();
  });
});
```

---

## 📈 Success Metrics

### Coverage Targets

| Metric | Current | Week 1 | Week 2 | Week 3 (Final) |
|--------|---------|--------|--------|----------------|
| **Test Files** | 347 | 347 | 360+ | 380+ |
| **Passing Tests** | 3275 | 3532 | 3800+ | 4000+ |
| **Failing Tests** | 257 | 0 | 0 | 0 |
| **Statements** | ~75% | ~85% | ~95% | 100% |
| **Branches** | ~70% | ~80% | ~90% | 100% |
| **Functions** | ~75% | ~85% | ~95% | 100% |
| **Lines** | ~75% | ~85% | ~95% | 100% |

### Quality Metrics

- ✅ **Test Execution Time:** < 5 minutes
- ✅ **Flaky Tests:** 0
- ✅ **Console Errors:** 0
- ✅ **Console Warnings:** 0
- ✅ **Test Maintainability:** High (AAA pattern)
- ✅ **Mock Coverage:** 100% of external dependencies

---

## 🎯 Final Deliverables

### Week 3 Completion Checklist

- [ ] All 3532+ tests passing
- [ ] 0 failing tests
- [ ] 0 critical errors
- [ ] 100% statement coverage
- [ ] 100% branch coverage
- [ ] 100% function coverage
- [ ] 100% line coverage
- [ ] Coverage report generated
- [ ] Test documentation updated
- [ ] CI/CD integration verified
- [ ] Team training completed

### Documentation Updates

1. **Test Coverage Report** - `frontend/COVERAGE_REPORT.md`
2. **Test Execution Guide** - `frontend/TEST_EXECUTION_GUIDE.md`
3. **Test Best Practices** - `frontend/TEST_BEST_PRACTICES.md`
4. **Troubleshooting Guide** - `frontend/TEST_TROUBLESHOOTING.md`

---

## 🚀 Getting Started

### Immediate Next Steps (Today)

1. **Run full test suite and capture output:**
```bash
npm run test 2>&1 | Out-File -FilePath test-failures-detailed.log
```

2. **Analyze failure patterns:**
```bash
# Review the log file
code test-failures-detailed.log
```

3. **Start fixing critical errors (25 errors):**
```bash
# Fix one file at a time
npm run test src/components/forms/CorrespondenceForm.test.tsx
```

4. **Track progress:**
```bash
# Create progress tracker
echo "# Test Fix Progress - Day 1" > test-fix-progress.md
```

### Tomorrow's Plan

1. Continue fixing critical errors
2. Fix 10-12 failing test files
3. Document common patterns
4. Update progress tracker

---

## 📞 Support & Resources

### Internal Resources
- Test documentation: `frontend/UNIT_TEST_COVERAGE_PLAN.md`
- Test progress: `frontend/UNIT_TEST_PROGRESS.md`
- Test templates: `frontend/test/templates/`

### External Resources
- Vitest docs: https://vitest.dev/
- React Testing Library: https://testing-library.com/react
- Testing best practices: https://kentcdodds.com/blog/common-mistakes-with-react-testing-library

---

**Plan Created:** March 17, 2026  
**Target Completion:** April 7, 2026 (3 weeks)  
**Status:** Ready to Execute - Start with Phase 1

**Next Action:** Run detailed test analysis and begin fixing critical errors.
