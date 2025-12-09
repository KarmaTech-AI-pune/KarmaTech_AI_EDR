# Technical Design Document

## Overview

This design implements an automated environment-specific version tagging system for the EDR deployment pipeline. The solution extends existing GitHub Actions workflows to automatically generate, apply, and track semantic version tags with environment identifiers (dev, staging, qa, prod) for every deployment.

## Architecture

### High-Level Architecture

```
GitHub Actions Workflow
├── PR Merged to Branch
├── Determine Environment (dev/staging/qa/prod)
├── Calculate Next Version (semantic versioning)
├── Create Version Tag (v1.3.0-env.date.build)
├── Push Tag to GitHub
├── Generate Release Notes
├── Update Release Manifest
└── Deploy Application

Deployment Artifacts
├── Git Tags (Immutable)
├── Release Manifest JSON (Per Environment)
└── Version Info (Injected into App)

Application Integration
├── Backend API (/health/version endpoint)
├── Frontend UI (Footer/About page)
└── Deployment Logs (GitHub Actions)
```

### Version Tag Format

```
v{MAJOR}.{MINOR}.{PATCH}-{ENV}.{DATE}.{BUILD}

Examples:
- v1.3.0-dev.20241209.1      (First dev deployment on Dec 9, 2024)
- v1.3.0-dev.20241209.2      (Second dev deployment same day)
- v1.3.0-staging.20241210.1  (Staging deployment on Dec 10, 2024)
- v1.3.0-qa.20241211.1       (QA deployment on Dec 11, 2024)
- v1.3.0-prod.20241212.1     (Production deployment on Dec 12, 2024)
- v1.3.0                     (Clean production release tag)
```

### Branch-to-Environment Mapping

```
Branch Name       → Environment → Tag Suffix
─────────────────────────────────────────────
Kiro/dev          → dev         → -dev
staging           → staging     → -staging
qa                → qa          → -qa
main/production   → prod        → -prod
```

## Components and Interfaces

### 1. Version Tagging Script

**File:** `.github/scripts/create-version-tag.sh`

**Purpose:** Centralized script for version tag generation and creation

**Key Functions:**
- `get_latest_version()`: Fetches latest version tag for environment
- `calculate_next_version()`: Determines next version number
- `generate_build_number()`: Creates unique build number for the day
- `create_git_tag()`: Creates annotated Git tag
- `push_tag()`: Pushes tag to remote repository
- `generate_release_notes()`: Extracts changes from commit history

### 2. GitHub Actions Workflow Enhancement

**File:** `.github/workflows/deploy-with-version-tags.yml`

**Jobs:**
1. **determine-environment**: Maps branch to environment
2. **create-version-tag**: Generates and creates version tag
3. **deploy**: Deploys application with version info
4. **update-manifest**: Updates release manifest
5. **create-release**: Creates GitHub Release (prod only)

### 3. Release Manifest Management

**File:** `.github/scripts/update-release-manifest.sh`

**Manifest Structure:**
```json
{
  "environment": "dev",
  "deployments": [
    {
      "version": "v1.3.0-dev.20241209.1",
      "cleanVersion": "v1.3.0",
      "commitSha": "abc123def456",
      "deployedAt": "2024-12-09T10:30:00Z",
      "deployedBy": "github-actions[bot]",
      "triggeredBy": "john.doe",
      "status": "success",
      "releaseNotes": ["feat: ...", "fix: ..."]
    }
  ],
  "lastUpdated": "2024-12-09T10:30:00Z"
}
```

**Storage Location:**
```
deployment/manifests/
├── dev-manifest.json
├── staging-manifest.json
├── qa-manifest.json
└── prod-manifest.json
```

### 4. Backend API Integration

**File:** `backend/src/NJSAPI/Controllers/HealthController.cs`

**Endpoints:**
- `GET /api/health` - Returns health status with version
- `GET /api/health/version` - Returns detailed version info

**Response Format:**
```json
{
  "version": "v1.3.0-dev.20241209.1",
  "commitSha": "abc123def456",
  "buildDate": "2024-12-09T10:30:00Z",
  "environment": "dev"
}
```

### 5. Frontend UI Integration

**File:** `frontend/src/components/common/AppFooter.tsx`

**Purpose:** Display version information in UI footer

**Features:**
- Fetches version from API on component mount
- Displays version, environment, commit SHA, build date
- Links to GitHub commit for traceability

### 6. Release Notes Generator

**File:** `.github/scripts/generate-release-notes.sh`

**Purpose:** Extract and format release notes from commit history

**Categories:**
- Features (feat:)
- Bug Fixes (fix:)
- Breaking Changes (BREAKING CHANGE:)
- Maintenance (chore:)

## Data Models

### Version Tag Model

```typescript
interface VersionTag {
  fullTag: string;              // v1.3.0-dev.20241209.1
  semanticVersion: string;      // 1.3.0
  major: number;                // 1
  minor: number;                // 3
  patch: number;                // 0
  environment: string;          // dev
  date: string;                 // 20241209
  buildNumber: number;          // 1
  commitSha: string;            // abc123def456
  createdAt: Date;
  createdBy: string;
}
```

### Deployment Record Model

```typescript
interface DeploymentRecord {
  id: string;
  version: string;
  cleanVersion: string;
  environment: string;
  commitSha: string;
  deployedAt: Date;
  deployedBy: string;
  triggeredBy: string;
  status: 'success' | 'failed' | 'rolled-back';
  releaseNotes: string[];
  duration: number;
}
```

### Release Manifest Model

```typescript
interface ReleaseManifest {
  environment: string;
  deployments: DeploymentRecord[];
  lastUpdated: Date;
  statistics: {
    totalDeployments: number;
    successRate: number;
    averageDuration: number;
    lastSuccessfulDeployment: Date;
  };
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Version Tag Uniqueness
*For any* environment and date, when multiple deployments occur, each deployment SHALL receive a unique version tag with incrementing build numbers.
**Validates: Requirements 1.2**

### Property 2: Tag Immutability
*For any* created version tag, the tag SHALL NOT be modified or deleted after creation, ensuring immutable deployment history.
**Validates: Requirements 6.2**

### Property 3: Environment Tag Consistency
*For any* deployment to an environment, the version tag SHALL contain the correct environment identifier matching the target environment.
**Validates: Requirements 1.3**

### Property 4: Semantic Version Progression
*For any* sequence of version tags, the semantic version SHALL progress monotonically (never decrease) within an environment.
**Validates: Requirements 5.1, 5.2, 5.3, 5.4**

### Property 5: Production Clean Tag Creation
*For any* production deployment, the system SHALL create both an environment-specific tag and a clean release tag.
**Validates: Requirements 1.4**

### Property 6: Deployment-Tag Correlation
*For any* successful deployment, a version tag SHALL be created; for any failed deployment, no version tag SHALL be created.
**Validates: Requirements 6.3**

### Property 7: Manifest Consistency
*For any* version tag created, the release manifest SHALL contain a corresponding deployment record with matching version, commit SHA, and timestamp.
**Validates: Requirements 4.1**

### Property 8: Release Notes Completeness
*For any* version tag, the release notes SHALL include all commit messages between the previous tag and the current tag.
**Validates: Requirements 8.1**

### Property 9: Version Visibility
*For any* deployed application, the version tag SHALL be accessible via API health endpoint, UI footer, and deployment logs.
**Validates: Requirements 3.1, 3.2, 3.3**

### Property 10: Concurrent Deployment Safety
*For any* concurrent deployments to different environments, version tag creation SHALL complete without conflicts or race conditions.
**Validates: Requirements 7.4**

## Error Handling

### Tag Creation Failures
- Retry with exponential backoff (max 3 attempts)
- Log detailed error messages
- Alert DevOps team on persistent failures

### Version Calculation Errors
- Validate tag format before processing
- Fall back to default version (1.0.0) if no valid tags
- Log warnings and continue with safe defaults

### Manifest Update Failures
- Validate JSON structure before writing
- Create backup of existing manifest
- Restore from backup if update fails
- Continue deployment (non-blocking)

### Concurrent Tag Conflicts
- Use Git's atomic tag creation
- Retry with incremented build number
- Add random jitter to retry timing
- Maximum 5 retry attempts

## Testing Strategy

### Unit Tests
- Version calculation logic
- Tag format validation
- Build number generation
- Release notes parsing
- Manifest serialization

### Integration Tests
- End-to-end workflow
- Multiple deployments same day
- Cross-environment deployments
- Production clean tag creation
- Failed deployment handling

### Property-Based Tests
- Uniqueness property
- Monotonicity property
- Format validation property
- Idempotency property

### End-to-End Tests
- Complete deployment pipeline
- Version visibility in API and UI
- Release manifest accuracy
- GitHub Release creation
- Rollback scenarios

## Performance Considerations

- Tag creation: < 5 seconds
- Manifest update: < 2 seconds
- API response: < 100ms
- Shallow clone for tag analysis
- Cache version info in memory

## Security Considerations

- GPG signing for all tags
- Restrict tag creation to CI/CD
- Branch protection for production
- Audit all tag creation events
- Validate manifest schema

## Deployment Strategy

- Phase 1: Dev environment (Week 1)
- Phase 2: Staging/QA (Week 2)
- Phase 3: Production (Week 3)
- Phase 4: Monitoring (Week 4)

## Monitoring and Alerting

### Metrics
- Tag creation success rate (99.9%)
- Tag creation duration (< 5s)
- Manifest update success rate (99.9%)
- Version API response time (< 100ms)

### Alerts
- Tag creation failure (immediate)
- Manifest corruption (immediate)
- Version API unavailable (5 min)
- Duplicate tag detected (immediate)
