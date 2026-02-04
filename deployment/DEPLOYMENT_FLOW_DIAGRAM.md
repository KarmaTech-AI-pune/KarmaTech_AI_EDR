# Deployment Flow with Git Release Tags - Visual Guide

## 🎯 Complete Deployment Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DEVELOPMENT ENVIRONMENT                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Developer Push to Saas/dev                                                 │
│         │                                                                    │
│         ▼                                                                    │
│  ┌──────────────────────────────────────┐                                  │
│  │ deploy-dev-with-tags.yml             │                                  │
│  │ ────────────────────────────────     │                                  │
│  │ 1. Create Tag: v1.2.3-dev.20241125.1│                                  │
│  │ 2. Build Frontend + Backend          │                                  │
│  │ 3. Embed Version in Artifacts        │                                  │
│  │ 4. Deploy to AWS Dev                 │                                  │
│  │ 5. Create version.json               │                                  │
│  └──────────────────────────────────────┘                                  │
│         │                                                                    │
│         ▼                                                                    │
│  ✅ Deployed: v1.2.3-dev.20241125.1                                        │
│  📍 URL: https://edr-admin.app.karmatech-ai.com                            │
│  📄 Version: https://edr-admin.app.karmatech-ai.com/version.json           │
│                                                                              │
└──────────────────────────┬───────────────────────────────────────────────────┘
                           │
                           │ Manual Trigger (After Dev Testing)
                           │
┌──────────────────────────┴───────────────────────────────────────────────────┐
│                          STAGING/QA ENVIRONMENT                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Manual Workflow Dispatch                                                   │
│         │                                                                    │
│         ▼                                                                    │
│  ┌──────────────────────────────────────┐                                  │
│  │ deploy-staging-with-tags.yml         │                                  │
│  │ ────────────────────────────────     │                                  │
│  │ 1. Validate Source Tag (optional)    │                                  │
│  │ 2. Create Tag: v1.2.3-staging.*.1   │                                  │
│  │ 3. Build from Dev Tag or Latest      │                                  │
│  │ 4. Run Automated QA Tests            │                                  │
│  │ 5. Deploy to Staging Environment     │                                  │
│  │ 6. Create version.json               │                                  │
│  └──────────────────────────────────────┘                                  │
│         │                                                                    │
│         ▼                                                                    │
│  ✅ Deployed: v1.2.3-staging.20241126.1                                    │
│  📍 URL: https://staging.app.karmatech-ai.com                              │
│  📄 Version: https://staging.app.karmatech-ai.com/version.json             │
│                                                                              │
│  ┌──────────────────────────────────────┐                                  │
│  │ Manual QA Testing                    │                                  │
│  │ ────────────────────────────────     │                                  │
│  │ • Functional Testing                 │                                  │
│  │ • Integration Testing                │                                  │
│  │ • Performance Testing                │                                  │
│  │ • Security Testing                   │                                  │
│  │ • User Acceptance Testing            │                                  │
│  └──────────────────────────────────────┘                                  │
│         │                                                                    │
│         ▼                                                                    │
│  ✅ QA Approved                                                             │
│                                                                              │
└──────────────────────────┬───────────────────────────────────────────────────┘
                           │
                           │ Manual Trigger + Approval Required
                           │
┌──────────────────────────┴───────────────────────────────────────────────────┐
│                          PRODUCTION ENVIRONMENT                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Manual Workflow Dispatch (Requires Staging Tag)                            │
│         │                                                                    │
│         ▼                                                                    │
│  ┌──────────────────────────────────────┐                                  │
│  │ Pre-Deployment Validation            │                                  │
│  │ ────────────────────────────────     │                                  │
│  │ 1. Validate Staging Tag Exists       │                                  │
│  │ 2. Run Security Scan                 │                                  │
│  │ 3. Run Performance Tests             │                                  │
│  │ 4. Check Production Readiness        │                                  │
│  └──────────────────────────────────────┘                                  │
│         │                                                                    │
│         ▼                                                                    │
│  ⚠️  MANUAL APPROVAL REQUIRED                                               │
│  (GitHub Environment Protection)                                            │
│         │                                                                    │
│         ▼                                                                    │
│  ┌──────────────────────────────────────┐                                  │
│  │ deploy-production-with-tags.yml      │                                  │
│  │ ────────────────────────────────     │                                  │
│  │ 1. Create Tag: v1.2.3                │                                  │
│  │ 2. Promote Staging Artifacts         │                                  │
│  │ 3. Deploy to Production              │                                  │
│  │ 4. Create GitHub Release             │                                  │
│  │ 5. Run Health Checks                 │                                  │
│  │ 6. Notify Stakeholders               │                                  │
│  └──────────────────────────────────────┘                                  │
│         │                                                                    │
│         ▼                                                                    │
│  ✅ Deployed: v1.2.3                                                        │
│  📍 URL: https://app.karmatech-ai.com                                      │
│  📄 Version: https://app.karmatech-ai.com/version.json                     │
│  🎉 GitHub Release: https://github.com/.../releases/tag/v1.2.3             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Rollback Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ROLLBACK PROCESS                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Issue Detected in Production                                               │
│         │                                                                    │
│         ▼                                                                    │
│  ┌──────────────────────────────────────┐                                  │
│  │ Manual Workflow Dispatch             │                                  │
│  │ ────────────────────────────────     │                                  │
│  │ • Select Environment                 │                                  │
│  │ • Specify Rollback Tag               │                                  │
│  │ • Select Component                   │                                  │
│  │ • Provide Reason                     │                                  │
│  └──────────────────────────────────────┘                                  │
│         │                                                                    │
│         ▼                                                                    │
│  ┌──────────────────────────────────────┐                                  │
│  │ rollback-deployment.yml              │                                  │
│  │ ────────────────────────────────     │                                  │
│  │ 1. Validate Rollback Tag             │                                  │
│  │ 2. Checkout Previous Tag             │                                  │
│  │ 3. Rebuild from Tag                  │                                  │
│  │ 4. Deploy Previous Version           │                                  │
│  │ 5. Run Health Checks                 │                                  │
│  │ 6. Create Rollback Audit Log         │                                  │
│  └──────────────────────────────────────┘                                  │
│         │                                                                    │
│         ▼                                                                    │
│  ✅ Rolled Back to: v1.2.2                                                  │
│  📝 Reason: Critical bug in payment processing                              │
│  👤 Rolled Back By: DevOps Team                                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🏷️ Tag Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          TAG CREATION FLOW                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Deployment Triggered                                                        │
│         │                                                                    │
│         ▼                                                                    │
│  ┌──────────────────────────────────────┐                                  │
│  │ Get Latest Production Tag            │                                  │
│  │ ────────────────────────────────     │                                  │
│  │ git tag --list "v[0-9]*.[0-9]*.*"   │                                  │
│  │ Latest: v1.2.2                       │                                  │
│  └──────────────────────────────────────┘                                  │
│         │                                                                    │
│         ▼                                                                    │
│  ┌──────────────────────────────────────┐                                  │
│  │ Bump Version                         │                                  │
│  │ ────────────────────────────────     │                                  │
│  │ Patch: v1.2.2 → v1.2.3              │                                  │
│  │ Minor: v1.2.2 → v1.3.0              │                                  │
│  │ Major: v1.2.2 → v2.0.0              │                                  │
│  └──────────────────────────────────────┘                                  │
│         │                                                                    │
│         ▼                                                                    │
│  ┌──────────────────────────────────────┐                                  │
│  │ Add Environment Suffix               │                                  │
│  │ ────────────────────────────────     │                                  │
│  │ Dev:        v1.2.3-dev.20241125.1   │                                  │
│  │ Staging:    v1.2.3-staging.*.1      │                                  │
│  │ Production: v1.2.3                   │                                  │
│  └──────────────────────────────────────┘                                  │
│         │                                                                    │
│         ▼                                                                    │
│  ┌──────────────────────────────────────┐                                  │
│  │ Check for Conflicts                  │                                  │
│  │ ────────────────────────────────     │                                  │
│  │ Tag exists? → Auto-increment build   │                                  │
│  │ v1.2.3-dev.20241125.1 exists         │                                  │
│  │ → Use v1.2.3-dev.20241125.2          │                                  │
│  └──────────────────────────────────────┘                                  │
│         │                                                                    │
│         ▼                                                                    │
│  ┌──────────────────────────────────────┐                                  │
│  │ Create Annotated Tag                 │                                  │
│  │ ────────────────────────────────     │                                  │
│  │ git tag -a v1.2.3-dev.20241125.2    │                                  │
│  │   -m "Release v1.2.3-dev.20241125.2"│                                  │
│  │   -m "Environment: dev"              │                                  │
│  │   -m "Component: full"               │                                  │
│  │   -m "Commit: abc123"                │                                  │
│  │   -m "Deployed by: github-actions"   │                                  │
│  └──────────────────────────────────────┘                                  │
│         │                                                                    │
│         ▼                                                                    │
│  ┌──────────────────────────────────────┐                                  │
│  │ Push Tag to Remote                   │                                  │
│  │ ────────────────────────────────     │                                  │
│  │ git push origin v1.2.3-dev.20241125.2│                                  │
│  └──────────────────────────────────────┘                                  │
│         │                                                                    │
│         ▼                                                                    │
│  ✅ Tag Created and Pushed                                                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📦 Version Manifest Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          VERSION TRACKING                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Build Process                                                               │
│         │                                                                    │
│         ▼                                                                    │
│  ┌──────────────────────────────────────┐                                  │
│  │ Embed Version in Build               │                                  │
│  │ ────────────────────────────────     │                                  │
│  │ Frontend: .env.production            │                                  │
│  │   VITE_APP_VERSION=v1.2.3-dev.*.1   │                                  │
│  │   VITE_BUILD_DATE=2024-11-25...     │                                  │
│  │   VITE_COMMIT_SHA=abc123            │                                  │
│  │                                      │                                  │
│  │ Backend: Docker Labels               │                                  │
│  │   version=v1.2.3-dev.20241125.1     │                                  │
│  │   environment=dev                    │                                  │
│  │   commit=abc123                      │                                  │
│  └──────────────────────────────────────┘                                  │
│         │                                                                    │
│         ▼                                                                    │
│  ┌──────────────────────────────────────┐                                  │
│  │ Create version.json                  │                                  │
│  │ ────────────────────────────────     │                                  │
│  │ {                                    │                                  │
│  │   "version": "v1.2.3-dev.*.1",      │                                  │
│  │   "semanticVersion": "1.2.3",       │                                  │
│  │   "environment": "dev",              │                                  │
│  │   "buildDate": "2024-11-25T...",    │                                  │
│  │   "commitSha": "abc123",             │                                  │
│  │   "deployedBy": "github-actions"     │                                  │
│  │ }                                    │                                  │
│  └──────────────────────────────────────┘                                  │
│         │                                                                    │
│         ▼                                                                    │
│  ┌──────────────────────────────────────┐                                  │
│  │ Deploy to S3/IIS                     │                                  │
│  │ ────────────────────────────────     │                                  │
│  │ • version.json in root               │                                  │
│  │ • Accessible via HTTP                │                                  │
│  └──────────────────────────────────────┘                                  │
│         │                                                                    │
│         ▼                                                                    │
│  ┌──────────────────────────────────────┐                                  │
│  │ Tag AWS Resources                    │                                  │
│  │ ────────────────────────────────     │                                  │
│  │ CloudFormation Stack Tags:           │                                  │
│  │   Environment=dev                    │                                  │
│  │   Version=1.2.3                      │                                  │
│  │   ReleaseTag=v1.2.3-dev.20241125.1  │                                  │
│  │   DeployedBy=github-actions          │                                  │
│  └──────────────────────────────────────┘                                  │
│         │                                                                    │
│         ▼                                                                    │
│  ✅ Version Tracked Everywhere                                              │
│                                                                              │
│  Access Points:                                                              │
│  • https://app.karmatech-ai.com/version.json                               │
│  • AWS CloudFormation Stack Tags                                            │
│  • Docker Image Labels                                                      │
│  • Git Tags                                                                 │
│  • Deployment Logs                                                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Version Comparison

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ENVIRONMENT VERSION COMPARISON                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────┐                                  │
│  │ DEVELOPMENT                          │                                  │
│  │ ────────────────────────────────     │                                  │
│  │ Current: v1.2.4-dev.20241125.3      │                                  │
│  │ Previous: v1.2.4-dev.20241125.2     │                                  │
│  │ Status: ✅ Latest                    │                                  │
│  └──────────────────────────────────────┘                                  │
│         │                                                                    │
│         │ (Ahead by 1 build)                                                │
│         ▼                                                                    │
│  ┌──────────────────────────────────────┐                                  │
│  │ STAGING                              │                                  │
│  │ ────────────────────────────────     │                                  │
│  │ Current: v1.2.4-staging.20241125.1  │                                  │
│  │ Source: v1.2.4-dev.20241125.2       │                                  │
│  │ Status: ⚠️  Behind dev by 1 build    │                                  │
│  └──────────────────────────────────────┘                                  │
│         │                                                                    │
│         │ (Ahead by 1 minor version)                                        │
│         ▼                                                                    │
│  ┌──────────────────────────────────────┐                                  │
│  │ PRODUCTION                           │                                  │
│  │ ────────────────────────────────     │                                  │
│  │ Current: v1.2.3                      │                                  │
│  │ Previous: v1.2.2                     │                                  │
│  │ Status: ⚠️  Behind staging           │                                  │
│  └──────────────────────────────────────┘                                  │
│                                                                              │
│  Commands to Compare:                                                        │
│  ────────────────────────────────────────                                  │
│  # What's in dev but not in staging?                                        │
│  git log v1.2.4-staging.20241125.1..v1.2.4-dev.20241125.3 --oneline       │
│                                                                              │
│  # What's in staging but not in production?                                 │
│  git log v1.2.3..v1.2.4-staging.20241125.1 --oneline                       │
│                                                                              │
│  # Compare files between environments                                        │
│  git diff v1.2.3..v1.2.4-staging.20241125.1                                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Tag Naming Examples

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          TAG NAMING PATTERNS                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Development Tags:                                                           │
│  ────────────────────────────────────────                                  │
│  v1.0.0-dev.20241125.1    ← First deployment on Nov 25                     │
│  v1.0.0-dev.20241125.2    ← Second deployment same day                     │
│  v1.0.1-dev.20241126.1    ← Patch bump, next day                           │
│  v1.1.0-dev.20241127.1    ← Minor bump                                     │
│  v2.0.0-dev.20241128.1    ← Major bump                                     │
│                                                                              │
│  Staging Tags:                                                               │
│  ────────────────────────────────────────                                  │
│  v1.0.0-staging.20241126.1    ← Promoted from dev                          │
│  v1.0.1-staging.20241127.1    ← Patch release to staging                   │
│  v1.1.0-staging.20241128.1    ← Minor release to staging                   │
│                                                                              │
│  Production Tags:                                                            │
│  ────────────────────────────────────────                                  │
│  v1.0.0    ← Initial production release                                     │
│  v1.0.1    ← Patch release (bug fix)                                        │
│  v1.1.0    ← Minor release (new features)                                   │
│  v2.0.0    ← Major release (breaking changes)                               │
│                                                                              │
│  Tag Anatomy:                                                                │
│  ────────────────────────────────────────                                  │
│  v1.2.3-dev.20241125.1                                                      │
│  │ │ │ │   │        │                                                       │
│  │ │ │ │   │        └─ Build number (increments per day)                   │
│  │ │ │ │   └────────── Date (YYYYMMDD)                                     │
│  │ │ │ └────────────── Environment (dev/staging)                            │
│  │ │ └──────────────── Patch version                                        │
│  │ └────────────────── Minor version                                        │
│  └──────────────────── Major version                                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Quick Reference Commands

```bash
# View all tags
git tag --sort=-v:refname

# View dev tags only
git tag --list "v*-dev.*" --sort=-v:refname

# View staging tags only
git tag --list "v*-staging.*" --sort=-v:refname

# View production tags only
git tag --list "v[0-9]*.[0-9]*.[0-9]*" --sort=-v:refname | grep -v "-"

# Show tag details
git show v1.2.3-dev.20241125.1

# Compare tags
git diff v1.2.2..v1.2.3

# Check deployed version
curl https://app.karmatech-ai.com/version.json

# Deploy to dev (automatic)
git push origin Saas/dev

# Deploy to staging (manual)
gh workflow run deploy-staging-with-tags.yml

# Deploy to production (manual + approval)
gh workflow run deploy-production-with-tags.yml \
  -f staging-tag=v1.2.3-staging.20241126.1

# Rollback
gh workflow run rollback-deployment.yml \
  -f environment=production \
  -f rollback-tag=v1.2.2 \
  -f component=full \
  -f reason="Critical bug"
```

---

**Visual Guide Version:** 1.0.0  
**Last Updated:** November 25, 2024
