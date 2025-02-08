using Microsoft.AspNetCore.Http;
using NJS.Application.Services;
using System.Security.Claims;

namespace NJSAPI.Services
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public string GetCurrentUserId()
        {
            return _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier) ?? "System";
        }

        public string GetCurrentUserName()
        {
            return _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Name) ?? "System";
        }
    }
}
