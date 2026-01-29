# Requirements Document

## Introduction

This specification defines the requirements for making the version display on the LoginScreen interactive and synchronized with GitHub tags. Users should be able to click on the version number to view release notes for the current deployment, and the version should dynamically reflect the actual GitHub tag rather than being hardcoded.

## Glossary

- **Version_Display**: The version number shown on the LoginScreen (currently hardcoded as "1.11.11")
- **GitHub_Tag**: Version identifier created during deployment (e.g., v1.0.38-dev.20251223.1)
- **Release_Notes_Modal**: Interactive popup showing release notes when version is clicked
- **Dynamic_Version**: Version number fetched from API that matches the GitHub tag
- **Interactive_Element**: Clickable version display that triggers release notes modal

## Requirements

### Requirement 1: Dynamic Version Synchronization

**User Story:** As a user, I want the version number on the login screen to show the actual deployed version from GitHub tags, so that I know exactly which version I'm using.

#### Acceptance Criteria

1. WHEN the LoginScreen loads, THE Version_Display SHALL fetch the current version from the backend API
2. WHEN displaying the version, THE Version_Display SHALL show the semantic version part (e.g., "v1.0.38") extracted from the GitHub tag
3. WHEN displaying the version, THE Version_Display SHALL show the exact same version that appears in the backend Swagger documentation
4. WHEN the GitHub tag is "v1.0.38-dev.20251223.1", THE Version_Display SHALL show "v1.0.38" (without environment and build suffixes)
5. WHEN no version is available from API, THE Version_Display SHALL show a fallback version with clear indication
6. THE Version_Display SHALL replace the hardcoded "1.11.11" with the dynamic version

### Requirement 2: Interactive Version Display

**User Story:** As a user, I want to click on the version number to see what's new in this release, so that I can understand what features and fixes are available.

#### Acceptance Criteria

1. WHEN a user hovers over the version display, THE Version_Display SHALL show visual feedback indicating it's clickable
2. WHEN a user clicks the version display, THE System SHALL open a Release_Notes_Modal
3. WHEN the modal opens, THE System SHALL fetch release notes for the current version
4. THE Release_Notes_Modal SHALL display structured release notes with Features, Bug Fixes, and Improvements
5. WHEN no release notes exist for the version, THE Modal SHALL display a friendly message

### Requirement 3: Release Notes Modal Design

**User Story:** As a user, I want release notes to be presented in a clear, easy-to-read format, so that I can quickly understand what changed in this version.

#### Acceptance Criteria

1. THE Release_Notes_Modal SHALL display the version number prominently in the header
2. WHEN showing release notes, THE Modal SHALL organize changes into clear sections (Features, Bug Fixes, Improvements)
3. WHEN displaying changes, THE Modal SHALL show brief descriptions with commit references when available
4. THE Modal SHALL include a close button and allow closing by clicking outside or pressing Escape
5. THE Modal SHALL be responsive and work well on both desktop and mobile devices

### Requirement 4: API Integration

**User Story:** As a frontend developer, I want reliable API endpoints to fetch version and release notes data, so that the UI can display accurate information.

#### Acceptance Criteria

1. THE API SHALL provide an endpoint to get the current deployed version (GET /api/version/current)
2. THE API SHALL provide an endpoint to get release notes for a specific version (GET /api/release-notes/{version})
3. WHEN requesting version information, THE API SHALL return the semantic version part extracted from the GitHub tag (e.g., "v1.0.38" from "v1.0.38-dev.20251223.1")
4. WHEN requesting version information, THE API SHALL return the same clean version displayed in the backend Swagger documentation
5. WHEN requesting release notes, THE API SHALL return structured JSON with organized change categories
6. WHEN API calls fail, THE Frontend SHALL handle errors gracefully and show appropriate fallback content

### Requirement 5: Performance and User Experience

**User Story:** As a user, I want the version information and release notes to load quickly without impacting login performance, so that I can access the application efficiently.

#### Acceptance Criteria

1. WHEN the LoginScreen loads, THE version fetch SHALL not block the login form rendering
2. WHEN clicking the version display, THE release notes modal SHALL open within 1 second
3. THE System SHALL cache version information to avoid repeated API calls during the session
4. WHEN release notes are loading, THE Modal SHALL show a loading indicator
5. THE System SHALL preload release notes for the current version in the background after login screen loads