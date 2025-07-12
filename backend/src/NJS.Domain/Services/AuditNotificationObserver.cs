using Microsoft.Extensions.Logging;
using NJS.Domain.Events;

namespace NJS.Domain.Services
{
    public class AuditNotificationObserver : IAuditObserver
    {
        private readonly ILogger<AuditNotificationObserver> _logger;

        public AuditNotificationObserver(ILogger<AuditNotificationObserver> logger)
        {
            _logger = logger;
        }

        public async Task OnAuditEventAsync(IAuditEvent auditEvent)
        {
            // Check if this is a critical operation that requires notification
            if (IsCriticalOperation(auditEvent))
            {
                await SendNotificationAsync(auditEvent);
            }

            await Task.CompletedTask;
        }

        private bool IsCriticalOperation(IAuditEvent auditEvent)
        {
            // Define critical operations based on your business rules
            var criticalEntities = new[] { "User", "Project", "BidPreparation", "GoNoGoDecision" };
            var criticalActions = new[] { "Deleted" };

            return criticalEntities.Contains(auditEvent.EntityName) && 
                   criticalActions.Contains(auditEvent.Action);
        }

        private async Task SendNotificationAsync(IAuditEvent auditEvent)
        {
            _logger.LogWarning(
                "CRITICAL AUDIT EVENT: {Action} on {EntityName} (ID: {EntityId}) by {ChangedBy} at {ChangedAt}",
                auditEvent.Action,
                auditEvent.EntityName,
                auditEvent.EntityId,
                auditEvent.ChangedBy,
                auditEvent.ChangedAt);

            // Here you can implement actual notification logic:
            // - Send email notifications
            // - Send Slack/Teams messages
            // - Trigger webhooks
            // - Send SMS notifications
            // etc.

            await Task.CompletedTask;
        }
    }
} 