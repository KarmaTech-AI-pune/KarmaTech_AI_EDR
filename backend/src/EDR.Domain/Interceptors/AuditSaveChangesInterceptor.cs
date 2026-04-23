using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;
using EDR.Domain.Entities;
using EDR.Domain.Events;
using EDR.Domain.Services;
using EDR.Domain.Database;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Domain.Interceptors
{
    public class AuditSaveChangesInterceptor : SaveChangesInterceptor
    {
        private readonly IAuditSubject _auditSubject;
        private readonly EDR.Domain.Services.IAuditContext _auditContext;

        public AuditSaveChangesInterceptor(IAuditSubject auditSubject, EDR.Domain.Services.IAuditContext auditContext)
        {
            _auditSubject = auditSubject;
            _auditContext = auditContext;
        }
        public override async ValueTask<InterceptionResult<int>> SavingChangesAsync(DbContextEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
        {

            var context = eventData.Context;
            if (context is null)
            {
                return result;
            }
            var auditEvents = new List<IAuditEvent>();

            foreach (var entry in context.ChangeTracker.Entries())
            {
                if (entry.Entity is EDR.Domain.Entities.AuditLog) continue;
                var auditEvent = CreateAuditEvent(entry);
                if (auditEvent != null)
                {
                    auditEvents.Add(auditEvent);
                }
            }
            if (auditEvents.Any())
            {
                _ = Task.Run(async () =>
                {
                    foreach (var auditEvent in auditEvents)
                    {
                        await _auditSubject.NotifyAsync(auditEvent);
                    }
                });

            }
            return result;
            // return base.SavingChangesAsync(eventData, result, cancellationToken);
        }


        private IAuditEvent CreateAuditEvent(EntityEntry entry)
        {
            var entityName = entry.Entity.GetType().Name;
            var entityId = GetEntityId(entry);
            var action = GetAction(entry);
            var oldValues = GetOldValues(entry);
            var newValues = GetNewValues(entry);
            var changedBy = _auditContext.GetCurrentUserName() ?? "Unknown User";
            var changedAt = DateTime.UtcNow;
            var reason = _auditContext.GetReason() ?? "No reason provided";
            var ipAddress = _auditContext.GetIpAddress() ?? "Unknown IP";
            var userAgent = _auditContext.GetUserAgent() ?? "Unknown User Agent";

            if (string.IsNullOrEmpty(entityId))
            {
                return null!;
            }

            var auditEvent = new AuditEvent(
                entityName,
                action,
                entityId,
                oldValues,
                newValues,
                changedBy,
                changedAt,
                reason,
                ipAddress,
                userAgent
            );

            return auditEvent;
        }

        private string GetEntityId(EntityEntry entry)
        {
            var primaryKey = entry.Metadata.FindPrimaryKey();
            if (primaryKey == null) return string.Empty;

            var keyValues = primaryKey.Properties
                .Select(p => entry.Property(p.Name).CurrentValue?.ToString() ?? "")
                .Where(v => !string.IsNullOrEmpty(v));

            return string.Join("|", keyValues);
        }
        private string GetAction(EntityEntry entry)
        {
            return entry.State switch
            {
                EntityState.Added => "Created",
                EntityState.Modified => "Updated",
                EntityState.Deleted => "Deleted",
                _ => "Unchanged"
            };
        }

        private string GetOldValues(EntityEntry entry)
        {
            if (entry.State == EntityState.Added) return string.Empty;

            var oldValues = new Dictionary<string, object>();
            foreach (var property in entry.Properties)
            {
                if (property.IsModified || entry.State == EntityState.Deleted)
                {
                    oldValues[property.Metadata.Name] = property.OriginalValue ?? DBNull.Value;
                }
            }
            return System.Text.Json.JsonSerializer.Serialize(oldValues);
        }

        private string GetNewValues(EntityEntry entry)
        {
            if (entry.State == EntityState.Deleted) return string.Empty;

            var newValues = new Dictionary<string, object>();
            foreach (var property in entry.Properties)
            {
                if (property.IsModified || entry.State == EntityState.Added)
                {
                    newValues[property.Metadata.Name] = property.CurrentValue ?? DBNull.Value;
                }
            }
            return System.Text.Json.JsonSerializer.Serialize(newValues);
        }
    }
}
