# Version Calculator Service

## Overview

The Version Calculator Service provides automated semantic versioning based on conventional commit messages. It implements the requirements specified in the automatic versioning system specification.

## Features

- **Conventional Commit Parsing**: Analyzes commit messages to determine version increment type
- **Semantic Versioning**: Follows MAJOR.MINOR.PATCH format
- **Multi-Platform Support**: Updates VERSION file, package.json, and .NET project files
- **Git Tag Management**: Creates and manages version tags
- **Release Notes Generation**: Automatically generates CHANGELOG.md entries
- **Error Handling**: Robust error handling with fallback mechanisms

## Usage

### Command Line Interface

```bash
# Basic usage (dry run)
node .github/scripts/version-calculator.js --dry-run

# Update version files without creating git tag
node .github/scripts/version-calculator.js --skip-tag

# Skip file updates (only create tag)
node .github/scripts/version-calculator.js --skip-files

# Specify custom base and head branches
node .github/scripts/version-calculator.js --base origin/main --head HEAD

# Show help
node .github/scripts/version-calculator.js --help
```

### Programmatic Usage

```javascript
const VersionCalculator = require('./version-calculator');

const calculator = new VersionCalculator();

// Calculate next version
const commits = calculator.getCommits('main', 'HEAD');
const newVersion = calculator.calculateNextVersion(commits);

// Update version files
calculator.updateVersionFile(newVersion);
calculator.updatePackageJson(newVersion);
calculator.updateDotNetProjects(newVersion);

// Create git tag
calculator.createGitTag(newVersion);
```

## Conventional Commit Format

The service recognizes the following conventional commit types:

- `feat:` - New feature (MINOR version increment)
- `fix:` - Bug fix (PATCH version increment)
- `feat!:` or `BREAKING CHANGE:` - Breaking change (MAJOR version increment)
- `docs:`, `style:`, `refactor:`, `test:`, `chore:` - Other changes (PATCH version increment)

### Examples

```
feat: add user authentication system          # Minor increment
fix: resolve login validation bug             # Patch increment
feat!: redesign API endpoints                 # Major increment
fix: update dependencies                      # Patch increment

feat(auth): add OAuth2 support
BREAKING CHANGE: remove deprecated endpoints  # Major increment
```

## Version Increment Priority

When multiple commit types are present, the highest priority increment is used:

1. **MAJOR** - Breaking changes (highest priority)
2. **MINOR** - New features
3. **PATCH** - Bug fixes and other changes (lowest priority)

## File Updates

The service automatically updates version information in:

1. **VERSION file** - Repository root version file
2. **package.json** - Frontend package version
3. **.NET Project Files** - Backend assembly versions
   - `backend/src/NJSAPI/NJSAPI.csproj`
   - `backend/src/NJS.Application/NJS.Application.csproj`
   - `backend/src/NJS.Domain/NJS.Domain.csproj`

## Git Tag Format

Version tags follow the format: `v{MAJOR}.{MINOR}.{PATCH}`

Examples:
- `v1.0.0`
- `v1.2.3`
- `v2.0.0`

## Release Notes

The service generates structured release notes in CHANGELOG.md with the following sections:

- **🚨 Breaking Changes** - Major version increments
- **✨ New Features** - Feature additions
- **🐛 Bug Fixes** - Bug fixes
- **🔧 Other Changes** - Documentation, refactoring, etc.

## Error Handling

The service includes robust error handling:

- **Invalid commit formats**: Logs warning, defaults to PATCH increment
- **Git tag creation failures**: Fails deployment, notifies administrators
- **File update failures**: Rolls back changes, fails deployment
- **Missing files**: Warns and continues with available files

## Testing

Run the test suite to verify functionality:

```bash
node .github/scripts/test-version-calculator.js
```

## Integration with GitHub Actions

The service is designed to integrate with GitHub Actions workflows:

```yaml
- name: Calculate Version
  run: node .github/scripts/version-calculator.js
  
- name: Get Version Output
  id: version
  run: echo "version=$(cat VERSION)" >> $GITHUB_OUTPUT
```

## Requirements Validation

This implementation satisfies the following requirements:

- **1.1-1.5**: Automatic version determination from commit messages
- **2.1-2.5**: Semantic versioning format and increment rules
- **3.1-3.5**: Version storage in canonical locations
- **4.1-4.5**: Automatic version application on merge
- **5.1-5.5**: Version history maintenance
- **9.1-9.5**: Automatic release notes generation

## Performance

- **Version calculation**: < 10 seconds for up to 100 commits
- **File updates**: < 2 seconds additional build time
- **Memory usage**: Minimal impact on build process

## Security

- Validates version increments to prevent manipulation
- Sanitizes commit message content in release notes
- Ensures atomic updates to prevent inconsistencies