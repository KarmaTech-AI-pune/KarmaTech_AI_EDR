# Business Requirements Document (BRD)
## Subscription & Feature Plan Module

**Project:** EDR (Enterprise Digital Runner)
**Module:** Subscription & Feature Plan Management
**Version:** 1.0
**Date:** 06 January 2026

---

### 1. Business Overview

#### 1.1 Background
EDR (Enterprise Digital Runner) is positioned as a scalable, multi-tenant SaaS platform. As the product matures and expands to diverse customer segments, there is a strong business need to monetize features flexibly, control access at the tenant level, and support multiple pricing models.

The existing subscription implementation supports basic pricing and limits but lacks flexibility in feature control, extensibility, and enterprise-grade governance. This Business Requirements Document (BRD) defines the business needs and expectations for a comprehensive Subscription & Feature Plan module.

#### 1.2 Business Problem Statement
- **Rigid Subscription Plans:** Current plans are difficult to extend.
- **Inconsistent Feature Access:** Feature access is not consistently enforced across the system.
- **Hardcoded Pricing Logic:** Partially hardcoded logic limits scalability.
- **No Add-ons Strategy:** Lack of structured way to introduce add-ons, premium features, or enterprise-only features.
- **Limited Currency Support:** Limited support for multiple currencies and pricing models.

#### 1.3 Business Objectives
- **Flexible Monetization:** Enable flexible SaaS monetization through subscription plans and feature-based pricing.
- **Granular Control:** Provide granular, tenant-level control over feature access.
- **Multiple Pricing Models:** Support monthly, yearly, and one-time pricing models.
- **Operational Efficiency:** Improve efficiency for admins managing plans and features.
- **Scalability:** Ensure future readiness for integrations such as Stripe.

---

### 2. Scope

#### 2.1 In-Scope
- Subscription plan creation and management.
- Feature master management.
- Mapping features to subscription plans.
- Tenant-to-plan association.
- Feature access validation and enforcement.
- Resource and quota-based limitations.
- Multi-currency pricing (USD, INR).
- Trial period and plan change tracking.
- Admin-level override and governance.

#### 2.2 Out of Scope
- Payment gateway transaction handling (actual payments).
- Invoice generation and taxation logic.
- Customer self-service billing portal (future phase).
- Third-party marketplace integrations.

---

### 3. Stakeholders

| Role | Responsibility |
| :--- | :--- |
| **Product Owner** | Business vision, prioritization |
| **Business Analyst** | Requirements validation |
| **Engineering Team** | Design & implementation |
| **QA Team** | Testing and validation |
| **Sales & Marketing** | Pricing strategy input |
| **Finance** | Pricing and currency validation |
| **Support Team** | Customer issue handling |

---

### 4. High-Level Business Requirements

#### BR-1: Subscription Plan Management
- The system shall allow the business to define multiple subscription plans.
- Each plan shall support different pricing cycles (monthly, yearly, one-time).
- Plans shall be configurable for different currencies.
- Plans can be activated or deactivated without data loss.
- Plans shall define usage limits (users, projects, storage, etc.).

#### BR-2: Feature Master Management
- The system shall maintain a centralized list of all product features.
- Each feature shall have a unique business identifier (slug).
- Features shall be grouped logically for business and UI clarity.
- Features can be marked as active, deprecated, or replaced.

#### BR-3: Plan–Feature Association
- Features can be included or excluded from plans.
- A feature may belong to multiple plans.
- Feature limits may vary based on the plan.
- Feature availability can be time-bound if required.

#### BR-4: Tenant Subscription Management
- Each tenant shall have exactly one active subscription plan at a time.
- Plan upgrades/downgrades shall be tracked for audit and reporting.
- Trial subscriptions shall be supported.
- Feature access shall be resolved based on the tenant’s active plan.

#### BR-5: Feature Access Control
- The system shall prevent unauthorized access to restricted features.
- Feature validation shall occur in real time during API execution.
- Admin users shall have override privileges.
- Clear business-friendly error messages shall be displayed on access denial.

---

### 5. Business Rules
1. A tenant cannot access a feature not included in its active subscription plan.
2. Deactivated plans cannot be assigned to new tenants.
3. Deprecated features remain accessible for existing tenants until removed.
4. Unlimited usage is represented by a limit value of zero.
5. Feature pricing is optional and may be bundled within plans.

---

### 6. Key Business Use Cases

#### UC-1: Create a New Subscription Plan
- **Actor:** Admin
- **Outcome:** A new subscription plan is available for tenant assignment.

#### UC-2: Assign Features to a Plan
- **Actor:** Admin
- **Outcome:** Plan includes selected features with optional limits.

#### UC-3: Validate Feature Access
- **Actor:** System
- **Outcome:** Tenant is allowed or denied access to a feature based on subscription.

#### UC-4: Upgrade Tenant Plan
- **Actor:** Admin / System
- **Outcome:** Tenant moves to a new plan and change history is recorded.

---

### 7. Reporting & Monitoring Requirements
- List of active subscription plans.
- Feature usage per tenant.
- Plan-wise tenant distribution.
- Upgrade/downgrade history.
- Trial conversion tracking.

---

### 8. Assumptions & Constraints

#### Assumptions
- Tenants are already uniquely identified in the system.
- Authentication and authorization mechanisms are in place.
- Pricing values are managed by admins only.

#### Constraints
- Must integrate with existing multi-tenant architecture.
- Must maintain backward compatibility with existing subscriptions.
- Must support future payment gateway enhancements.

---

### 9. Risks & Mitigation

| Risk | Impact | Mitigation |
| :--- | :--- | :--- |
| **Incorrect feature gating** | Revenue & trust loss | Centralized validation service |
| **Data migration issues** | Production instability | Staged migration & backups |
| **Pricing misconfiguration** | Financial risk | Admin validation & audit logs |

---

### 10. Success Metrics (KPIs)
- Reduction in feature access-related bugs.
- Faster onboarding of new pricing plans.
- Improved revenue flexibility.
- 80% automated test coverage.
- No downtime during migration.

---

### 11. Approval

| Name | Role | Signature | Date |
| :--- | :--- | :--- | :--- |
| | Product Owner | | |
| | Engineering Lead | | |
| | Business Analyst | | |

*End of Business Requirements Document*
