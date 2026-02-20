using EDR.Domain.Entities;
using EDR.Domain.Events;

namespace EDR.Domain.Services
{
    public interface IAuditService
    {
        Task LogAuditAsync(IAuditEvent auditEvent);
        Task<IEnumerable<AuditLog>> GetAuditLogsAsync(string entityName, string entityId);
        Task<IEnumerable<AuditLog>> GetAuditLogsByUserAsync(string changedBy);
        Task<IEnumerable<AuditLog>> GetAuditLogsByDateRangeAsync(DateTime startDate, DateTime endDate);
    }
} 
