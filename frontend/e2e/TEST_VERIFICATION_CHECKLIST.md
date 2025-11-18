# E2E Test Verification Checklist

## Pre-Test Setup

- [ ] Backend API is running on `http://localhost:5245`
- [ ] Frontend dev server is running on `http://localhost:5173` or `5176`
- [ ] Test user exists: `test@example.com` / `Admin@123`
- [ ] Test project with ID `1` exists in database
- [ ] Database is accessible and migrations are up to date

---

## Fixed Tests to Verify

### ✅ E2E-1: Complete Workflow
- [ ] Test passes without URL assertion error
- [ ] Successfully navigates through: Login → Project → Update → History
- [ ] Verifies budget update appears in history

### ✅ E2E-2: Budget Update Without Reason
- [ ] Test passes without networkidle timeout
- [ ] Successfully updates budget with empty reason field
- [ ] Verifies optional field works correctly

### ✅ E2E-3: Filter by Cost Changes
- [ ] Test passes without fixed timeout error
- [ ] Successfully filters history by cost changes
- [ ] Verifies only cost changes are shown

### ✅ E2E-4: Filter by Fee Changes
- [ ] Test passes without fixed timeout error
- [ ] Successfully filters history by fee changes
- [ ] Verifies only fee changes are shown

### ✅ E2E-5: API Data Fetching
- [ ] Test passes without API pattern timeout
- [ ] Successfully intercepts API call
- [ ] Verifies correct endpoint is called

### ✅ E2E-6: Dialog Submission
- [ ] Test passes without fixed timeout error
- [ ] Successfully submits budget update
- [ ] Verifies API call completes

### ✅ E2E-7: Timeline Updates
- [ ] Test passes without fixed timeout error
- [ ] Successfully creates budget change
- [ ] Verifies timeline updates with new entry

### ✅ E2E-8: Error Handling
- [ ] Test passes without fixed timeout error
- [ ] Successfully intercepts API and returns error
- [ ] Verifies error message displays

### ✅ E2E-10: Loading States
- [ ] Test passes without networkidle timeout
- [ ] Successfully checks for loading indicator
- [ ] Verifies loading state or data load

### ✅ E2E-13: Database Record Creation
- [ ] Test passes without login timeout
- [ ] Successfully creates budget change
- [ ] Verifies record appears in history

### ✅ E2E-16: Character Limit
- [ ] Test passes without networkidle timeout
- [ ] Successfully validates 501 character limit
- [ ] Verifies validation error displays

---

## Expected Test Results

**Target:** 20/25 tests passing (80%)

**Passing Tests (20):**
- E2E-1, 2, 3, 4, 5, 6, 7, 8, 10, 13, 16 (11 fixed)
- E2E-9, 11, 12, 14, 15, 17, 18 (7 already passing)
- A11Y-1, A11Y-2 (2 already passing)

**Still Failing (3):**
- E2E-19: Budget history page load time (needs data setup)
- BC-1: Chromium compatibility (needs data setup)
- E2E-20: API performance (needs backend optimization)

**Skipped (2):**
- BC-2: Firefox (optional)
- BC-3: WebKit (optional)

---

## Troubleshooting

### If tests still fail:

1. **Check server status:**
   ```bash
   curl http://localhost:5245/health
   curl http://localhost:5173
   ```

2. **Check test user:**
   - Verify user exists in database
   - Verify password is correct
   - Check user has permissions

3. **Check project data:**
   - Verify project ID 1 exists
   - Check project has budget fields
   - Verify user has access to project

4. **Check browser:**
   - Ensure Chromium is installed
   - Run: `npx playwright install chromium`

5. **Check logs:**
   - Review test output for specific errors
   - Check browser console logs
   - Review API logs

---

## Success Criteria

- [ ] At least 20/25 tests passing (80%)
- [ ] All 11 fixed tests pass
- [ ] No timeout errors in fixed tests
- [ ] Test execution completes in reasonable time (<10 minutes)

---

**Status:** Ready for testing ✅
