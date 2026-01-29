# 🚀 AI-DLC Master Automation - Quick Start

## TL;DR

**One hook. Complete automation. Requirements → Deployment.**

## 3-Step Process

### 1️⃣ Create Spec
```
Tell Kiro: "Create a spec for [feature description]"
Kiro creates: requirements.md, design.md, tasks.md
```

### 2️⃣ Save tasks.md
```
Just save the file.
Master hook activates automatically.
```

### 3️⃣ Approve PR
```
Wait ~30 minutes
Review PR on GitHub
Click "Approve"
Done!
```

## What Happens Automatically

```
Save tasks.md (ONCE)
    ↓
🤖 Create branch
    ↓
🤖 Execute Task 1 → commit → push → save tasks.md
    ↓ (auto-triggers)
🤖 Execute Task 2 → commit → push → save tasks.md
    ↓ (auto-triggers)
🤖 Execute Task 3 → commit → push → save tasks.md
    ↓ (continues for all tasks automatically)
🤖 All tasks complete!
    ↓
🤖 Build React frontend
    ↓
🤖 Publish .NET backend
    ↓
🤖 Create GitHub PR
    ↓
👤 YOU APPROVE (10 min)
    ↓
✅ DONE!
```

**Key:** Save tasks.md ONCE, Kiro chains through ALL tasks automatically!

## Time Comparison

| Task | Before | After |
|------|--------|-------|
| Implementation | 12 hours | 30 minutes |
| Your time | 12 hours | 10 minutes |
| **Savings** | - | **94%** |

## Commands

### Check PR Status
```bash
gh pr list --label "kiro-automated"
```

### Manual Merge (if needed)
```bash
gh pr merge [PR-number] --merge --delete-branch
```

### Check Deployment
```bash
gh run list --workflow=deploy-dev-with-tags.yml --limit 1
```

## Troubleshooting

**Hook not working?**
- Restart Kiro
- Check if hook is enabled
- Verify tasks.md was saved

**Need help?**
- Read: `.kiro/hooks/README.md`
- Check: Agent Hooks UI in Kiro

## That's It!

**One hook. Complete automation. Ship features faster. 🚀**
