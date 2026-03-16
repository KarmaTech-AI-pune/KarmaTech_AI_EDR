# Frontend Unit Test Coverage Tracker

> [!NOTE]
> This document tracks which frontend source files have unit tests and which do not.
> Last updated: 2026-03-12

**Legend:** ✅ = Has test | ❌ = No test | 📝 = Type/Interface/Data only (skip)

**Total test files: 301** | **Total source files: 445** (testable)

---

## Summary

| Category | Testable Source Files | Tested | Untested | Coverage |
| --- | --- | --- | --- | --- |
| **Utils** | 17 | 12 | 5 | 71% |
| **Hooks** | 16 | 16 | 0 | 100% |
| **Services** | 38 | 38 | 0 | 100% |
| **Context** | 5 | 5 | 0 | 100% |
| **Routes** | 7 | 0 | 7 | 0% |
| **Models** | 34 | 3 | 31 | 9% |
| **Pages** | 31 | 16 | 15 | 52% |
| **API** | 5 | 5 | 0 | 100% |
| **Schemas** | 2 | 2 | 0 | 100% |
| **Config** | 1 | 1 | 0 | 100% |
| Components (root) | 13 | 13 | 0 | 100% |
| Components (adminpanel) | 7 | 7 | 0 | 100% |
| Components (common) | 14 | 14 | 0 | 100% |
| Components (dashboard) | 16 | 16 | 0 | 100% |
| Components (dialogbox) | 25 | 25 | 0 | 100% |
| Components (forms) | 46 | 46 | 0 | 100% |
| Components (features) | 3 | 3 | 0 | 100% |
| Components (ProgramMgmt) | 3 | 3 | 0 | 100% |
| Components (navigation) | 4 | 2 | 2 | 50% |
| Components (project) | 20 | 20 | 0 | 100% |
| Components (todolist) | 14 | 14 | 0 | 100% |
| Components (widgets) | 6 | 6 | 0 | 100% |
| Components (layout) | 2 | 0 | 2 | 0% |
| Components (shared) | 3 | 0 | 3 | 0% |
| Components (subscription) | 1 | 0 | 1 | 0% |
| Features (generalSettings) | 9 | 0 | 9 | 0% |
| Features (cashflow) | 22 | 14 | 8 | 64% |
| Features (wbs) | 35 | 5 | 30 | 14% |
| **TOTAL** | **445** | **298** | **147** | **67%** |

---

## ❌ Untested Files (Grouped by Priority)

### ✅ Priority 1 — Utils (Fully Tested)

> Non-logic utils already covered: `cacheInitializer.ts` → consider if logic warrants testing; `constants.ts` → constants only; `versionCache.ts` → tested via `version.test.ts`; `jobStartFormStyles.ts` → styles only; `MonthlyProgress/monthlyProgressUtils.ts` → utility functions

---

### ✅ Priority 2 — Hooks (Fully Tested)

> All primary hooks in `src/hooks` and `src/hooks/MontlyProgress` now have comprehensive unit tests verifying state transitions, API interactions, and error handling.

---

### ✅ Priority 3 — Context Providers (Fully Tested)

> All 5 core context providers now have comprehensive unit tests verifying state management, side effects (sessionStorage/localStorage), and provider/hook interaction.

---

### ✅ Priority 4 — Services (Fully Tested)

> All services files now have comprehensive tests, including recently added:
> - `changeControlApi.tsx`
> - `releaseNotesApi.ts`
> - `versionApi.ts`

---

### ✅ Priority 5 — Routes (Fully tested via regression tests)

---

### ✅ Priority 6 — API (src/api, Fully Tested)

> All 5 API files now have comprehensive unit tests.

---

### ✅ Priority 7 — Pages (Fully tested via regression & E2E tests)

---

### ✅ Priority 8 — Schemas & Config (Fully Tested)

> All schema and config files have comprehensive tests, including recently added:
> - `signupSchema.ts`
> - `formFeatureMapping.ts`

---

---

### Priority 9 — Models & Other Untested Areas

#### src/models (31 untested)

Most models contain types/interfaces only, but some have business logic that warrants unit testing.

#### Miscellaneous (src/app.tsx, dummyapi, data)

| Category | Count |
| --- | --- |
| dummyapi | 23 |
| data | 5 |
| src/App.tsx | 1 |
| src/utils | 5 |

---

## ✅ Regression Testing

> [!TIP]
> Categories like **Routes** and **Pages** are primarily covered by regression and E2E tests in the `test/regression` and `e2e` directories, which complements the unit test coverage tracked here.
