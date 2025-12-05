# Requirements Document: Deployment Release Tagging System

## Introduction

This feature implements an automated Git release tagging system that integrates with the existing deployment pipeline (dev → staging/QA → production). The system will create environment-specific release tags for each deployment stage, providing clear traceability and version management across all environments.

## Glossary

- **Release Tag**: A Git tag that marks a specific commit as deployed to an environment (e.g., `v1.2.3-dev`, `v1.2.3-staging`, `v1.2.3-prod`)
- **Semantic Version**: Version format following `vMAJOR.MINOR.PATCH` pattern (e.g., `v1.2.3`)
- **Environment**: Deployment target (dev, staging/QA, production)
- **Deployment Pipeline**: The automated workflow that builds and deploys code through environments
- **GitHub Actions**: CI/CD platform used for automated deployments
- **CloudFormation**: AWS infrastructure-as-code service for provisioning resources
- **Elastic Beanstalk**: AWS service for deploying and managing backend applications
- **S3**: AWS object storage service for hosting frontend static files
- **CloudFront**: AWS CDN service for distributing frontend content

## Requirements

### Requirement 1: Environment-Specific Release Tagging

**User Story:** As a DevOps engineer, I want each deployment to automatically create an environment-specific Git tag, so that I can track which version is deployed to each environment.

#### Acceptance Criteria

1. WHEN a deployment to dev environment completes successfully THEN the system SHALL create a Git tag with format `vX.Y.Z-dev` where X.Y.Z is the semantic version
2. WHEN a deployment to staging/QA environment completes successfully THEN the system SHALL create a Git tag with format `vX.Y.Z-staging`
3. WHEN a deployment to production environment completes successfully THEN the system SHALL create a Git tag with format `vX.Y.Z-prod`
4. WHEN creating an environment tag THEN the system SHALL use the base semantic version from the most recent version tag (without environment suffix)
5. WHEN no previous version tag exists THEN the system SHALL start with version `v1.0.0`

### Requirement 2: Semantic Version Management

**User Story:** As a release manager, I want the system to automatically increment semantic versions based on PR labels, so that version numbers accurately reflect the type of changes being deployed.

#### Acceptance Criteria

1. WHEN a PR is merged with label "major" THEN the system SHALL increment the major version number and reset minor and patch to 0
2. WHEN a PR is merged with label "minor" THEN the system SHALL increment the minor version number and reset patch to 0
3. WHEN a PR is merged without major or minor labels THEN the system SHALL increment the patch version number
4. WHEN determining the next version THEN the system SHALL only consider base semantic version tags (vX.Y.Z) and ignore environment-suffixed tags
5. WHEN multiple deployments occur for the same version THEN the system SHALL reuse the same base version with different environment suffixes

### Requirement 3: Integration with Existing Deployment Workflows

**User Story:** As a developer, I want release tagging to integrate seamlessly with existing deployment workflows, so that deployments continue to work without manual intervention.

#### Acceptance Criteria

1. WHEN the frontend deployment workflow completes successfully THEN the system SHALL create appropriate environment tags for both admin and tenant deployments
2. WHEN the backend deployment workflow completes successfully THEN the system SHALL create appropriate environment tags
3. WHEN a deployment fails THEN the system SHALL NOT create a release tag
4. WHEN creating tags THEN the system SHALL not interfere with the existing deployment process
5. WHEN a tag already exists for a specific version and environment THEN the system SHALL skip tag creation and log a warning

### Requirement 4: Release Notes and Changelog Generation

**User Story:** As a product manager, I want automatic release notes generated for each deployment, so that I can communicate changes to stakeholders.

#### Acceptance Criteria

1. WHEN a release tag is created THEN the system SHALL generate release notes containing all commits since the previous release
2. WHEN generating release notes THEN the system SHALL categorize commits by type (feat, fix, docs, chore, etc.)
3. WHEN generating release notes THEN the system SHALL include PR numbers and authors
4. WHEN a deployment completes THEN the system SHALL create a GitHub Release with the generated notes
5. WHEN release notes are generated THEN the system SHALL format them in markdown for readability

### Requirement 5: Deployment Traceability and Audit Trail

**User Story:** As a compliance officer, I want complete traceability of what code is deployed to each environment, so that I can meet audit requirements.

#### Acceptance Criteria

1. WHEN a deployment occurs THEN the system SHALL record the commit SHA, timestamp, deployer, and environment in the tag annotation
2. WHEN querying deployment history THEN the system SHALL provide a clear view of all deployments across environments
3. WHEN a rollback is needed THEN the system SHALL provide easy identification of the previous stable version for each environment
4. WHEN viewing tags THEN the system SHALL show which commits are deployed to which environments
5. WHEN generating audit reports THEN the system SHALL include all deployment metadata (who, what, when, where)

### Requirement 6: Multi-Environment Deployment Workflow

**User Story:** As a DevOps engineer, I want to promote releases through environments (dev → staging → production), so that changes are tested before reaching production.

#### Acceptance Criteria

1. WHEN code is pushed to the dev branch THEN the system SHALL deploy to dev environment and create a `-dev` tag
2. WHEN a release is promoted to staging THEN the system SHALL deploy the same version to staging and create a `-staging` tag
3. WHEN a release is promoted to production THEN the system SHALL deploy the same version to production and create a `-prod` tag
4. WHEN promoting between environments THEN the system SHALL verify the version was successfully deployed to the previous environment
5. WHEN a version is deployed to production THEN the system SHALL create a final release tag without environment suffix

### Requirement 7: Rollback Support

**User Story:** As a DevOps engineer, I want to easily rollback to a previous version in any environment, so that I can quickly recover from deployment issues.

#### Acceptance Criteria

1. WHEN a rollback is initiated THEN the system SHALL identify the previous stable version tag for the target environment
2. WHEN rolling back THEN the system SHALL deploy the code from the identified tag
3. WHEN a rollback completes THEN the system SHALL create a new tag indicating the rollback (e.g., `v1.2.3-prod-rollback`)
4. WHEN rolling back THEN the system SHALL preserve the original deployment tags for audit purposes
5. WHEN a rollback occurs THEN the system SHALL generate release notes documenting the rollback reason

### Requirement 8: Notification and Reporting

**User Story:** As a team lead, I want to receive notifications when deployments complete, so that I can monitor the deployment pipeline.

#### Acceptance Criteria

1. WHEN a deployment completes successfully THEN the system SHALL send a notification with deployment details
2. WHEN a deployment fails THEN the system SHALL send an alert with error information
3. WHEN generating notifications THEN the system SHALL include version number, environment, deployer, and timestamp
4. WHEN a deployment completes THEN the system SHALL update the GitHub Actions summary with deployment status
5. WHEN viewing deployment history THEN the system SHALL provide a dashboard showing current versions in each environment

### Requirement 9: Backward Compatibility

**User Story:** As a developer, I want the new tagging system to work with existing tags and workflows, so that historical data is preserved.

#### Acceptance Criteria

1. WHEN the system starts THEN it SHALL recognize and use existing version tags created by the current `push_Tags.yml` workflow
2. WHEN determining the next version THEN the system SHALL correctly parse existing tags regardless of format variations
3. WHEN existing workflows run THEN they SHALL continue to function without modification
4. WHEN migrating to the new system THEN existing tags SHALL remain valid and accessible
5. WHEN querying version history THEN both old and new tag formats SHALL be included

### Requirement 10: Error Handling and Recovery

**User Story:** As a DevOps engineer, I want the tagging system to handle errors gracefully, so that deployment failures don't leave the system in an inconsistent state.

#### Acceptance Criteria

1. WHEN tag creation fails THEN the system SHALL log the error and continue with deployment
2. WHEN a Git push fails THEN the system SHALL retry up to 3 times with exponential backoff
3. WHEN duplicate tags are detected THEN the system SHALL skip creation and log a warning
4. WHEN network errors occur THEN the system SHALL provide clear error messages for troubleshooting
5. WHEN recovering from errors THEN the system SHALL not leave orphaned or incomplete tags
