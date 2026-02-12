# Budget Health Indicator - Playwright E2E Tests

## Overview

This directory contains automated Playwright tests that demonstrate how the **BudgetHealthIndicator** component is accessed and used in the application.

## Test Files

### 1. `budget-health-demo.spec.ts` ⭐ **RECOMMENDED**
**Simple, standalone demo script** - Best for first-time viewing

**What it does:**
- Automatically logs in
- Navigates to a project
- Finds the Budget Health Indicator
- Verifies color coding (Green/Yellow/Red)
- Takes detailed screenshots
- Provides clear console output

**Run with:**
```bash
# Run in headed mode (see the browser)
npx playwright test budget-health-demo.spec.ts --headed

# Run in headless mode (faster)
npx playwright test budget-health-demo.spec.ts

# Run with UI mode (interactive)
npx playwright test budget-health-demo.spec.ts --ui
```

**Expected Output:**
```
🎯 Budget Health Indicator - Automated Demo

📝 Step 1: Logging in...
✅ Logged in successfully

📂 Step 2: Navigating to Project Management...
✅ On Project Management page

🔍 Step 3: Opening a project...
✅ Project opened

🎯 Step 4: Looking for Budget Health Indicator...
✅ Budget Health Indicator FOUND!

📊 Indicator Details:
   Text: Healthy (75.5%)
   Status: Healthy
   Utilization: 75.5%
   Color: 🟢 Green (Success)

✅ Step 5: Verifying color coding...
   ✅ Healthy status verified!

📸 Step 6: Taking detailed screenshots...
✅ Screenshots saved!

═══════════════════════════════════════════════
✅ DEMO COMPLETE - Budget Health Indicator Works!
═══════════════════════════════════════════════
```

### 2. `budget-health-indicator.spec.ts`
**Comprehensive test suite** - Multiple test scenarios

**What it includes:**
- Visual verification test
- API data integration test
- Complete workflow test
- Quick demo test

**Run with:**
```bash
npx playwright test budget-health-indicator.spec.ts --headed
```

## Prerequisites

### 1. Start the Development Server
```bash
cd frontend
npm run dev
```
The app should be running on `http://localhost:5176`

### 2. Ensure Backend is Running
The backend API should be running on `http://localhost:5245`

### 3. Test User Credentials
Default test credentials:
- Email: `test@example.com`
- Password: `Admin@123`

## Running the Tests

### Quick Start (Recommended)
```bash
# Navigate to frontend directory
cd frontend

# Run the simple demo (best for first time)
npx playwright test budget-health-demo.spec.ts --headed

# This will:
# 1. Open a browser window
# 2. Automatically navigate through the app
# 3. Find and verify the Budget Health Indicator
# 4. Take screenshots
# 5. Show results in console
```

### All Test Options

```bash
# Run all budget health tests
npx playwright test budget-health --headed

# Run specific test file
npx playwright test budget-health-demo.spec.ts --headed

# Run in headless mode (no browser window)
npx playwright test budget-health-demo.spec.ts

# Run with debug mode
npx playwright test budget-health-demo.spec.ts --debug

# Run with UI mode (interactive)
npx playwright test budget-health-demo.spec.ts --ui

# Run and generate HTML report
npx playwright test budget-health-demo.spec.ts --reporter=html
```

## Test Results

### Screenshots
All screenshots are saved to:
```
frontend/test-results/demo/
├── 01-logged-in.png
├── 02-project-list.png
├── 03-project-opened.png
├── 04-indicator-highlighted.png
├── 05-indicator-closeup.png
└── 06-indicator-tooltip.png
```

### Console Output
The tests provide detailed console output showing:
- Each step being executed
- Component details (status, percentage, color)
- Verification results
- Screenshot locations

## What the Tests Verify

### ✅ Requirement 2.1: Green Indicator (Healthy)
- Verifies green color when utilization < 90%
- Checks for `MuiChip-colorSuccess` class
- Validates status text shows "Healthy"

### ✅ Requirement 2.2: Yellow Indicator (Warning)
- Verifies yellow color when utilization 90-100%
- Checks for `MuiChip-colorWarning` class
- Validates status text shows "Warning"

### ✅ Requirement 2.3: Red Indicator (Critical)
- Verifies red color when utilization > 100%
- Checks for `MuiChip-colorError` class
- Validates status text shows "Critical"

### ✅ Requirement 2.4: Shows Utilization Percentage
- Verifies percentage is displayed
- Checks format (e.g., "75.5%")
- Validates percentage matches status

## Component Location

The Budget Health Indicator can be found at:
```
Component: BudgetHealthIndicator
Location: Project Overview Page
Path: /project-management → [Select Project]
Element: MUI Chip with status text and percentage
```

## Troubleshooting

### Test Fails: "Budget Health Indicator NOT FOUND"

**Possible causes:**
1. **Component not integrated yet** - The component may not be added to the project overview page
2. **No budget data** - The project may not have budget information
3. **Wrong page** - The component may be on a different tab/section

**Solutions:**
1. Check if the component is imported in the project overview page
2. Verify the project has `estimatedBudget` and `actualCost` data
3. Check the API endpoint: `GET /api/projects/{id}/budget/health`

### Test Fails: "Login Failed"

**Solutions:**
1. Verify the backend is running on `http://localhost:5245`
2. Check test credentials are correct
3. Ensure the test user exists in the database

### Test Fails: "No Projects Found"

**Solutions:**
1. Create at least one project in the system
2. Verify the project list API is working
3. Check database has project data

## Manual Testing

If automated tests fail, you can manually verify:

1. **Login** to the application
2. **Navigate** to Project Management
3. **Open** any project
4. **Look for** a colored chip showing:
   - Status: "Healthy", "Warning", or "Critical"
   - Percentage: e.g., "75.5%"
   - Color: Green, Yellow, or Red

## Integration Points

The component integrates with:

### API Endpoint
```
GET /api/projects/{id}/budget/health

Response:
{
  "projectId": 1,
  "status": "Healthy",
  "utilizationPercentage": 75.5,
  "estimatedBudget": 100000,
  "actualCost": 75500
}
```

### Component Usage
```tsx
import { BudgetHealthIndicator } from './components/project/budget';

<BudgetHealthIndicator
  status="Healthy"
  utilizationPercentage={75.5}
/>
```

## Next Steps

After running the tests:

1. **Review Screenshots** - Check `test-results/demo/` folder
2. **Verify Console Output** - Ensure all steps passed
3. **Check Color Coding** - Confirm colors match status
4. **Test Different Projects** - Try projects with different budget statuses

## Support

For issues or questions:
1. Check the component documentation: `BudgetHealthIndicator.md`
2. Review the component code: `BudgetHealthIndicator.tsx`
3. Check the API implementation: Backend budget health endpoint
4. Review test screenshots for visual verification

## Test Maintenance

When updating the component:
1. Update tests if component structure changes
2. Update selectors if CSS classes change
3. Update expected values if logic changes
4. Re-run tests to verify changes

---

**Last Updated:** December 2024  
**Component Version:** 1.0  
**Test Framework:** Playwright
