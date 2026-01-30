# Design Document - Automatic Versioning System

## Overview

The Automatic Versioning System implements semantic versioning automation using conventional commit parsing, integrated with the existing GitHub Actions workflow. The system eliminates hardcoded version numbers (like the current `1.11.11` in LoginScreen.tsx) and provides dynamic version management across all application components.

## Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions Workflow                  │
│  ┌─────────────────┐    ┌─────────────────┐               │
│  │ Version         │    │ Build &         │               │
│  │ Calculator      │───▶│ Deploy          │               │
│  │ (Node.js)       │    │ (Existing)      │               │
│  └─────────────────┘    └─────────────────┘               │
└──────────────┬──────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────┐
│                    Version Storage                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Git Tags    │  │ VERSION     │  │ package.json│        │
│  │ v1.12.0     │  │ File        │  │ version     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└──────────────┬──────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────┐
│                Application Components                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Frontend    │  │ Backend     │  │ API         │        │
│  │ (React)     │  │ (.NET)      │  │ Endpoints   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Version Calculator Service

**Location:** `.github/scripts/version-calculator.js`

**Responsibilities:**
- Parse conventional commit messages from merged PRs
- Calculate next version based on semantic versioning rules
- Create git tags and update version files
- Generate release notes from commit messages

**Interface:**
```javascript
class VersionCalculator {
  async calculateNextVersion(commits: Commit[]): Promise<Version>
  async updateVersionFiles(version: Version): Promise<void>
  async createGitTag(version: Version): Promise<void>
  async generateReleaseNotes(fromVersion: Version, toVersion: Version): Promise<string>
}
```

### 2. Version Storage Components

#### Git Tags
- **Format:** `v{MAJOR}.{MINOR}.{PATCH}` (e.g., `v1.12.0`)
- **Purpose:** Canonical version reference for deployments
- **Location:** Git repository tags

#### VERSION File
- **Location:** Repository root `/VERSION`
- **Format:** Plain text containing version number
- **Purpose:** Build-time version injection

#### Package.json Version
- **Location:** `frontend/package.json`
- **Field:** `version`
- **Purpose:** Frontend build versioning

### 3. Application Integration Points

#### Frontend Version Display
**Current Issue:** Hardcoded version in LoginScreen.tsx
```typescript
// ❌ Current (hardcoded)
<Typography variant="h6" color="text.secondary">
    Version 1.11.11
</Typography>

// ✅ Proposed (dynamic)
<Typography variant="h6" color="text.secondary">
    Version {process.env.REACT_APP_VERSION}
</Typography>
```

#### Backend Version API
**New Endpoint:** `GET /api/version`
```csharp
[HttpGet("version")]
public IActionResult GetVersion()
{
    return Ok(new { 
        version = Assembly.GetExecutingAssembly().GetName().Version.ToString(),
        buildDate = BuildInfo.BuildDate,
        commitHash = BuildInfo.CommitHash
    });
}
```

## Data Models

### Version Model
```typescript
interface Version {
  major: number;
  minor: number;
  patch: number;
  prerelease?: string;
  buildMetadata?: string;
  toString(): string; // Returns "1.12.0"
  toTag(): string;    // Returns "v1.12.0"
}
```

### Commit Analysis Model
```typescript
interface CommitAnalysis {
  type: 'feat' | 'fix' | 'docs' | 'style' | 'refactor' | 'test' | 'chore';
  scope?: string;
  breaking: boolean;
  description: string;
  body?: string;
  footer?: string;
}
```

### Release Notes Model
```typescript
interface ReleaseNotes {
  version: string;
  date: string;
  features: CommitAnalysis[];
  bugFixes: CommitAnalysis[];
  breakingChanges: CommitAnalysis[];
  other: CommitAnalysis[];
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Version Monotonicity
*For any* two consecutive versions V1 and V2, where V2 is calculated after V1, V2 should be greater than V1 according to semantic versioning rules.
**Validates: Requirements 2.5**

### Property 2: Commit Type Mapping Consistency
*For any* conventional commit message, the version increment type should be deterministic based on the commit type (fix→PATCH, feat→MINOR, BREAKING→MAJOR).
**Validates: Requirements 1.3, 1.4, 1.5**

### Property 3: Version File Synchronization
*For any* version update operation, all version storage locations (git tag, VERSION file, package.json) should contain the same version number after the operation completes.
**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

### Property 4: Atomic Version Updates
*For any* version update operation, either all version references are updated successfully, or none are updated (no partial updates).
**Validates: Requirements 4.5**

### Property 5: Release Notes Completeness
*For any* version increment, the generated release notes should include all commits between the previous version and the new version.
**Validates: Requirements 9.1, 9.2**

## Error Handling

### Version Calculation Errors
- **Invalid Commit Format:** Log warning, default to PATCH increment
- **Git Tag Creation Failure:** Fail deployment, notify administrators
- **Version File Update Failure:** Rollback changes, fail deployment

### Deployment Integration Errors
- **Version Service Unavailable:** Use cached version, log error
- **Network Timeout:** Retry with exponential backoff
- **Permission Errors:** Fail gracefully with detailed error message

### Frontend Version Display Errors
- **Environment Variable Missing:** Display "Version Unknown"
- **API Endpoint Failure:** Fall back to build-time version
- **Invalid Version Format:** Display raw version string

## Testing Strategy

### Unit Tests
- Version calculation logic with various commit message combinations
- Semantic version comparison and increment functions
- Release notes generation from commit data
- Error handling for invalid inputs

### Integration Tests
- End-to-end version workflow from PR merge to deployment
- Git tag creation and retrieval
- Version file updates across all locations
- API endpoint responses with version information

### Property-Based Tests
- Version monotonicity across random commit sequences
- Commit parsing consistency with generated conventional commits
- Version synchronization across multiple update operations

### Performance Tests
- Version calculation time for large commit histories
- API response times for version endpoints
- Build time impact of version injection

## Implementation Plan

### Phase 1: Core Version Calculator (Week 1)
1. Implement conventional commit parser
2. Create semantic version calculation logic
3. Add git tag creation functionality
4. Create VERSION file update mechanism

### Phase 2: Build Integration (Week 2)
1. Integrate with GitHub Actions workflow
2. Update frontend build process for version injection
3. Update backend build process for version embedding
4. Create version API endpoints

### Phase 3: UI Integration (Week 3)
1. Replace hardcoded version in LoginScreen.tsx
2. Add version display to settings/about pages
3. Include version in error reporting
4. Add version to application logs

### Phase 4: Release Management (Week 4)
1. Implement automatic release notes generation
2. Create CHANGELOG.md maintenance
3. Add version history API endpoints
4. Integrate with monitoring and alerting

## Security Considerations

### Git Tag Security
- Ensure only authorized workflows can create version tags
- Validate version increments to prevent malicious version manipulation
- Use signed commits for version-related changes

### API Security
- Rate limit version API endpoints
- Sanitize version information in responses
- Ensure version endpoints don't leak sensitive build information

### Build Security
- Validate version information during build process
- Ensure version injection doesn't introduce vulnerabilities
- Secure version calculation scripts from tampering

## Performance Requirements

### Version Calculation
- **Target:** Complete version calculation within 10 seconds of PR merge
- **Constraint:** Handle up to 100 commits in a single PR
- **Optimization:** Cache commit analysis results

### API Response Times
- **Version Endpoint:** < 100ms response time
- **Version History:** < 500ms for last 50 versions
- **Release Notes:** < 1s for current version notes

### Build Impact
- **Frontend Build:** < 5% increase in build time
- **Backend Build:** < 3% increase in build time
- **Version Injection:** < 2 seconds additional time

## Monitoring and Alerting

### Key Metrics
- Version calculation success rate
- Time from PR merge to version tag creation
- Version API endpoint availability and response times
- Version synchronization across all storage locations

### Alerts
- Version calculation failures
- Version file update failures
- Version API endpoint errors
- Version synchronization mismatches

This design addresses the specific issue of hardcoded versions (like `1.11.11` in LoginScreen.tsx) while providing comprehensive version management for release tracking and error correlation.