namespace NJS.Domain.Services
{
    public interface IAuditContext
    {
        string? GetCurrentUserId();
        string? GetCurrentUserName();
        string? GetIpAddress();
        string? GetUserAgent();
        string? GetReason();
    }
} 