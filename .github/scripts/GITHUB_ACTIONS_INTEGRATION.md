# GitHub Actions Version Integration

## Overview

The GitHub Actions Version Integration provides enhanced automation for version calculation and deployment workflows. This integration eliminates manual version management and ensures consistent, error-free version handling across all deployment environments.

## Features

### ✅ **Automatic Version Calculation**
- Analyzes conventional commit messages to determine version increments
- Supports semantic versioning (MAJOR.MINOR.PATCH)
- Handles manual version overrides via workflow dispatch

### ✅ **Comprehensive Error Handling**
- Validates prerequisites before execution
- Provides detailed error messages and recovery guidance
- Prevents deployment on version calculation failures
- Notifies administrators of critical issues

### ✅ **Version File Synchronization**
- Updates VERSION file in repository root
- Updates frontend/package.json version
- Updates .NET project file versions
- Validates synchronization across all files

### ✅ **Git Tag Management**
- Creates semantic version tags (v1.2.3)
- Creates environment-specific tags (v1.2.3-dev.20241209.1)
- Automatically pushes tags to remote repository
- Handles tag creation failures gracefully

### ✅ **GitHub Actions Integration**
- Provides structured outputs for workflow steps
- Generates comprehensive step summaries
- Sets environment variables for subsequent steps
- Supports both automatic and manual execution

## Integration Points

### 1. **Workflow Integration**

The integration is embedded in the `deploy-dev-with-tags.yml` workflow:

```yaml
- name: Calculate Version and Create Tags
  id: version-integration
  run: |
    node .github/scripts/github-actions-version-integration.js --base origin/Kiro/dev --head HEAD
```

### 2. **Output Variables**

The integration provides these outputs for subsequent workflow steps:

| Output | Description | Example |
|--------|-------------|---------|
| `integration_success` | Overall success status | `true` |
| `new_version` | Calculated semantic version | `1.2.3` |
| `version_tag` | Clean version tag | `v1.2.3` |
| `environment_version_tag` | Environment-specific tag | `v1.2.3-dev.20241209.1` |
| `increment_type` | Version increment type | `minor` |
| `environment` | Deployment environment | `dev` |
| `build_number` | Build number for the day | `1` |
| `commits_analyzed` | Number of commits analyzed | `5` |
| `execution_time` | Script execution time | `2.45` |
| `version_sync_status` | File synchronization status | `synchronized` |

### 3. **Error Handling**

When errors occur, the integration:

1. **Logs detailed error messages** in GitHub Actions format
2. **Sets error output variables** for workflow decision making
3. **Prevents deployment** by exiting with error code
4. **Notifies administrators** via step summary and outputs
5. **Provides recovery guidance** in error messages

## Conventional Commit Support

The integration recognizes these conventional commit types:

| Commit Type | Version Increment | Example |
|-------------|-------------------|---------|
| `feat:` | MINOR | `feat: add user authentication` |
| `fix:` | PATCH | `fix: resolve login validation bug` |
| `feat!:` or `BREAKING CHANGE:` | MAJOR | `feat!: redesign API endpoints` |
| `docs:`, `style:`, `refactor:`, `test:`, `chore:` | PATCH | `docs: update API documentation` |

### Priority Rules

When multiple commit types are present:
1. **MAJOR** - Breaking changes (highest priority)
2. **MINOR** - New features
3. **PATCH** - Bug fixes and other changes (lowest priority)

## Manual Version Override

The integration supports manual version increments via workflow dispatch:

```yaml
workflow_dispatch:
  inputs:
    version-bump:
      description: 'Version bump type'
      required: false
      default: 'patch'
      type: choice
      options:
        - patch
        - minor
        - major
```

When manual override is specified, it takes precedence over calculated increments.

## Error Scenarios and Recovery

### 1. **Version Calculation Failure**

**Symptoms:**
- `integration_success` output is `false`
- Error messages in workflow logs
- Deployment is blocked

**Recovery:**
1. Check commit message format
2. Verify git repository state
3. Review error messages in step summary
4. Re-run workflow after fixes

### 2. **Git Tag Creation Failure**

**Symptoms:**
- `tag_creation_success` output is `false`
- Git tag not visible in repository
- Deployment is blocked

**Recovery:**
1. Check git permissions
2. Verify network connectivity
3. Check for existing tags with same name
4. Review git configuration

### 3. **Version File Synchronization Failure**

**Symptoms:**
- `version_sync_status` output is `mismatched`
- Different versions in VERSION vs package.json
- Deployment is blocked

**Recovery:**
1. Check file permissions
2. Verify file formats (JSON syntax, etc.)
3. Review file update error messages
4. Manually synchronize files if needed

### 4. **Administrator Notification**

When critical errors occur, administrators are notified via:
- GitHub Actions step summary
- Error output variables
- Detailed error logs

The notification includes:
- Error type and message
- Required actions
- Deployment status (blocked)
- Recovery guidance

## Performance Metrics

### Execution Time Targets

| Operation | Target | Typical |
|-----------|--------|---------|
| Version Calculation | < 10s | 2-5s |
| File Updates | < 5s | 1-2s |
| Git Tag Creation | < 10s | 2-3s |
| Total Integration | < 30s | 5-10s |

### Resource Usage

- **Memory**: < 100MB
- **CPU**: Minimal impact
- **Network**: Git operations only
- **Storage**: Negligible

## Security Considerations

### 1. **Git Tag Security**
- Only authorized workflows can create tags
- Version increments are validated
- Signed commits recommended for version changes

### 2. **File Security**
- Version files are validated before updates
- JSON syntax is verified
- File permissions are checked

### 3. **Workflow Security**
- Error messages don't expose sensitive information
- Git credentials are handled securely
- Output sanitization prevents injection

## Monitoring and Alerting

### Key Metrics to Monitor

1. **Success Rate**: Percentage of successful version integrations
2. **Execution Time**: Time from start to completion
3. **Error Frequency**: Rate of version calculation failures
4. **Tag Creation Success**: Rate of successful git tag creation

### Recommended Alerts

1. **Integration Failure**: Alert when `integration_success` is `false`
2. **Performance Degradation**: Alert when execution time > 30s
3. **High Error Rate**: Alert when error rate > 5%
4. **Version Sync Issues**: Alert when files are not synchronized

## Troubleshooting Guide

### Common Issues

#### Issue: "Git is not available or not configured properly"
**Solution:**
1. Verify git is installed in the runner
2. Check git configuration
3. Ensure repository is properly checked out

#### Issue: "Version calculator script not found"
**Solution:**
1. Verify script exists in `.github/scripts/`
2. Check file permissions
3. Ensure repository checkout includes all files

#### Issue: "Version files are not synchronized"
**Solution:**
1. Check file permissions
2. Verify JSON syntax in package.json
3. Review file update error messages
4. Manually verify file contents

#### Issue: "Git tag creation failed"
**Solution:**
1. Check git permissions
2. Verify tag doesn't already exist
3. Check network connectivity
4. Review git configuration

### Debug Mode

To enable debug mode, add environment variable:

```yaml
env:
  DEBUG: true
```

This provides additional logging and diagnostic information.

## Best Practices

### 1. **Commit Message Format**
- Use conventional commit format consistently
- Include clear, descriptive commit messages
- Use appropriate commit types (feat, fix, etc.)

### 2. **Workflow Configuration**
- Always run version integration before deployment
- Use job dependencies to ensure proper sequencing
- Include error handling in subsequent steps

### 3. **Monitoring**
- Monitor integration success rates
- Set up alerts for failures
- Review execution times regularly

### 4. **Recovery Planning**
- Document recovery procedures
- Test rollback scenarios
- Maintain administrator contact information

## Integration Testing

### Test Scenarios

1. **Normal Operation**: Standard commit with conventional format
2. **Manual Override**: Workflow dispatch with manual increment
3. **Error Handling**: Invalid commit format or git issues
4. **Performance**: Large number of commits
5. **Edge Cases**: Empty commits, merge commits, etc.

### Test Commands

```bash
# Test dry run
node .github/scripts/github-actions-version-integration.js --dry-run

# Test with manual increment
node .github/scripts/github-actions-version-integration.js --increment minor --dry-run

# Test with specific commit range
node .github/scripts/github-actions-version-integration.js --base HEAD~5 --head HEAD --dry-run
```

## Migration from Legacy System

### Before Migration
- Manual version updates in multiple files
- Inconsistent version numbering
- Error-prone deployment process
- No automatic tag creation

### After Migration
- Fully automated version management
- Consistent semantic versioning
- Error-free deployment process
- Automatic git tag creation
- Comprehensive error handling

### Migration Steps

1. **Deploy Integration**: Add scripts and update workflow
2. **Test Integration**: Run in dry-run mode
3. **Validate Results**: Verify version calculation accuracy
4. **Enable Production**: Remove dry-run flag
5. **Monitor Results**: Watch for issues and performance

## Support and Maintenance

### Regular Maintenance

1. **Update Dependencies**: Keep Node.js and git updated
2. **Review Logs**: Check for recurring issues
3. **Performance Monitoring**: Track execution times
4. **Security Updates**: Apply security patches promptly

### Support Contacts

- **Technical Issues**: Development team
- **Workflow Issues**: DevOps team
- **Emergency Issues**: On-call administrator

## Conclusion

The GitHub Actions Version Integration provides a robust, automated solution for version management in deployment workflows. It eliminates manual errors, ensures consistency, and provides comprehensive error handling for reliable deployments.

Key benefits:
- ✅ **Zero manual intervention** required
- ✅ **Comprehensive error handling** prevents deployment issues
- ✅ **Consistent version management** across all files
- ✅ **Automatic git tag creation** for release tracking
- ✅ **Performance optimized** for fast execution
- ✅ **Security focused** with proper validation

The integration is production-ready and provides the foundation for reliable, automated deployments.