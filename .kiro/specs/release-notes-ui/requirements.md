# Requirements Document

## Introduction

This specification defines the requirements for implementing release notes publishing to the UI for the KarmaTech AI EDR application. The system will automatically generate and display release notes based on GitHub tags and deployment versions, providing users and stakeholders with visibility into features, fixes, and improvements included in each release.

## Glossary

- **Release_Notes**: Structured documentation of changes included in a software release
- **GitHub_Tag**: Version identifier created during deployment (e.g., v1.0.38-dev.20251223.1)
- **Deployment_Version**: The specific version currently running in an environment
- **UI_Component**: User interface element that displays release information
- **Release_History**: Historical view of all past release notes
- **Conventional_Commits**: Standardized commit message format for automated categorization

## Requirements

### Requirement 1: Automatic Release Notes Generation

**User Story:** As a system administrator, I want release notes to be automatically generated from Git commits and PRs, so that documentation is consistent and up-to-date without manual effort.

#### Acceptance Criteria

1. WHEN a PR is merged to Kiro/dev, THE Release_Notes_Generator SHALL analyze all commit messages in the PR
2. WHEN analyzing commits, THE Release_Notes_Generator SHALL categorize changes based on conventional commit prefixes (feat:, fix:, docs:, etc.)
3. WHEN generating release notes, THE Release_Notes_Generator SHALL include feature additions, bug fixes, improvements, and breaking changes
4. WHEN a GitHub tag is created, THE Release_Notes_Generator SHALL associate the release notes with that specific tag version
5. THE Release_Notes_Generator SHALL store release notes in a structured format accessible by the UI

### Requirement 2: Version-Based UI Display

**User Story:** As a user, I want to see release notes for the exact version currently deployed, so that I understand what features and fixes are available in my environment.

#### Acceptance Criteria

1. WHEN a user accesses the application, THE UI_Component SHALL display the current deployment version
2. WHEN displaying version information, THE UI_Component SHALL show release notes corresponding to the deployed version
3. WHEN the version display is clicked, THE UI_Component SHALL expand to show detailed release notes
4. THE UI_Component SHALL show release notes sections for Features, Bug Fixes, Improvements, and Known Issues
5. WHEN no release notes exist for a version, THE UI_Component SHALL display a default message

### Requirement 3: Release History Viewer

**User Story:** As a stakeholder, I want to view past deployment release notes via a history view, so that I can track the evolution of the application over time.

#### Acceptance Criteria

1. THE Application SHALL provide a dedicated Release History page accessible from the main navigation
2. WHEN accessing Release History, THE UI SHALL display all past releases in reverse chronological order
3. WHEN displaying release history, THE UI SHALL show version number, deployment date, and summary of changes
4. WHEN a user clicks on a historical release, THE UI SHALL expand to show full release notes for that version
5. THE Release_History SHALL support filtering by date range and change type

### Requirement 4: GitHub Tag Integration

**User Story:** As a developer, I want the release notes system to integrate with our existing GitHub tagging workflow, so that version management remains consistent across all tools.

#### Acceptance Criteria

1. WHEN a GitHub tag is created (e.g., v1.0.38-dev.20251223.1), THE System SHALL automatically fetch associated commit information
2. WHEN processing tags, THE System SHALL extract semantic version, environment, and build information
3. WHEN displaying versions in UI, THE System SHALL use the GitHub tag format for consistency
4. THE System SHALL support both development tags (with date/build) and production tags (clean semantic version)
5. WHEN a tag is deleted or modified, THE System SHALL update corresponding release notes

### Requirement 5: Enhanced Build Script Integration

**User Story:** As a DevOps engineer, I want the PublishProject.ps1 script to use GitHub release tags for consistent naming, so that deployment artifacts are properly versioned and traceable.

#### Acceptance Criteria

1. WHEN PublishProject.ps1 executes, THE Script SHALL fetch the latest GitHub tag for the current branch
2. WHEN creating deployment artifacts, THE Script SHALL use the GitHub tag in the ZIP file naming convention
3. WHEN no GitHub tag exists, THE Script SHALL generate a default version with timestamp
4. THE Script SHALL include both version and timestamp in the artifact name (e.g., EDR-v1.0.38-dev.20251223.1-20251223-143022.zip)
5. WHEN the script completes, THE Script SHALL log the version information used for the build

### Requirement 6: Release Notes Content Structure

**User Story:** As a user, I want release notes to be well-structured and easy to understand, so that I can quickly identify relevant changes and their impact.

#### Acceptance Criteria

1. THE Release_Notes SHALL include sections for New Features, Bug Fixes, Improvements, and Breaking Changes
2. WHEN displaying changes, THE UI SHALL show a brief description and associated commit/PR reference
3. WHEN available, THE Release_Notes SHALL include JIRA ticket references extracted from commit messages
4. THE Release_Notes SHALL indicate the impact level of changes (Low, Medium, High)
5. WHEN known issues exist, THE Release_Notes SHALL include a dedicated Known Issues section

### Requirement 7: API Endpoints for Release Data

**User Story:** As a frontend developer, I want API endpoints to retrieve release notes data, so that the UI can dynamically load and display release information.

#### Acceptance Criteria

1. THE API SHALL provide an endpoint to retrieve release notes for a specific version
2. THE API SHALL provide an endpoint to retrieve all release history with pagination
3. WHEN requesting release notes, THE API SHALL return structured JSON with all release sections
4. THE API SHALL support filtering release history by date range, version pattern, and change type
5. WHEN API errors occur, THE System SHALL return appropriate HTTP status codes and error messages

### Requirement 8: Performance and Caching

**User Story:** As a user, I want release notes to load quickly without impacting application performance, so that I can access information efficiently.

#### Acceptance Criteria

1. THE System SHALL cache release notes data to minimize GitHub API calls
2. WHEN displaying current version notes, THE UI SHALL load within 2 seconds
3. THE System SHALL refresh release notes cache every 30 minutes or on deployment
4. WHEN loading release history, THE UI SHALL implement pagination with 10 releases per page
5. THE System SHALL preload release notes for the current version during application startup