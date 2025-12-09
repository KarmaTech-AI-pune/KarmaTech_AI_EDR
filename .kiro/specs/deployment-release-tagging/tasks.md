# Implementation Plan

## Overview

Simplified implementation plan focused on two main goals:
1. **Environment-based tagging** - Automatic tags for dev, staging, and production
2. **Version information visibility** - Display version info in API and UI

## Core Implementation Tasks

### Goal 1: Environment-Based Tagging

- [x] 1. Create version tagging script





  - Create `.github/scripts/create-version-tag.sh` script
  - Implement logic to determine environment from branch (Kiro/dev → dev, staging → staging, main → prod)
  - Generate version tag format: `v{MAJOR}.{MINOR}.{PATCH}-{ENV}.{DATE}.{BUILD}`
  - Calculate next version number by reading existing tags
  - Generate unique build number for same-day deployments
  - Create and push Git tag to repository
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4_

- [ ] 2. Update GitHub Actions workflow
  - Modify existing `deploy-dev-with-tags.yml` workflow (or create new one)
  - Add step to determine environment from branch name
  - Add step to run version tagging script before deployment
  - Pass version tag to deployment steps as environment variable
  - Log version tag in workflow output
  - For production: create both environment tag (v1.3.0-prod.DATE.BUILD) and clean tag (v1.3.0)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 1.4_

- [ ] 3. Test environment tagging
  - Test dev deployment creates correct tag format
  - Test staging deployment creates correct tag format
  - Test production deployment creates both tags
  - Test multiple deployments same day increment build number
  - Verify tags are visible in GitHub repository
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

### Goal 2: Version Information Visibility

- [ ] 4. Add version to backend API
  - Create or update `HealthController.cs` in backend
  - Add `GET /api/health/version` endpoint
  - Return JSON with: version, environment, commitSha, buildDate
  - Read version from configuration (appsettings.json or environment variable)
  - _Requirements: 3.3, 3.5_

- [ ] 5. Inject version into deployment
  - Update deployment workflow to inject version tag into appsettings.json
  - Set environment variable `APP_VERSION` with version tag value
  - Set environment variable `COMMIT_SHA` with Git commit SHA
  - Set environment variable `BUILD_DATE` with current timestamp
  - Ensure backend reads these values on startup
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 6. Add version display to frontend UI
  - Create `AppFooter.tsx` component in frontend
  - Fetch version info from `/api/health/version` endpoint
  - Display version, environment, commit SHA in footer
  - Add link to GitHub commit using commit SHA
  - Integrate AppFooter into main App.tsx layout
  - _Requirements: 3.2, 3.4_

- [ ] 7. Test version visibility
  - Deploy to dev and verify version appears in API response
  - Verify version appears in UI footer
  - Verify commit SHA link works correctly
  - Test with different environments (dev, staging, prod)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

## Optional Enhancements (Can be added later)

- [ ] 8. Add release manifest tracking (optional)
  - Create JSON manifest files to track deployment history
  - Store in `deployment/manifests/{env}-manifest.json`
  - Update manifest after each successful deployment
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 9. Add release notes generation (optional)
  - Create script to extract commit messages between tags
  - Generate markdown release notes
  - Attach to GitHub Release for production deployments
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 10. Add monitoring and alerts (optional)
  - Track tag creation success rate
  - Alert on tag creation failures
  - Monitor version API response time
  - _Requirements: Performance and reliability_

## Deployment Plan

- [ ] 11. Deploy to dev environment
  - Enable version tagging for Kiro/dev branch
  - Test with 3-5 deployments
  - Verify tags and version visibility
  - _Requirements: All_

- [ ] 12. Deploy to staging environment
  - Enable version tagging for staging branch
  - Test deployment and verify tags
  - _Requirements: All_

- [ ] 13. Deploy to production environment
  - Enable version tagging for main branch
  - Test clean tag creation
  - Verify both environment and clean tags created
  - _Requirements: All_

## Notes

- Focus on core functionality first (tasks 1-7)
- Optional enhancements (tasks 8-10) can be added after core is working
- Test each environment before moving to the next
- Version tag format: `v1.3.0-dev.20241209.1` (version-env.date.build)
- Production gets two tags: `v1.3.0-prod.20241209.1` and `v1.3.0`

## Success Criteria

- ✅ Every deployment creates a unique version tag
- ✅ Tags include environment identifier (dev, staging, prod)
- ✅ Version visible in API endpoint `/api/health/version`
- ✅ Version visible in UI footer
- ✅ Production deployments create clean release tag
- ✅ No manual intervention required
