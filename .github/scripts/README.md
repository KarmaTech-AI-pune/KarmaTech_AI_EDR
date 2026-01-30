# Version Tagging Script

## Overview

The `create-version-tag.sh` script automates the creation of environment-specific version tags for the EDR deployment pipeline.

## Version Tag Format

```
v{MAJOR}.{MINOR}.{PATCH}-{ENV}.{DATE}.{BUILD}
```

**Examples:**
- `v1.3.0-dev.20241209.1` - First dev deployment on Dec 9, 2024
- `v1.3.0-dev.20241209.2` - Second dev deployment same day
- `v1.3.0-staging.20241210.1` - Staging deployment on Dec 10, 2024
- `v1.3.0-prod.20241212.1` - Production deployment on Dec 12, 2024
- `v1.3.0` - Clean production release tag (created alongside prod tag)

## Branch to Environment Mapping

| Branch Name | Environment | Tag Suffix |
|-------------|-------------|------------|
| `Kiro/dev` | dev | `-dev` |
| `staging` | staging | `-staging` |
| `qa` | qa | `-qa` |
| `main` / `production` | prod | `-prod` |

## Usage

### Basic Usage (Auto-detect branch)

```bash
./.github/scripts/create-version-tag.sh
```

### Specify Branch Name

```bash
./.github/scripts/create-version-tag.sh "Kiro/dev"
```

### Specify Version Increment Type

```bash
# Patch increment (default) - v1.2.3 -> v1.2.4
./.github/scripts/create-version-tag.sh "Kiro/dev" "patch"

# Minor increment - v1.2.3 -> v1.3.0
./.github/scripts/create-version-tag.sh "Kiro/dev" "minor"

# Major increment - v1.2.3 -> v2.0.0
./.github/scripts/create-version-tag.sh "Kiro/dev" "major"
```

### Using Environment Variables

```bash
# Override branch name
BRANCH_NAME="staging" ./.github/scripts/create-version-tag.sh

# Override version increment type
VERSION_INCREMENT="minor" ./.github/scripts/create-version-tag.sh

# Override commit SHA
COMMIT_SHA="abc123" ./.github/scripts/create-version-tag.sh
```

## GitHub Actions Integration

The script automatically exports variables for GitHub Actions when `GITHUB_OUTPUT` is set:

```yaml
- name: Create Version Tag
  id: version
  run: ./.github/scripts/create-version-tag.sh
  
- name: Use Version Tag
  run: |
    echo "Version Tag: ${{ steps.version.outputs.version_tag }}"
    echo "Version: ${{ steps.version.outputs.version }}"
    echo "Environment: ${{ steps.version.outputs.environment }}"
    echo "Build Number: ${{ steps.version.outputs.build_number }}"
    echo "Commit SHA: ${{ steps.version.outputs.commit_sha }}"
```

## Features

### 1. Environment Detection
- Automatically determines environment from branch name
- Supports dev, staging, qa, and prod environments
- Fails with clear error for unknown branches

### 2. Version Calculation
- Reads existing tags to determine current version
- Supports semantic versioning (MAJOR.MINOR.PATCH)
- Defaults to v1.0.0 if no tags exist
- Supports patch, minor, and major increments

### 3. Build Number Generation
- Generates unique build numbers for same-day deployments
- Automatically increments for multiple deployments per day
- Format: `{DATE}.{BUILD}` (e.g., `20241209.1`, `20241209.2`)

### 4. Production Clean Tags
- For production deployments, creates two tags:
  - Environment tag: `v1.3.0-prod.20241209.1`
  - Clean tag: `v1.3.0`
- Clean tag is used for release notes and GitHub Releases

### 5. Git Tag Management
- Creates annotated tags with detailed metadata
- Pushes tags to remote repository automatically
- Includes commit SHA, branch, and deployment details
- Prevents duplicate tags

## Output

The script outputs the following information:

```
VERSION_TAG=v1.3.0-dev.20241209.1
VERSION=1.3.0
ENVIRONMENT=dev
BUILD_NUMBER=1
COMMIT_SHA=abc123def456...
```

## Error Handling

The script will exit with an error if:
- Branch name cannot be mapped to an environment
- Git operations fail (tag creation, push)
- Required Git commands are not available

## Requirements

- Git installed and configured
- Write access to the repository
- Network access to push tags to remote

## Testing

### Test in Dry-Run Mode

To test without creating actual tags, you can modify the script temporarily or use Git's dry-run features:

```bash
# View what tags would be created
git tag -l "v*-dev.*"

# Test tag creation locally (don't push)
# Comment out the `git push` line in the script
```

### Verify Tag Creation

```bash
# List all tags
git tag -l

# List tags for specific environment
git tag -l "v*-dev.*"

# View tag details
git show v1.3.0-dev.20241209.1
```

## Troubleshooting

### Permission Denied

If you get a permission error, make the script executable:

```bash
chmod +x .github/scripts/create-version-tag.sh
```

### Tag Already Exists

If a tag already exists, the script will fail. To force recreate:

```bash
# Delete local tag
git tag -d v1.3.0-dev.20241209.1

# Delete remote tag
git push origin :refs/tags/v1.3.0-dev.20241209.1

# Run script again
./.github/scripts/create-version-tag.sh
```

### Wrong Environment Detected

Ensure your branch name matches the expected patterns:
- `Kiro/dev` or `dev` → dev environment
- `staging` → staging environment
- `qa` → qa environment
- `main` or `production` → prod environment

## Examples

### Example 1: First Dev Deployment

```bash
$ ./.github/scripts/create-version-tag.sh
[INFO] === Version Tagging Script Started ===
[INFO] Current branch: Kiro/dev
[INFO] Using branch: Kiro/dev
[INFO] Environment: dev
[INFO] Current version: 1.0.0
[INFO] Increment type: patch
[INFO] Next version: 1.0.1
[INFO] Date: 20241209
[INFO] Build number: 1
[INFO] Generated version tag: v1.0.1-dev.20241209.1
[SUCCESS] Tag created locally: v1.0.1-dev.20241209.1
[SUCCESS] Tag pushed to remote: v1.0.1-dev.20241209.1
[SUCCESS] === Version Tagging Complete ===
VERSION_TAG=v1.0.1-dev.20241209.1
VERSION=1.0.1
ENVIRONMENT=dev
BUILD_NUMBER=1
```

### Example 2: Second Dev Deployment Same Day

```bash
$ ./.github/scripts/create-version-tag.sh
[INFO] Generated version tag: v1.0.2-dev.20241209.2
[SUCCESS] === Version Tagging Complete ===
VERSION_TAG=v1.0.2-dev.20241209.2
BUILD_NUMBER=2
```

### Example 3: Production Deployment

```bash
$ ./.github/scripts/create-version-tag.sh "main"
[INFO] Environment: prod
[INFO] Generated version tag: v1.3.0-prod.20241209.1
[SUCCESS] Tag pushed to remote: v1.3.0-prod.20241209.1
[INFO] Production deployment detected. Creating clean release tag...
[SUCCESS] Clean tag pushed to remote: v1.3.0
[SUCCESS] === Version Tagging Complete ===
VERSION_TAG=v1.3.0-prod.20241209.1
```

## Integration with Deployment Workflow

This script is designed to be called from GitHub Actions workflows:

```yaml
name: Deploy with Version Tags

on:
  push:
    branches:
      - Kiro/dev
      - staging
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        with:
          fetch-depth: 0  # Fetch all history for tags
          
      - name: Create Version Tag
        id: version
        run: |
          chmod +x .github/scripts/create-version-tag.sh
          ./.github/scripts/create-version-tag.sh
          
      - name: Deploy Application
        run: |
          echo "Deploying version ${{ steps.version.outputs.version_tag }}"
          # Your deployment commands here
```

## Maintenance

### Updating Version Logic

To modify version increment logic, edit the `increment_version()` function in the script.

### Adding New Environments

To add support for new environments, update the `determine_environment()` function:

```bash
determine_environment() {
    local branch_name=$1
    
    case "$branch_name" in
        # ... existing cases ...
        "uat")
            echo "uat"
            ;;
        *)
            log_error "Unknown branch: $branch_name"
            exit 1
            ;;
    esac
}
```

## License

This script is part of the EDR project and follows the project's license terms.
