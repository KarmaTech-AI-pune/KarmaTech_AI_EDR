# Version Tagging Script - Quick Start Guide

## What It Does

Automatically creates version tags in the format: `v{MAJOR}.{MINOR}.{PATCH}-{ENV}.{DATE}.{BUILD}`

Example: `v1.3.0-dev.20241209.1`

## Quick Usage

### 1. Basic Usage (Auto-detect current branch)
```bash
./.github/scripts/create-version-tag.sh
```

### 2. Specify Branch
```bash
./.github/scripts/create-version-tag.sh "Kiro/dev"
```

### 3. Specify Version Increment
```bash
# Patch (default): 1.2.3 → 1.2.4
./.github/scripts/create-version-tag.sh "Kiro/dev" "patch"

# Minor: 1.2.3 → 1.3.0
./.github/scripts/create-version-tag.sh "Kiro/dev" "minor"

# Major: 1.2.3 → 2.0.0
./.github/scripts/create-version-tag.sh "Kiro/dev" "major"
```

## Branch → Environment Mapping

| Branch | Environment | Tag Example |
|--------|-------------|-------------|
| `Kiro/dev` | dev | `v1.3.0-dev.20241209.1` |
| `staging` | staging | `v1.3.0-staging.20241209.1` |
| `qa` | qa | `v1.3.0-qa.20241209.1` |
| `main` | prod | `v1.3.0-prod.20241209.1` + `v1.3.0` |

## Key Features

✅ **Auto-detects environment** from branch name  
✅ **Calculates next version** by reading existing tags  
✅ **Generates unique build numbers** for same-day deployments  
✅ **Creates clean production tags** (v1.3.0) for prod deployments  
✅ **Pushes tags to GitHub** automatically  
✅ **Exports variables** for GitHub Actions  

## Output

The script outputs these variables:
```
VERSION_TAG=v1.3.0-dev.20241209.1
VERSION=1.3.0
ENVIRONMENT=dev
BUILD_NUMBER=1
COMMIT_SHA=abc123...
```

## GitHub Actions Integration

```yaml
- name: Create Version Tag
  id: version
  run: ./.github/scripts/create-version-tag.sh
  
- name: Use Version
  run: echo "Deploying ${{ steps.version.outputs.version_tag }}"
```

## Troubleshooting

### Make Script Executable
```bash
chmod +x .github/scripts/create-version-tag.sh
```

### View Existing Tags
```bash
# All tags
git tag -l

# Tags for specific environment
git tag -l "v*-dev.*"
```

### Delete Tag (if needed)
```bash
# Local
git tag -d v1.3.0-dev.20241209.1

# Remote
git push origin :refs/tags/v1.3.0-dev.20241209.1
```

## Examples

### First Deployment Today
```bash
$ ./.github/scripts/create-version-tag.sh
[INFO] Generated version tag: v1.0.1-dev.20241209.1
[SUCCESS] Tag pushed to remote: v1.0.1-dev.20241209.1
VERSION_TAG=v1.0.1-dev.20241209.1
BUILD_NUMBER=1
```

### Second Deployment Same Day
```bash
$ ./.github/scripts/create-version-tag.sh
[INFO] Generated version tag: v1.0.2-dev.20241209.2
VERSION_TAG=v1.0.2-dev.20241209.2
BUILD_NUMBER=2
```

### Production Deployment
```bash
$ ./.github/scripts/create-version-tag.sh "main"
[INFO] Generated version tag: v1.3.0-prod.20241209.1
[SUCCESS] Tag pushed to remote: v1.3.0-prod.20241209.1
[INFO] Creating clean production tag...
[SUCCESS] Clean tag pushed to remote: v1.3.0
```

## Need More Help?

See the full documentation: [README.md](./README.md)
