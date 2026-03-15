# Frontend Unit Test Coverage Tracker

> [!NOTE]
> This document tracks which frontend source files have unit tests and which do not.
> Last updated: 2026-03-09

**Legend:** ✅ = Has test | ❌ = No test | 📝 = Type/Interface/Data only (skip)

**Total test files: 199+** | **Total source files: ~402** (excluding types, data, themes, setup ≈ ~340 testable)

---

## Summary

| Category                   | Testable Source Files | Tested         | Untested       | Coverage       |
| -------------------------- | --------------------- | -------------- | -------------- | -------------- |
| **Utils**            | 13                    | 13             | 0              | 100%           |
| **Hooks**            | 16                    | 16             | 0              | 100%           |
| **Services**         | 36                    | 36             | 0              | 100%           |
| **Context**          | 5                     | 5              | 0              | 100%           |
| **Routes**           | 7                     | 7              | 0              | 100%           |
| **Models**           | 30 (logic only)       | 2              | 28             | 7%             |
| **Pages**            | 23                    | 23             | 0              | 100%           |
| **API (src/api)**    | 5                     | 5              | 0              | 100%           |
| **Schemas**          | 2                     | 2              | 0              | 100%           |
| **Config**           | 1                     | 1              | 0              | 100%           |
| Components (root)          | 13                    | 13             | 0              | 100%           |
| Components (adminpanel)    | 7                     | 7              | 0              | 100%           |
| Components (common)        | 14                    | 14             | 0              | 100%           |
| Components (dashboard)     | 15                    | 15             | 0              | 100%           |
| Components (dialogbox all) | 23                    | 22             | 1              | 96%            |
| Components (forms all)     | 41                    | 37             | 4              | 90%            |
| Components (features)      | 3                     | 3              | 0              | 100%           |
| Components (ProgramMgmt)   | 3                     | 3              | 0              | 100%           |
| Components (navigation)    | 4                     | 2              | 2              | 50%            |
| Components (project all)   | 20                    | 9              | 11             | 45%            |
| Components (layout)        | 2                     | 0              | 2              | 0%             |
| Components (shared)        | 3                     | 0              | 3              | 0%             |
| Components (subscription)  | 1                     | 0              | 1              | 0%             |
| Components (todolist all)  | 14                    | 0              | 14             | 0%             |
| Components (widgets)       | 6                     | 0              | 6              | 0%             |
| Features (generalSettings) | 9                     | 0              | 9              | 0%             |
| Features (wbs)             | 35                    | 1              | 34             | 3%             |
| Dummyapi                   | 2                     | 2              | 0              | 100%           |
| **TOTAL**            | **~340**        | **~232** | **~108** | **~68%** |

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

> All 36 service files now have comprehensive unit tests.

---

### ✅ Priority 5 — Routes (Fully tested via regression tests)

---

### ✅ Priority 6 — API (src/api, Fully Tested)

> All 5 API files now have comprehensive unit tests.

---

### ✅ Priority 7 — Pages (Fully tested via regression & E2E tests)

---

### ✅ Priority 8 — Schemas & Config (Fully Tested)

> All Schemas & Config files now have comprehensive unit tests.

---

### Priority 9 — Components (untested)

#### Components/project (11 untested)

| File                                                                                                                                                                        |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [DecideApprovalDialog.tsx](file:///e:/Internship/KarmaTech/Git%20Repo/KarmaTech_AI_EDR/frontend/src/components/project/DecideApprovalDialog.tsx)                               |
| [DecideReviewDialog.tsx](file:///e:/Internship/KarmaTech/Git%20Repo/KarmaTech_AI_EDR/frontend/src/components/project/DecideReviewDialog.tsx)                                   |
| [GanttChart.tsx](file:///e:/Internship/KarmaTech/Git%20Repo/KarmaTech_AI_EDR/frontend/src/components/project/GanttChart.tsx)                                                   |
| [OpportunityItem.tsx](file:///e:/Internship/KarmaTech/Git%20Repo/KarmaTech_AI_EDR/frontend/src/components/project/OpportunityItem.tsx)                                         |
| [OpportunityList.tsx](file:///e:/Internship/KarmaTech/Git%20Repo/KarmaTech_AI_EDR/frontend/src/components/project/OpportunityList.tsx)                                         |
| [ProjectFilter.tsx](file:///e:/Internship/KarmaTech/Git%20Repo/KarmaTech_AI_EDR/frontend/src/components/project/ProjectFilter.tsx)                                             |
| [ProjectInitializationDialog.tsx](file:///e:/Internship/KarmaTech/Git%20Repo/KarmaTech_AI_EDR/frontend/src/components/project/ProjectInitializationDialog.tsx)                 |
| [ProjectItem.tsx](file:///e:/Internship/KarmaTech/Git%20Repo/KarmaTech_AI_EDR/frontend/src/components/project/ProjectItem.tsx)                                                 |
| [SendForReviewDialog.tsx](file:///e:/Internship/KarmaTech/Git%20Repo/KarmaTech_AI_EDR/frontend/src/components/project/SendForReviewDialog.tsx)                                 |
| [WorkflowHistoryDisplay.tsx](file:///e:/Internship/KarmaTech/Git%20Repo/KarmaTech_AI_EDR/frontend/src/components/project/WorkflowHistoryDisplay.tsx)                           |
| [budget/BudgetHealthIndicatorExample.tsx](file:///e:/Internship/KarmaTech/Git%20Repo/KarmaTech_AI_EDR/frontend/src/components/project/budget/BudgetHealthIndicatorExample.tsx) |
| [budget/index.ts](file:///e:/Internship/KarmaTech/Git%20Repo/KarmaTech_AI_EDR/frontend/src/components/project/budget/index.ts)                                                 |

#### Components/todolist (14 untested)

| File                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `IssueCard.tsx`, `SubtaskItem.tsx`, `SubtaskList.tsx`, `TodolistColumn.tsx`, `TodolistHeader.tsx`                                            |
| `common/InlineEdit.tsx`, `common/IssueDetailRow.tsx`, `common/IssueTypeIcon.tsx`, `common/PriorityIcon.tsx`, `common/TimeTrackingWidget.tsx` |
| `modals/CreateIssueModal.tsx`, `modals/CreateSprintModal.tsx`, `modals/IssueDetailModal.tsx`, `modals/SubtaskDetailModal.tsx`                  |

#### Components/widgets (6 untested)

| File                                                                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BusinessDevelopmentWidget.tsx`, `DecisionWidget.tsx`, `GoNoGoWidget.tsx`, `HistoryWidget.tsx`, `NotificationSnackbar.tsx`, `ProjectHeaderWidget.tsx` |

#### Components/shared (3), layout (2), nav (2), subscription (1)

| File                                                                               |
| ---------------------------------------------------------------------------------- |
| `shared/ActionButton.tsx`, `shared/ProgressBar.tsx`, `shared/StatusIcon.tsx` |
| `layout/BDSideMenu.tsx`, `layout/SideMenu.tsx`                                 |
| `navigation/PasswordChangeDemo.tsx`, `navigation/PasswordChangeDropdown.tsx`   |
| `subscription/FeatureGate.tsx`                                                   |

#### Components/forms (4 untested)

| File                                                                                  |
| ------------------------------------------------------------------------------------- |
| `MonthlyProgresscomponents/index.ts` (barrel)                                       |
| `MonthlyProgresscomponents/TabComponents/CurrentMonthActionsTab.tsx`                |
| `MonthlyProgresscomponents/TabComponents/FinancialDetailsTab.tsx`                   |
| `MonthlyProgresscomponents/TabComponents/LastMonthActionsTab.tsx`                   |
| `MonthlyProgresscomponents/TabComponents/ManpowerPlanningTab.tsx`                   |
| `MonthlyProgresscomponents/TabComponents/ProgressReviewDeliverables.tsx`            |
| `MonthlyProgresscomponents/TabComponents/ScheduleTab.tsx`                           |
| `forms/WorkBreakdownStructureForm.tsx` — has test but may overlap with wbs feature |

#### Components/dialogbox (1 untested)

| File                                    |
| --------------------------------------- |
| `dialogbox/index.tsx` (barrel export) |

---

### Priority 10 — Features (43 untested)

#### features/generalSettings (9 files)

| File                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `common/CollapsibleTableRow.tsx`, `common/ExpandableIcon.tsx`, `common/ItemActionButtons.tsx`                                                                       |
| `components/WBSHierarchyTable.tsx`, `components/WBSLevel1List.tsx`, `components/WBSLevel2List.tsx`, `components/WBSLevel3List.tsx`, `components/WBSRowItem.tsx` |
| `pages/GeneralSettings.tsx`                                                                                                                                             |

#### features/wbs (34 untested — only WBSChart.test.tsx exists)

| File                                                                                                                                                                                                                                            |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/` — 15 files (ActionButton, AddItemButton, ConfirmationDialog, DeleteWBSDialog, LevelSelect, PlannedHoursInput, TotalCostDisplay, WBSFormDialog, WBSHeader, WBSItemRow, WBSLevelTable, WbsOptions, WBSRow, WBSSummary, WBSTable) |
| `hooks/` — 10 files (useExpansionState, useWBSData, useWBSFormDialogLogic, useWBSFormLogic, useWBSHeaderLogic, useWbsOptionsLogic, useWBSRowLogic, useWBSTableLogic, useWBSTotals, wbsCalculations)                                          |
| `services/` — wbsApi.tsx, wbsHeaderApi.tsx                                                                                                                                                                                                   |
| `context/` — WBSContext.tsx                                                                                                                                                                                                                  |
| `pages/` — TodoList.tsx, WorkBreakdownStructureForm.tsx                                                                                                                                                                                      |
| `utils/` — wbsToGantt.ts, wbsUtils.ts                                                                                                                                                                                                        |
| `types/` — wbs.ts (📝 type only)                                                                                                                                                                                                             |
| `index.ts` (📝 barrel)                                                                                                                                                                                                                        |

---

## ✅ Fully Tested Categories (no action needed)

- Components: root, adminpanel, common, dashboard, features, ProgramManagement
- Dummyapi
- Forms: all major forms + subcomponents tested
- Dialogbox: all major dialogs tested (admin, changecontrol, projectclosure, ProjectReviewWorkflow)
- Routes: fully tested via regression
- Pages: fully tested via regression
- Schemas & Config: fully tested
