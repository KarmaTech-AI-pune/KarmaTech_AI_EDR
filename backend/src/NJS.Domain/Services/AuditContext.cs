using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace NJS.Domain.Services
{
    public class AuditContext : IAuditContext
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AuditContext(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public string? GetCurrentUserId()
        {
            return _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }

        public string? GetCurrentUserName()
        {
            return _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Name)?.Value 
                ?? _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Email)?.Value;
        }

        public string? GetIpAddress()
        {
            return _httpContextAccessor.HttpContext?.Connection?.RemoteIpAddress?.ToString();
        }

        public string? GetUserAgent()
        {
            return _httpContextAccessor.HttpContext?.Request?.Headers["User-Agent"].ToString();
        }

        public string? GetReason()
        {
            return _httpContextAccessor.HttpContext?.Request?.Headers["X-Audit-Reason"].ToString();
        }
    }
} 