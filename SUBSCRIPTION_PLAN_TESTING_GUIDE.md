# Subscription Plan and Feature Management - Manual Testing Guide

**Version:** 1.0  
**Date:** February 11, 2026  
**Feature Branch:** feature/kiro/Subscription_Plan_and_Feature  
**PR:** #210

---

## ðŸ“‹ Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Test Environment Setup](#test-environment-setup)
4. [Subscription Plan Management Tests](#subscription-plan-management-tests)
5. [Feature Management Tests](#feature-management-tests)
6. [Tenant Subscription Tests](#tenant-subscription-tests)
7. [Integration Tests](#integration-tests)
8. [Security & Authorization Tests](#security--authorization-tests)
9. [Performance Tests](#performance-tests)
10. [Test Data Reference](#test-data-reference)
11. [Troubleshooting](#troubleshooting)

---

## ðŸŽ¯ Overview

This guide provides step-by-step instructions for manually testing the Subscription Plan and Feature Management functionality in the KarmaTech EDR application.

### What's Being Tested

- **Subscription Plans:** Create, read, update, delete subscription plans
- **Features:** Manage application features and their availability
- **Plan-Feature Mapping:** Associate features with subscription plans
- **Tenant Subscriptions:** Assign plans to tenants and manage subscriptions
- **Access Control:** Verify feature-based access restrictions

---

## âœ… Prerequisites

### Required Tools

- **Postman** or **Insomnia** (API testing)
- **Web Browser** (Chrome, Firefox, or Edge)
- **Database Client** (SQL Server Management Studio or Azure Data Studio)
- **Authentication Token** (JWT token from login)

### Environment Information

- **Backend API Base URL:** `https://localhost:7001` or `http://localhost:5000`
- **Database:** SQL Server (connection string in appsettings.json)
- **Authentication:** JWT Bearer Token required for all endpoints

### Test User Accounts

You'll need accounts with different roles:
- **Admin User:** Full access to all features
- **Regular User:** Limited access based on subscription plan
- **Tenant Admin:** Can manage tenant subscriptions

---

## ðŸ”§ Test Environment Setup

### Step 1: Start the Backend API

```powershell
# Navigate to backend directory
cd backend/src/EDR.API

# Run the API
dotnet run
```

**Expected Output:**
```
Now listening on: https://localhost:7001
Now listening on: http://localhost:5000
Application started. Press Ctrl+C to shut down.
```

### Step 2: Verify Database Seeding

The application automatically seeds subscription plans and features on startup.

**Check Database:**
```sql
-- Verify subscription plans exist
SELECT * FROM SubscriptionPlans;

-- Verify features exist
SELECT * FROM Features;

-- Verify plan-feature mappings
SELECT sp.Name AS PlanName, f.Name AS FeatureName
FROM SubscriptionPlanFeatures spf
JOIN SubscriptionPlans sp ON spf.SubscriptionPlanId = sp.Id
JOIN Features f ON spf.FeatureId = f.Id
ORDER BY sp.Name, f.Name;
```


**Expected Seeded Data:**

| Plan Name | Monthly Price | Max Users | Max Projects | Max Storage |
|-----------|---------------|-----------|--------------|-------------|
| Starter | $100 | 5 | 5 | 10 GB |
| Business | $400 | 20 | 25 | 100 GB |
| Enterprise | Custom | Unlimited | Unlimited | Unlimited |
| One-Time License | $0 | Unlimited | Unlimited | Unlimited |

### Step 3: Obtain Authentication Token

**Login Request:**
```http
POST {{baseUrl}}/api/auth/login
Content-Type: application/json

{
  "email": "admin@karmatech.com",
  "password": "YourPassword123!"
}
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "user-id-here",
  "email": "admin@karmatech.com",
  "roles": ["Admin"]
}
```

**Save the token** - You'll use it in the `Authorization` header for all subsequent requests:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## ðŸ“¦ Subscription Plan Management Tests

### Test 1: Get All Subscription Plans

**Purpose:** Verify all subscription plans can be retrieved

**Request:**
```http
GET {{baseUrl}}/api/subscriptions/plans
Authorization: Bearer {{token}}
```

**Expected Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Starter",
    "description": "Perfect for individuals and small projects",
    "monthlyPrice": 100.00,
    "yearlyPrice": 1000.00,
    "maxUsers": 5,
    "maxProjects": 5,
    "maxStorageGB": 10,
    "isActive": true,
    "stripePriceId": "plan_starter_2024"
  },
  {
    "id": 2,
    "name": "Business",
    "description": "For small to mid-sized teams with advanced needs",
    "monthlyPrice": 400.00,
    "yearlyPrice": 4000.00,
    "maxUsers": 20,
    "maxProjects": 25,
    "maxStorageGB": 100,
    "isActive": true,
    "stripePriceId": "plan_business_2024"
  }
]
```

**Validation Checklist:**
- [ ] Status code is 200 OK
- [ ] Response contains array of plans
- [ ] All 4 seeded plans are present (Starter, Business, Enterprise, One-Time License)
- [ ] Each plan has all required fields
- [ ] Prices are formatted correctly (decimal with 2 places)
- [ ] MaxUsers, MaxProjects, MaxStorageGB show -1 for unlimited plans

---

### Test 2: Get Subscription Plans with Features

**Purpose:** Verify plans can be retrieved with their associated features

**Request:**
```http
GET {{baseUrl}}/api/subscriptions/plans?includeFeatures=true
Authorization: Bearer {{token}}
```

**Expected Response (200 OK):**
```json
{
  "plans": [
    {
      "id": 1,
      "name": "Starter",
      "description": "Perfect for individuals and small projects",
      "monthlyPrice": 100.00,
      "yearlyPrice": 1000.00,
      "maxUsers": 5,
      "maxProjects": 5,
      "maxStorageGB": 10,
      "isActive": true,
      "stripePriceId": "plan_starter_2024",
      "subscriptionPlanFeatures": [
        {
          "id": 1,
          "subscriptionPlanId": 1,
          "featureId": 1,
          "feature": {
            "id": 1,
            "name": "WBS",
            "description": "Work Breakdown Structure",
            "isActive": true
          }
        }
      ]
    }
  ]
}
```

**Validation Checklist:**
- [ ] Status code is 200 OK
- [ ] Response wrapped in `plans` array
- [ ] Each plan includes `subscriptionPlanFeatures` array
- [ ] Features are properly nested with full details
- [ ] Feature names match expected values (WBS, ODC Table, Job Start Form, etc.)

---

### Test 3: Get Single Subscription Plan by ID

**Purpose:** Verify individual plan retrieval

**Request:**
```http
GET {{baseUrl}}/api/subscriptions/plans/1
Authorization: Bearer {{token}}
```

**Expected Response (200 OK):**
```json
{
  "id": 1,
  "name": "Starter",
  "description": "Perfect for individuals and small projects",
  "monthlyPrice": 100.00,
  "yearlyPrice": 1000.00,
  "maxUsers": 5,
  "maxProjects": 5,
  "maxStorageGB": 10,
  "isActive": true,
  "stripePriceId": "plan_starter_2024"
}
```

**Validation Checklist:**
- [ ] Status code is 200 OK
- [ ] Correct plan returned based on ID
- [ ] All fields populated correctly

**Error Case - Non-existent Plan:**
```http
GET {{baseUrl}}/api/subscriptions/plans/999
Authorization: Bearer {{token}}
```

**Expected Response (404 Not Found):**
```json
{
  "message": "Plan not found"
}
```

---

### Test 4: Create New Subscription Plan

**Purpose:** Verify new subscription plans can be created

**Request:**
```http
POST {{baseUrl}}/api/subscriptions/plans
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Premium",
  "description": "Premium plan for power users",
  "monthlyPrice": 250.00,
  "yearlyPrice": 2500.00,
  "maxUsers": 10,
  "maxProjects": 15,
  "maxStorageGB": 50,
  "isActive": true,
  "stripePriceId": "plan_premium_2024"
}
```

**Expected Response (201 Created):**
```json
{
  "id": 5,
  "name": "Premium",
  "description": "Premium plan for power users",
  "monthlyPrice": 250.00,
  "yearlyPrice": 2500.00,
  "maxUsers": 10,
  "maxProjects": 15,
  "maxStorageGB": 50,
  "isActive": true,
  "stripePriceId": "plan_premium_2024"
}
```

**Validation Checklist:**
- [ ] Status code is 201 Created
- [ ] Response includes new plan with generated ID
- [ ] Location header contains URL to new resource
- [ ] Plan appears in database
- [ ] Plan appears in GET all plans request

**Error Cases to Test:**

1. **Missing Required Fields:**
```json
{
  "description": "Missing name field"
}
```
Expected: 400 Bad Request

2. **Invalid Price (Negative):**
```json
{
  "name": "Invalid Plan",
  "monthlyPrice": -100.00
}
```
Expected: 400 Bad Request

---

### Test 5: Update Subscription Plan

**Purpose:** Verify existing plans can be updated

**Request:**
```http
PUT {{baseUrl}}/api/subscriptions/plans/5
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "id": 5,
  "name": "Premium Plus",
  "description": "Enhanced premium plan",
  "monthlyPrice": 300.00,
  "yearlyPrice": 3000.00,
  "maxUsers": 15,
  "maxProjects": 20,
  "maxStorageGB": 75,
  "isActive": true,
  "stripePriceId": "plan_premium_plus_2024"
}
```

**Expected Response (204 No Content)**

**Validation Checklist:**
- [ ] Status code is 204 No Content
- [ ] Changes reflected in database
- [ ] GET request shows updated values
- [ ] Existing tenants using this plan are not affected

**Error Case - ID Mismatch:**
```http
PUT {{baseUrl}}/api/subscriptions/plans/5
Content-Type: application/json

{
  "id": 6,
  "name": "Premium Plus"
}
```
Expected: 400 Bad Request

---

### Test 6: Delete Subscription Plan

**Purpose:** Verify plans can be deleted when not in use

**Request:**
```http
DELETE {{baseUrl}}/api/subscriptions/plans/5
Authorization: Bearer {{token}}
```

**Expected Response (204 No Content)**

**Validation Checklist:**
- [ ] Status code is 204 No Content
- [ ] Plan removed from database
- [ ] Plan no longer appears in GET all plans

**Error Case - Plan In Use:**

First, assign the plan to a tenant, then try to delete:

```http
DELETE {{baseUrl}}/api/subscriptions/plans/1
Authorization: Bearer {{token}}
```

**Expected Response (400 Bad Request):**
```json
{
  "message": "Cannot delete plan. 5 tenants are currently using this plan."
}
```

---

## ðŸŽ¨ Feature Management Tests

### Test 7: Get All Features

**Purpose:** Verify all application features can be retrieved

**Request:**
```http
GET {{baseUrl}}/api/feature
Authorization: Bearer {{token}}
```

**Expected Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "WBS",
    "description": "Work Breakdown Structure",
    "isActive": true
  },
  {
    "id": 2,
    "name": "ODC Table",
    "description": "On-Demand Capacity Table",
    "isActive": true
  },
  {
    "id": 3,
    "name": "Job Start Form",
    "description": "Job initiation form",
    "isActive": true
  }
]
```

**Validation Checklist:**
- [ ] Status code is 200 OK
- [ ] All seeded features present
- [ ] Feature names match expected values
- [ ] IsActive flag is correct

---

### Test 8: Get Feature by ID

**Purpose:** Verify individual feature retrieval

**Request:**
```http
GET {{baseUrl}}/api/feature/1
Authorization: Bearer {{token}}
```

**Expected Response (200 OK):**
```json
{
  "id": 1,
  "name": "WBS",
  "description": "Work Breakdown Structure",
  "isActive": true
}
```

---

### Test 9: Create New Feature

**Purpose:** Verify new features can be created

**Request:**
```http
POST {{baseUrl}}/api/feature
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Advanced Analytics",
  "description": "Advanced reporting and analytics dashboard",
  "isActive": true
}
```

**Expected Response (201 Created):**
```json
{
  "id": 20,
  "name": "Advanced Analytics",
  "description": "Advanced reporting and analytics dashboard",
  "isActive": true
}
```

**Validation Checklist:**
- [ ] Status code is 201 Created
- [ ] New feature has generated ID
- [ ] Feature appears in GET all features
- [ ] Feature can be assigned to plans

---

### Test 10: Update Feature

**Purpose:** Verify features can be updated

**Request:**
```http
PUT {{baseUrl}}/api/feature/20
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "id": 20,
  "name": "Premium Analytics",
  "description": "Premium reporting and analytics with AI insights",
  "isActive": true
}
```

**Expected Response (200 OK):**
```json
{
  "id": 20,
  "name": "Premium Analytics",
  "description": "Premium reporting and analytics with AI insights",
  "isActive": true
}
```

---

### Test 11: Delete Feature

**Purpose:** Verify features can be deleted

**Request:**
```http
DELETE {{baseUrl}}/api/feature/20
Authorization: Bearer {{token}}
```

**Expected Response (204 No Content)**

**Validation Checklist:**
- [ ] Status code is 204 No Content
- [ ] Feature removed from database
- [ ] Associated plan-feature mappings removed

---

## ðŸ”— Plan-Feature Mapping Tests

### Test 12: Add Feature to Plan

**Purpose:** Verify features can be associated with subscription plans

**Request:**
```http
POST {{baseUrl}}/api/subscriptions/plans/1/features/20
Authorization: Bearer {{token}}
```

**Expected Response (200 OK):**
```json
{
  "message": "Feature added to plan successfully"
}
```

**Validation Checklist:**
- [ ] Status code is 200 OK
- [ ] Mapping created in SubscriptionPlanFeatures table
- [ ] Feature appears when getting plan with features
- [ ] Tenants with this plan now have access to the feature

**Verify in Database:**
```sql
SELECT * FROM SubscriptionPlanFeatures 
WHERE SubscriptionPlanId = 1 AND FeatureId = 20;
```

---

### Test 13: Remove Feature from Plan

**Purpose:** Verify features can be removed from subscription plans

**Request:**
```http
DELETE {{baseUrl}}/api/subscriptions/plans/1/features/20
Authorization: Bearer {{token}}
```

**Expected Response (200 OK):**
```json
{
  "message": "Feature removed from plan successfully"
}
```

**Validation Checklist:**
- [ ] Status code is 200 OK
- [ ] Mapping removed from database
- [ ] Feature no longer appears in plan details
- [ ] Tenants with this plan lose access to the feature

---

### Test 14: Get Plan with All Features

**Purpose:** Verify complete feature list for a plan

**Request:**
```http
GET {{baseUrl}}/api/subscriptions/features/by-plan/1
Authorization: Bearer {{token}}
```

**Expected Response (200 OK):**
```json
{
  "plans": [
    {
      "id": 1,
      "name": "Starter",
      "description": "Perfect for individuals and small projects",
      "monthlyPrice": 100.00,
      "yearlyPrice": 1000.00,
      "maxUsers": 5,
      "maxProjects": 5,
      "maxStorageGB": 10,
      "features": [
        {
          "id": 1,
          "name": "WBS",
          "description": "Work Breakdown Structure",
          "isActive": true
        },
        {
          "id": 2,
          "name": "ODC Table",
          "description": "On-Demand Capacity Table",
          "isActive": true
        }
      ]
    }
  ]
}
```

---

## ðŸ‘¥ Tenant Subscription Tests

### Test 15: Create Tenant Subscription

**Purpose:** Verify tenants can be subscribed to plans

**Request:**
```http
POST {{baseUrl}}/api/subscriptions/tenants/1/subscribe
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "planId": 1
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Subscription created successfully"
}
```

**Validation Checklist:**
- [ ] Status code is 200 OK
- [ ] Tenant's SubscriptionPlanId updated in database
- [ ] Tenant can access features from the plan
- [ ] Tenant limitations applied (MaxUsers, MaxProjects, MaxStorage)

**Verify in Database:**
```sql
SELECT t.Name, t.SubscriptionPlanId, sp.Name AS PlanName
FROM Tenants t
LEFT JOIN SubscriptionPlans sp ON t.SubscriptionPlanId = sp.Id
WHERE t.Id = 1;
```

---

### Test 16: Update Tenant Subscription (Upgrade/Downgrade)

**Purpose:** Verify tenant subscriptions can be changed

**Scenario 1: Upgrade from Starter to Business**

**Request:**
```http
PUT {{baseUrl}}/api/subscriptions/tenants/1/plan
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "planId": 2
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Subscription updated successfully"
}
```

**Validation Checklist:**
- [ ] Tenant's plan updated to Business
- [ ] New features from Business plan accessible
- [ ] New limitations applied (20 users, 25 projects, 100GB)
- [ ] Old Starter features still accessible (if included in Business)

**Scenario 2: Downgrade from Business to Starter**

Same request with `planId: 1`

**Additional Validation:**
- [ ] Check if tenant exceeds new limits (users, projects, storage)
- [ ] System should warn or prevent downgrade if limits exceeded

---

### Test 17: Cancel Tenant Subscription

**Purpose:** Verify tenant subscriptions can be cancelled

**Request:**
```http
POST {{baseUrl}}/api/subscriptions/tenants/1/cancel
Authorization: Bearer {{token}}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Subscription cancelled successfully"
}
```

**Validation Checklist:**
- [ ] Tenant's SubscriptionPlanId set to NULL
- [ ] Tenant loses access to all plan features
- [ ] Tenant status may change to Inactive or Suspended
- [ ] Data retained but access restricted

---

## ðŸ“Š Integration Tests

### Test 18: Complete Subscription Workflow

**Purpose:** Test end-to-end subscription lifecycle

**Step 1: Create New Tenant**
```http
POST {{baseUrl}}/api/tenants
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Test Company Inc",
  "domain": "testcompany.com",
  "status": "Active"
}
```

**Step 2: Subscribe Tenant to Starter Plan**
```http
POST {{baseUrl}}/api/subscriptions/tenants/{tenantId}/subscribe
Content-Type: application/json

{
  "planId": 1
}
```

**Step 3: Verify Feature Access**
```http
GET {{baseUrl}}/api/subscriptions/features/by-plan/1
```

**Step 4: Upgrade to Business Plan**
```http
PUT {{baseUrl}}/api/subscriptions/tenants/{tenantId}/plan
Content-Type: application/json

{
  "planId": 2
}
```

**Step 5: Add Custom Feature to Plan**
```http
POST {{baseUrl}}/api/subscriptions/plans/2/features/20
```

**Step 6: Verify New Feature Access**
```http
GET {{baseUrl}}/api/subscriptions/features/by-plan/2
```

**Step 7: Cancel Subscription**
```http
POST {{baseUrl}}/api/subscriptions/tenants/{tenantId}/cancel
```

**Validation Checklist:**
- [ ] All steps complete successfully
- [ ] Feature access changes correctly at each step
- [ ] Database reflects all changes
- [ ] No orphaned records or broken relationships

---

### Test 19: Subscription Statistics

**Purpose:** Verify subscription analytics and reporting

**Request:**
```http
GET {{baseUrl}}/api/subscriptions/stats
Authorization: Bearer {{token}}
```

**Expected Response (200 OK):**
```json
{
  "totalPlans": 4,
  "activePlans": 4,
  "totalSubscribers": 12,
  "monthlyRevenue": 3200.00
}
```

**Validation Checklist:**
- [ ] Total plans count is correct
- [ ] Active plans count excludes inactive plans
- [ ] Total subscribers matches tenant count with subscriptions
- [ ] Monthly revenue calculation is accurate

**Verify Calculation:**
```sql
SELECT 
    COUNT(DISTINCT sp.Id) AS TotalPlans,
    COUNT(DISTINCT CASE WHEN sp.IsActive = 1 THEN sp.Id END) AS ActivePlans,
    COUNT(DISTINCT t.Id) AS TotalSubscribers,
    SUM(sp.MonthlyPrice) AS MonthlyRevenue
FROM Tenants t
LEFT JOIN SubscriptionPlans sp ON t.SubscriptionPlanId = sp.Id
WHERE t.Status = 'Active';
```

---

## ðŸ”’ Security & Authorization Tests

### Test 20: Unauthorized Access

**Purpose:** Verify endpoints require authentication

**Request (No Token):**
```http
GET {{baseUrl}}/api/subscriptions/plans
```

**Expected Response (401 Unauthorized):**
```json
{
  "message": "Unauthorized"
}
```

---

### Test 21: Invalid Token

**Purpose:** Verify invalid tokens are rejected

**Request:**
```http
GET {{baseUrl}}/api/subscriptions/plans
Authorization: Bearer invalid_token_here
```

**Expected Response (401 Unauthorized)**

---

### Test 22: Expired Token

**Purpose:** Verify expired tokens are rejected

Use a token that has expired (wait for expiration or use an old token)

**Expected Response (401 Unauthorized):**
```json
{
  "message": "Token has expired"
}
```

---

### Test 23: Role-Based Access Control

**Purpose:** Verify only authorized roles can manage subscriptions

**Test with Regular User (Non-Admin):**
```http
POST {{baseUrl}}/api/subscriptions/plans
Authorization: Bearer {{regularUserToken}}
Content-Type: application/json

{
  "name": "Unauthorized Plan"
}
```

**Expected Response (403 Forbidden):**
```json
{
  "message": "Insufficient permissions"
}
```

---

## âš¡ Performance Tests

### Test 24: Load Testing - Get All Plans

**Purpose:** Verify performance under load

**Tool:** Apache JMeter or Postman Runner

**Test Configuration:**
- Concurrent Users: 50
- Requests per User: 10
- Total Requests: 500

**Acceptance Criteria:**
- [ ] Average response time < 500ms
- [ ] 95th percentile < 1000ms
- [ ] 0% error rate
- [ ] No database connection pool exhaustion

---

### Test 25: Large Dataset Performance

**Purpose:** Test performance with many plans and features

**Setup:**
1. Create 100 subscription plans
2. Create 50 features
3. Create 500 plan-feature mappings

**Test Request:**
```http
GET {{baseUrl}}/api/subscriptions/plans?includeFeatures=true
```

**Acceptance Criteria:**
- [ ] Response time < 2 seconds
- [ ] No timeout errors
- [ ] Proper pagination if implemented
- [ ] Memory usage remains stable

---

## ðŸ“š Test Data Reference

### Seeded Subscription Plans

| ID | Name | Monthly | Yearly | Users | Projects | Storage |
|----|------|---------|--------|-------|----------|---------|
| 1 | Starter | $100 | $1,000 | 5 | 5 | 10 GB |
| 2 | Business | $400 | $4,000 | 20 | 25 | 100 GB |
| 3 | Enterprise | Custom | Custom | âˆž | âˆž | âˆž |
| 4 | One-Time License | $0 | $0 | âˆž | âˆž | âˆž |

### Seeded Features (Starter Plan)

1. WBS (Work Breakdown Structure)
2. ODC Table
3. Job Start Form
4. Input Register
5. Email Notifications
6. Monthly Progress Review
7. Manpower Planning

### Seeded Features (Business Plan - Additional)

8. Go/No-Go Decision
9. Project Budget
10. Correspondence Management
11. Change Control
12. Risk Management
13. Quality Management

### Seeded Features (Enterprise Plan - Additional)

14. Advanced Analytics
15. Custom Workflows
16. API Access
17. White Labeling
18. Priority Support
19. Custom Integrations

---

## ðŸ”§ Troubleshooting

### Issue 1: "Subscription plan not found"

**Symptoms:** 404 error when accessing plans

**Solutions:**
1. Verify database seeding completed successfully
2. Check database connection string
3. Run migrations: `dotnet ef database update`
4. Check application logs for seeding errors

---

### Issue 2: "Cannot add feature to plan"

**Symptoms:** 400 error when adding features

**Solutions:**
1. Verify feature ID exists: `SELECT * FROM Features WHERE Id = X`
2. Verify plan ID exists: `SELECT * FROM SubscriptionPlans WHERE Id = X`
3. Check for duplicate mapping
4. Verify foreign key constraints

---

### Issue 3: "Unauthorized" errors

**Symptoms:** 401 errors on all requests

**Solutions:**
1. Verify token is included in Authorization header
2. Check token format: `Bearer {token}`
3. Verify token hasn't expired
4. Re-login to get fresh token
5. Check API authentication configuration

---

### Issue 4: Performance degradation

**Symptoms:** Slow response times

**Solutions:**
1. Check database indexes on SubscriptionPlanFeatures table
2. Verify connection pooling is configured
3. Check for N+1 query problems
4. Enable query logging to identify slow queries
5. Consider implementing caching for frequently accessed plans

---

### Issue 5: Database connection errors

**Symptoms:** "Cannot connect to database"

**Solutions:**
1. Verify SQL Server is running
2. Check connection string in appsettings.json
3. Verify database exists
4. Check firewall rules
5. Verify SQL Server authentication mode

---

## âœ… Test Completion Checklist

### Subscription Plan Management
- [ ] Get all plans
- [ ] Get plans with features
- [ ] Get single plan by ID
- [ ] Create new plan
- [ ] Update existing plan
- [ ] Delete plan (success and error cases)

### Feature Management
- [ ] Get all features
- [ ] Get feature by ID
- [ ] Create new feature
- [ ] Update feature
- [ ] Delete feature

### Plan-Feature Mapping
- [ ] Add feature to plan
- [ ] Remove feature from plan
- [ ] Get plan with all features

### Tenant Subscriptions
- [ ] Create tenant subscription
- [ ] Update tenant subscription (upgrade)
- [ ] Update tenant subscription (downgrade)
- [ ] Cancel tenant subscription

### Integration Tests
- [ ] Complete subscription workflow
- [ ] Subscription statistics

### Security Tests
- [ ] Unauthorized access blocked
- [ ] Invalid token rejected
- [ ] Expired token rejected
- [ ] Role-based access enforced

### Performance Tests
- [ ] Load testing passed
- [ ] Large dataset performance acceptable

---

## ðŸ“ Test Report Template

After completing all tests, document results:

```markdown
# Subscription Plan Testing Report

**Date:** [Date]
**Tester:** [Your Name]
**Environment:** [Dev/Staging/Production]
**Build Version:** [Version]

## Summary
- Total Tests: 25
- Passed: X
- Failed: X
- Blocked: X
- Pass Rate: X%

## Failed Tests
1. Test #X: [Test Name]
   - Expected: [Expected Result]
   - Actual: [Actual Result]
   - Severity: [Critical/High/Medium/Low]
   - Notes: [Additional details]

## Performance Metrics
- Average API Response Time: Xms
- Peak Memory Usage: XMB
- Database Query Count: X

## Recommendations
1. [Recommendation 1]
2. [Recommendation 2]

## Sign-off
- [ ] All critical tests passed
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Ready for production: YES/NO
```

---

## ðŸŽ¯ Next Steps

After completing manual testing:

1. **Document Results:** Fill out test report template
2. **Log Defects:** Create issues for any failures
3. **Update Documentation:** Note any API changes
4. **Automated Tests:** Convert manual tests to automated tests
5. **Performance Baseline:** Record performance metrics for future comparison
6. **Security Audit:** Schedule security review if needed

---

**Questions or Issues?**
Contact the development team or refer to:
- API Documentation: `/docs/api`
- Architecture Guide: `/docs/architecture`
- Database Schema: `/docs/database`

---

**End of Testing Guide**


---

# ðŸ–¥ï¸ FRONTEND APPLICATION TESTING

## Overview

This section covers manual testing of the subscription plan and feature management functionality through the web application UI.

---

## ðŸš€ Frontend Environment Setup

### Step 1: Start the Frontend Application

```powershell
# Navigate to frontend directory
cd frontend

# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms

âžœ  Local:   http://localhost:5173/
âžœ  Network: use --host to expose
âžœ  press h + enter to show help
```

### Step 2: Access the Application

1. Open your web browser
2. Navigate to: `http://localhost:5173/`
3. You should see the login page

### Step 3: Login with Admin Account

**Test Credentials:**
- **Email:** `admin@karmatech.com`
- **Password:** `YourPassword123!`

**Expected Result:**
- Successful login
- Redirect to dashboard/home page
- User menu shows logged-in user

---

## ðŸ“‹ Frontend Test Cases

---

## TEST SUITE 1: Admin Panel Access

### Test F1: Navigate to Subscription Management

**Purpose:** Verify admin can access subscription management interface

**Steps:**
1. Login as admin user
2. Click on the **hamburger menu** (â˜°) or **Admin Panel** link
3. Look for **"Subscription Plans"** in the sidebar menu
4. Click on **"Subscription Plans"**

**Expected Results:**
- [ ] Subscription Plans menu item is visible
- [ ] Menu item has a dollar sign icon ($)
- [ ] Clicking opens the Subscription Management page
- [ ] Page title shows "Subscription Plans"
- [ ] "Add Plan" button is visible in top-right corner

**Screenshot Location:** Take screenshot of Subscription Management page

---

### Test F2: View Subscription Statistics Dashboard

**Purpose:** Verify subscription statistics are displayed correctly

**Steps:**
1. Navigate to Subscription Plans page
2. Observe the statistics cards at the top

**Expected Results:**
- [ ] **Total Plans** card shows correct count (should be 4 for seeded data)
- [ ] **Active Plans** card shows count of active plans
- [ ] **Total Subscribers** card shows number of tenants with subscriptions
- [ ] **Monthly Revenue** card shows calculated revenue
- [ ] All numbers are formatted correctly (no NaN or undefined)
- [ ] Cards are responsive and well-aligned

**Validation:**
Compare displayed numbers with database:
```sql
SELECT 
    (SELECT COUNT(*) FROM SubscriptionPlans) AS TotalPlans,
    (SELECT COUNT(*) FROM SubscriptionPlans WHERE IsActive = 1) AS ActivePlans,
    (SELECT COUNT(*) FROM Tenants WHERE SubscriptionPlanId IS NOT NULL) AS TotalSubscribers
```

---

### Test F3: View Subscription Plans Table

**Purpose:** Verify all subscription plans are displayed in the table

**Steps:**
1. Scroll down to the subscription plans table
2. Review each column and row

**Expected Results:**
- [ ] Table displays all 4 seeded plans (Starter, Business, Enterprise, One-Time License)
- [ ] **Plan Name** column shows name and description
- [ ] **Pricing** column shows monthly and yearly prices
- [ ] **Limits** column shows chips for Users, Projects, and Storage
- [ ] **Features** column shows feature chips (hover shows description)
- [ ] **Subscribers** column shows count
- [ ] **Status** column shows Active/Inactive chip (green for active)
- [ ] **Actions** column shows Edit and Delete icons
- [ ] Table is scrollable if content overflows
- [ ] All data matches database records

---

## TEST SUITE 2: Create Subscription Plan

### Test F4: Open Create Plan Dialog

**Purpose:** Verify create plan dialog opens correctly

**Steps:**
1. Click **"Add Plan"** button in top-right corner

**Expected Results:**
- [ ] Dialog opens with title "Add New Subscription Plan"
- [ ] All form fields are empty/default values
- [ ] Form includes fields:
  - Plan Name (text)
  - Description (multiline text)
  - Monthly Price (number)
  - Yearly Price (number)
  - Max Users (number)
  - Max Projects (number)
  - Max Storage GB (number)
  - Active (toggle switch - default ON)
  - Features (checkboxes for each feature)
- [ ] "Cancel" and "Create" buttons visible at bottom
- [ ] Features section shows all available features with checkboxes

---

### Test F5: Create New Subscription Plan - Success

**Purpose:** Verify new subscription plan can be created successfully

**Test Data:**
```
Plan Name: Premium
Description: Premium plan for power users
Monthly Price: 250
Yearly Price: 2500
Max Users: 10
Max Projects: 15
Max Storage: 50
Active: Yes (checked)
Features: Select "WBS", "ODC Table", "Job Start Form"
```

**Steps:**
1. Click "Add Plan" button
2. Fill in all fields with test data above
3. Check the checkboxes for WBS, ODC Table, and Job Start Form
4. Click **"Create"** button

**Expected Results:**
- [ ] Dialog closes automatically
- [ ] Success message appears (if implemented)
- [ ] New "Premium" plan appears in the table
- [ ] Plan shows correct pricing: $250/month, $2500/year
- [ ] Plan shows correct limits: 10 Users, 15 Projects, 50GB Storage
- [ ] Plan shows 3 feature chips (WBS, ODC Table, Job Start Form)
- [ ] Plan status shows "Active" (green chip)
- [ ] Subscribers count shows 0
- [ ] Statistics cards update (Total Plans increases by 1)

**Database Verification:**
```sql
SELECT * FROM SubscriptionPlans WHERE Name = 'Premium';
SELECT * FROM SubscriptionPlanFeatures WHERE SubscriptionPlanId = (SELECT Id FROM SubscriptionPlans WHERE Name = 'Premium');
```

---

### Test F6: Create Plan - Validation Errors

**Purpose:** Verify form validation works correctly

**Test Cases:**

**Case 1: Empty Plan Name**
- Leave Plan Name empty
- Fill other required fields
- Click "Create"
- **Expected:** Error message "Plan name is required" or field highlighted in red

**Case 2: Negative Price**
- Enter -100 in Monthly Price
- **Expected:** Field doesn't accept negative value or shows error

**Case 3: Zero Max Users**
- Enter 0 in Max Users
- **Expected:** Error message or minimum value enforced (1)

**Case 4: No Features Selected**
- Don't select any features
- **Expected:** Plan created successfully (features are optional) OR warning message

---

## TEST SUITE 3: Edit Subscription Plan

### Test F7: Open Edit Plan Dialog

**Purpose:** Verify edit dialog opens with existing plan data

**Steps:**
1. Find the "Premium" plan in the table
2. Click the **Edit icon** (pencil) in the Actions column

**Expected Results:**
- [ ] Dialog opens with title "Edit Subscription Plan"
- [ ] All fields are pre-filled with existing plan data
- [ ] Plan Name shows "Premium"
- [ ] Description shows "Premium plan for power users"
- [ ] Prices show $250 and $2500
- [ ] Limits show 10, 15, 50
- [ ] Active toggle is ON
- [ ] Previously selected features (WBS, ODC Table, Job Start Form) are checked
- [ ] "Cancel" and "Update" buttons visible

---

### Test F8: Update Subscription Plan - Success

**Purpose:** Verify subscription plan can be updated

**Changes to Make:**
```
Plan Name: Premium Plus (changed)
Monthly Price: 300 (changed from 250)
Yearly Price: 3000 (changed from 2500)
Max Users: 15 (changed from 10)
Add Feature: "Input Register" (check the box)
Remove Feature: "ODC Table" (uncheck the box)
```

**Steps:**
1. Click Edit icon for "Premium" plan
2. Make the changes listed above
3. Click **"Update"** button

**Expected Results:**
- [ ] Dialog closes automatically
- [ ] Plan name updates to "Premium Plus" in table
- [ ] Pricing updates to $300/month, $3000/year
- [ ] Limits update to 15 Users
- [ ] Features now show: WBS, Job Start Form, Input Register (3 chips)
- [ ] ODC Table feature is removed
- [ ] No duplicate entries created
- [ ] Statistics remain consistent

**Database Verification:**
```sql
SELECT * FROM SubscriptionPlans WHERE Name = 'Premium Plus';
SELECT f.Name FROM SubscriptionPlanFeatures spf
JOIN Features f ON spf.FeatureId = f.Id
WHERE spf.SubscriptionPlanId = (SELECT Id FROM SubscriptionPlans WHERE Name = 'Premium Plus');
```

---

### Test F9: Update Plan - Cancel Changes

**Purpose:** Verify cancel button discards changes

**Steps:**
1. Click Edit icon for any plan
2. Make some changes to the form
3. Click **"Cancel"** button

**Expected Results:**
- [ ] Dialog closes
- [ ] No changes saved to database
- [ ] Table shows original data
- [ ] No error messages

---

## TEST SUITE 4: Delete Subscription Plan

### Test F10: Delete Plan - Success (No Subscribers)

**Purpose:** Verify plan can be deleted when not in use

**Steps:**
1. Find "Premium Plus" plan (should have 0 subscribers)
2. Click the **Delete icon** (trash can) in Actions column
3. Confirm deletion in the confirmation dialog

**Expected Results:**
- [ ] Confirmation dialog appears with message: "Are you sure you want to delete this subscription plan? This action cannot be undone."
- [ ] Dialog has "Cancel" and "OK/Confirm" buttons
- [ ] After confirming, plan is removed from table
- [ ] Statistics update (Total Plans decreases by 1)
- [ ] No error messages
- [ ] Plan removed from database

**Database Verification:**
```sql
SELECT * FROM SubscriptionPlans WHERE Name = 'Premium Plus';
-- Should return 0 rows
```

---

### Test F11: Delete Plan - Error (Has Subscribers)

**Purpose:** Verify plan cannot be deleted when in use

**Steps:**
1. Try to delete "Starter" plan (should have subscribers)
2. Click Delete icon
3. Confirm deletion

**Expected Results:**
- [ ] Error message appears: "Cannot delete plan. X tenants are currently using this plan."
- [ ] Plan remains in table
- [ ] Plan still exists in database
- [ ] Error message is user-friendly and clear

---

## TEST SUITE 5: Feature Management Integration

### Test F12: View Features in Plan

**Purpose:** Verify features are displayed correctly for each plan

**Steps:**
1. Review the Features column for each plan in the table
2. Hover over each feature chip

**Expected Results:**
- [ ] Each plan shows its associated features as colored chips
- [ ] Hovering over a feature chip shows a tooltip with feature description
- [ ] Feature names are readable and not truncated
- [ ] If a plan has many features, they wrap to multiple lines
- [ ] If a plan has no features, it shows "No features" text

---

### Test F13: Add/Remove Features from Plan

**Purpose:** Verify features can be added and removed from plans

**Steps:**
1. Edit the "Starter" plan
2. Note currently selected features
3. Add 2 new features (check their boxes)
4. Remove 1 existing feature (uncheck its box)
5. Click "Update"

**Expected Results:**
- [ ] Dialog closes
- [ ] Features column updates immediately
- [ ] New features appear as chips
- [ ] Removed feature disappears
- [ ] Feature count is correct
- [ ] Changes persist after page refresh

---

## TEST SUITE 6: Tenant Subscription Management

### Test F14: Navigate to Tenant Management

**Purpose:** Verify tenant management interface is accessible

**Steps:**
1. From Admin Panel sidebar
2. Click **"Tenant Management"**

**Expected Results:**
- [ ] Tenant Management page loads
- [ ] Table shows list of tenants
- [ ] "Add Tenant" button visible
- [ ] Table includes "Subscription Plan" column

---

### Test F15: Assign Subscription to Tenant

**Purpose:** Verify subscription plan can be assigned to tenant

**Steps:**
1. Click "Add Tenant" or Edit an existing tenant
2. Fill in tenant details:
   - Name: "Test Company Inc"
   - Domain: "testcompany.com"
   - Contact Email: "admin@testcompany.com"
   - Status: Active
3. In **"Subscription Plan"** dropdown, select "Starter"
4. Click "Create" or "Update"

**Expected Results:**
- [ ] Tenant created/updated successfully
- [ ] Tenant appears in table with "Starter" plan shown
- [ ] Subscription Plan column shows "Starter" and "$100/month"
- [ ] Tenant can now access features from Starter plan
- [ ] Starter plan's subscriber count increases by 1
- [ ] Monthly Revenue in Subscription Management increases by $100

**Database Verification:**
```sql
SELECT t.Name, t.SubscriptionPlanId, sp.Name AS PlanName
FROM Tenants t
LEFT JOIN SubscriptionPlans sp ON t.SubscriptionPlanId = sp.Id
WHERE t.Name = 'Test Company Inc';
```

---

### Test F16: Change Tenant Subscription (Upgrade)

**Purpose:** Verify tenant can be upgraded to different plan

**Steps:**
1. Find "Test Company Inc" tenant
2. Click Edit icon
3. Change Subscription Plan dropdown from "Starter" to "Business"
4. Click "Update"

**Expected Results:**
- [ ] Tenant updated successfully
- [ ] Subscription Plan column now shows "Business" and "$400/month"
- [ ] Starter plan subscriber count decreases by 1
- [ ] Business plan subscriber count increases by 1
- [ ] Monthly Revenue updates correctly (+$300)
- [ ] Tenant now has access to Business plan features

---

### Test F17: Remove Subscription from Tenant

**Purpose:** Verify subscription can be removed from tenant

**Steps:**
1. Edit "Test Company Inc" tenant
2. Change Subscription Plan dropdown to "No Plan" (empty option)
3. Click "Update"

**Expected Results:**
- [ ] Tenant updated successfully
- [ ] Subscription Plan column shows empty or "No Plan"
- [ ] Business plan subscriber count decreases by 1
- [ ] Monthly Revenue decreases by $400
- [ ] Tenant loses access to plan features

---

## TEST SUITE 7: Responsive Design & UI/UX

### Test F18: Mobile Responsiveness

**Purpose:** Verify UI works on mobile devices

**Steps:**
1. Open browser DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select mobile device (iPhone 12, Samsung Galaxy, etc.)
4. Navigate through Subscription Management

**Expected Results:**
- [ ] Page layout adjusts to mobile screen
- [ ] Statistics cards stack vertically
- [ ] Table is scrollable horizontally or shows mobile-friendly view
- [ ] Buttons are touch-friendly (adequate size)
- [ ] Dialog forms are usable on mobile
- [ ] No horizontal scrolling on main page
- [ ] Text is readable without zooming

---

### Test F19: Tablet Responsiveness

**Purpose:** Verify UI works on tablet devices

**Steps:**
1. In DevTools, select iPad or tablet device
2. Test in both portrait and landscape orientations

**Expected Results:**
- [ ] Layout adapts appropriately
- [ ] Statistics cards show 2 per row
- [ ] Table columns are visible without excessive scrolling
- [ ] Forms are well-spaced and usable

---

### Test F20: Browser Compatibility

**Purpose:** Verify application works across different browsers

**Browsers to Test:**
- Chrome (latest)
- Firefox (latest)
- Edge (latest)
- Safari (if on Mac)

**Steps:**
1. Open application in each browser
2. Perform basic operations (view, create, edit, delete)

**Expected Results:**
- [ ] Application loads correctly in all browsers
- [ ] All features work consistently
- [ ] No console errors
- [ ] Styling appears consistent
- [ ] Dialogs and modals work properly

---

## TEST SUITE 8: Error Handling & Edge Cases

### Test F21: Network Error Handling

**Purpose:** Verify graceful handling of network errors

**Steps:**
1. Open browser DevTools â†’ Network tab
2. Set throttling to "Offline"
3. Try to load Subscription Plans page
4. Try to create/edit a plan

**Expected Results:**
- [ ] User-friendly error message appears
- [ ] Message indicates network/connection issue
- [ ] Application doesn't crash
- [ ] Error can be dismissed
- [ ] Retry mechanism available (if implemented)

---

### Test F22: Loading States

**Purpose:** Verify loading indicators are shown

**Steps:**
1. Refresh Subscription Management page
2. Observe initial load
3. Create/edit/delete a plan and observe

**Expected Results:**
- [ ] Loading spinner shows while fetching data
- [ ] Buttons show loading state during operations
- [ ] User cannot submit form multiple times
- [ ] Loading indicators are visually clear

---

### Test F23: Empty State Handling

**Purpose:** Verify UI handles empty data gracefully

**Steps:**
1. Delete all subscription plans (in test environment)
2. Observe the table

**Expected Results:**
- [ ] Table shows "No data" or empty state message
- [ ] Statistics show 0 for all metrics
- [ ] "Add Plan" button still accessible
- [ ] No JavaScript errors in console

---

## TEST SUITE 9: Data Persistence & Refresh

### Test F24: Data Persistence After Page Refresh

**Purpose:** Verify changes persist after browser refresh

**Steps:**
1. Create a new subscription plan
2. Press F5 or click browser refresh
3. Verify the new plan is still visible

**Expected Results:**
- [ ] New plan appears after refresh
- [ ] All data is accurate
- [ ] No data loss

---

### Test F25: Real-time Updates (if applicable)

**Purpose:** Verify UI updates when data changes

**Steps:**
1. Open Subscription Management in two browser tabs
2. In Tab 1, create a new plan
3. Switch to Tab 2 and refresh

**Expected Results:**
- [ ] New plan appears in Tab 2 after refresh
- [ ] Statistics update correctly
- [ ] No stale data displayed

---

## TEST SUITE 10: Security & Authorization

### Test F26: Non-Admin User Access

**Purpose:** Verify non-admin users cannot access subscription management

**Steps:**
1. Logout from admin account
2. Login with regular user account (non-admin)
3. Try to access Admin Panel

**Expected Results:**
- [ ] "Subscription Plans" menu item is hidden OR
- [ ] Clicking shows "Access Denied" message
- [ ] User cannot view subscription data
- [ ] User cannot create/edit/delete plans

---

### Test F27: Session Timeout Handling

**Purpose:** Verify application handles expired sessions

**Steps:**
1. Login and navigate to Subscription Management
2. Wait for session to expire (or manually clear token)
3. Try to perform an action (create/edit plan)

**Expected Results:**
- [ ] Error message indicates session expired
- [ ] User redirected to login page
- [ ] After re-login, user returns to previous page
- [ ] No data corruption

---

## ðŸ“Š Frontend Test Results Template

```markdown
# Frontend Test Execution Report

**Date:** [Date]
**Tester:** [Name]
**Browser:** [Chrome/Firefox/Edge/Safari]
**Screen Resolution:** [1920x1080 / Mobile / Tablet]

## Test Summary
- Total Tests: 27
- Passed: ___
- Failed: ___
- Blocked: ___
- Pass Rate: ___%

## Test Results by Suite

### Suite 1: Admin Panel Access (F1-F3)
- F1: â˜ Pass â˜ Fail - Navigate to Subscription Management
- F2: â˜ Pass â˜ Fail - View Statistics Dashboard
- F3: â˜ Pass â˜ Fail - View Plans Table

### Suite 2: Create Subscription Plan (F4-F6)
- F4: â˜ Pass â˜ Fail - Open Create Dialog
- F5: â˜ Pass â˜ Fail - Create Plan Success
- F6: â˜ Pass â˜ Fail - Validation Errors

### Suite 3: Edit Subscription Plan (F7-F9)
- F7: â˜ Pass â˜ Fail - Open Edit Dialog
- F8: â˜ Pass â˜ Fail - Update Plan Success
- F9: â˜ Pass â˜ Fail - Cancel Changes

### Suite 4: Delete Subscription Plan (F10-F11)
- F10: â˜ Pass â˜ Fail - Delete Success
- F11: â˜ Pass â˜ Fail - Delete Error (In Use)

### Suite 5: Feature Management (F12-F13)
- F12: â˜ Pass â˜ Fail - View Features
- F13: â˜ Pass â˜ Fail - Add/Remove Features

### Suite 6: Tenant Subscription (F14-F17)
- F14: â˜ Pass â˜ Fail - Navigate to Tenants
- F15: â˜ Pass â˜ Fail - Assign Subscription
- F16: â˜ Pass â˜ Fail - Upgrade Subscription
- F17: â˜ Pass â˜ Fail - Remove Subscription

### Suite 7: Responsive Design (F18-F20)
- F18: â˜ Pass â˜ Fail - Mobile Responsiveness
- F19: â˜ Pass â˜ Fail - Tablet Responsiveness
- F20: â˜ Pass â˜ Fail - Browser Compatibility

### Suite 8: Error Handling (F21-F23)
- F21: â˜ Pass â˜ Fail - Network Errors
- F22: â˜ Pass â˜ Fail - Loading States
- F23: â˜ Pass â˜ Fail - Empty States

### Suite 9: Data Persistence (F24-F25)
- F24: â˜ Pass â˜ Fail - After Refresh
- F25: â˜ Pass â˜ Fail - Real-time Updates

### Suite 10: Security (F26-F27)
- F26: â˜ Pass â˜ Fail - Non-Admin Access
- F27: â˜ Pass â˜ Fail - Session Timeout

## Failed Tests Details

### Test F#: [Test Name]
- **Expected:** [What should happen]
- **Actual:** [What actually happened]
- **Steps to Reproduce:**
  1. Step 1
  2. Step 2
- **Screenshot:** [Attach screenshot]
- **Console Errors:** [Any errors from browser console]
- **Severity:** Critical / High / Medium / Low

## UI/UX Observations
- [Note any UI issues, suggestions, or improvements]

## Performance Notes
- Page load time: ___ seconds
- Dialog open time: ___ ms
- Table render time: ___ ms

## Recommendations
1. [Recommendation 1]
2. [Recommendation 2]

## Sign-off
- [ ] All critical tests passed
- [ ] UI is user-friendly
- [ ] No blocking issues
- [ ] Ready for production: YES / NO

**Tester Signature:** _______________
**Date:** _______________
```

---

## ðŸŽ¯ Frontend Testing Best Practices

### Before Testing
1. Clear browser cache and cookies
2. Use incognito/private mode for clean state
3. Check browser console for errors
4. Verify backend API is running
5. Ensure test data is seeded

### During Testing
1. Take screenshots of each major step
2. Note any console errors or warnings
3. Test both success and error scenarios
4. Verify data in database after UI operations
5. Test with different user roles

### After Testing
1. Document all findings
2. Create bug reports for failures
3. Suggest UI/UX improvements
4. Verify fixes for reported issues
5. Perform regression testing

---

## ðŸ” Common Frontend Issues & Solutions

### Issue 1: "Plans not loading"
**Symptoms:** Empty table, loading spinner forever

**Solutions:**
1. Check browser console for API errors
2. Verify backend API is running
3. Check network tab for failed requests
4. Verify authentication token is valid
5. Check CORS configuration

---

### Issue 2: "Create plan button not working"
**Symptoms:** Nothing happens when clicking button

**Solutions:**
1. Check console for JavaScript errors
2. Verify button is not disabled
3. Check if dialog is opening behind other elements
4. Verify event handlers are attached
5. Check for z-index issues

---

### Issue 3: "Features not displaying"
**Symptoms:** Feature chips not showing or showing incorrectly

**Solutions:**
1. Verify API returns features in correct format
2. Check if features array is populated
3. Verify feature IDs match between plan and features
4. Check CSS for hidden elements
5. Verify data mapping in component

---

### Issue 4: "Form validation not working"
**Symptoms:** Can submit invalid data

**Solutions:**
1. Check if validation rules are defined
2. Verify required attribute on inputs
3. Check form submission handler
4. Verify backend validation as fallback
5. Check for JavaScript errors preventing validation

---

### Issue 5: "Statistics showing wrong numbers"
**Symptoms:** Incorrect counts or revenue

**Solutions:**
1. Verify calculation logic in component
2. Check if data is filtered correctly
3. Verify API returns correct data
4. Check for null/undefined values
5. Verify number formatting functions

---

## âœ… Frontend Testing Completion Checklist

### Pre-Testing
- [ ] Frontend application running
- [ ] Backend API running
- [ ] Database seeded with test data
- [ ] Admin user account available
- [ ] Browser DevTools ready

### Core Functionality
- [ ] Can view all subscription plans
- [ ] Can create new subscription plan
- [ ] Can edit existing subscription plan
- [ ] Can delete subscription plan
- [ ] Can add features to plan
- [ ] Can remove features from plan
- [ ] Can assign plan to tenant
- [ ] Can change tenant's plan
- [ ] Statistics display correctly

### UI/UX
- [ ] All buttons work
- [ ] All forms validate correctly
- [ ] Dialogs open and close properly
- [ ] Tables display data correctly
- [ ] Loading states show appropriately
- [ ] Error messages are clear
- [ ] Success messages appear
- [ ] Tooltips work on hover

### Responsive Design
- [ ] Works on desktop (1920x1080)
- [ ] Works on laptop (1366x768)
- [ ] Works on tablet (iPad)
- [ ] Works on mobile (iPhone)
- [ ] Works in portrait orientation
- [ ] Works in landscape orientation

### Browser Compatibility
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Edge
- [ ] Works in Safari (if available)

### Security
- [ ] Non-admin users blocked
- [ ] Session timeout handled
- [ ] Unauthorized access prevented
- [ ] Sensitive data not exposed

### Performance
- [ ] Page loads in < 3 seconds
- [ ] No memory leaks
- [ ] No console errors
- [ ] Smooth animations
- [ ] Responsive interactions

---

**End of Frontend Testing Section**

---


