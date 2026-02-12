---
inclusion: always
---

# AI-DLC Workflow Enforcement Rules

## MANDATORY: Git Branch Setup (BEFORE ANY WORK)

**🚨 CRITICAL**: Before starting ANY spec creation or development work, you MUST execute these 4 commands in exact order:

```powershell
# MANDATORY SEQUENCE - Execute EVERY TIME before any work:
git branch --show-current          # 1. Check current branch
git checkout Kiro/dev              # 2. Switch to base branch  
git pull origin Kiro/dev           # 3. Get latest changes
git checkout -b feature/[name]     # 4. Create clean feature branch
```

**🚫 ABSOLUTE RULE**: 
- NEVER start spec creation without executing these 4 commands first
- NEVER assume you're on the right branch
- NEVER skip pulling latest changes from Kiro/dev
- ALWAYS create feature branch from clean Kiro/dev

**✅ Success Indicators:**
- Current branch shows: `feature/[descriptive-name]`
- Branch is up-to-date with origin/Kiro/dev
- Working tree is clean
- Feature branch pushed to origin

**Example Feature Branch Names:**
- `feature/project-status-history`
- `feature/user-authentication`
- `feature/budget-health-indicator`

---

## CONDITIONAL: Database Migration Update (ONLY IF ENTITY CHANGES)

**⚠️ IMPORTANT**: Run database migration update ONLY when your feature includes changes to database entities:

```powershell
# CONDITIONAL - Execute ONLY if entity changes exist:
cd backend                                    # 1. Navigate to backend directory
.\update_db.bat                               # 2. Run migration update script
```

**When to run this:**
- ✅ You modified existing entities in `backend/src/NJS.Domain/Entities/`
- ✅ You added new entities in `backend/src/NJS.Domain/Entities/`
- ✅ You changed entity properties, relationships, or constraints
- ✅ Your feature requires database schema changes

**When NOT to run this:**
- ❌ No entity changes in your feature
- ❌ Only frontend changes
- ❌ Only API/controller changes without entity modifications
- ❌ Only business logic changes without schema changes

**What this script does:**
1. Creates a new migration for your entity changes
2. Updates local database with your new schema
3. Ensures your changes are reflected in the database

**✅ Success Indicators (if you ran the script):**
- Script output shows: "Build succeeded"
- Script output shows: "Done. To undo this action, use 'ef migrations remove'"
- New migration file created in `backend/src/NJS.Domain/Migrations/`
- Database updated with your schema changes

---

## Mandatory 7-Step Process

**CRITICAL**: Every feature implementation MUST follow the exact 7-step process outlined in `AI-DLC-Small-Feature-Example.md`. No exceptions, no shortcuts, no skipping steps.

## Step-by-Step Enforcement Rules

### STEP 1: REQUIREMENT ANALYSIS (MANDATORY)

**🚨 PREREQUISITE**: Git branch setup MUST be completed first (see section above)

**Before proceeding to Step 2, you MUST:**

✅ **Required Actions:**
1. Parse the business requirement completely
2. Scan ALL existing documentation files:
   - `DATABASE_SCHEMA.md` → Find related table structures
   - `ARCHITECTURE.md` → Understand existing patterns
   - `CODING_STANDARDS.md` → Learn naming conventions
   - `API_DOCUMENTATION.md` → See existing API patterns
3. Identify ALL affected components (Database, Backend, Frontend)
4. Define clear, testable acceptance criteria
5. Document assumptions and constraints

✅ **Required Output:**
- Create `REQUIREMENT_ANALYSIS_[FEATURE-ID].md` document

✅ **Quality Gates (Must Pass):**
- [ ] Requirements are clear and unambiguous
- [ ] Acceptance criteria are testable
- [ ] All dependencies identified
- [ ] Business value clearly articulated
- [ ] Integration points with existing features mapped

**🚫 STOP RULE**: If any quality gate fails, STOP and request clarification. Do NOT proceed to Step 2.

---

### STEP 2: CODEBASE IMPACT ANALYSIS (MANDATORY)

**Before proceeding to Step 3, you MUST:**

✅ **Required Actions:**
1. Scan existing codebase for similar patterns
2. Identify ALL files that need modification
3. Map database schema changes required
4. Assess API endpoint changes needed
5. Evaluate frontend component impacts
6. Identify potential breaking changes
7. Estimate development effort

✅ **Required Output:**
- Create `IMPACT_ANALYSIS_[FEATURE-ID].md` document

✅ **Quality Gates (Must Pass):**
- [ ] All affected components identified
- [ ] Risk assessment completed
- [ ] Breaking changes documented
- [ ] Migration strategy defined (if needed)
- [ ] Effort estimation provided

**🚫 STOP RULE**: If breaking changes are identified without mitigation strategy, STOP and escalate.

---

### STEP 3: TECHNICAL DESIGN (MANDATORY)

**Before proceeding to Step 4, you MUST:**

✅ **Required Actions:**
1. Design database schema following EDR patterns from `database-schema-patterns.md`
2. Design API endpoints following RESTful standards from `api-documentation-patterns.md`
3. Design frontend components following React patterns from `architecture-patterns.md`
4. Plan comprehensive testing strategy (unit, integration, E2E, performance, security)
5. Define performance requirements
6. Design security measures
7. Plan deployment strategy

✅ **Required Output:**
- Create `TECHNICAL_DESIGN_[FEATURE-ID].md` document

✅ **Quality Gates (Must Pass):**
- [ ] Design follows established architecture patterns
- [ ] Database design follows naming conventions
- [ ] API design follows RESTful standards
- [ ] Security requirements addressed
- [ ] Performance targets defined
- [ ] Testing strategy comprehensive

**🚫 STOP RULE**: If design conflicts with existing patterns, STOP and redesign or escalate.

---

### STEP 4: IMPLEMENTATION (MANDATORY)

**You MUST implement in this exact order:**

**⚠️ Implementation Scope:**
- **Full-stack features:** Implement backend FIRST, then frontend
- **Backend-only features:** Follow backend workflow only, skip frontend
- **Frontend-only features:** Skip backend workflow, follow frontend only
- **API integration:** Backend → Types → Services → Components

✅ **Backend Implementation (Required Order):**
1. Create/update database entities following BaseEntity pattern
2. Generate EF Core migrations with proper naming
3. Implement repositories following Repository pattern
4. Create CQRS commands and queries using MediatR
5. Implement API controllers following RESTful standards
6. Add proper error handling and logging
7. Implement authentication and authorization
8. Add input validation using FluentValidation

**📌 Backend-Only Features:** If no frontend changes needed, stop here and proceed to testing.

✅ **Frontend Implementation (Required Order):**

**MANDATORY: Follow React Top-Down Implementation Workflow**

**📌 Applies to:** Features requiring React/UI changes. Skip if backend-only.

Refer to `react-implementation-workflow.md` for complete details. The implementation MUST follow this exact order:

1. **Create Folder Structure** - Create all required folders and files first
   - `types/` - TypeScript interfaces
   - `services/` - API service layer
   - `hooks/` - Custom hooks (if needed)
   - `pages/` - Page components
   - `components/[feature]/` - Feature-specific components

2. **Define TypeScript Types** - Create all interfaces BEFORE components
   - Create type definition files in `types/` folder
   - Define all data model interfaces
   - Define component prop interfaces

3. **Create API Service Layer** - Implement services BEFORE components
   - Create service files in `services/` folder
   - Implement API methods using Axios
   - Use proper TypeScript types

4. **Create Custom Hooks** (if needed) - Data-fetching hooks BEFORE pages
   - Create hook files in `hooks/` folder
   - Implement data fetching logic
   - Handle loading, error, and success states

5. **Create Skeleton Pages & Components** - Basic structure with placeholders
   - Create skeleton page files in `pages/` folder
   - Create skeleton component files in `components/[feature]/` folder
   - Add basic structure with TODO comments
   - Define prop interfaces

6. **Configure Routing** - Add routes using the skeleton pages
   - Open routing configuration file
   - Add new route entry
   - Import skeleton page component (already exists)
   - Configure route parameters

7. **Implement Page Component Structure** - Set up page with data fetching (NO components yet)
   - Add route parameter extraction
   - Import and use hooks/services
   - Implement data fetching and state management
   - Add loading and error handling
   - Create page structure with placeholders
   - DO NOT call child components yet

8. **Implement ALL Child Components** - Build all components bottom-up
   - Identify component hierarchy (which components use which)
   - Start with leaf components (no dependencies)
   - Move up to parent components (use leaf components)
   - Complete all top-level components
   - Implement from smallest to largest
   - Ensure all components are fully functional before Step 9

9. **Integrate Components into Page** - Add components one by one
   - Import all implemented components
   - Replace placeholders from Step 7
   - Add components one at a time
   - Pass props correctly from page state
   - Wire up event handlers
   - Test each integration

10. **Add Validation & Error Handling** - Enhance with validation
    - Add form validation using React Hook Form + Zod
    - Implement error boundaries
    - Add user feedback (success/error messages)
    - Add loading states for async operations

11. **Create Tests** - Write tests for components and pages
    - Create test files alongside components
    - Test page component behavior
    - Test child component rendering
    - Test user interactions

**🚨 CRITICAL RULE:** For any implementation requiring a page:
- ✅ Create folders and files FIRST
- ✅ Create skeleton pages and components SECOND
- ✅ Configure routes THIRD (using skeleton pages)
- ✅ Implement page structure FOURTH (data fetching only, NO components)
- ✅ Implement ALL components FIFTH (bottom-up: smallest to largest)
- ✅ Integrate components into page LAST (one by one)

**❌ NEVER:**
- Start with individual components in isolation
- Create components before defining their page context
- Skip folder structure creation
- Create routes after page components
- Call components in page before they're implemented
- Integrate components before they're all complete

**🔧 Flexibility Exceptions:**
- **Reusable component library:** May skip routing/page steps if building shared components
- **Updating existing features:** Maintain existing structure, apply workflow to new additions
- **Bug fixes:** Fix in place without restructuring
- **Styling updates:** No workflow restructuring needed
- **Backend-only work:** Skip entire frontend workflow
- ✅ Create the page component THIRD (which calls child components)
- ✅ Create child components LAST (called by the page)

**❌ NEVER:**
- Start with individual components in isolation
- Create components before defining their page context
- Skip folder structure creation
- Create routes after page components

✅ **Quality Gates (Must Pass):**
- [ ] Code follows ALL coding standards from `coding-standards.md`
- [ ] No compilation errors or warnings
- [ ] All dependencies properly injected
- [ ] Proper error handling implemented
- [ ] Security measures in place
- [ ] Architecture patterns followed from `architecture-patterns.md`

**🚫 STOP RULE**: If code doesn't compile or violates standards, STOP and fix before proceeding.

---

### STEP 5: COMPREHENSIVE TESTING (MANDATORY)

**You MUST execute ALL test types from `comprehensive-testing-framework.md`:**

✅ **Required Test Categories:**
1. **Unit Tests** (100% coverage)
   - Backend business logic tests
   - Frontend component tests
   - Edge case testing
2. **Integration Tests**
   - API endpoint tests
   - Database integration tests
   - Service integration tests
3. **End-to-End Tests**
   - Complete user workflow tests
   - Cross-browser compatibility tests
4. **Performance Tests**
   - API response time tests (<500ms)
   - Database query performance tests
   - Load testing (concurrent users)
5. **Security Tests**
   - Authentication tests
   - Authorization tests
   - Input validation tests
   - SQL injection prevention tests
6. **Accessibility Tests**
   - WCAG 2.1 AA compliance tests
   - Keyboard navigation tests
   - Screen reader compatibility tests

✅ **Required Outputs:**
- `TEST_REPORT_[FEATURE-ID].md` (using template from comprehensive-testing-framework.md)
- `COVERAGE_REPORT.md`
- Detailed test execution results with recommendations

✅ **Quality Gates (Must Pass):**
- [ ] ALL tests pass (100% success rate)
- [ ] Code coverage = 100%
- [ ] Performance requirements met
- [ ] Security vulnerabilities addressed
- [ ] Accessibility standards met
- [ ] Detailed test report generated with management recommendations

**🚫 STOP RULE**: If ANY test fails or coverage is below 100%, STOP and fix before proceeding.

---

### STEP 6: CODE QUALITY & OPTIMIZATION (MANDATORY)

✅ **Required Actions:**
1. Code review against established standards
2. Performance optimization where needed
3. Security vulnerability scanning
4. Code duplication analysis and refactoring
5. Documentation updates (API docs, README, etc.)
6. Database query optimization
7. Frontend bundle size optimization

✅ **Required Output:**
- Create `CODE_QUALITY_REPORT_[FEATURE-ID].md`

✅ **Quality Gates (Must Pass):**
- [ ] Code review approved
- [ ] No critical security vulnerabilities
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] No code duplication issues
- [ ] Technical debt within acceptable limits

**🚫 STOP RULE**: If critical security vulnerabilities found, STOP and fix immediately.

---

### STEP 7: DEPLOYMENT PACKAGE (MANDATORY)

✅ **Required Actions:**
1. Create database migration scripts
2. Create rollback procedures
3. Update environment configurations
4. Create deployment checklist
5. Prepare monitoring and alerting
6. Document post-deployment verification steps
7. Create user documentation (if needed)

✅ **Required Outputs:**
- `DEPLOYMENT_PACKAGE_[FEATURE-ID].md`
- Migration scripts (forward and rollback)
- Deployment checklist
- Monitoring configuration

✅ **Quality Gates (Must Pass):**
- [ ] Deployment scripts tested
- [ ] Rollback procedures verified
- [ ] Monitoring configured
- [ ] Documentation complete
- [ ] Stakeholder approval obtained

**🚫 STOP RULE**: If rollback procedures not tested, STOP and test before deployment.

---

## Workflow State Management

### Current Step Tracking
Always maintain awareness of current step:
```
CURRENT_STEP: [1|2|3|4|5|6|7]
FEATURE_ID: [Unique identifier]
STEP_STATUS: [IN_PROGRESS|COMPLETED|BLOCKED]
QUALITY_GATES_PASSED: [TRUE|FALSE]
```

### Step Transition Rules
```
Step 1 → Step 2: Only if ALL Step 1 quality gates pass
Step 2 → Step 3: Only if ALL Step 2 quality gates pass
Step 3 → Step 4: Only if ALL Step 3 quality gates pass
Step 4 → Step 5: Only if ALL Step 4 quality gates pass
Step 5 → Step 6: Only if ALL Step 5 quality gates pass
Step 6 → Step 7: Only if ALL Step 6 quality gates pass
Step 7 → COMPLETE: Only if ALL Step 7 quality gates pass
```

### Mandatory Step Validation
Before starting each step, validate:
```
✅ Previous step completed successfully
✅ All required documents from previous step exist
✅ All quality gates from previous step passed
✅ No blocking issues remain unresolved
```

## Escalation Rules

### When to STOP and Escalate
1. **Ambiguous Requirements** - Cannot proceed without clarification
2. **Missing Documentation** - Required docs not available in `/docs` folder
3. **Breaking Changes** - Design requires breaking existing functionality
4. **Security Vulnerabilities** - Critical security issues identified
5. **Performance Issues** - Cannot meet performance targets
6. **Test Failures** - Cannot resolve test failures after 3 attempts
7. **Quality Gate Failures** - Any mandatory quality gate fails

### Escalation Process
1. **STOP** all work immediately
2. Create `ESCALATION_NOTICE_[FEATURE-ID].md`
3. Document the specific blocker
4. Explain what human decision/input is needed
5. Wait for human response before proceeding

## Compliance Verification

### Self-Check Questions (Ask Before Each Step)
1. "Have I completed ALL required actions for the current step?"
2. "Do ALL quality gates pass for the current step?"
3. "Have I created ALL required output documents?"
4. "Am I following the exact process from AI-DLC-Small-Feature-Example.md?"
5. "Is there any ambiguity that requires human clarification?"

### Process Audit Trail
Maintain complete audit trail:
```
STEP_1_STARTED: [timestamp]
STEP_1_COMPLETED: [timestamp]
STEP_1_QUALITY_GATES: [PASS/FAIL details]
STEP_1_OUTPUTS: [list of created documents]
... (repeat for each step)
```

## Success Criteria

### Feature Completion Checklist
- [ ] All 7 steps completed in order
- [ ] All quality gates passed
- [ ] All required documents created
- [ ] All tests passing (100% coverage)
- [ ] Performance requirements met
- [ ] Security requirements met
- [ ] Documentation complete
- [ ] Deployment package ready
- [ ] Stakeholder approval obtained

**FINAL RULE**: A feature is NOT complete until ALL 7 steps are finished and ALL quality gates pass. No exceptions.

This ensures every AI-DLC implementation follows the exact same rigorous process demonstrated in the small feature example.