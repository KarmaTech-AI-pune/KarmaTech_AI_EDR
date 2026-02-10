# Feature & Subscription API Workflow Guide

This document explains the workflow for managing Features and Subscription Plans using the newly implemented dynamic APIs.

## 1. Feature Management API
These APIs allow you to create and manage the global list of features available in the system.

| Action | HTTP Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Get All Features** | `GET` | `/api/Feature` | Lists all features with their IDs, Names, Descriptions, and Active status. |
| **Create Feature** | `POST` | `/api/Feature` | Creates a new feature. **Note:** Features no longer have prices; prices are set at the Plan level. |
| **Update Feature** | `PUT` | `/api/Feature/{id}` | Updates feature details (Name, Description, IsActive). Setting `IsActive=false` hides it globally. |
| **Delete Feature** | `DELETE` | `/api/Feature/{id}` | Permanently removes a feature. |

### Example: Create a New Feature
**POST** `/api/Feature`
```json
{
  "name": "Advanced Reporting",
  "description": "Access to advanced analytics dashboards",
  "isActive": true
}
```

---

## 2. Subscription Plan Management API
These APIs manage the Plans themselves (e.g., "Starter", "Business").

| Action | HTTP Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Get All Plans** | `GET` | `/api/Subscriptions/plans` | Lists basic plan details. Use `?includeFeatures=true` to see features. |
| **Create Plan** | `POST` | `/api/Subscriptions/plans` | Creates a new subscription plan with pricing. |
| **Update Plan** | `PUT` | `/api/Subscriptions/plans/{id}` | Updates plan details (Price, quotas, etc.). |

---

## 3. Dynamic Feature Mapping (The Workflow)
This is the core workflow for assigning availability of features to specific plans.

### Step-by-Step Workflow:

1.  **Create your Feature** (if it doesn't exist) using `POST /api/Feature`.
    *   *Result*: Feature exists but isn't assigned to any plan yet.
2.  **Get Plan ID** using `GET /api/Subscriptions/plans`.
3.  **Assign Feature to Plan** using the Mapping API:
    *   **POST** `/api/Subscriptions/plans/{planId}/features/{featureId}`
    *   *Result*: This feature is now available for that specific plan.
4.  **Remove Feature from Plan** (if needed):
    *   **DELETE** `/api/Subscriptions/plans/{planId}/features/{featureId}`
    *   *Result*: This feature is no longer included in that plan.

### Example: Mapping "Advanced Reporting" to "Business Plan"
**POST** `/api/Subscriptions/plans/2/features/15`
*(Assuming Plan ID 2 is "Business" and Feature ID 15 is "Advanced Reporting")*

---

## 4. Verification
To verify your configuration is working as expected:
*   Call `GET /api/Subscriptions/plans-with-features`.
*   Check the response. You should see "Advanced Reporting" listed under the "Business" plan's features list, but NOT under usage-restricted plans if you didn't parse it there.

## Key Changes Summary
*   **Features are Price-less**: A `Feature` entity is now just a definition (Name/Slug).
*   **Decoupled Pricing**: You don't set a price on a feature. You set the price on the **Plan**.
*   **IsActive Flag**:
    *   `Feature.IsActive = false`: Feature is deprecated globally.
    *   `Remove from Plan`: Feature is active but not available in that specific plan.
