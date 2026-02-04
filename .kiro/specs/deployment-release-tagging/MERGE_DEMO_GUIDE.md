# How to Demo Version Tagging on PR Merge

## Current Status

✅ **Workflow configured and ready**
✅ **Script tested and working**
✅ **Demo tags created to verify functionality**
✅ **Workflow updated to trigger on `Kiro/dev` branch**

## What Will Happen When You Merge This PR

### Step-by-Step Flow

```
1. You merge PR to Kiro/dev
   ↓
2. GitHub detects push to Kiro/dev
   ↓
3. Workflow "Deploy with Version Tags" triggers
   ↓
4. Script determines environment: "dev"
   ↓
5. Script calculates next version: v1.0.31 (after v1.0.30)
   ↓
6. Script generates tag: v1.0.31-dev.20241209.X
   ↓
7. Tag is created and pushed to GitHub
   ↓
8. Deployment proceeds with version info
   ↓
9. You can see the tag on GitHub!
```

## How to Verify After Merge

### Option 1: Check GitHub Web Interface

1. Go to: https://github.com/makshintre/KarmaTech_AI_EDR/tags
2. Look for the newest tag with format: `v1.0.31-dev.20241209.X`
3. Click on it to see details

### Option 2: Check via Git Command

```bash
# Fetch latest tags
git fetch --tags

# List recent dev tags
git tag -l "v*-dev.*" | tail -5

# Show details of latest tag
git show v1.0.31-dev.20241209.1
```

### Option 3: Check GitHub Actions

1. Go to: https://github.com/makshintre/KarmaTech_AI_EDR/actions
2. Look for workflow run: "Deploy with Version Tags"
3. Click on it to see the execution
4. Check the "Create Version Tag" job
5. You'll see output like:

```
[INFO] Current branch: Kiro/dev
[INFO] Environment: dev
[INFO] Current version: 1.0.30
[INFO] Next version: 1.0.31
[INFO] Date: 20241209
[INFO] Build number: 1
[INFO] Generated version tag: v1.0.31-dev.20241209.1
[SUCCESS] Tag created locally: v1.0.31-dev.20241209.1
[SUCCESS] Tag pushed to remote: v1.0.31-dev.20241209.1
```

## Demo Tags Already Created

To demonstrate the system is working, I've already created these demo tags:

- ✅ `v1.0.30-dev.20241209.1` - First dev deployment today
- ✅ `v1.0.30-dev.20241209.2` - Second dev deployment (build incremented)

**View them here:**
- https://github.com/makshintre/KarmaTech_AI_EDR/releases/tag/v1.0.30-dev.20241209.1
- https://github.com/makshintre/KarmaTech_AI_EDR/releases/tag/v1.0.30-dev.20241209.2

## Expected Tag After Your PR Merge

When you merge this PR to `Kiro/dev`, you should see:

```
Tag: v1.0.31-dev.20241209.3
     │  │  │   │    │       │
     │  │  │   │    │       └─ Build number (3rd deployment today)
     │  │  │   │    └───────── Date (YYYYMMDD)
     │  │  │   └────────────── Environment (dev)
     │  │  └────────────────── Patch version
     │  └───────────────────── Minor version
     └──────────────────────── Major version
```

**Why build number 3?**
- Build 1: `v1.0.30-dev.20241209.1` (demo tag)
- Build 2: `v1.0.30-dev.20241209.2` (demo tag)
- Build 3: `v1.0.31-dev.20241209.3` (your PR merge) ← **This will be created**

## What Gets Tagged

The tag will be created on the **merge commit** that gets created when you merge the PR to `Kiro/dev`.

## Workflow Trigger Conditions

The workflow triggers when:
- ✅ Push to `Kiro/dev` branch
- ✅ Changes in `frontend/**` OR `backend/**` OR workflow file itself

Your PR includes changes to the workflow file, so it **will definitely trigger**.

## What to Show in Demo

### Before Merge
```bash
# Show current tags
git tag -l "v*-dev.20241209.*"

# Output:
v1.0.30-dev.20241209.1
v1.0.30-dev.20241209.2
```

### After Merge
```bash
# Fetch and show new tags
git fetch --tags
git tag -l "v*-dev.20241209.*"

# Output:
v1.0.30-dev.20241209.1
v1.0.30-dev.20241209.2
v1.0.31-dev.20241209.3  ← NEW TAG!
```

### Show Tag Details
```bash
git show v1.0.31-dev.20241209.3

# Output will show:
# - Tag name
# - Tagger (github-actions[bot])
# - Date/time
# - Tag message with deployment details
# - Commit SHA
```

## Testing Different Environments

If you want to test other environments later:

### Staging
1. Create branch from `Kiro/dev`: `git checkout -b staging`
2. Push to GitHub: `git push origin staging`
3. Tag created: `v1.0.31-staging.20241209.1`

### Production
1. Merge to `main` branch
2. Two tags created:
   - `v1.0.31-prod.20241209.1` (environment-specific)
   - `v1.0.31` (clean release tag)

## Troubleshooting

### If workflow doesn't trigger:
1. Check GitHub Actions tab
2. Verify branch name is exactly `Kiro/dev`
3. Ensure changes are in `frontend/`, `backend/`, or workflow file

### If tag isn't created:
1. Check workflow logs in GitHub Actions
2. Look for errors in "Create Version Tag" job
3. Verify Git permissions are correct

### If you want to test without merging:
1. Manually trigger workflow from GitHub Actions UI
2. Or run the script locally:
   ```bash
   export BRANCH_NAME="Kiro/dev"
   export VERSION_INCREMENT="patch"
   bash .github/scripts/create-version-tag.sh
   ```

## Summary

✅ Everything is ready for your demo
✅ Workflow will trigger automatically on merge
✅ Tag will be created with format: `v1.0.31-dev.20241209.X`
✅ You can verify it immediately after merge
✅ Demo tags already exist to show the system works

**Just merge the PR and watch the magic happen!** 🚀
