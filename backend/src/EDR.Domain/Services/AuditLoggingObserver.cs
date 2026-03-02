using Microsoft.Extensions.Logging;
using EDR.Domain.Events;

namespace EDR.Domain.Services
{
    public class AuditLoggingObserver : IAuditObserver
    {
        private readonly ILogger<AuditLoggingObserver> _logger;

        public AuditLoggingObserver(ILogger<AuditLoggingObserver> logger)
        {
            _logger = logger;
        }

        public async Task OnAuditEventAsync(IAuditEvent auditEvent)
        {
            _logger.LogInformation(
                "Audit Event: {Action} on {EntityName} (ID: {EntityId}) by {ChangedBy} at {ChangedAt}",
                auditEvent.Action,
                auditEvent.EntityName,
                auditEvent.EntityId,
                auditEvent.ChangedBy,
                auditEvent.ChangedAt);

            await Task.CompletedTask;
        }
    }
} 
