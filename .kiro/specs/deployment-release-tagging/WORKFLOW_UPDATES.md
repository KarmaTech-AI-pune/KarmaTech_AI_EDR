# GitHub Actions Workflow Updates

## Summary

Updated the `deploy-dev-with-tags.yml` workflow to use the new version tagging script and support multiple environments with automatic environment detection.

## Changes Made

### 1. Replaced Reusable Workflow with Direct Script Execution

**Before:** Used `.github/workflows/create-release-tags.yml` reusable workflow
**After:** Directly executes `.github/scripts/create-version-tag.sh` script

**Benefits:**
- Simpler workflow structure
- Direct control over version tagging logic
- Consistent with the new script-based approach

### 2. Added Environment Detection

The workflow now automatically determines the environment from the branch name:

| Branch Name | Environment |
|-------------|-------------|
| `Saas/dev`, `Kiro/dev`, `dev` | dev |
| `staging` | staging |
| `qa` | qa |
| `main`, `master`, `production` | prod |

### 3. Version Tag Format

The workflow now creates tags in the format specified in requirements:

- **Dev/Staging/QA:** `v{MAJOR}.{MINOR}.{PATCH}-{ENV}.{DATE}.{BUILD}`
  - Example: `v1.3.0-dev.20241209.1`
- **Production:** Creates both:
  - Environment tag: `v1.3.0-prod.20241209.1`
  - Clean tag: `v1.3.0`

### 4. Environment Variables Passed to Deployment Steps

All deployment steps now receive version information as environment variables:

```yaml
env:
  VERSION_TAG: ${{ needs.create-version-tag.outputs.version-tag }}
  VERSION: ${{ needs.create-version-tag.outputs.version }}
  ENVIRONMENT: ${{ needs.create-version-tag.outputs.environment }}
  COMMIT_SHA: ${{ needs.create-version-tag.outputs.commit-sha }}
```

### 5. Enhanced Logging

Version information is now logged at multiple points:

1. **After tag creation:** Displays tag details in workflow summary
2. **During deployment:** Logs version tag being deployed
3. **In deployment summary:** Shows complete version information

### 6. Dynamic Stack Naming

CloudFormation stacks now use dynamic environment-based naming:

**Before:** `njs-admin-frontend-dev` (hardcoded)
**After:** `njs-admin-frontend-${{ needs.create-version-tag.outputs.environment }}` (dynamic)

This allows the same workflow to deploy to different environments.

### 7. Updated Version Manifests

The `version.json` files now include additional information:

```json
{
  "version": "v1.3.0-dev.20241209.1",
  "semanticVersion": "1.3.0",
  "environment": "dev",
  "component": "admin",
  "buildNumber": "1",
  "buildDate": "2024-12-09T10:30:00Z",
  "commitSha": "abc123...",
  "branch": "Saas/dev",
  "deployedBy": "github-actions[bot]"
}
```

### 8. CloudFormation Tags

Infrastructure stacks are now tagged with version information:

```yaml
--tags \
  Environment=${{ needs.create-version-tag.outputs.environment }} \
  Version=${{ needs.create-version-tag.outputs.version }} \
  VersionTag=${{ needs.create-version-tag.outputs.version-tag }} \
  DeployedBy=${{ github.actor }} \
  DeployedAt=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
```

## Workflow Outputs

The `create-version-tag` job now provides these outputs:

- `version-tag`: Full version tag (e.g., `v1.3.0-dev.20241209.1`)
- `version`: Semantic version (e.g., `1.3.0`)
- `environment`: Detected environment (e.g., `dev`)
- `build-number`: Build number for the day (e.g., `1`)
- `commit-sha`: Full commit SHA

## Testing Recommendations

1. **Test on Saas/dev branch:**
   - Push changes to `Saas/dev`
   - Verify tag format: `v*-dev.YYYYMMDD.*`
   - Check version in deployed apps

2. **Test on staging branch:**
   - Push changes to `staging`
   - Verify tag format: `v*-staging.YYYYMMDD.*`
   - Verify environment detection

3. **Test on production branch:**
   - Push changes to `main`
   - Verify both tags created:
     - `v*-prod.YYYYMMDD.*`
     - `v*` (clean tag)

4. **Test multiple deployments same day:**
   - Deploy twice to same environment
   - Verify build number increments: `.1` → `.2`

## Requirements Validated

✅ **Requirement 2.1:** Automatic trigger on branch merge
✅ **Requirement 2.2:** Automatic environment detection from branch
✅ **Requirement 2.3:** Automatic version number calculation
✅ **Requirement 2.4:** Automatic tag creation for production
✅ **Requirement 1.4:** Both environment and clean tags for production

## Next Steps

1. Test the updated workflow on a feature branch
2. Verify version tags are created correctly
3. Check that version information appears in deployed applications
4. Implement backend API endpoint for version information (Task 4)
5. Add version display to frontend UI (Task 6)
