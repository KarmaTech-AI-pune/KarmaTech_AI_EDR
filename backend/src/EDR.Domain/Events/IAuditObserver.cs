namespace EDR.Domain.Events
{
    public interface IAuditObserver
    {
        Task OnAuditEventAsync(IAuditEvent auditEvent);
    }
}

