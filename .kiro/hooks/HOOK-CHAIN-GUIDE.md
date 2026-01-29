# 🔗 AI-DLC Hook Chain System

## Overview

This is a **3-hook chain** that automates the entire development workflow:

```
┌─────────────────────────────────────────────────────────────────┐
│                   AUTOMATIC HOOK CHAIN FLOW                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   tasks.md saved (ONCE by user)                                │
│        │                                                        │
│        ▼                                                        │
│   ┌─────────────────────────────────────┐                      │
│   │  HOOK 1: Execute Task 1             │                      │
│   │  • Implement task                   │                      │
│   │  • Mark [x] in tasks.md             │                      │
│   │  • SAVE tasks.md (auto-trigger!)    │                      │
│   │  • git commit & push                │                      │
│   └─────────────────────────────────────┘                      │
│        │                                                        │
│        │ (tasks.md save auto-triggers hook)                    │
│        ▼                                                        │
│   ┌─────────────────────────────────────┐                      │
│   │  HOOK 1: Execute Task 2             │                      │
│   │  • Implement task                   │                      │
│   │  • Mark [x] in tasks.md             │                      │
│   │  • SAVE tasks.md (auto-trigger!)    │                      │
│   │  • git commit & push                │                      │
│   └─────────────────────────────────────┘                      │
│        │                                                        │
│        │ (repeats automatically for all tasks)                 │
│        │                                                        │
│        ▼                                                        │
│   ┌─────────────────────────────────────┐                      │
│   │  HOOK 1: Execute Last Task          │                      │
│   │  • Implement task                   │                      │
│   │  • Mark [x] in tasks.md             │                      │
│   │  • ALL tasks complete!              │                      │
│   │  • Create .tasks-complete marker    │                      │
│   │  • git commit & push                │                      │
│   └─────────────────────────────────────┘                      │
│        │                                                        │
│        ▼                                                        │
│   ┌─────────────────────────────────────┐                      │
│   │  HOOK 2: Build & Publish            │                      │
│   │  • Run PublishProject.ps1           │                      │
│   │  • Build React frontend             │                      │
│   │  • Publish .NET backend             │                      │
│   │  • Create .build-complete marker    │                      │
│   │  • git commit & push                │                      │
│   └─────────────────────────────────────┘                      │
│        │                                                        │
│        ▼                                                        │
│   ┌─────────────────────────────────────┐                      │
│   │  HOOK 3: PR Creator                 │                      │
│   │  • Generate PR body                 │                      │
│   │  • gh pr create                     │                      │
│   │  • Add labels                       │                      │
│   │  • Create .pr-created marker        │                      │
│   │  • Report PR URL                    │                      │
│   └─────────────────────────────────────┘                      │
│        │                                                        │
│        ▼                                                        │
│   👤 HUMAN: Review & Approve PR on GitHub                       │
│                                                                 │
│   🎉 FULLY AUTOMATIC - Save tasks.md once, get PR!             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Hook Files

| File | Trigger | Action |
|------|---------|--------|
| `01-task-executor.kiro.hook` | tasks.md edited | Execute ONE task, commit, push |
| `02-build-publish.kiro.hook` | .tasks-complete created | Run PublishProject.ps1 |
| `03-pr-creator.kiro.hook` | .build-complete created | Create GitHub PR |

---

## 🔄 How Hooks Chain Together

### Marker Files (Communication Between Hooks)

```
.kiro/specs/[feature-name]/
├── requirements.md      # Created by user/Kiro
├── design.md            # Created by user/Kiro
├── tasks.md             # Created by user/Kiro
├── .tasks-complete      # Created by Hook 1 (triggers Hook 2)
├── .build-complete      # Created by Hook 2 (triggers Hook 3)
├── .pr-created          # Created by Hook 3 (contains PR info)
└── pr-body.md           # Created by Hook 3 (PR description)
```

### Chain Triggers

1. **Hook 1 → Hook 2**: When Hook 1 completes ALL tasks, it creates `.tasks-complete`
2. **Hook 2 → Hook 3**: When Hook 2 finishes build, it creates `.build-complete`
3. **Hook 3 → Human**: When Hook 3 creates PR, it creates `.pr-created` and notifies user

---

## 📋 Detailed Hook Behavior

### Hook 1: Task Executor

**Trigger:** `tasks.md` is edited/saved

**Behavior:**
1. Reads tasks.md
2. Finds FIRST uncompleted task (`- [ ]`)
3. Reads requirements.md and design.md for context
4. Implements the task (writes code)
5. Marks task as complete (`- [x]`)
6. **Saves tasks.md file (this auto-triggers the hook again!)**
7. Commits with message: `feat: complete task X - description`
8. Pushes to feature branch
9. **AUTO-CHAINS:** The save in step 6 automatically triggers this hook again for the next task

**Key Point:** Executes ONE task per trigger, but AUTOMATICALLY triggers itself for the next task by saving tasks.md. This creates a chain reaction until all tasks are complete.

**Completion:** When ALL tasks are `[x]`, creates `.tasks-complete` marker

---

### Hook 2: Build & Publish

**Trigger:** `.tasks-complete` file is created

**Behavior:**
1. Verifies all tasks are complete
2. Runs `PublishProject.ps1`:
   - Builds React frontend
   - Publishes .NET backend
3. Verifies build outputs exist
4. Creates `.build-complete` marker
5. Commits and pushes

**Key Point:** Only runs AFTER all tasks are done

---

### Hook 3: PR Creator

**Trigger:** `.build-complete` file is created

**Behavior:**
1. Reads spec files for context
2. Generates comprehensive PR body
3. Creates PR using `gh pr create`
4. Adds `kiro-automated` label
5. Creates `.pr-created` marker with PR info
6. Reports PR URL to user

**Key Point:** Only runs AFTER build succeeds

---

## 🚀 Usage

### Step 1: Create Your Spec
```
.kiro/specs/my-feature/
├── requirements.md
├── design.md
└── tasks.md
```

### Step 2: Save tasks.md ONCE
Just save the file ONE TIME. Hook 1 will activate and auto-chain through all tasks.

### Step 3: Watch the Magic (FULLY AUTOMATIC)
```
Hook 1: Task 1 → commit → push → save tasks.md (auto-triggers)
Hook 1: Task 2 → commit → push → save tasks.md (auto-triggers)
Hook 1: Task 3 → commit → push → save tasks.md (auto-triggers)
...
Hook 1: Last task → commit → push → creates .tasks-complete (triggers Hook 2)
Hook 2: Build frontend → Build backend → creates .build-complete (triggers Hook 3)
Hook 3: Generate PR → Create PR → creates .pr-created
```

**NO MANUAL INTERVENTION NEEDED** - Just save tasks.md once and watch it go!

### Step 4: Approve PR
Go to GitHub, review the PR, approve it.

---

## 🔧 Troubleshooting

### Hook 1 Not Triggering
- Check if `01-task-executor.kiro.hook` is enabled
- Verify tasks.md path matches pattern
- Restart Kiro

### Hook 2 Not Triggering
- Check if `.tasks-complete` was created
- Verify all tasks are marked `[x]`
- Check if `02-build-publish.kiro.hook` is enabled

### Hook 3 Not Triggering
- Check if `.build-complete` was created
- Verify build was successful
- Check if `03-pr-creator.kiro.hook` is enabled

### Build Fails
- Check PublishProject.ps1 paths
- Verify npm and dotnet are installed
- Check for compilation errors

### PR Creation Fails
- Verify GitHub CLI is authenticated: `gh auth status`
- Check if feature branch exists
- Verify Kiro/dev branch exists

---

## 🧹 Cleanup

After PR is merged, clean up marker files:
```bash
rm .kiro/specs/[feature-name]/.tasks-complete
rm .kiro/specs/[feature-name]/.build-complete
rm .kiro/specs/[feature-name]/.pr-created
```

Or keep them for audit trail.

---

## ✅ Benefits of This Approach

1. **Single Responsibility**: Each hook does ONE thing
2. **Easy to Debug**: If something fails, you know exactly which hook
3. **Granular Commits**: Each task gets its own commit
4. **Clear Progress**: Marker files show exactly where you are
5. **Resumable**: If interrupted, just save tasks.md again
6. **Auditable**: Full history of what happened when

---

## 🆚 Comparison: Single Hook vs Hook Chain

| Aspect | Single Master Hook | Hook Chain |
|--------|-------------------|------------|
| Complexity | High | Low per hook |
| Debugging | Difficult | Easy |
| Commits | One big commit | One per task |
| Failure Recovery | Start over | Resume from failure |
| Modification | Risky | Safe |
| Understanding | Hard | Easy |

---

## 📝 Notes

- Hooks are numbered (01, 02, 03) for clarity
- Marker files start with `.` to be hidden
- Each hook is independent but connected via markers
- Human approval is still required for PR merge

---

**Created:** December 21, 2024
**Version:** 1.0
