# 🔧 Realistic Hook Chain Workflow Guide

**Updated:** December 21, 2024  
**Status:** Workaround for Kiro limitations  

---

## 🎯 What This Guide Provides

Since automatic hook chaining isn't possible due to Kiro platform limitations, this guide shows the **actual steps** needed to achieve semi-automated development workflow.

**Reality Check:** You'll need to manually trigger each hook, but each hook still provides significant automation value.

---

## 📋 Complete Workflow (With Manual Steps)

### Phase 1: Setup (One Time)
```
1. Create your spec files:
   - .kiro/specs/[feature-name]/requirements.md
   - .kiro/specs/[feature-name]/design.md  
   - .kiro/specs/[feature-name]/tasks.md

2. Verify hooks are enabled:
   - 01-task-executor.kiro.hook ✅
   - 02-build-publish.kiro.hook ✅
   - 03-pr-creator.kiro.hook ✅
```

### Phase 2: Task Execution (Manual Triggers Required)

#### Step 1: Execute First Task
```
👤 MANUAL ACTION:
1. Open tasks.md in Kiro
2. Press Ctrl+S (save the file)

🤖 AUTOMATIC RESULT:
- Hook 1 activates
- Executes first uncompleted task
- Marks task as [x] in tasks.md
- Commits and pushes changes
- Stops (does NOT continue to next task)
```

#### Step 2: Execute Next Task  
```
👤 MANUAL ACTION:
1. Open tasks.md in Kiro (should show first task as [x])
2. Press Ctrl+S (save the file again)

🤖 AUTOMATIC RESULT:
- Hook 1 activates again
- Executes next uncompleted task
- Marks task as [x] in tasks.md
- Commits and pushes changes
- Stops
```

#### Step 3: Repeat for All Tasks
```
👤 MANUAL ACTION:
Repeat Step 2 for each remaining task:
- Save tasks.md → Hook executes 1 task → Stop
- Save tasks.md → Hook executes 1 task → Stop
- Continue until all tasks are [x]

🤖 AUTOMATIC RESULT:
- Each task gets implemented
- Each task gets its own git commit
- Clean development history
```

### Phase 3: Build & Publish (Manual Trigger Required)

#### Step 4: Trigger Build Hook
```
👤 MANUAL ACTION:
1. Right-click in .kiro/specs/[feature-name]/ folder
2. Select "New File"
3. Name it: .tasks-complete
4. Add any content (e.g., "completed")
5. Save the file

🤖 AUTOMATIC RESULT:
- Hook 2 activates
- Runs PublishProject.ps1
- Builds React frontend
- Publishes .NET backend
- Creates .build-complete marker
- Commits and pushes
```

### Phase 4: PR Creation (Manual Trigger Required)

#### Step 5: Trigger PR Hook
```
👤 MANUAL ACTION:
1. Verify .build-complete file exists (created by Hook 2)
2. If not, create it manually:
   - Right-click in .kiro/specs/[feature-name]/ folder
   - New File: .build-complete
   - Add content: "build-success"
   - Save

🤖 AUTOMATIC RESULT:
- Hook 3 activates
- Generates comprehensive PR description
- Creates GitHub PR using gh cli
- Adds appropriate labels
- Reports PR URL
```

### Phase 5: Review & Merge (Manual)
```
👤 MANUAL ACTION:
1. Go to GitHub.com
2. Review the created PR
3. Approve and merge
4. Delete feature branch
```

---

## ⏱️ Time Breakdown

| Phase | Manual Time | Automated Time | Total |
|-------|-------------|----------------|-------|
| Setup | 5 min | 0 min | 5 min |
| Task Execution | 2 min × N tasks | 5 min × N tasks | 7N min |
| Build | 30 sec | 3 min | 3.5 min |
| PR Creation | 30 sec | 1 min | 1.5 min |
| Review | 10 min | 0 min | 10 min |
| **TOTAL** | **~20 min** | **~30 min** | **~50 min** |

**For 5 tasks:** ~55 minutes total (vs 8+ hours manual development)

**Automation Level:** ~60% (not 90% as originally promised)

---

## 🎯 Quick Reference Commands

### Trigger Hook 1 (Task Execution)
```
Action: Open tasks.md → Press Ctrl+S
Result: Executes next uncompleted task
Repeat: For each task
```

### Trigger Hook 2 (Build)
```
Action: Create .tasks-complete file with any content
Result: Builds frontend and backend
One-time: Only after all tasks complete
```

### Trigger Hook 3 (PR Creation)
```
Action: Verify .build-complete exists (auto-created by Hook 2)
Result: Creates GitHub PR
One-time: Only after successful build
```

---

## 🚨 Troubleshooting

### Hook 1 Not Triggering
**Problem:** Saved tasks.md but nothing happened
**Solution:**
1. Check if hook is enabled in Kiro settings
2. Verify tasks.md path matches pattern
3. Ensure there are uncompleted tasks `- [ ]`
4. Try closing and reopening the file

### Hook 2 Not Triggering  
**Problem:** Created .tasks-complete but build didn't start
**Solution:**
1. Verify all tasks are marked `[x]` in tasks.md
2. Check if .tasks-complete file was created in correct location
3. Try deleting and recreating the file
4. Verify Hook 2 is enabled

### Hook 3 Not Triggering
**Problem:** Build completed but PR wasn't created
**Solution:**
1. Verify .build-complete file exists
2. Check GitHub CLI authentication: `gh auth status`
3. Verify feature branch exists and is pushed
4. Check if PR already exists

### Build Failures
**Problem:** Hook 2 runs but build fails
**Solution:**
1. Check PublishProject.ps1 exists
2. Verify npm and dotnet are installed
3. Check for compilation errors in output
4. Run build manually first to debug

---

## 📊 Comparison: Ideal vs Reality

### What We Wanted (Impossible):
```
User: Save tasks.md once
System: Execute all tasks → Build → Create PR
User: Review PR
Time: 15 minutes total
```

### What We Actually Get (Possible):
```
User: Save tasks.md (repeat for each task)
System: Execute 1 task per save
User: Create .tasks-complete file  
System: Build project
User: Verify build success
System: Create PR
User: Review PR
Time: 50-60 minutes total
```

### Still Better Than Manual:
```
Manual Development: 8+ hours
With Hooks: 1 hour
Savings: 85%+ time saved
```

---

## 💡 Pro Tips

### Batch Task Execution
If you have many small tasks, consider combining them in the tasks.md to reduce manual triggers.

### Use File Templates
Create template files for common markers:
```
.tasks-complete-template → copy when needed
.build-complete-template → copy when needed
```

### Monitor Progress
Watch the git commits to see progress:
```bash
git log --oneline
```

### Prepare for Failures
Keep the feature branch - if a hook fails, you can resume from where it stopped.

---

## 🎯 Management Summary

**What Works:**
- ✅ Individual hooks provide significant automation
- ✅ Clean git history with one commit per task
- ✅ Structured, repeatable workflow
- ✅ 85%+ time savings vs manual development

**What Doesn't Work:**
- ❌ True "automatic chaining" between hooks
- ❌ "Save once, get PR" promise
- ❌ Zero manual intervention

**Bottom Line:**
- Still valuable automation, just not as seamless as promised
- Requires 5-10 manual triggers instead of 1
- Delivers 60% automation instead of 90%
- Significant time savings still achieved

---

**Created:** December 21, 2024  
**Status:** Production Ready  
**Audience:** Development team and management