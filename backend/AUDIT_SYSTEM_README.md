# Audit System Implementation

This document describes the audit system implementation using the Observer pattern in ASP.NET Core. The system automatically tracks all database changes without modifying existing code.

## Overview

The audit system uses the Observer pattern to automatically capture and log all database changes (Insert, Update, Delete) in your Entity Framework application. It's designed to be completely non-intrusive to your existing codebase.

## Architecture

### Observer Pattern Components

1. **IAuditEvent** - Interface defining audit event data
2. **AuditEvent** - Concrete implementation of audit events
3. **IAuditObserver** - Interface for observers that handle audit events
4. **IAuditSubject** - Interface for the subject that manages observers
5. **AuditSubject** - Concrete implementation that manages and notifies observers

### Core Services

1. **IAuditService** - Service interface for audit operations
2. **AuditService** - Concrete implementation that logs audit events to database
3. **IAuditContext** - Interface for getting current user context
4. **AuditContext** - Concrete implementation that extracts user info from HTTP context

### Interceptors

1. **AuditSaveChangesInterceptor** - Entity Framework interceptor that captures database changes
2. **AuditableProjectManagementContext** - Extended DbContext with audit functionality

### Observers

1. **AuditService** - Database logging observer
2. **AuditLoggingObserver** - Console/file logging observer
3. **AuditNotificationObserver** - Notification observer for critical operations

## Installation and Setup

### 1. Database Setup

Run the audit database setup script:

```powershell
.\setup-audit-database.ps1
```

This will create the `AuditLogs` table with appropriate indexes.

### 2. Service Registration

The audit services are already integrated into your `Program.cs` and `ServiceCollectionExtensions.cs`:

```csharp
// In Program.cs
builder.Services.AddAuditServices();
builder.Services.ConfigureAuditObservers();

// In ServiceCollectionExtensions.cs
// The DbContext is already configured to use audit functionality
```

### 3. Database Context Configuration

The system automatically uses the auditable context when audit services are available.

## How It Works

### Automatic Audit Capture

1. **Entity Framework Interceptor**: The `AuditSaveChangesInterceptor` automatically intercepts all `SaveChanges` operations
2. **Change Detection**: It analyzes the `ChangeTracker` to identify Insert, Update, and Delete operations
3. **Event Creation**: For each change, it creates an `AuditEvent` with:
   - Entity name and ID
   - Action type (Created/Updated/Deleted)
   - Old and new values (JSON serialized)
   - User information (from HTTP context)
   - Timestamp and metadata

### Observer Pattern Implementation

1. **Event Notification**: The interceptor notifies all registered observers asynchronously
2. **Multiple Observers**: Different observers handle the same event for different purposes:
   - **Database Observer**: Logs to `AuditLogs` table
   - **Logging Observer**: Writes to application logs
   - **Notification Observer**: Sends notifications for critical operations

### User Context Extraction

The system automatically extracts user information from:
- JWT claims (NameIdentifier, Name, Email)
- HTTP headers (User-Agent, X-Audit-Reason)
- Connection information (IP Address)

## API Endpoints

The audit system provides REST API endpoints for querying audit logs:

### Get Audit Logs by Entity
```
GET /api/audit/entity/{entityName}/{entityId}
```

### Get Audit Logs by User
```
GET /api/audit/user/{changedBy}
```

### Get Audit Logs by Date Range
```
GET /api/audit/daterange?startDate=2024-01-01&endDate=2024-12-31
```

### Get Audit Summary
```
GET /api/audit/summary?startDate=2024-01-01&endDate=2024-12-31
```

## Usage Examples

### Adding Audit Reason

To add a reason for an audit event, include the `X-Audit-Reason` header in your HTTP request:

```javascript
// Frontend JavaScript
fetch('/api/projects', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-Audit-Reason': 'Project creation for new client'
    },
    body: JSON.stringify(projectData)
});
```

### Querying Audit Logs

```csharp
// In your controller or service
public class ProjectController : ControllerBase
{
    private readonly IAuditService _auditService;

    public ProjectController(IAuditService auditService)
    {
        _auditService = auditService;
    }

    public async Task<IActionResult> GetProjectAuditHistory(int projectId)
    {
        var auditLogs = await _auditService.GetAuditLogsAsync("Project", projectId.ToString());
        return Ok(auditLogs);
    }
}
```

## Customization

### Adding Custom Observers

Create a new observer by implementing `IAuditObserver`:

```csharp
public class CustomAuditObserver : IAuditObserver
{
    public async Task OnAuditEventAsync(IAuditEvent auditEvent)
    {
        // Your custom logic here
        // e.g., send to external system, trigger workflows, etc.
        await Task.CompletedTask;
    }
}
```

Register it in your service collection:

```csharp
services.AddScoped<IAuditObserver, CustomAuditObserver>();
```

### Filtering Audit Events

Modify the `AuditSaveChangesInterceptor` to filter specific entities or operations:

```csharp
private IAuditEvent CreateAuditEvent(EntityEntry entry)
{
    // Skip certain entities
    if (entry.Entity is SomeEntityToSkip) return null;
    
    // Skip certain operations
    if (entry.State == EntityState.Modified && !HasSignificantChanges(entry)) return null;
    
    // ... rest of the method
}
```

### Custom Notification Rules

Modify the `AuditNotificationObserver` to define your own critical operation rules:

```csharp
private bool IsCriticalOperation(IAuditEvent auditEvent)
{
    var criticalEntities = new[] { "User", "Project", "BidPreparation" };
    var criticalActions = new[] { "Deleted", "Updated" };
    
    return criticalEntities.Contains(auditEvent.EntityName) && 
           criticalActions.Contains(auditEvent.Action);
}
```

## Performance Considerations

### Database Indexes

The system creates indexes on commonly queried fields:
- `EntityName`
- `EntityId`
- `ChangedBy`
- `ChangedAt`
- Composite index on `(EntityName, EntityId)`

### Asynchronous Processing

Audit events are processed asynchronously to avoid blocking the main transaction:
- Events are captured during `SaveChanges`
- Notifications are sent after the transaction commits
- Database logging happens in the background

### Selective Auditing

To improve performance, you can:
1. Filter out entities that don't need auditing
2. Only audit specific properties
3. Use different observers for different environments

## Security Considerations

### Data Privacy

- Audit logs contain sensitive data (old/new values)
- Implement appropriate access controls
- Consider data retention policies
- Encrypt sensitive audit data if required

### Access Control

- Audit API endpoints require authentication
- Implement role-based access to audit logs
- Consider audit log access auditing

### Data Retention

Implement a cleanup strategy for old audit logs:

```csharp
// Example cleanup service
public class AuditCleanupService : IHostedService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        // Delete audit logs older than 1 year
        var cutoffDate = DateTime.UtcNow.AddYears(-1);
        // Implementation here
    }
}
```

## Troubleshooting

### Common Issues

1. **Audit logs not being created**
   - Check if the audit interceptor is registered
   - Verify the `AuditLogs` table exists
   - Check application logs for errors

2. **User information not captured**
   - Ensure `HttpContextAccessor` is registered
   - Verify authentication is working
   - Check JWT claim names

3. **Performance issues**
   - Review database indexes
   - Consider filtering unnecessary entities
   - Monitor audit log table size

### Debugging

Enable detailed logging for the audit system:

```json
{
  "Logging": {
    "LogLevel": {
      "NJS.Domain.Services.AuditService": "Debug",
      "NJS.Domain.Interceptors.AuditSaveChangesInterceptor": "Debug"
    }
  }
}
```

## Migration from Existing Systems

If you have existing audit functionality:

1. **Gradual Migration**: Run both systems in parallel
2. **Data Migration**: Create scripts to migrate existing audit data
3. **Feature Parity**: Ensure all existing audit features are covered
4. **Testing**: Thoroughly test the new system before switching

## Best Practices

1. **Test Thoroughly**: Test audit functionality in all environments
2. **Monitor Performance**: Keep an eye on audit table growth
3. **Regular Maintenance**: Implement audit log cleanup strategies
4. **Documentation**: Document any customizations or business rules
5. **Backup Strategy**: Include audit logs in your backup strategy

## Support

For issues or questions about the audit system:
1. Check the application logs
2. Review this documentation
3. Test with a simple entity first
4. Verify database connectivity and permissions 