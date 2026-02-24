using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Events;

namespace EDR.Domain.Services
{
    public class AuditService : IAuditService, IAuditObserver
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<AuditService> _logger;

        public AuditService(IServiceProvider serviceProvider, ILogger<AuditService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        public async Task LogAuditAsync(IAuditEvent auditEvent)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<ProjectManagementContext>();

                var auditLog = new AuditLog
                {
                    EntityName = auditEvent.EntityName,
                    Action = auditEvent.Action,
                    EntityId = auditEvent.EntityId,
                    OldValues = auditEvent.OldValues,
                    NewValues = auditEvent.NewValues,
                    ChangedBy = auditEvent.ChangedBy,
                    ChangedAt = auditEvent.ChangedAt,
                    Reason = auditEvent.Reason,
                    IpAddress = auditEvent.IpAddress,
                    UserAgent = auditEvent.UserAgent
                };

                context.AuditLogs.Add(auditLog);
                await context.SaveChangesAsync();
                
                _logger.LogDebug("Audit log saved successfully for {EntityName} {Action} by {ChangedBy}", 
                    auditEvent.EntityName, auditEvent.Action, auditEvent.ChangedBy);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to save audit log for {EntityName} {Action} by {ChangedBy}: {Message}", 
                    auditEvent.EntityName, auditEvent.Action, auditEvent.ChangedBy, ex.Message);
            }
        }

        public async Task<IEnumerable<AuditLog>> GetAuditLogsAsync(string entityName, string entityId)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<ProjectManagementContext>();

                var logs = await context.AuditLogs
                    .Where(a => a.EntityName == entityName && a.EntityId == entityId)
                    .OrderByDescending(a => a.ChangedAt)
                    .ToListAsync();

                _logger.LogDebug("Retrieved {Count} audit logs for {EntityName} {EntityId}", 
                    logs.Count, entityName, entityId);

                return logs;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve audit logs for {EntityName} {EntityId}: {Message}", 
                    entityName, entityId, ex.Message);
                throw;
            }
        }

        public async Task<IEnumerable<AuditLog>> GetAuditLogsByUserAsync(string changedBy)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<ProjectManagementContext>();

                var logs = await context.AuditLogs
                    .Where(a => a.ChangedBy == changedBy)
                    .OrderByDescending(a => a.ChangedAt)
                    .ToListAsync();

                _logger.LogDebug("Retrieved {Count} audit logs for user {ChangedBy}", 
                    logs.Count, changedBy);

                return logs;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve audit logs for user {ChangedBy}: {Message}", 
                    changedBy, ex.Message);
                throw;
            }
        }

        public async Task<IEnumerable<AuditLog>> GetAuditLogsByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<ProjectManagementContext>();

                var logs = await context.AuditLogs
                    .Where(a => a.ChangedAt >= startDate && a.ChangedAt <= endDate)
                    .OrderByDescending(a => a.ChangedAt)
                    .ToListAsync();

                _logger.LogDebug("Retrieved {Count} audit logs between {StartDate} and {EndDate}", 
                    logs.Count, startDate, endDate);

                return logs;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve audit logs between {StartDate} and {EndDate}: {Message}", 
                    startDate, endDate, ex.Message);
                return null;
            }
        }

        public async Task OnAuditEventAsync(IAuditEvent auditEvent)
        {
            await LogAuditAsync(auditEvent);
        }
    }
}
