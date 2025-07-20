using NJS.Domain.Entities;
using NJS.Domain.Events;

namespace NJS.Domain.Services
{
    public interface IAuditService
    {
        Task LogAuditAsync(IAuditEvent auditEvent);
        Task<IEnumerable<AuditLog>> GetAuditLogsAsync(string entityName, string entityId);
        Task<IEnumerable<AuditLog>> GetAuditLogsByUserAsync(string changedBy);
        Task<IEnumerable<AuditLog>> GetAuditLogsByDateRangeAsync(DateTime startDate, DateTime endDate);
    }
} 