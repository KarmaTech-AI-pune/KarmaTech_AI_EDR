# Developer Workflow Quick Reference Guide

**Last Updated:** January 19, 2025

## 🎯 Which Workflow Should I Follow?

Use this decision tree to determine which workflow applies to your work:

```
What are you working on?
│
├─ 🆕 NEW FEATURE
│   │
│   ├─ Full-Stack (Backend + Frontend)
│   │   └─ ✅ Follow: Backend Workflow → Frontend Workflow
│   │
│   ├─ Backend-Only (API, Database, Business Logic)
│   │   └─ ✅ Follow: Backend Workflow ONLY
│   │
│   └─ Frontend-Only (UI, Components, Pages)
│       │
│       ├─ New Page with Route?
│       │   └─ ✅ Follow: Full React Workflow (Folders → Routes → Pages → Components)
│       │
│       └─ Reusable Component Library?
│           └─ 🔧 Flexible: May skip routing/page steps
│
├─ 🐛 BUG FIX
│   └─ 🔧 Flexible: Fix in place, maintain existing structure
│
├─ 🔄 UPDATE EXISTING FEATURE
│   └─ 🔧 Flexible: Maintain structure, apply workflow to new additions only
│
└─ 🎨 STYLING/CSS CHANGES
    └─ 🔧 Flexible: No workflow needed
```

---

## 📋 Backend Workflow (Backend-Only or Full-Stack Step 1)

**When to use:** Backend-only features OR first step of full-stack features

**Order:**
1. ✅ Create/update database entities (BaseEntity pattern)
2. ✅ Generate EF Core migrations
3. ✅ Implement repositories (Repository pattern)
4. ✅ Create CQRS commands and queries (MediatR)
5. ✅ Implement API controllers (RESTful standards)
6. ✅ Add error handling and logging
7. ✅ Implement authentication/authorization
8. ✅ Add input validation (FluentValidation)

**Stop here if:** Backend-only feature (no UI changes needed)

**Continue to frontend if:** Full-stack feature

---

## 📋 Frontend Workflow (Frontend-Only or Full-Stack Step 2)

**When to use:** Frontend-only features OR second step of full-stack features

### Full React Workflow (For New Pages)

**MANDATORY ORDER:**

1. ✅ **Create Folder Structure**
   ```
   frontend/src/
   ├── types/[feature].ts
   ├── services/[feature]Service.ts
   ├── hooks/use[Feature].ts (if needed)
   ├── pages/[Feature].tsx
   └── components/[feature]/
       ├── [Feature]Header.tsx
       ├── [Feature]Details.tsx
       └── [Feature]Form.tsx
   ```

2. ✅ **Define TypeScript Types**
   - Create interfaces in `types/` folder
   - Define data models
   - Define component props

3. ✅ **Create API Service Layer**
   - Create service in `services/` folder
   - Implement API methods using Axios
   - Use proper TypeScript types

4. ✅ **Create Custom Hooks** (if needed)
   - Create hook in `hooks/` folder
   - Handle data fetching, loading, errors

5. ✅ **Create Skeleton Pages & Components**
   - Create basic page structure with placeholders
   - Create basic component structure with TODO comments
   - Define prop interfaces

6. ✅ **Configure Routing**
   - Open routing configuration file
   - Add new route entry using skeleton page
   - Import page component (already exists)

7. ✅ **Implement Page Component Structure**
   - Add route parameter extraction
   - Fetch data using hooks/services
   - Manage state
   - Handle loading/error states
   - Create page structure with placeholders
   - DO NOT call components yet

8. ✅ **Implement ALL Child Components (Bottom-Up)**
   - Identify component hierarchy
   - Start with leaf components (smallest, no dependencies)
   - Move to parent components (use leaf components)
   - Complete top-level components
   - Build from smallest to largest
   - Complete ALL before Step 9

9. ✅ **Integrate Components into Page (One by One)**
   - Import all implemented components
   - Replace placeholders
   - Add components one at a time
   - Pass props from page state
   - Wire up event handlers
   - Test each integration

10. ✅ **Add Validation & Error Handling**
    - Form validation (React Hook Form + Zod)
    - Error boundaries
    - User feedback

11. ✅ **Create Tests**
    - Test page behavior
    - Test component rendering
    - Test user interactions

### Flexible React Workflow (For Component Libraries)

**When:** Building reusable components without specific pages

**Order:**
1. ✅ Create folder structure
2. ✅ Define TypeScript types
3. ✅ Create components (may skip routing/page steps)
4. ✅ Add validation
5. ✅ Create tests

---

## 🚫 Common Mistakes to Avoid

### ❌ DON'T:
- Start with individual components before defining page context
- Create components before creating the page that uses them
- Skip folder structure creation
- Create routes after page components
- Work bottom-up (components → pages → routes)
- Apply full workflow to bug fixes or updates

### ✅ DO:
- Create folders and files FIRST
- Define types BEFORE components
- Create services BEFORE components
- Configure routes BEFORE creating pages
- Create pages BEFORE child components
- Work top-down (folders → routes → pages → components)
- Be flexible for bug fixes, updates, and component libraries

---

## 📊 Workflow Comparison

| Scenario | Backend Workflow | Frontend Workflow | Notes |
|----------|------------------|-------------------|-------|
| **Backend-Only API** | ✅ Required | ❌ Skip | No UI changes |
| **Frontend-Only Page** | ❌ Skip | ✅ Required (Full) | New page with route |
| **Full-Stack Feature** | ✅ Required (First) | ✅ Required (Second) | Backend → Frontend |
| **Component Library** | ❌ Skip | 🔧 Flexible | May skip routing/pages |
| **Bug Fix** | 🔧 As needed | 🔧 As needed | Fix in place |
| **Update Existing** | 🔧 As needed | 🔧 As needed | Maintain structure |
| **Styling Only** | ❌ Skip | 🔧 Flexible | No workflow needed |

---

## 🎯 Quick Decision Matrix

### "Do I need to follow the full React workflow?"

**YES - Follow full workflow if:**
- ✅ Creating a new page with a route
- ✅ Building a new feature with UI
- ✅ Full-stack feature (after backend is done)

**NO - Be flexible if:**
- 🔧 Backend-only work (skip frontend entirely)
- 🔧 Reusable component library (skip routing/pages)
- 🔧 Bug fix (fix in place)
- 🔧 Update existing feature (maintain structure)
- 🔧 Styling changes (no workflow)

---

## 📚 Reference Documents

- **Full React Workflow:** `.kiro/steering/react-implementation-workflow.md`
- **Enforcement Rules:** `.kiro/steering/workflow-enforcement-rules.md`
- **Architecture Patterns:** `.kiro/steering/architecture-patterns.md`
- **Core Guidelines:** `.kiro/steering/core-ai-dlc-guidelines.md`

---

## 💡 Pro Tips

1. **Backend-only work?** Skip frontend workflow entirely. No need to create React folders/routes/pages.

2. **Full-stack feature?** Always do backend FIRST, then frontend. This ensures API is ready when building UI.

3. **New page?** MUST follow full React workflow: Folders → Routes → Pages → Components.

4. **Component library?** Can skip routing and page steps. Focus on reusable components.

5. **Bug fix?** Fix in place. Don't restructure existing code.

6. **Update existing?** Maintain current structure. Apply workflow only to new additions.

7. **Styling only?** No workflow needed. Just update CSS/styles.

---

## ✅ Checklist Before Starting

- [ ] Determined if backend-only, frontend-only, or full-stack
- [ ] Identified which workflow(s) to follow
- [ ] Checked if flexibility applies (bug fix, update, etc.)
- [ ] Read relevant steering file for detailed guidance
- [ ] Ready to follow the correct workflow order

---

**Remember:** The workflow exists to ensure consistency and maintainability. Follow it for new features, be flexible for maintenance work.
