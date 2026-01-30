# Git Release Tags - Quick Start Guide

## 🚀 5-Minute Quick Start

### What You Need to Know

Every deployment now automatically creates a Git release tag:
- **Dev:** `v1.2.3-dev.20241125.1`
- **Staging:** `v1.2.3-staging.20241126.1`
- **Production:** `v1.2.3`

---

## 📦 Common Tasks

### 1. Deploy to Development

**Automatic on push:**
```bash
git add .
git commit -m "Your changes"
git push origin Saas/dev
```

**Result:** Automatically creates tag like `v1.2.3-dev.20241125.1` and deploys

**Check deployment:**
```bash
# View created tag
git fetch --tags
git tag --list "v*-dev.*" --sort=-v:refname | head -1

# Check deployed version
curl https://edr-admin.app.karmatech-ai.com/version.json
```

---

### 2. Deploy to Staging

**Manual trigger:**
```bash
gh workflow run deploy-staging-with-tags.yml
```

**Or via GitHub UI:**
1. Go to Actions → Deploy to STAGING with Release Tags
2. Click "Run workflow"
3. Click "Run workflow" button

**Result:** Creates tag like `v1.2.3-staging.20241126.1` and deploys

---

### 3. Deploy to Production

**Manual trigger (requires approval):**
```bash
gh workflow run deploy-production-with-tags.yml \
  -f staging-tag=v1.2.3-staging.20241126.1
```

**Or via GitHub UI:**
1. Go to Actions → Deploy to PRODUCTION with Release Tags
2. Click "Run workflow"
3. Enter staging tag (e.g., `v1.2.3-staging.20241126.1`)
4. Click "Run workflow"
5. **Wait for approval notification**
6. Approve deployment

**Result:** Creates tag `v1.2.3` and deploys to production

---

### 4. Check Deployed Version

**Via API:**
```bash
# Dev
curl https://edr-admin.app.karmatech-ai.com/version.json

# Staging
curl https://staging.app.karmatech-ai.com/version.json

# Production
curl https://app.karmatech-ai.com/version.json
```

**Via Git:**
```bash
# List all tags
git tag --sort=-v:refname

# List dev tags only
git tag --list "v*-dev.*" --sort=-v:refname

# List production tags only
git tag --list "v[0-9]*.[0-9]*.[0-9]*" --sort=-v:refname | grep -v "-"
```

---

### 5. Rollback

**Via GitHub UI:**
1. Go to Actions → Rollback Deployment
2. Click "Run workflow"
3. Select:
   - **Environment:** production
   - **Rollback Tag:** v1.2.2 (previous version)
   - **Component:** full
   - **Reason:** "Critical bug in payment processing"
4. Click "Run workflow"
5. Approve (if production)

**Via CLI:**
```bash
gh workflow run rollback-deployment.yml \
  -f environment=production \
  -f rollback-tag=v1.2.2 \
  -f component=full \
  -f reason="Critical bug"
```

---

## 🔍 Troubleshooting

### Problem: Tag already exists

**Solution:** Build number auto-increments for dev/staging. For production, use a different version.

### Problem: Deployment failed

**Solution:**
1. Check GitHub Actions logs
2. Review error message
3. Fix issue and redeploy

### Problem: Version not showing

**Solution:**
1. Check if deployment completed
2. Clear browser cache
3. Check version.json directly: `curl https://app.karmatech-ai.com/version.json`

---

## 📚 More Information

- **Full Guide:** `deployment/GIT_RELEASE_TAGS_GUIDE.md`
- **Visual Diagrams:** `deployment/DEPLOYMENT_FLOW_DIAGRAM.md`
- **Implementation Details:** `deployment/IMPLEMENTATION_SUMMARY.md`
- **Executive Summary:** `deployment/EXECUTIVE_SUMMARY.md`

---

## 🆘 Need Help?

1. Check documentation first
2. Review GitHub Actions logs
3. Check deployment logs: `C:\Deployments\Logs\deployment-log.txt`
4. Contact DevOps team

---

## 📋 Cheat Sheet

```bash
# Deploy to dev (automatic)
git push origin Saas/dev

# Deploy to staging
gh workflow run deploy-staging-with-tags.yml

# Deploy to production
gh workflow run deploy-production-with-tags.yml \
  -f staging-tag=v1.2.3-staging.20241126.1

# Rollback
gh workflow run rollback-deployment.yml \
  -f environment=production \
  -f rollback-tag=v1.2.2 \
  -f component=full \
  -f reason="Critical bug"

# Check version
curl https://app.karmatech-ai.com/version.json

# List tags
git tag --sort=-v:refname | head -10

# Show tag details
git show v1.2.3

# Compare versions
git diff v1.2.2..v1.2.3
```

---

**Quick Start Version:** 1.0.0  
**Last Updated:** November 25, 2024
