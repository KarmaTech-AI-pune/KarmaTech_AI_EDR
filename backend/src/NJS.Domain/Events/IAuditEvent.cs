namespace NJS.Domain.Events
{
    public interface IAuditEvent
    {
        string EntityName { get; }

        string Action { get; }

        string EntityId { get; }

        string OldValues { get; }

        string NewValues { get; }

        string ChangedBy { get; }

        DateTime ChangedAt { get; }

        string? Reason { get; }

        string? IpAddress { get; }

        string? UserAgent { get; }

    }

}

