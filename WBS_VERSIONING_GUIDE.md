# WBS Versioning System Implementation Guide

## Overview

The WBS (Work Breakdown Structure) versioning system has been implemented to maintain a complete history of all WBS changes while ensuring backward compatibility with existing APIs. The system automatically creates versions whenever WBS data is modified and provides APIs to manage and retrieve different versions.

## Key Features

### 1. Automatic Version Creation
- **When**: Every time WBS data is updated via the `SetWBSCommand`
- **What**: Creates a new version with a snapshot of the current WBS state
- **How**: Copies all tasks, planned hours, and user assignments to version history tables

### 2. Backward Compatibility
- **Existing API**: `GET /api/projects/{projectId}/wbs/header/{taskType}/status` 
- **Behavior**: Returns the status of the latest version (if available) or falls back to the old WBS header status
- **No Breaking Changes**: All existing frontend code continues to work without modification

### 3. Version Management
- **Latest Version**: Always points to the most recent version created
- **Active Version**: The version currently in use (can be different from latest)
- **Version History**: Complete audit trail of all changes

## Database Schema

### Core Version Tables
- `WBSVersionHistories`: Main version records
- `WBSTaskVersionHistories`: Task snapshots for each version
- `WBSTaskPlannedHourVersionHistories`: Planned hours for each task version
- `UserWBSTaskVersionHistories`: User assignments for each task version
- `WBSVersionWorkflowHistories`: Workflow history for each version

### Key Fields
- `IsLatest`: Boolean flag indicating the most recent version
- `IsActive`: Boolean flag indicating the currently active version
- `Version`: String identifier (e.g., "1.0", "1.1", "2.0")
- `Comments`: Description of changes in this version

## API Endpoints

### Version Management APIs

#### 1. Get All Versions
```
GET /api/projects/{projectId}/wbs/versions
```
Returns a list of all WBS versions for the project.

#### 2. Get Latest Version
```
GET /api/projects/{projectId}/wbs/versions/latest
```
Returns the most recent WBS version with full details.

#### 3. Get Specific Version
```
GET /api/projects/{projectId}/wbs/versions/{version}
```
Returns a specific WBS version by version number.

#### 4. Create New Version
```
POST /api/projects/{projectId}/wbs/versions
```
Manually creates a new version from the current WBS state.

#### 5. Activate Version
```
POST /api/projects/{projectId}/wbs/versions/{version}/activate
```
Makes a specific version the active version.

#### 6. Delete Version
```
DELETE /api/projects/{projectId}/wbs/versions/{version}
```
Deletes a version (cannot delete active version).

#### 7. Get Version Workflow History
```
GET /api/projects/{projectId}/wbs/versions/{version}/workflow-history
```
Returns the workflow history for a specific version.

### Backward Compatible APIs

#### Existing Status API (Enhanced)
```
GET /api/projects/{projectId}/wbs/header/{taskType}/status
```
- **New Behavior**: Returns the status of the latest WBS version
- **Fallback**: If no versions exist, returns the old WBS header status
- **No Changes Required**: Frontend code continues to work as before

## Implementation Details

### 1. Automatic Version Creation
The `SetWBSCommandHandler` has been enhanced to automatically create a new version after every WBS update:

```csharp
// After WBS is updated
await CreateWBSVersionAfterUpdate(wbs, request.Tasks);
```

### 2. Version Numbering
- **Format**: Decimal numbers (e.g., "1.0", "1.1", "2.0")
- **Generation**: Automatic increment based on existing versions
- **Customization**: Can be overridden with custom version numbers

### 3. Data Copying
When creating a version, the system:
1. Creates a new `WBSVersionHistory` record
2. Copies all tasks to `WBSTaskVersionHistory`
3. Copies all planned hours to `WBSTaskPlannedHourVersionHistory`
4. Copies all user assignments to `UserWBSTaskVersionHistory`
5. Maintains parent-child relationships between tasks

### 4. Status Management
- **Latest Version**: Always has `IsLatest = true`
- **Active Version**: Only one version can have `IsActive = true`
- **Workflow Status**: Each version maintains its own workflow status

## Usage Examples

### Frontend Integration

#### 1. Display Version History
```javascript
// Get all versions
const versions = await api.get(`/api/projects/${projectId}/wbs/versions`);

// Display version list
versions.forEach(version => {
    console.log(`Version ${version.version}: ${version.comments}`);
    console.log(`Status: ${version.status}`);
    console.log(`Created: ${version.createdAt}`);
});
```

#### 2. Compare Versions
```javascript
// Get two versions to compare
const version1 = await api.get(`/api/projects/${projectId}/wbs/versions/1.0`);
const version2 = await api.get(`/api/projects/${projectId}/wbs/versions/1.1`);

// Compare tasks, budgets, etc.
```

#### 3. Activate a Version
```javascript
// Make version 1.0 the active version
await api.post(`/api/projects/${projectId}/wbs/versions/1.0/activate`);
```

### Backend Integration

#### 1. Manual Version Creation
```csharp
var command = new CreateWBSVersionCommand(projectId, tasks, "Major restructuring");
var versionNumber = await mediator.Send(command);
```

#### 2. Version Comparison
```csharp
var query = new CompareWBSVersionsQuery(projectId, "1.0", "1.1");
var comparison = await mediator.Send(query);
```

## Benefits

### 1. Complete Audit Trail
- Every change is preserved in version history
- No data loss when reverting to previous versions
- Full traceability of who made what changes when

### 2. Risk Mitigation
- Safe experimentation with WBS changes
- Easy rollback to previous working versions
- Ability to compare different approaches

### 3. Compliance
- Maintains historical records for regulatory requirements
- Supports change control processes
- Provides evidence of decision-making

### 4. User Experience
- No disruption to existing workflows
- Gradual adoption of new features
- Familiar interface with enhanced capabilities

## Migration Notes

### For Existing Projects
- Existing WBS data continues to work without changes
- First version will be created automatically on next WBS update
- No data migration required

### For New Projects
- Versioning is enabled by default
- First version created automatically when WBS is first set
- All subsequent changes create new versions

## Future Enhancements

### Planned Features
1. **Version Comparison UI**: Visual diff between versions
2. **Bulk Operations**: Apply changes across multiple versions
3. **Version Templates**: Predefined version structures
4. **Advanced Filtering**: Search and filter versions by criteria
5. **Export/Import**: Version data export and import capabilities

### Performance Optimizations
1. **Lazy Loading**: Load version data on demand
2. **Caching**: Cache frequently accessed versions
3. **Compression**: Compress version data for storage efficiency
4. **Cleanup**: Automatic cleanup of old versions

## Troubleshooting

### Common Issues

#### 1. Version Creation Fails
- **Cause**: Database constraints or missing data
- **Solution**: Check logs for specific error messages
- **Workaround**: Version creation failure doesn't break main WBS operations

#### 2. Status API Returns Old Data
- **Cause**: No versions exist yet
- **Solution**: Update WBS to create first version
- **Expected**: Falls back to old behavior until first version is created

#### 3. Version Activation Fails
- **Cause**: Version doesn't exist or is already active
- **Solution**: Check version number and current active version
- **Prevention**: Validate version existence before activation

## Support

For technical support or questions about the WBS versioning system:
1. Check the application logs for detailed error messages
2. Review the database schema for data integrity
3. Verify API responses match expected formats
4. Contact the development team for complex issues 