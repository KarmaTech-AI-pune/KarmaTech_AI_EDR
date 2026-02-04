# Deployment Release Tagging - Implementation Plan

## Executive Summary

This document outlines the implementation plan for adding automated Git release tagging to the EDR deployment pipeline. The system will create environment-specific tags (dev, staging, production) for each successful deployment, providing complete traceability and version management.

## Current State Analysis

### Existing Tagging System
- **File**: `.github/workflows/push_Tags.yml`
- **Trigger**: PR merge to any branch
- **Behavior**: Creates semantic version tags (vX.Y.Z) based on PR labels
- **Limitations**: 
  - No environment-specific tags
  - No integration with deployment workflows
  - No release notes generation
  - No deployment traceability

### Existing Deployment Workflows

#### 1. Frontend Deployment (`.github/workflows/deploy-frontend-complete.yml`)
- **Trigger**: Push to `Saas/dev` branch with frontend changes
- **Environments**: Dev (admin + tenant)
- **Process**:
  1. Deploy CloudFormation infrastructure
  2. Build admin frontend (npm run build)
  3. Deploy admin to S3 + CloudFront
  4. Build tenant frontend (npm run build)
  5. Deploy tenant to S3 + CloudFront
- **Missing**: Release tagging

#### 2. Backend Deployment (`.github/workflows/deploy-multitenant-backend.yml`)
- **Trigger**: Manual or automated
- **Environments**: Dev, Staging, Production
- **Process**:
  1. Build .NET Core 8.0 application (dotnet publish)
  2. Deploy to Elastic Beanstalk
  3. Run database migrations
- **Missing**: Release tagging

#### 3. Windows IIS Deployment (`deployment/scripts/3-deploy-backend.ps1`)
- **Trigger**: Manual PowerShell execution
- **Process**:
  1. Create backup
  2. Stop IIS app pool
  3. Extract and deploy files
  4. Start IIS app pool
  5. Health check
- **Missing**: Release tagging

## Proposed Architecture

### Tag Naming Convention

```
Base Version Tag:     v1.2.3
Dev Tag:             v1.2.3-dev
Staging Tag:         v1.2.3-staging
Production Tag:      v1.2.3-prod
Rollback Tag:        v1.2.3-prod-rollback-1
```

### Workflow Integration Points

```
┌─────────────────────────────────────────────────────────────┐
│                    PR Merge (Any Branch)                     │
│                  push_Tags.yml (EXISTING)                    │
│              Creates: v1.2.3 (base version)                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Push to Saas/dev Branch                         │
│         deploy-frontend-complete.yml (ENHANCED)              │
│         deploy-multitenant-backend.yml (ENHANCED)            │
│                                                              │
│  1. Deploy to Dev Environment                                │
│  2. On Success: Create v1.2.3-dev tag                       │
│  3. Generate Release Notes                                   │
│  4. Create GitHub Release                                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Manual Promotion to Staging                     │
│         deploy-to-staging.yml (NEW WORKFLOW)                 │
│                                                              │
│  1. Verify v1.2.3-dev exists                                │
│  2. Deploy to Staging Environment                            │
│  3. On Success: Create v1.2.3-staging tag                   │
│  4. Generate Release Notes                                   │
│  5. Create GitHub Release                                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Manual Promotion to Production                  │
│         deploy-to-production.yml (NEW WORKFLOW)              │
│                                                              │
│  1. Verify v1.2.3-staging exists                            │
│  2. Deploy to Production Environment                         │
│  3. On Success: Create v1.2.3-prod tag                      │
│  4. Generate Release Notes                                   │
│  5. Create GitHub Release                                    │
│  6. Send Notifications                                       │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Phases

### Phase 1: Core Tagging Infrastructure (Week 1)

#### 1.1 Create Reusable Tagging Action
**File**: `.github/actions/create-release-tag/action.yml`

**Purpose**: Reusable composite action for creating environment-specific tags

**Inputs**:
- `environment`: dev, staging, or prod
- `version`: Base semantic version (e.g., 1.2.3)
- `commit-sha`: Commit to tag
- `github-token`: GitHub token for authentication

**Outputs**:
- `tag-name`: Created tag name (e.g., v1.2.3-dev)
- `tag-created`: Boolean indicating if tag was created

**Features**:
- Checks if tag already exists
- Creates annotated tag with metadata
- Pushes tag to remote
- Handles errors gracefully

#### 1.2 Create Release Notes Generator
**File**: `.github/actions/generate-release-notes/action.yml`

**Purpose**: Generate formatted release notes from commits

**Inputs**:
- `from-tag`: Previous tag to compare from
- `to-tag`: Current tag to compare to
- `environment`: Target environment

**Outputs**:
- `release-notes`: Markdown-formatted release notes
- `commit-count`: Number of commits included

**Features**:
- Categorizes commits by type (feat, fix, docs, etc.)
- Includes PR numbers and authors
- Formats in markdown
- Handles first release (no previous tag)

#### 1.3 Create Version Resolver
**File**: `.github/actions/resolve-version/action.yml`

**Purpose**: Determine the correct version to use for deployment

**Inputs**:
- `environment`: Target environment
- `branch`: Source branch

**Outputs**:
- `version`: Semantic version (e.g., 1.2.3)
- `full-tag`: Full tag name (e.g., v1.2.3-dev)
- `previous-tag`: Previous tag for this environment

**Features**:
- Finds latest base version tag
- Checks if environment tag exists
- Determines if new version is needed

### Phase 2: Enhance Existing Workflows (Week 2)

#### 2.1 Enhance Frontend Deployment Workflow
**File**: `.github/workflows/deploy-frontend-complete.yml`

**Changes**:
1. Add version resolution step at start
2. Add tagging step after successful deployment
3. Add release notes generation
4. Add GitHub Release creation
5. Add deployment summary with version info

**New Jobs**:
- `resolve-version`: Determine version before deployment
- `create-release-tag`: Create tag after successful deployment
- `create-github-release`: Create GitHub Release with notes

#### 2.2 Enhance Backend Deployment Workflow
**File**: `.github/workflows/deploy-multitenant-backend.yml`

**Changes**:
1. Add version resolution step
2. Add tagging step after successful deployment
3. Add release notes generation
4. Add GitHub Release creation
5. Add deployment notifications

#### 2.3 Update Existing Tag Workflow
**File**: `.github/workflows/push_Tags.yml`

**Changes**:
- Add comment explaining this creates base version tags
- Ensure it doesn't conflict with environment tags
- Add validation to prevent environment suffix in base tags

### Phase 3: Create Environment Promotion Workflows (Week 3)

#### 3.1 Create Staging Deployment Workflow
**File**: `.github/workflows/deploy-to-staging.yml`

**Trigger**: Manual workflow_dispatch with version input

**Process**:
1. Validate that `-dev` tag exists for specified version
2. Checkout code at that tag
3. Deploy frontend to staging S3/CloudFront
4. Deploy backend to staging Elastic Beanstalk
5. Run smoke tests
6. Create `-staging` tag on success
7. Generate and publish release notes
8. Send notifications

#### 3.2 Create Production Deployment Workflow
**File**: `.github/workflows/deploy-to-production.yml`

**Trigger**: Manual workflow_dispatch with version input

**Process**:
1. Validate that `-staging` tag exists for specified version
2. Require manual approval (GitHub Environment protection)
3. Checkout code at that tag
4. Deploy frontend to production S3/CloudFront
5. Deploy backend to production Elastic Beanstalk
6. Run smoke tests
7. Create `-prod` tag on success
8. Generate and publish release notes
9. Send notifications (Slack, email, etc.)
10. Update deployment dashboard

### Phase 4: Rollback Support (Week 4)

#### 4.1 Create Rollback Workflow
**File**: `.github/workflows/rollback-deployment.yml`

**Trigger**: Manual workflow_dispatch

**Inputs**:
- `environment`: dev, staging, or prod
- `target-version`: Version to rollback to (optional, defaults to previous)
- `reason`: Reason for rollback

**Process**:
1. Identify current version in environment
2. Identify target version (previous stable or specified)
3. Validate target version exists
4. Deploy target version to environment
5. Create rollback tag (e.g., v1.2.3-prod-rollback-1)
6. Generate rollback release notes
7. Send notifications

#### 4.2 Create Rollback Helper Script
**File**: `deployment/scripts/rollback-helper.ps1`

**Purpose**: PowerShell script for Windows IIS rollbacks

**Features**:
- Lists available versions for rollback
- Validates rollback target
- Executes rollback deployment
- Creates rollback tag
- Generates rollback report

### Phase 5: Monitoring and Reporting (Week 5)

#### 5.1 Create Deployment Dashboard
**File**: `.github/workflows/update-deployment-dashboard.yml`

**Purpose**: Update a dashboard showing current versions in each environment

**Process**:
1. Query latest tags for each environment
2. Generate markdown table
3. Update GitHub Wiki or README
4. Include deployment timestamps and deployers

**Output Example**:
```markdown
| Environment | Version | Deployed At | Deployed By |
|-------------|---------|-------------|-------------|
| Dev         | v1.2.5-dev | 2024-11-25 10:30 | github-actions |
| Staging     | v1.2.4-staging | 2024-11-24 15:45 | john.doe |
| Production  | v1.2.3-prod | 2024-11-23 09:00 | jane.smith |
```

#### 5.2 Create Deployment History Report
**File**: `deployment/scripts/generate-deployment-report.ps1`

**Purpose**: Generate audit-ready deployment history report

**Features**:
- Lists all deployments across environments
- Includes commit SHAs, timestamps, deployers
- Exports to CSV and PDF
- Filters by date range and environment

#### 5.3 Add Notification Integration
**File**: `.github/actions/send-deployment-notification/action.yml`

**Purpose**: Send notifications to various channels

**Supported Channels**:
- GitHub Actions summary
- Slack webhook
- Microsoft Teams webhook
- Email (via SendGrid or similar)

**Notification Content**:
- Environment
- Version
- Deployer
- Timestamp
- Commit summary
- Link to release notes

## File Structure

```
.github/
├── actions/
│   ├── create-release-tag/
│   │   └── action.yml                    # NEW: Reusable tag creation
│   ├── generate-release-notes/
│   │   └── action.yml                    # NEW: Release notes generator
│   ├── resolve-version/
│   │   └── action.yml                    # NEW: Version resolver
│   └── send-deployment-notification/
│       └── action.yml                    # NEW: Notification sender
│
├── workflows/
│   ├── push_Tags.yml                     # EXISTING: Base version tags
│   ├── deploy-frontend-complete.yml      # ENHANCED: Add tagging
│   ├── deploy-multitenant-backend.yml    # ENHANCED: Add tagging
│   ├── deploy-to-staging.yml             # NEW: Staging promotion
│   ├── deploy-to-production.yml          # NEW: Production promotion
│   ├── rollback-deployment.yml           # NEW: Rollback support
│   └── update-deployment-dashboard.yml   # NEW: Dashboard updates
│
deployment/
├── scripts/
│   ├── 3-deploy-backend.ps1              # ENHANCED: Add tagging
│   ├── rollback-helper.ps1               # NEW: Rollback support
│   └── generate-deployment-report.ps1    # NEW: Audit reports
│
└── docs/
    ├── DEPLOYMENT_GUIDE.md               # ENHANCED: Add tagging docs
    └── ROLLBACK_GUIDE.md                 # NEW: Rollback procedures
```

## Implementation Timeline

### Week 1: Core Infrastructure
- Day 1-2: Create reusable tagging action
- Day 3-4: Create release notes generator
- Day 5: Create version resolver
- Day 5: Testing and documentation

### Week 2: Workflow Enhancement
- Day 1-2: Enhance frontend deployment workflow
- Day 3-4: Enhance backend deployment workflow
- Day 5: Update existing tag workflow
- Day 5: Testing and validation

### Week 3: Environment Promotion
- Day 1-2: Create staging deployment workflow
- Day 3-4: Create production deployment workflow
- Day 5: Integration testing

### Week 4: Rollback Support
- Day 1-2: Create rollback workflow
- Day 3-4: Create rollback helper script
- Day 5: Testing rollback scenarios

### Week 5: Monitoring and Polish
- Day 1-2: Create deployment dashboard
- Day 3: Create deployment history report
- Day 4: Add notification integration
- Day 5: Final testing and documentation

## Testing Strategy

### Unit Testing
- Test tag creation logic
- Test version resolution logic
- Test release notes generation
- Test notification formatting

### Integration Testing
- Test full deployment flow (dev → staging → prod)
- Test rollback scenarios
- Test error handling
- Test concurrent deployments

### End-to-End Testing
- Deploy sample application through all environments
- Verify tags are created correctly
- Verify release notes are accurate
- Verify notifications are sent
- Verify rollback works correctly

## Rollout Strategy

### Phase 1: Pilot (Week 6)
- Enable on dev environment only
- Monitor for issues
- Gather feedback from team

### Phase 2: Staging (Week 7)
- Enable on staging environment
- Test promotion workflow
- Validate release notes

### Phase 3: Production (Week 8)
- Enable on production environment
- Full team training
- Documentation complete

## Success Metrics

### Technical Metrics
- 100% of deployments create appropriate tags
- 0 failed tag creations
- < 30 seconds added to deployment time
- 100% release notes accuracy

### Business Metrics
- Reduced time to identify deployed versions
- Faster rollback execution
- Improved audit compliance
- Better deployment visibility

## Risk Mitigation

### Risk 1: Tag Conflicts
**Mitigation**: Check for existing tags before creation, use unique suffixes

### Risk 2: Deployment Failures
**Mitigation**: Only create tags after successful deployment, implement retry logic

### Risk 3: Performance Impact
**Mitigation**: Run tagging in parallel with deployment, optimize Git operations

### Risk 4: Backward Compatibility
**Mitigation**: Preserve existing tags, support both old and new formats

## Documentation Requirements

### User Documentation
- Deployment guide updates
- Rollback procedures
- Version management guide
- Troubleshooting guide

### Developer Documentation
- Workflow architecture
- Action API documentation
- Testing procedures
- Contribution guidelines

## Approval and Sign-off

This implementation plan requires approval from:
- [ ] DevOps Lead
- [ ] Development Manager
- [ ] Release Manager
- [ ] Security Team
- [ ] Compliance Officer

---

**Next Steps**: Upon approval, proceed to detailed design phase and begin implementation of Phase 1.
