# Version Tagging Script - Testing Guide

## Pre-Testing Checklist

Before testing the script, ensure:

- [ ] Git is installed and configured
- [ ] You have write access to the repository
- [ ] You're on a valid branch (Kiro/dev, staging, qa, or main)
- [ ] Script is executable: `chmod +x .github/scripts/create-version-tag.sh`

## Test Scenarios

### Test 1: First Deployment (No Existing Tags)

**Purpose:** Verify script creates initial version tag

**Steps:**
```bash
# Ensure no tags exist for dev environment
git tag -l "v*-dev.*"

# Run script
./.github/scripts/create-version-tag.sh "Kiro/dev"
```

**Expected Output:**
```
[INFO] Current version: 1.0.0
[INFO] Next version: 1.0.1
[INFO] Generated version tag: v1.0.1-dev.20241209.1
[SUCCESS] Tag pushed to remote: v1.0.1-dev.20241209.1
VERSION_TAG=v1.0.1-dev.20241209.1
VERSION=1.0.1
ENVIRONMENT=dev
BUILD_NUMBER=1
```

**Verification:**
```bash
# Check tag was created
git tag -l "v1.0.1-dev.*"

# View tag details
git show v1.0.1-dev.20241209.1
```

---

### Test 2: Multiple Deployments Same Day

**Purpose:** Verify build number increments correctly

**Steps:**
```bash
# First deployment
./.github/scripts/create-version-tag.sh "Kiro/dev"

# Second deployment (same day)
./.github/scripts/create-version-tag.sh "Kiro/dev"

# Third deployment (same day)
./.github/scripts/create-version-tag.sh "Kiro/dev"
```

**Expected Output:**
```
# First: v1.0.1-dev.20241209.1
# Second: v1.0.2-dev.20241209.2
# Third: v1.0.3-dev.20241209.3
```

**Verification:**
```bash
# List all tags for today
git tag -l "v*-dev.20241209.*"
```

---

### Test 3: Different Environments

**Purpose:** Verify environment detection works correctly

**Steps:**
```bash
# Dev environment
./.github/scripts/create-version-tag.sh "Kiro/dev"

# Staging environment
./.github/scripts/create-version-tag.sh "staging"

# QA environment
./.github/scripts/create-version-tag.sh "qa"

# Production environment
./.github/scripts/create-version-tag.sh "main"
```

**Expected Output:**
```
# Dev: v1.0.1-dev.20241209.1
# Staging: v1.0.1-staging.20241209.1
# QA: v1.0.1-qa.20241209.1
# Prod: v1.0.1-prod.20241209.1 + v1.0.1 (clean tag)
```

**Verification:**
```bash
# Check each environment has its own tags
git tag -l "v*-dev.*"
git tag -l "v*-staging.*"
git tag -l "v*-qa.*"
git tag -l "v*-prod.*"

# Check clean production tag exists
git tag -l "v1.0.1"
```

---

### Test 4: Version Increment Types

**Purpose:** Verify semantic versioning works correctly

**Steps:**
```bash
# Patch increment (default)
./.github/scripts/create-version-tag.sh "Kiro/dev" "patch"

# Minor increment
./.github/scripts/create-version-tag.sh "Kiro/dev" "minor"

# Major increment
./.github/scripts/create-version-tag.sh "Kiro/dev" "major"
```

**Expected Output:**
```
# Starting from v1.2.3:
# Patch: v1.2.4-dev.20241209.1
# Minor: v1.3.0-dev.20241209.2
# Major: v2.0.0-dev.20241209.3
```

**Verification:**
```bash
# Check version progression
git tag -l "v*-dev.*" | sort -V
```

---

### Test 5: Production Clean Tag

**Purpose:** Verify production creates both environment and clean tags

**Steps:**
```bash
# Deploy to production
./.github/scripts/create-version-tag.sh "main"
```

**Expected Output:**
```
[INFO] Generated version tag: v1.3.0-prod.20241209.1
[SUCCESS] Tag pushed to remote: v1.3.0-prod.20241209.1
[INFO] Production deployment detected. Creating clean release tag...
[SUCCESS] Clean tag pushed to remote: v1.3.0
```

**Verification:**
```bash
# Check both tags exist
git tag -l "v1.3.0-prod.*"
git tag -l "v1.3.0"

# Verify they point to same commit
git rev-list -n 1 v1.3.0-prod.20241209.1
git rev-list -n 1 v1.3.0
```

---

### Test 6: Environment Variables

**Purpose:** Verify environment variable overrides work

**Steps:**
```bash
# Override branch name
BRANCH_NAME="staging" ./.github/scripts/create-version-tag.sh

# Override version increment
VERSION_INCREMENT="minor" ./.github/scripts/create-version-tag.sh "Kiro/dev"

# Override commit SHA
COMMIT_SHA="HEAD~1" ./.github/scripts/create-version-tag.sh "Kiro/dev"
```

**Expected Output:**
```
# Should use overridden values
[INFO] Using branch: staging
[INFO] Increment type: minor
[INFO] Commit SHA: <previous commit>
```

---

### Test 7: Error Handling

**Purpose:** Verify script handles errors gracefully

**Steps:**
```bash
# Test 7a: Unknown branch
./.github/scripts/create-version-tag.sh "unknown-branch"

# Test 7b: Duplicate tag (run same command twice)
./.github/scripts/create-version-tag.sh "Kiro/dev"
./.github/scripts/create-version-tag.sh "Kiro/dev"  # Should fail
```

**Expected Output:**
```
# Test 7a:
[ERROR] Unknown branch: unknown-branch. Cannot determine environment.

# Test 7b:
[ERROR] Failed to create tag: v1.0.1-dev.20241209.1
fatal: tag 'v1.0.1-dev.20241209.1' already exists
```

---

### Test 8: GitHub Actions Integration

**Purpose:** Verify script exports variables for GitHub Actions

**Steps:**
```bash
# Create temporary output file
export GITHUB_OUTPUT=$(mktemp)

# Run script
./.github/scripts/create-version-tag.sh "Kiro/dev"

# Check output file
cat $GITHUB_OUTPUT
```

**Expected Output:**
```
version_tag=v1.0.1-dev.20241209.1
version=1.0.1
environment=dev
build_number=1
commit_sha=abc123def456...
```

---

## Automated Test Script

Create a test script to run all tests automatically:

```bash
#!/bin/bash
# test-version-tagging.sh

echo "=== Version Tagging Script Test Suite ==="

# Test 1: Environment Detection
echo "Test 1: Environment Detection"
for branch in "Kiro/dev" "staging" "qa" "main"; do
    echo "Testing branch: $branch"
    ./.github/scripts/create-version-tag.sh "$branch" 2>&1 | grep "Environment:"
done

# Test 2: Version Increment
echo "Test 2: Version Increment Types"
for type in "patch" "minor" "major"; do
    echo "Testing increment: $type"
    ./.github/scripts/create-version-tag.sh "Kiro/dev" "$type" 2>&1 | grep "Increment type:"
done

# Test 3: Build Number Increment
echo "Test 3: Build Number Increment"
./.github/scripts/create-version-tag.sh "Kiro/dev" 2>&1 | grep "Build number:"
./.github/scripts/create-version-tag.sh "Kiro/dev" 2>&1 | grep "Build number:"

echo "=== Test Suite Complete ==="
```

---

## Cleanup After Testing

After testing, you may want to clean up test tags:

```bash
# List all test tags
git tag -l "v*-dev.*"

# Delete specific tag locally
git tag -d v1.0.1-dev.20241209.1

# Delete specific tag from remote
git push origin :refs/tags/v1.0.1-dev.20241209.1

# Delete all dev tags (CAREFUL!)
git tag -l "v*-dev.*" | xargs git tag -d
git tag -l "v*-dev.*" | xargs -I {} git push origin :refs/tags/{}
```

---

## Integration Testing with GitHub Actions

Test the script in a GitHub Actions workflow:

```yaml
name: Test Version Tagging

on:
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          fetch-depth: 0
          
      - name: Test Script
        id: version
        run: |
          chmod +x .github/scripts/create-version-tag.sh
          ./.github/scripts/create-version-tag.sh
          
      - name: Verify Outputs
        run: |
          echo "Version Tag: ${{ steps.version.outputs.version_tag }}"
          echo "Version: ${{ steps.version.outputs.version }}"
          echo "Environment: ${{ steps.version.outputs.environment }}"
          echo "Build Number: ${{ steps.version.outputs.build_number }}"
          
      - name: Verify Tag Exists
        run: |
          git fetch --tags
          git tag -l "${{ steps.version.outputs.version_tag }}"
```

---

## Performance Testing

Test script performance with many existing tags:

```bash
# Create 100 test tags
for i in {1..100}; do
    git tag "v1.0.$i-dev.20241209.$i"
done

# Time the script execution
time ./.github/scripts/create-version-tag.sh "Kiro/dev"

# Expected: < 5 seconds
```

---

## Troubleshooting Test Failures

### Script Not Executable
```bash
chmod +x .github/scripts/create-version-tag.sh
```

### Git Not Found
```bash
which git
# Install git if not found
```

### Permission Denied (Push)
```bash
# Check git remote
git remote -v

# Check authentication
git config user.name
git config user.email
```

### Tag Already Exists
```bash
# Delete and retry
git tag -d <tag-name>
git push origin :refs/tags/<tag-name>
```

---

## Test Results Documentation

Document your test results:

```markdown
# Test Results - Version Tagging Script

**Date:** 2024-12-09
**Tester:** [Your Name]
**Environment:** Windows/Linux/macOS

## Test Summary

| Test | Status | Notes |
|------|--------|-------|
| First Deployment | ✅ Pass | Tag created successfully |
| Multiple Same Day | ✅ Pass | Build numbers increment correctly |
| Different Environments | ✅ Pass | All environments work |
| Version Increments | ✅ Pass | Patch/minor/major work |
| Production Clean Tag | ✅ Pass | Both tags created |
| Environment Variables | ✅ Pass | Overrides work |
| Error Handling | ✅ Pass | Errors handled gracefully |
| GitHub Actions | ✅ Pass | Variables exported correctly |

## Issues Found

None

## Recommendations

Script is ready for production use.
```

---

## Next Steps After Testing

Once all tests pass:

1. ✅ Commit the script to repository
2. ✅ Update GitHub Actions workflows to use the script
3. ✅ Document usage in team wiki
4. ✅ Train team members on usage
5. ✅ Monitor first production deployment

---

**For questions or issues, refer to the main [README.md](./README.md)**
