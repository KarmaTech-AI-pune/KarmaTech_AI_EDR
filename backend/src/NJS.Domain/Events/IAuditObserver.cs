namespace NJS.Domain.Events
{
    public interface IAuditObserver
    {
        Task OnAuditEventAsync(IAuditEvent auditEvent);
    }
}
