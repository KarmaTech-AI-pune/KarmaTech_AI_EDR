namespace NJS.Domain.Events
{
    public interface IAuditSubject
    {
        void Attach(IAuditObserver observer);
        void Detach(IAuditObserver observer);
        Task NotifyAsync(IAuditEvent auditEvent);
    }
}
