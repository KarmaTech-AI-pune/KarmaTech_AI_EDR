# Automatic Versioning System

## Overview

The Automatic Versioning System provides seamless version management using conventional commits and semantic versioning. Every merge to `Kiro/dev` automatically calculates and applies the next version number based on the types of changes included.

## How It Works

### 1. Conventional Commits
The system analyzes commit messages to determine version increments:

| Commit Type | Version Bump | Example |
|-------------|--------------|---------|
| `fix:` | PATCH (1.11.11 → 1.11.12) | `fix: resolve login timeout issue` |
| `feat:` | MINOR (1.11.11 → 1.12.0) | `feat: add project status history` |
| `feat!:` or `BREAKING CHANGE:` | MAJOR (1.11.11 → 2.0.0) | `feat!: redesign authentication API` |

### 2. Automatic Version Updates
When a PR is merged, the system automatically:
- ✅ Analyzes all commit messages in the PR
- ✅ Calculates the appropriate version increment
- ✅ Updates `VERSION` file and `package.json`
- ✅ Creates git tag (e.g., `v1.12.0-dev.20241204.1`)
- ✅ Updates all version displays in the application
- ✅ Generates release notes in `CHANGELOG.md`

### 3. Version Display Locations
Version information appears in:
- **Login Screen**: Dynamic version display (replaces hardcoded "1.11.11")
- **API Endpoints**: `/api/version` and `/api/version/health`
- **Build Artifacts**: Embedded in compiled applications
- **Deployment Logs**: All deployment activities include version context
- **Error Reports**: Version information included for debugging

## Usage

### For Developers

#### Writing Conventional Commits
```bash
# Bug fixes (PATCH increment)
git commit -m "fix: resolve null reference in project status"

# New features (MINOR increment)  
git commit -m "feat: add automatic email notifications"

# Breaking changes (MAJOR increment)
git commit -m "feat!: redesign user authentication system"
# or
git commit -m "feat: redesign user authentication

BREAKING CHANGE: This changes the authentication API endpoints"
```

#### Using Version Information in Code

**Frontend (React/TypeScript):**
```typescript
import { getVersionInfo, getDisplayVersion } from '../utils/version';

// Get full version information
const versionInfo = getVersionInfo();
console.log(versionInfo.version); // "1.12.0"
console.log(versionInfo.displayVersion); // "v1.12.0"

// Use the VersionDisplay component
import { VersionDisplay } from '../components/VersionDisplay';

<VersionDisplay 
  prefix="App Version"
  showBuildDate={true}
  showDevIndicator={true}
/>
```

**Backend (C#/.NET):**
```csharp
// Version API endpoint
GET /api/version

// Response:
{
  "success": true,
  "data": {
    "version": "1.12.0",
    "buildDate": "2024-12-04T10:30:00Z",
    "commitHash": "abc123def456"
  }
}
```

### For QA/Testing

#### Version Context in Error Reports
All error reports automatically include version information:
```
Error: Login failed
Version: v1.12.0 (2024-12-04)
Environment: dev
Commit: abc123def456
```

#### Health Check with Version
```bash
curl https://api.app.karmatech-ai.com/api/version/health

{
  "status": "healthy",
  "version": "1.12.0",
  "uptime": "2d 5h 30m 15s",
  "timestamp": "2024-12-04T15:30:00Z"
}
```

### For Release Management

#### Version History
```bash
# Get version history via API
GET /api/version/history

# Or check git tags
git tag -l "v*" --sort=-version:refname
```

#### Release Notes
Automatic release notes are generated in `CHANGELOG.md`:

```markdown
# Release v1.12.0

**Release Date:** 2024-12-04

## ✨ New Features
- Add project status history tracking
- Implement automatic email notifications

## 🐛 Bug Fixes  
- Resolve null reference in project status
- Fix login timeout issue

## 🔧 Other Changes
- Update documentation for new features
- Refactor authentication middleware
```

## Configuration

### Environment Variables
The system uses these environment variables during build:

```bash
# Frontend (Vite)
VITE_APP_VERSION=1.12.0
VITE_BUILD_DATE=2024-12-04T10:30:00Z
VITE_COMMIT_SHA=abc123def456

# Backend (.NET)
BUILD_COMMIT_HASH=abc123def456
BUILD_DATE=2024-12-04T10:30:00Z
```

### Manual Version Override
You can manually override the version increment when triggering deployment:

```yaml
# In GitHub Actions
workflow_dispatch:
  inputs:
    version-bump:
      description: 'Version bump type'
      type: choice
      options:
        - patch
        - minor  
        - major
```

## Troubleshooting

### Version Not Updating
1. **Check commit messages**: Ensure they follow conventional commit format
2. **Verify workflow**: Check GitHub Actions logs for version calculation
3. **Check file permissions**: Ensure workflow can write to VERSION file

### Version Display Issues
1. **Frontend shows "unknown"**: Check if `VITE_APP_VERSION` is set during build
2. **Backend API errors**: Verify VERSION file exists in deployment
3. **Inconsistent versions**: Check that all version files are synchronized

### Common Issues

**Issue**: Version shows as "dev" or "unknown"
**Solution**: Ensure build process includes version injection

**Issue**: Hardcoded version still appears
**Solution**: Verify all hardcoded versions are replaced with dynamic versions

**Issue**: Version calculation fails
**Solution**: Check that conventional commit format is used in PR

## Files Modified

### New Files
- `.github/scripts/version-calculator.js` - Core version calculation logic
- `VERSION` - Repository root version file  
- `frontend/src/utils/version.ts` - Version utilities
- `frontend/src/components/VersionDisplay.tsx` - Reusable version component
- `backend/src/NJSAPI/Controllers/VersionController.cs` - Version API
- `CHANGELOG.md` - Automated release notes

### Modified Files
- `frontend/src/pages/LoginScreen.tsx` - Dynamic version display
- `frontend/package.json` - Automated version updates
- `frontend/vite.config.ts` - Version injection configuration
- `.github/workflows/deploy-dev-with-tags.yml` - Integrated version calculation

## Benefits

### For Development Team
- ✅ **Zero manual version management** - No more forgetting to update versions
- ✅ **Consistent versioning** - Same process every time
- ✅ **Clear change tracking** - Version increments reflect change impact
- ✅ **Automated documentation** - Release notes generated automatically

### For QA/Support
- ✅ **Version context in errors** - Easy to correlate issues with releases
- ✅ **Clear deployment tracking** - Know exactly what's deployed where
- ✅ **Historical tracking** - Complete version history available
- ✅ **Health monitoring** - Version information in health checks

### For Management
- ✅ **Release visibility** - Clear tracking of what's released when
- ✅ **Change impact assessment** - Version increments indicate change scope
- ✅ **Audit trail** - Complete history of changes and deployments
- ✅ **Reduced errors** - Automated process eliminates human mistakes

---

**The automatic versioning system ensures every deployable build has a clear, consistent version number for effective release management and error tracking.**