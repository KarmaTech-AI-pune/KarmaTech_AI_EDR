# Git Release Tags Implementation Guide

## 📋 Overview

This guide documents the Git release tagging strategy implemented for the EDR deployment lifecycle across **Dev → Staging/QA → Production** environments.

---

## 🏷️ Tagging Strategy

### Tag Format

```
Development:    v{major}.{minor}.{patch}-dev.{YYYYMMDD}.{build}
Staging/QA:     v{major}.{minor}.{patch}-staging.{YYYYMMDD}.{build}
Production:     v{major}.{minor}.{patch}
```

### Examples

```
v1.2.3-dev.20241125.1        # First dev deployment on Nov 25, 2024
v1.2.3-dev.20241125.2        # Second dev deployment same day
v1.2.3-staging.20241126.1    # Staging deployment on Nov 26, 2024
v1.2.3                       # Production release (clean semantic version)
```

---

## 🔄 Deployment Lifecycle

### 1. Development Environment

**Trigger:** Push to `Saas/dev` branch

**Workflow:** `.github/workflows/deploy-dev-with-tags.yml`

**Process:**
1. Automatically creates dev release tag (e.g., `v1.2.3-dev.20241125.1`)
2. Builds frontend and backend with version embedded
3. Deploys to AWS dev environment
4. Creates `version.json` manifest in deployed artifacts

**Tag Creation:**
- Automatic on every deployment
- Build number auto-increments for same-day deployments
- Format: `v{version}-dev.{date}.{build}`

**Example:**
```bash
# Automatic on push to Saas/dev
git push origin Saas/dev

# Manual trigger with version bump
gh workflow run deploy-dev-with-tags.yml -f version-bump=minor
```

---

### 2. Staging/QA Environment

**Trigger:** Manual workflow dispatch or push to `staging` branch

**Workflow:** `.github/workflows/deploy-staging-with-tags.yml`

**Process:**
1. Creates staging release tag (e.g., `v1.2.3-staging.20241126.1`)
2. Can deploy from specific dev tag or latest commit
3. Runs automated QA tests
4. Deploys to staging environment for manual QA testing

**Tag Creation:**
- Manual trigger required
- Can reference source dev tag
- Format: `v{version}-staging.{date}.{build}`

**Example:**
```bash
# Deploy latest to staging
gh workflow run deploy-staging-with-tags.yml

# Deploy specific dev tag to staging
gh workflow run deploy-staging-with-tags.yml \
  -f source-tag=v1.2.3-dev.20241125.1 \
  -f version-bump=patch
```

---

### 3. Production Environment

**Trigger:** Manual workflow dispatch only (requires approval)

**Workflow:** `.github/workflows/deploy-production-with-tags.yml`

**Process:**
1. **Validates** staging tag exists and is approved
2. **Runs** pre-deployment tests (security, performance)
3. **Requires** manual approval (GitHub environment protection)
4. **Creates** production release tag (e.g., `v1.2.3`)
5. **Promotes** staging artifacts to production
6. **Runs** post-deployment verification
7. **Creates** GitHub Release with release notes

**Tag Creation:**
- Manual trigger only
- Requires staging tag as input
- Clean semantic version (no environment suffix)
- Creates GitHub Release automatically

**Example:**
```bash
# Promote staging to production
gh workflow run deploy-production-with-tags.yml \
  -f staging-tag=v1.2.3-staging.20241126.1 \
  -f version-bump=patch
```

---

## 🔧 Workflow Files

### Core Workflows

| Workflow | Purpose | Trigger |
|----------|---------|---------|
| `create-release-tags.yml` | Reusable tag creation workflow | Called by other workflows |
| `deploy-dev-with-tags.yml` | Dev deployment with tagging | Push to `Saas/dev` |
| `deploy-staging-with-tags.yml` | Staging deployment with tagging | Manual or push to `staging` |
| `deploy-production-with-tags.yml` | Production deployment with tagging | Manual only (requires approval) |
| `rollback-deployment.yml` | Rollback to previous tag | Manual only |

### Legacy Workflows (Still Active)

| Workflow | Status | Notes |
|----------|--------|-------|
| `push_Tags.yml` | ✅ Active | Creates tags on PR merge (existing) |
| `deploy-frontend-complete.yml` | ⚠️ Legacy | Use `deploy-dev-with-tags.yml` instead |
| `deploy-multitenant-backend.yml` | ⚠️ Legacy | Use `deploy-dev-with-tags.yml` instead |

---

## 📦 Version Manifest

Every deployment creates a `version.json` file in the deployed artifacts:

```json
{
  "version": "v1.2.3-dev.20241125.1",
  "semanticVersion": "1.2.3",
  "environment": "dev",
  "component": "frontend",
  "buildDate": "2024-11-25T10:30:00Z",
  "commitSha": "abc123def456",
  "branch": "Saas/dev",
  "deployedBy": "github-actions[bot]"
}
```

**Access URLs:**
- Dev: `https://edr-admin.app.karmatech-ai.com/version.json`
- Staging: `https://staging.app.karmatech-ai.com/version.json`
- Production: `https://app.karmatech-ai.com/version.json`

---

## 🔄 Rollback Process

### Using GitHub Actions

**Workflow:** `.github/workflows/rollback-deployment.yml`

**Steps:**
1. Go to Actions → Rollback Deployment
2. Click "Run workflow"
3. Select:
   - **Environment:** dev, staging, or production
   - **Rollback Tag:** Tag to rollback to (e.g., `v1.2.2-dev.20241124.1`)
   - **Component:** full, frontend-only, or backend-only
   - **Reason:** Description of why rollback is needed
4. Approve (if production)
5. Monitor rollback progress

**Example:**
```bash
gh workflow run rollback-deployment.yml \
  -f environment=production \
  -f rollback-tag=v1.2.2 \
  -f component=full \
  -f reason="Critical bug in payment processing"
```

### Using Local Script

**Script:** `deployment/scripts/Deploy-With-Git-Tags.ps1`

```powershell
# Rollback by checking out previous tag and redeploying
git checkout v1.2.2-dev.20241124.1

.\deployment\scripts\Deploy-With-Git-Tags.ps1 `
  -Environment "dev" `
  -Component "backend" `
  -VersionBump "patch"
```

---

## 🛠️ Local Deployment with Tags

### PowerShell Script

**Script:** `deployment/scripts/Deploy-With-Git-Tags.ps1`

**Features:**
- Creates Git release tags automatically
- Backs up current deployment
- Embeds version in build artifacts
- Creates deployment manifest
- Logs all deployments

**Usage:**

```powershell
# Deploy backend to dev
.\deployment\scripts\Deploy-With-Git-Tags.ps1 `
  -Environment "dev" `
  -Component "backend" `
  -VersionBump "patch"

# Deploy full stack to staging
.\deployment\scripts\Deploy-With-Git-Tags.ps1 `
  -Environment "staging" `
  -Component "full" `
  -VersionBump "minor"

# Deploy frontend only to production
.\deployment\scripts\Deploy-With-Git-Tags.ps1 `
  -Environment "production" `
  -Component "frontend" `
  -VersionBump "major"
```

**Parameters:**
- `-Environment`: dev, staging, production
- `-Component`: frontend, backend, full
- `-VersionBump`: patch, minor, major
- `-SiteName`: IIS site name (optional)
- `-AppPoolName`: IIS app pool name (optional)
- `-BackupPath`: Backup location (optional)

---

## 📊 Version Tracking

### View All Tags

```bash
# List all tags
git tag

# List dev tags only
git tag --list "v*-dev.*"

# List staging tags only
git tag --list "v*-staging.*"

# List production tags only
git tag --list "v[0-9]*.[0-9]*.[0-9]*" | grep -v "-"

# List tags sorted by version
git tag --sort=-v:refname
```

### View Tag Details

```bash
# Show tag annotation
git show v1.2.3-dev.20241125.1

# Show commit for tag
git rev-list -n 1 v1.2.3-dev.20241125.1

# Show files changed since tag
git diff v1.2.3-dev.20241125.1..HEAD
```

### Compare Deployments

```bash
# Compare two tags
git diff v1.2.2-dev.20241124.1..v1.2.3-dev.20241125.1

# Show commits between tags
git log v1.2.2-dev.20241124.1..v1.2.3-dev.20241125.1 --oneline

# Show what's in staging but not in production
git log v1.2.3..v1.2.3-staging.20241126.1 --oneline
```

---

## 🔍 Troubleshooting

### Tag Already Exists

**Problem:** Tag already exists when trying to deploy

**Solution:**
- For dev/staging: Build number auto-increments
- For production: Manual intervention required

```bash
# Delete local tag
git tag -d v1.2.3

# Delete remote tag
git push origin :refs/tags/v1.2.3

# Recreate tag
git tag -a v1.2.3 -m "Release v1.2.3"
git push origin v1.2.3
```

### Failed to Push Tag

**Problem:** Git push fails for tag

**Solution:**
```bash
# Check remote connection
git remote -v

# Fetch latest tags
git fetch --tags

# Force push tag (use with caution)
git push origin v1.2.3 --force
```

### Version Mismatch

**Problem:** Deployed version doesn't match expected tag

**Solution:**
```bash
# Check deployed version
curl https://app.karmatech-ai.com/version.json

# Verify tag exists
git tag --list "v1.2.3"

# Check tag commit
git show v1.2.3
```

---

## 📈 Best Practices

### 1. Version Bumping

- **Patch (x.x.X):** Bug fixes, minor updates
- **Minor (x.X.0):** New features, non-breaking changes
- **Major (X.0.0):** Breaking changes, major releases

### 2. Tag Naming

- ✅ **Good:** `v1.2.3-dev.20241125.1`
- ❌ **Bad:** `dev-release-nov-25`
- ❌ **Bad:** `v1.2.3-dev` (missing date and build)

### 3. Deployment Flow

```
Dev (v1.2.3-dev.20241125.1)
    ↓ (QA Testing)
Staging (v1.2.3-staging.20241126.1)
    ↓ (Approval + Final Testing)
Production (v1.2.3)
```

### 4. Rollback Strategy

- Always test rollback in dev/staging first
- Document rollback reason
- Monitor application after rollback
- Investigate root cause before redeploying

### 5. Tag Management

- Never delete production tags
- Keep dev/staging tags for at least 30 days
- Archive old tags periodically
- Use annotated tags (not lightweight tags)

---

## 🔗 Integration with Existing System

### Compatibility with `push_Tags.yml`

The new tagging system **coexists** with the existing `push_Tags.yml` workflow:

- **`push_Tags.yml`:** Creates tags on PR merge (existing behavior)
- **New workflows:** Create environment-specific tags on deployment

**Recommendation:** Gradually migrate to new system, then deprecate `push_Tags.yml`

### Migration Path

1. **Phase 1 (Current):** Both systems active
2. **Phase 2:** Use new system for all deployments
3. **Phase 3:** Disable `push_Tags.yml`
4. **Phase 4:** Clean up legacy tags

---

## 📝 Deployment Log

All deployments are logged to:
- **Local:** `C:\Deployments\Logs\deployment-log.txt`
- **GitHub:** Workflow run summaries
- **AWS:** CloudFormation stack tags

**Log Format:**
```
2024-11-25 10:30:00 | SUCCESS | backend | dev | v1.2.3-dev.20241125.1 | Backup: C:\Deployments\Backups\...
```

---

## 🎯 Quick Reference

### Common Commands

```bash
# Deploy to dev (automatic tagging)
git push origin Saas/dev

# Deploy to staging
gh workflow run deploy-staging-with-tags.yml

# Deploy to production
gh workflow run deploy-production-with-tags.yml \
  -f staging-tag=v1.2.3-staging.20241126.1

# Rollback production
gh workflow run rollback-deployment.yml \
  -f environment=production \
  -f rollback-tag=v1.2.2

# View deployed version
curl https://app.karmatech-ai.com/version.json

# List recent tags
git tag --sort=-v:refname | head -10
```

---

## 📞 Support

For issues or questions:
1. Check this guide first
2. Review workflow logs in GitHub Actions
3. Check deployment logs: `C:\Deployments\Logs\deployment-log.txt`
4. Contact DevOps team

---

**Last Updated:** November 25, 2024  
**Version:** 1.0.0  
**Maintained By:** DevOps Team
