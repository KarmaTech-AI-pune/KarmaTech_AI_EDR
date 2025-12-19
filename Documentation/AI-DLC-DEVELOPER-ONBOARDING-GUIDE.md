# AI-DLC Developer Onboarding Guide

**Welcome to KarmaTech's AI-Driven Development Lifecycle!**

This guide will help you set up your environment and start using the AI-DLC workflow to build features faster, with higher quality, and consistent standards.

---

## 🎯 What is AI-DLC?

AI-DLC is our automated development workflow that takes you from a business requirement all the way to deployment on the dev server. It combines:

- **Kiro IDE** - AI-powered development environment
- **Spec-Driven Development** - Structured requirements → design → tasks
- **GitHub Automation** - Automatic branching, PRs, and deployments
- **Quality Gates** - Built-in testing and validation

**Result:** 85% faster feature delivery with 95% fewer errors.

---

## 📋 Prerequisites Checklist

Before you begin, ensure you have:

| Tool | Version | Purpose | Installation |
|------|---------|---------|--------------|
| **Git** | 2.40+ | Version control | [git-scm.com](https://git-scm.com) |
| **Node.js** | 18+ LTS | Frontend development | [nodejs.org](https://nodejs.org) |
| **.NET SDK** | 8.0+ | Backend development | [dotnet.microsoft.com](https://dotnet.microsoft.com) |
| **VS Code** | Latest | Code editor (for Kiro) | [code.visualstudio.com](https://code.visualstudio.com) |
| **Kiro IDE** | Latest | AI-DLC automation | [https://kiro.dev/downloads/](https://https://kiro.dev/downloads/) |
| **GitHub CLI** | 2.40+ | PR automation | [cli.github.com](https://cli.github.com) |
| **SQL Server** | 2019+ | Local database | Already on dev machines |
| **PowerShell** | 7+ | Script execution | Windows built-in |

---

## 🚀 Step 1: Clone the Repository

```powershell
# Navigate to your projects folder
cd D:\Projects

# Clone the repository
git clone https://github.com/makshintre/KarmaTech_AI_EDR.git

# Enter the project directory
cd KarmaTech_AI_EDR

# Checkout the development branch
git checkout Kiro/dev

# Pull latest changes
git pull origin Kiro/dev
```

---

## 🔐 Step 2: Configure GitHub CLI

The GitHub CLI enables automatic PR creation and merging.

```powershell
# Install GitHub CLI (if not installed)
winget install GitHub.cli

# Authenticate with GitHub
gh auth login

# Follow the prompts:
# 1. Select "GitHub.com"
# 2. Select "HTTPS"
# 3. Select "Login with a web browser"
# 4. Copy the one-time code and paste in browser
# 5. Authorize GitHub CLI
```

**Verify authentication:**
```powershell
gh auth status
# Should show: ✓ Logged in to github.com as [your-username]
```

---

## 🛠️ Step 3: Install Kiro IDE

1. Go to [https://kiro.dev/downloads/](https://https://kiro.dev/downloads/)
2. Download Kiro IDE for Windows
3. Run the installer and follow setup instructions
4. Launch Kiro IDE

**Verify Kiro is working:**
- Open the KarmaTech_AI_EDR folder in Kiro IDE
- You should see the Kiro chat panel and AI features available

---

## 💾 Step 4: Set Up Local Database

```powershell
# Navigate to backend folder
cd backend

# Run database setup script
.\setup-database.ps1

# If you need to reset the database
.\drop-database.ps1
.\setup-database.ps1
```

---

## 📦 Step 5: Install Dependencies

**Backend:**
```powershell
cd backend
dotnet restore
dotnet build
```

**Frontend:**
```powershell
cd frontend
npm install
```

**Verify everything works:**
```powershell
# Run backend tests
cd backend
dotnet test

# Run frontend tests
cd frontend
npm test
```

---

## 🎮 Step 6: Your First AI-DLC Feature

Now let's walk through creating your first feature using AI-DLC.

### 6.1 Start a New Spec

1. Open Kiro IDE
2. Open the Kiro chat panel (or click Kiro icon)
3. Type your feature request:

```
I need to add a feature that [describe your feature here]
```

**Example:**
```
I need to add a feature that allows users to add notes to projects
```

### 6.2 Kiro Creates the Spec

Kiro will automatically:
1. Create `.kiro/specs/[feature-name]/requirements.md`
2. Ask you to review and approve requirements
3. Create `design.md` after approval
4. Ask you to review and approve design
5. Create `tasks.md` after approval
6. **Automatically create a feature branch**

### 6.3 Execute Tasks

Once the spec is approved:
1. Open `.kiro/specs/[feature-name]/tasks.md`
2. Click "Start task" next to the first task
3. Kiro implements the task
4. Review the changes
5. Continue to next task

### 6.4 Automatic PR Creation

When all tasks are complete:
1. Kiro runs all tests automatically
2. Creates a PR with test results
3. You review the PR on GitHub
4. Approve and merge

### 6.5 Automatic Deployment

After merge:
- GitHub Actions automatically deploys to dev server
- Version tag is created automatically
- You can verify at the dev server URL

---

## 📁 Project Structure Overview

```
KarmaTech_AI_EDR/
├── .kiro/
│   ├── specs/              # Feature specifications
│   │   └── [feature-name]/
│   │       ├── requirements.md
│   │       ├── design.md
│   │       └── tasks.md
│   └── steering/           # AI behavior rules
├── backend/
│   ├── src/
│   │   ├── NJS.API/        # API controllers
│   │   ├── NJS.Application/# CQRS commands/queries
│   │   └── NJS.Domain/     # Entities
│   └── NJS.API.Tests/      # Backend tests
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   └── types/          # TypeScript types
│   └── test/               # Frontend tests
├── Documentation/          # Project documentation
└── deployment/             # Deployment scripts
```

---

## 🔄 The AI-DLC Workflow (Visual)

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI-DLC 7-Step Workflow                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. REQUIREMENTS    You describe → Kiro creates requirements.md │
│         ↓           [Review & Approve]                          │
│                                                                 │
│  2. DESIGN          Kiro creates design.md with architecture    │
│         ↓           [Review & Approve]                          │
│                                                                 │
│  3. TASKS           Kiro creates tasks.md checklist             │
│         ↓           [Review & Approve]                          │
│                                                                 │
│  🤖 AUTO: Feature branch created (feature/[name])               │
│         ↓                                                       │
│                                                                 │
│  4. IMPLEMENTATION  Kiro writes code, you review each task      │
│         ↓           [Commits pushed automatically]              │
│                                                                 │
│  5. TESTING         Kiro runs tests, generates coverage report  │
│         ↓           [Must pass 80% coverage]                    │
│                                                                 │
│  6. PR CREATION     Kiro creates PR with test results           │
│         ↓           [YOU REVIEW & APPROVE - Only manual step]   │
│                                                                 │
│  7. DEPLOYMENT      Auto-merge → Auto-deploy to dev server      │
│                     [Version tag created automatically]         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ Quality Gates

Every feature must pass these gates:

| Gate | Requirement | When |
|------|-------------|------|
| **Requirements Approval** | Clear, testable acceptance criteria | After Step 1 |
| **Design Approval** | Architecture follows patterns | After Step 2 |
| **Tasks Approval** | All requirements covered | After Step 3 |
| **Tests Pass** | 100% tests passing | After Step 5 |
| **Coverage** | ≥80% code coverage | After Step 5 |
| **PR Approval** | Human code review | After Step 6 |

---

## 🛡️ Coding Standards Quick Reference

### Backend (C#/.NET)
- Use CQRS pattern (Commands/Queries with MediatR)
- Follow Repository pattern
- Use FluentValidation for input validation
- All entities inherit from BaseEntity
- Use DTOs for API responses (never expose entities)

### Frontend (React/TypeScript)
- Use functional components with hooks
- Define TypeScript interfaces for all data
- Use Material-UI components
- API calls go through service layer
- Use Formik + Yup for form validation

### Git Commits
- Use conventional commits: `feat:`, `fix:`, `docs:`, `test:`
- Keep commits focused and atomic
- Reference task numbers in commits

---

## 🆘 Troubleshooting

### "Kiro is not responding"
```powershell
# Restart Kiro IDE
# If still not working, check your internet connection
```

### "GitHub CLI not authenticated"
```powershell
gh auth login
# Follow the prompts again
```

### "Tests failing"
```powershell
# Check test output for specific failures
dotnet test --logger "console;verbosity=detailed"

# For frontend
npm test -- --verbose
```

### "Branch already exists"
```powershell
# Delete local branch
git branch -D feature/[name]

# Delete remote branch (if needed)
git push origin --delete feature/[name]
```

### "Merge conflicts"
```powershell
# Update your branch with latest dev
git checkout feature/[name]
git pull origin Kiro/dev
# Resolve conflicts in Kiro IDE
git add .
git commit -m "fix: resolve merge conflicts"
git push
```

---

## 📚 Key Documentation

| Document | Location | Purpose |
|----------|----------|---------|
| Architecture | `Documentation/ARCHITECTURE.md` | System design patterns |
| Coding Standards | `Documentation/CODING_STANDARDS.md` | Code style guide |
| API Documentation | `Documentation/API_DOCUMENTATION.md` | API endpoints reference |
| Database Schema | `Documentation/DATABASE_SCHEMA.md` | Table structures |
| AI-DLC Example | `Documentation/AI-DLC-Small-Feature-Example.md` | Detailed walkthrough |

---

## 🎯 Tips for Success

1. **Start Small** - Your first feature should be simple (add a field, new endpoint)
2. **Review Specs Carefully** - The spec drives everything, get it right
3. **Trust the Process** - Let Kiro handle the automation
4. **Ask Questions** - If something's unclear, ask before proceeding
5. **Don't Skip Steps** - Each step builds on the previous one
6. **Review Your PRs** - Even though Kiro wrote it, you own it

---

## 🤝 Getting Help

- **Slack Channel:** #ai-dlc-support
- **Documentation:** This guide + files in `/Documentation`
- **Team Lead:** [Your Name] - for workflow questions
- **Kiro Issues:** Check Kiro IDE logs or restart the application

---

## 🏁 Ready to Start?

1. ✅ Complete all setup steps above
2. ✅ Run the test commands to verify everything works
3. ✅ Pick a small feature from the backlog
4. ✅ Open Kiro and describe your feature
5. ✅ Follow the workflow!

**Welcome to the team! Let's build great software together.** 🚀

---

*Last Updated: December 2024*
*Version: 1.0*
