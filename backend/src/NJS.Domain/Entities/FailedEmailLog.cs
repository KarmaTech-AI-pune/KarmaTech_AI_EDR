using System;

namespace NJS.Domain.Entities;

public class FailedEmailLog
{
    public int Id { get; set; }
    public string To { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string ErrorMessage { get; set; } = string.Empty;
    public DateTime AttemptedAt { get; set; }
    public int RetryCount { get; set; }
    public DateTime? LastRetryAt { get; set; }
    public bool IsResolved { get; set; }
}
