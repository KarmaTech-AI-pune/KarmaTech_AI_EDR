# Technical Design Document: Deployment Release Tagging System

## Overview

This document provides the technical design for implementing automated Git release tagging across the EDR deployment pipeline. The system integrates with existing GitHub Actions workflows to create environment-specific tags (dev, staging, production) for each successful deployment.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     GitHub Repository                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Base Version │  │ Environment  │  │   Release    │         │
│  │    Tags      │  │    Tags      │  │    Notes     │         │
│  │  v1.2.3      │  │ v1.2.3-dev   │  │  Generated   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GitHub Actions Workflows                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Reusable Actions (Composite Actions)                    │  │
│  │  • create-release-tag                                    │  │
│  │  • generate-release-notes                                │  │
│  │  • resolve-version                                       │  │
│  │  • send-deployment-notification                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│  ┌──────────────────────────┼────────────────────────────────┐ │
│  │  Deployment Workflows    │                                │ │
│  │  • deploy-frontend       │  • deploy-to-staging          │ │
│  │  • deploy-backend        │  • deploy-to-production       │ │
│  │  • rollback-deployment   │  • update-dashboard           │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Deployment Targets                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │     Dev      │  │   Staging    │  │  Production  │         │
│  │  Environment │  │  Environment │  │  Environment │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Reusable Composite Actions

#### 1.1 create-release-tag Action

**Purpose**: Creates environment-specific Git tags with metadata

**Location**: `.github/actions/create-release-tag/action.yml`

**Interface**:
```yaml
inputs:
  environment:
    description: 'Target environment (dev, staging, prod)'
    required: true
  version:
    description: 'Base semantic version (e.g., 1.2.3)'
    required: true
  commit-sha:
    description: 'Commit SHA to tag'
    required: false
    default: ${{ github.sha }}
  github-token:
    description: 'GitHub token for authentication'
    required: true
    default: ${{ github.token }}

outputs:
  tag-name:
    description: 'Created tag name (e.g., v1.2.3-dev)'
  tag-created:
    description: 'Boolean indicating if tag was created'
  tag-url:
    description: 'URL to the created tag'
```


**Implementation Logic**:
```yaml
runs:
  using: composite
  steps:
    - name: Validate inputs
      shell: bash
      run: |
        if [[ ! "${{ inputs.environment }}" =~ ^(dev|staging|prod)$ ]]; then
          echo "Error: Invalid environment"
          exit 1
        fi
    
    - name: Construct tag name
      id: tag
      shell: bash
      run: |
        TAG_NAME="v${{ inputs.version }}-${{ inputs.environment }}"
        echo "tag-name=$TAG_NAME" >> $GITHUB_OUTPUT
    
    - name: Check if tag exists
      id: check
      shell: bash
      run: |
        if git rev-parse "${{ steps.tag.outputs.tag-name }}" >/dev/null 2>&1; then
          echo "exists=true" >> $GITHUB_OUTPUT
        else
          echo "exists=false" >> $GITHUB_OUTPUT
        fi
    
    - name: Create annotated tag
      if: steps.check.outputs.exists == 'false'
      shell: bash
      run: |
        git config user.name "github-actions[bot]"
        git config user.email "github-actions[bot]@users.noreply.github.com"
        
        git tag -a "${{ steps.tag.outputs.tag-name }}" \
          "${{ inputs.commit-sha }}" \
          -m "Deployment to ${{ inputs.environment }}" \
          -m "Version: ${{ inputs.version }}" \
          -m "Commit: ${{ inputs.commit-sha }}" \
          -m "Deployed by: ${{ github.actor }}" \
          -m "Deployed at: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
    
    - name: Push tag
      if: steps.check.outputs.exists == 'false'
      shell: bash
      run: |
        git push origin "${{ steps.tag.outputs.tag-name }}"
```

#### 1.2 generate-release-notes Action

**Purpose**: Generates formatted release notes from commit history

**Location**: `.github/actions/generate-release-notes/action.yml`

**Interface**:
```yaml
inputs:
  from-tag:
    description: 'Previous tag to compare from'
    required: false
  to-tag:
    description: 'Current tag to compare to'
    required: true
  environment:
    description: 'Target environment'
    required: true

outputs:
  release-notes:
    description: 'Markdown-formatted release notes'
  commit-count:
    description: 'Number of commits included'
```


**Implementation Logic**:
```yaml
runs:
  using: composite
  steps:
    - name: Get commit range
      id: range
      shell: bash
      run: |
        if [ -z "${{ inputs.from-tag }}" ]; then
          # First release - get all commits
          COMMITS=$(git log --pretty=format:"%h|%s|%an|%ae" "${{ inputs.to-tag }}")
        else
          # Get commits between tags
          COMMITS=$(git log --pretty=format:"%h|%s|%an|%ae" \
            "${{ inputs.from-tag }}..${{ inputs.to-tag }}")
        fi
        echo "commits<<EOF" >> $GITHUB_OUTPUT
        echo "$COMMITS" >> $GITHUB_OUTPUT
        echo "EOF" >> $GITHUB_OUTPUT
    
    - name: Categorize commits
      id: categorize
      shell: bash
      run: |
        FEATURES=""
        FIXES=""
        DOCS=""
        CHORES=""
        OTHER=""
        
        while IFS='|' read -r hash subject author email; do
          if [[ $subject =~ ^feat ]]; then
            FEATURES="$FEATURES\n- $subject ($hash) by $author"
          elif [[ $subject =~ ^fix ]]; then
            FIXES="$FIXES\n- $subject ($hash) by $author"
          elif [[ $subject =~ ^docs ]]; then
            DOCS="$DOCS\n- $subject ($hash) by $author"
          elif [[ $subject =~ ^chore ]]; then
            CHORES="$CHORES\n- $subject ($hash) by $author"
          else
            OTHER="$OTHER\n- $subject ($hash) by $author"
          fi
        done <<< "${{ steps.range.outputs.commits }}"
        
        echo "features<<EOF" >> $GITHUB_OUTPUT
        echo -e "$FEATURES" >> $GITHUB_OUTPUT
        echo "EOF" >> $GITHUB_OUTPUT
        
        echo "fixes<<EOF" >> $GITHUB_OUTPUT
        echo -e "$FIXES" >> $GITHUB_OUTPUT
        echo "EOF" >> $GITHUB_OUTPUT
    
    - name: Format release notes
      id: format
      shell: bash
      run: |
        NOTES="# Release Notes - ${{ inputs.to-tag }}\n\n"
        NOTES="$NOTES## Environment: ${{ inputs.environment }}\n\n"
        NOTES="$NOTES### 🚀 Features\n${{ steps.categorize.outputs.features }}\n\n"
        NOTES="$NOTES### 🐛 Bug Fixes\n${{ steps.categorize.outputs.fixes }}\n\n"
        
        echo "release-notes<<EOF" >> $GITHUB_OUTPUT
        echo -e "$NOTES" >> $GITHUB_OUTPUT
        echo "EOF" >> $GITHUB_OUTPUT
```

#### 1.3 resolve-version Action

**Purpose**: Determines the correct version for deployment

**Location**: `.github/actions/resolve-version/action.yml`

**Interface**:
```yaml
inputs:
  environment:
    description: 'Target environment'
    required: true
  branch:
    description: 'Source branch'
    required: false
    default: ${{ github.ref_name }}

outputs:
  version:
    description: 'Semantic version (e.g., 1.2.3)'
  full-tag:
    description: 'Full tag name (e.g., v1.2.3-dev)'
  previous-tag:
    description: 'Previous tag for this environment'
  is-new-version:
    description: 'Boolean indicating if this is a new version'
```


**Implementation Logic**:
```yaml
runs:
  using: composite
  steps:
    - name: Fetch all tags
      shell: bash
      run: |
        git fetch --tags --force
    
    - name: Get latest base version
      id: base
      shell: bash
      run: |
        # Get latest semantic version tag (vX.Y.Z without environment suffix)
        LATEST=$(git tag --list "v[0-9]*.[0-9]*.[0-9]*" \
          --sort=-v:refname | head -n1)
        
        if [ -z "$LATEST" ]; then
          VERSION="1.0.0"
        else
          VERSION="${LATEST#v}"
        fi
        
        echo "version=$VERSION" >> $GITHUB_OUTPUT
        echo "Latest base version: $VERSION"
    
    - name: Check environment tag
      id: env-tag
      shell: bash
      run: |
        ENV_TAG="v${{ steps.base.outputs.version }}-${{ inputs.environment }}"
        
        if git rev-parse "$ENV_TAG" >/dev/null 2>&1; then
          echo "exists=true" >> $GITHUB_OUTPUT
          echo "is-new-version=false" >> $GITHUB_OUTPUT
        else
          echo "exists=false" >> $GITHUB_OUTPUT
          echo "is-new-version=true" >> $GITHUB_OUTPUT
        fi
        
        echo "full-tag=$ENV_TAG" >> $GITHUB_OUTPUT
    
    - name: Get previous environment tag
      id: previous
      shell: bash
      run: |
        PREV=$(git tag --list "v*-${{ inputs.environment }}" \
          --sort=-v:refname | head -n1)
        echo "previous-tag=$PREV" >> $GITHUB_OUTPUT
```

## Data Models

### Tag Metadata Structure

```yaml
Tag Name: v1.2.3-dev
Tag Type: Annotated
Tag Message:
  Line 1: "Deployment to dev"
  Line 2: "Version: 1.2.3"
  Line 3: "Commit: abc123def456"
  Line 4: "Deployed by: john.doe"
  Line 5: "Deployed at: 2024-11-25T10:30:00Z"
  Line 6: "Workflow: deploy-frontend-complete"
  Line 7: "Run ID: 1234567890"
```

### Release Notes Structure

```markdown
# Release Notes - v1.2.3-dev

## Environment: dev
**Deployed**: 2024-11-25 10:30:00 UTC
**Deployed by**: john.doe
**Commit**: abc123def456

### 🚀 Features
- feat: Add project status history tracking (abc123) by jane.smith
- feat: Implement user notifications (def456) by bob.jones

### 🐛 Bug Fixes
- fix: Resolve authentication timeout issue (ghi789) by alice.brown
- fix: Correct date formatting in reports (jkl012) by charlie.davis

### 📚 Documentation
- docs: Update API documentation (mno345) by david.wilson

### 🔧 Chores
- chore: Update dependencies (pqr678) by eve.martinez
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Acceptance Criteria Testing Prework

**1.1 WHEN a deployment to dev environment completes successfully THEN the system SHALL create a Git tag with format `vX.Y.Z-dev`**
Thoughts: This is a rule that should apply to all dev deployments. We can test this by simulating deployments and verifying the tag format matches the pattern.
Testable: yes - property

**1.2 WHEN a deployment to staging/QA environment completes successfully THEN the system SHALL create a Git tag with format `vX.Y.Z-staging`**
Thoughts: Similar to 1.1, this applies to all staging deployments.
Testable: yes - property

**1.3 WHEN a deployment to production environment completes successfully THEN the system SHALL create a Git tag with format `vX.Y.Z-prod`**
Thoughts: Similar to 1.1 and 1.2, this applies to all production deployments.
Testable: yes - property

**2.1 WHEN a PR is merged with label "major" THEN the system SHALL increment the major version number**
Thoughts: This is testing version increment logic across all major version bumps.
Testable: yes - property

**2.2 WHEN a PR is merged with label "minor" THEN the system SHALL increment the minor version number**
Thoughts: This is testing version increment logic across all minor version bumps.
Testable: yes - property

**2.3 WHEN a PR is merged without major or minor labels THEN the system SHALL increment the patch version number**
Thoughts: This is testing default version increment behavior.
Testable: yes - property

**3.5 WHEN a tag already exists for a specific version and environment THEN the system SHALL skip tag creation**
Thoughts: This is testing idempotency - creating the same tag twice should not fail.
Testable: yes - property

**4.1 WHEN a release tag is created THEN the system SHALL generate release notes containing all commits since the previous release**
Thoughts: This is testing that release notes include all commits in the range.
Testable: yes - property

**5.1 WHEN a deployment occurs THEN the system SHALL record the commit SHA, timestamp, deployer, and environment in the tag annotation**
Thoughts: This is testing that all required metadata is present in tag annotations.
Testable: yes - property

### Property 1: Environment Tag Format Validation
*For any* successful deployment to an environment, the created tag SHALL match the format `v[0-9]+\.[0-9]+\.[0-9]+-{environment}` where environment is one of (dev, staging, prod)
**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: Version Increment Correctness
*For any* PR merge with a version bump label, the new version SHALL be exactly one increment higher than the previous version in the appropriate position (major, minor, or patch)
**Validates: Requirements 2.1, 2.2, 2.3**

### Property 3: Tag Idempotency
*For any* deployment, attempting to create the same environment tag twice SHALL not result in an error and SHALL preserve the original tag
**Validates: Requirements 3.5**

### Property 4: Release Notes Completeness
*For any* release tag, the generated release notes SHALL include all commits between the previous tag and the current tag, with no commits missing or duplicated
**Validates: Requirements 4.1**

### Property 5: Tag Metadata Completeness
*For any* created tag, the tag annotation SHALL contain all required fields: commit SHA, timestamp, deployer, environment, and all fields SHALL be non-empty
**Validates: Requirements 5.1**

### Property 6: Tag Ordering Consistency
*For any* sequence of deployments to the same environment, the tags SHALL be ordered chronologically by version number
**Validates: Requirements 1.4**

### Property 7: Rollback Tag Preservation
*For any* rollback operation, the original deployment tags SHALL remain unchanged and a new rollback tag SHALL be created
**Validates: Requirements 7.4**


## Error Handling

### Error Scenarios and Handling

#### 1. Tag Already Exists
**Scenario**: Attempting to create a tag that already exists
**Handling**:
- Check for tag existence before creation
- Log warning message
- Skip tag creation
- Continue with deployment
- Return success with `tag-created=false`

#### 2. Git Push Failure
**Scenario**: Network error or permission issue when pushing tag
**Handling**:
- Retry up to 3 times with exponential backoff (1s, 2s, 4s)
- Log each retry attempt
- If all retries fail, log error but don't fail deployment
- Send notification about tag creation failure
- Manual tag creation can be done later

#### 3. Invalid Version Format
**Scenario**: Version doesn't match semantic versioning pattern
**Handling**:
- Validate version format using regex
- Fail fast with clear error message
- Prevent deployment from continuing
- Require manual intervention

#### 4. Missing Base Version Tag
**Scenario**: No base version tag exists (first deployment)
**Handling**:
- Default to v1.0.0
- Log that this is the first version
- Create base tag and environment tag
- Continue normally

#### 5. Release Notes Generation Failure
**Scenario**: Error parsing commits or generating notes
**Handling**:
- Log error details
- Create tag without release notes
- Send notification about missing release notes
- Allow manual release notes creation later

## Testing Strategy

### Unit Testing

#### Test Suite 1: Tag Creation Logic
```yaml
Test: Valid environment tag creation
Given: version="1.2.3", environment="dev"
When: create-release-tag action is called
Then: Tag "v1.2.3-dev" is created

Test: Duplicate tag handling
Given: Tag "v1.2.3-dev" already exists
When: create-release-tag action is called
Then: No error occurs, tag-created=false

Test: Invalid environment rejection
Given: environment="invalid"
When: create-release-tag action is called
Then: Action fails with validation error
```

#### Test Suite 2: Version Resolution
```yaml
Test: First version resolution
Given: No existing tags
When: resolve-version action is called
Then: version="1.0.0"

Test: Latest version detection
Given: Tags v1.0.0, v1.1.0, v1.2.0 exist
When: resolve-version action is called
Then: version="1.2.0"

Test: Environment tag detection
Given: v1.2.0-dev exists
When: resolve-version for dev is called
Then: is-new-version=false
```

#### Test Suite 3: Release Notes Generation
```yaml
Test: Commit categorization
Given: Commits with feat, fix, docs prefixes
When: generate-release-notes action is called
Then: Commits are grouped by category

Test: First release notes
Given: No previous tag
When: generate-release-notes action is called
Then: All commits from repository start are included

Test: Empty commit range
Given: No commits between tags
When: generate-release-notes action is called
Then: Release notes indicate no changes
```

### Integration Testing

#### Test Suite 4: Full Deployment Flow
```yaml
Test: Dev deployment with tagging
Given: Code pushed to Saas/dev branch
When: deploy-frontend-complete workflow runs
Then: 
  - Deployment succeeds
  - v1.2.3-dev tag is created
  - Release notes are generated
  - GitHub Release is created

Test: Staging promotion
Given: v1.2.3-dev tag exists
When: deploy-to-staging workflow runs
Then:
  - Deployment succeeds
  - v1.2.3-staging tag is created
  - Release notes reference dev deployment

Test: Production promotion
Given: v1.2.3-staging tag exists
When: deploy-to-production workflow runs
Then:
  - Deployment succeeds
  - v1.2.3-prod tag is created
  - Notifications are sent
```

### End-to-End Testing

#### Test Suite 5: Complete Release Cycle
```yaml
Test: Full release cycle
Given: New feature branch merged to dev
When: Complete deployment pipeline executes
Then:
  - Base version tag created (v1.2.3)
  - Dev deployment creates v1.2.3-dev
  - Staging promotion creates v1.2.3-staging
  - Production promotion creates v1.2.3-prod
  - All release notes are accurate
  - All tags have correct metadata

Test: Rollback scenario
Given: v1.2.3-prod deployed with issues
When: Rollback to v1.2.2-prod is initiated
Then:
  - v1.2.2 code is deployed
  - v1.2.2-prod-rollback-1 tag is created
  - Rollback release notes are generated
  - Notifications are sent
```

### Property-Based Testing

Using GitHub Actions test framework, we'll implement property-based tests for:

1. **Tag Format Property**: All created tags match the expected format
2. **Version Ordering Property**: Tags are always in correct version order
3. **Metadata Completeness Property**: All tags have complete metadata
4. **Idempotency Property**: Multiple deployments of same version don't create duplicate tags


## Deployment Strategy

### Phase 1: Development Environment (Week 1-2)
- Deploy reusable actions to repository
- Enhance dev deployment workflows
- Test with sample deployments
- Validate tag creation and release notes

### Phase 2: Staging Environment (Week 3)
- Create staging promotion workflow
- Test promotion from dev to staging
- Validate version consistency
- Test rollback scenarios

### Phase 3: Production Environment (Week 4)
- Create production promotion workflow
- Add approval gates
- Test full pipeline (dev → staging → prod)
- Validate notifications and monitoring

### Phase 4: Monitoring and Optimization (Week 5)
- Deploy dashboard updates
- Add comprehensive monitoring
- Optimize performance
- Complete documentation

## Security Considerations

### 1. GitHub Token Permissions
- Use `GITHUB_TOKEN` with minimal required permissions
- Required permissions:
  - `contents: write` (for creating tags)
  - `actions: read` (for workflow access)
  - `pull-requests: read` (for PR information)

### 2. Tag Protection
- Enable tag protection rules for production tags
- Require signed commits for production deployments
- Implement approval workflows for production

### 3. Audit Logging
- All tag creations are logged in GitHub audit log
- Tag annotations include deployer information
- Deployment history is preserved in Git

### 4. Access Control
- Restrict who can trigger production deployments
- Use GitHub Environments for approval gates
- Implement CODEOWNERS for workflow changes

## Performance Considerations

### 1. Git Operations Optimization
- Use shallow clones where possible
- Fetch only necessary tags
- Parallel tag creation for multi-component deployments

### 2. Workflow Execution Time
- Target: < 30 seconds added to deployment time
- Parallel execution of tagging and deployment steps
- Caching of Git metadata

### 3. API Rate Limiting
- Implement exponential backoff for GitHub API calls
- Batch operations where possible
- Monitor rate limit usage

## Monitoring and Observability

### 1. Metrics to Track
- Tag creation success rate
- Deployment frequency per environment
- Time between environment promotions
- Rollback frequency
- Release notes generation time

### 2. Alerts
- Failed tag creation
- Deployment failures
- Missing release notes
- Version inconsistencies

### 3. Dashboards
- Current versions in each environment
- Deployment history timeline
- Version promotion flow
- Rollback history

## Documentation Requirements

### 1. User Documentation
- Deployment guide updates
- How to promote releases
- How to perform rollbacks
- Troubleshooting guide

### 2. Developer Documentation
- Workflow architecture
- Action API reference
- Testing procedures
- Contributing guidelines

### 3. Operations Documentation
- Monitoring setup
- Alert configuration
- Incident response procedures
- Audit report generation

## Success Criteria

### Technical Success Criteria
- ✅ 100% of successful deployments create appropriate tags
- ✅ 0% tag creation failures
- ✅ < 30 seconds added to deployment time
- ✅ 100% release notes accuracy
- ✅ All property-based tests pass

### Business Success Criteria
- ✅ Reduced time to identify deployed versions (from minutes to seconds)
- ✅ Faster rollback execution (< 5 minutes)
- ✅ Improved audit compliance (100% traceability)
- ✅ Better deployment visibility (real-time dashboard)
- ✅ Reduced deployment errors (through better version management)

## Appendix

### A. Tag Naming Examples

```
Base Version:        v1.2.3
Dev Tag:            v1.2.3-dev
Staging Tag:        v1.2.3-staging
Production Tag:     v1.2.3-prod
Rollback Tag:       v1.2.3-prod-rollback-1
Hotfix Tag:         v1.2.4-prod-hotfix
```

### B. Workflow Trigger Matrix

| Workflow | Trigger | Creates Tag | Environment |
|----------|---------|-------------|-------------|
| push_Tags.yml | PR merge | v1.2.3 | N/A |
| deploy-frontend-complete.yml | Push to Saas/dev | v1.2.3-dev | Dev |
| deploy-multitenant-backend.yml | Push to Saas/dev | v1.2.3-dev | Dev |
| deploy-to-staging.yml | Manual | v1.2.3-staging | Staging |
| deploy-to-production.yml | Manual | v1.2.3-prod | Production |
| rollback-deployment.yml | Manual | v1.2.2-prod-rollback-1 | Any |

### C. Version Resolution Algorithm

```
1. Fetch all tags from remote
2. Filter tags matching pattern: v[0-9]+\.[0-9]+\.[0-9]+$
3. Sort tags by semantic version (descending)
4. Select first tag as latest base version
5. Check if environment-specific tag exists (base + environment suffix)
6. If exists: reuse version, set is-new-version=false
7. If not exists: use base version, set is-new-version=true
8. Return version, full-tag, previous-tag, is-new-version
```

---

**Design Document Version**: 1.0
**Last Updated**: 2024-11-25
**Status**: Ready for Implementation
