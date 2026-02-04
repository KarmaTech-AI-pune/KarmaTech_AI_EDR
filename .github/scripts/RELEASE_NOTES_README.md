# Release Notes Generation Scripts

This directory contains scripts for automatically generating and storing release notes as part of the GitHub Actions deployment workflow.

## Scripts Overview

### 1. `generate-release-notes.js`

Generates structured release notes from Git commits using conventional commit format.

**Features:**
- Parses conventional commit messages (feat:, fix:, docs:, etc.)
- Extracts JIRA ticket references
- Categorizes changes into Features, Bug Fixes, Improvements, etc.
- Generates both markdown and JSON formats
- Handles breaking changes detection

**Usage:**
```bash
node generate-release-notes.js --version v1.2.3-dev.20241223.1 --environment dev --commit-sha abc123
```

**Output Files:**
- `.github/release-notes/{version}-{environment}.md` - Markdown format
- `.github/release-notes/{version}-{environment}.json` - Structured JSON
- `.github/release-notes/api-data.json` - API-ready format

### 2. `store-release-notes.js`

Stores generated release notes in the database via API call.

**Features:**
- Validates release notes data structure
- Retry logic with exponential backoff
- Support for API authentication
- GitHub Actions integration

**Usage:**
```bash
node store-release-notes.js --api-url https://api.app.karmatech-ai.com/api/release-notes --data-file .github/release-notes/api-data.json
```

**Environment Variables:**
- `RELEASE_NOTES_API_KEY` - Optional API key for authentication

## Workflow Integration

### Automatic Triggers

Release notes are automatically generated when:

1. **Development Deployment** (`deploy-dev-with-tags.yml`)
   - Triggered on push to `Kiro/dev` branch
   - Creates development release tags
   - Generates and stores release notes

2. **Staging Deployment** (`deploy-staging-with-tags.yml`)
   - Uses `create-release-tags.yml` workflow
   - Generates release notes for staging environment

3. **Production Deployment** (`deploy-production-with-tags.yml`)
   - Uses `create-release-tags.yml` workflow
   - Creates GitHub Release with release notes
   - Generates clean production release notes

### Workflow Steps

1. **Version Tag Creation** - Creates environment-specific version tags
2. **Release Notes Generation** - Analyzes commits and generates structured notes
3. **Database Storage** - Stores release notes via API call
4. **GitHub Release** - Creates GitHub Release (for production)
5. **Deployment** - Continues with application deployment

## Conventional Commit Format

The release notes generator recognizes these conventional commit types:

| Type | Category | Description |
|------|----------|-------------|
| `feat:` | Features | New features |
| `fix:` | Bug Fixes | Bug fixes |
| `docs:` | Documentation | Documentation changes |
| `style:` | Improvements | Code style changes |
| `refactor:` | Improvements | Code refactoring |
| `perf:` | Performance | Performance improvements |
| `test:` | Testing | Test additions/changes |
| `chore:` | Maintenance | Maintenance tasks |
| `ci:` | CI/CD | CI/CD changes |
| `build:` | Build | Build system changes |
| `revert:` | Reverts | Reverted changes |

### Breaking Changes

Breaking changes are detected by:
- `BREAKING CHANGE:` in commit message
- `!:` in commit type (e.g., `feat!:`)
- "breaking" keyword in description

### JIRA Integration

JIRA ticket references are automatically extracted from commit messages:
- Format: `[A-Z]+-\d+` (e.g., EDR-123, PROJ-456)
- Multiple tickets per commit supported
- Included in release notes output

## API Integration

### Release Notes API Endpoint

**POST** `/api/release-notes`

**Request Body:**
```json
{
  "version": "v1.2.3-dev.20241223.1",
  "environment": "dev",
  "releaseDate": "2024-12-23T14:30:00Z",
  "buildNumber": "123",
  "commitSha": "abc123def456",
  "branch": "Kiro/dev",
  "features": [
    {
      "description": "Add new feature",
      "commitSha": "abc123",
      "jiraTicket": "EDR-123",
      "impact": "Medium",
      "author": "John Doe",
      "scope": "frontend"
    }
  ],
  "bugFixes": [...],
  "improvements": [...],
  "breakingChanges": [...],
  "knownIssues": []
}
```

**Response:**
```json
{
  "success": true,
  "id": 123,
  "version": "v1.2.3-dev.20241223.1",
  "message": "Release notes stored successfully"
}
```

## File Structure

```
.github/
├── scripts/
│   ├── generate-release-notes.js     # Main generation script
│   ├── store-release-notes.js        # Database storage script
│   └── RELEASE_NOTES_README.md       # This documentation
├── release-notes/                    # Generated release notes
│   ├── v1.2.3-dev.20241223.1.md     # Markdown format
│   ├── v1.2.3-dev.20241223.1.json   # Structured JSON
│   └── api-data.json                 # Latest API data
└── workflows/
    ├── deploy-dev-with-tags.yml      # Dev deployment with release notes
    ├── deploy-staging-with-tags.yml  # Staging deployment
    ├── deploy-production-with-tags.yml # Production deployment
    └── create-release-tags.yml       # Shared tag creation workflow
```

## Troubleshooting

### Common Issues

1. **No commits found**
   - Check if there are commits between tags
   - Verify Git history is available (fetch-depth: 0)

2. **API storage fails**
   - Check API endpoint availability
   - Verify authentication if required
   - Review network connectivity

3. **Invalid commit format**
   - Commits without conventional format are categorized as "Other"
   - No impact on release notes generation

### Debug Mode

Enable debug logging by setting environment variable:
```bash
export DEBUG_RELEASE_NOTES=true
```

### Manual Execution

Generate release notes manually:
```bash
# Generate release notes
node .github/scripts/generate-release-notes.js \
  --version "v1.2.3-dev.20241223.1" \
  --environment "dev" \
  --commit-sha "abc123"

# Store in database
node .github/scripts/store-release-notes.js \
  --api-url "https://api.app.karmatech-ai.com/api/release-notes" \
  --data-file ".github/release-notes/api-data.json"
```

## Future Enhancements

- [ ] Support for custom commit message formats
- [ ] Integration with additional issue tracking systems
- [ ] Release notes templates
- [ ] Automated changelog generation
- [ ] Release notes approval workflow
- [ ] Multi-language support
- [ ] Release notes analytics

## Related Documentation

- [GitHub Actions Workflows](../workflows/README.md)
- [Version Tagging Strategy](./VERSION_CALCULATOR_README.md)
- [API Documentation](../../backend/README.md)
- [Frontend Integration](../../frontend/README.md)