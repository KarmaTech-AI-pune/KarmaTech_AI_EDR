using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace NJS.Domain.Services
{
    public interface ITenantResolutionStrategy
    {
        Task<string> GetTenantIdentifierAsync();
    }

    public class HeaderResolutionStrategy : ITenantResolutionStrategy
    {
        private readonly IHttpContextAccessor _httpContextAccessor;       
        private const string TenantHeaderKey = "X-Tenant-Context";

        public HeaderResolutionStrategy(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public Task<string> GetTenantIdentifierAsync()
        {
            var tenantId = _httpContextAccessor.HttpContext?.Request.Headers[TenantHeaderKey].ToString();
            return Task.FromResult(tenantId ?? string.Empty);
        }
    }

    public class DomainResolutionStrategy : ITenantResolutionStrategy
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public DomainResolutionStrategy(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public Task<string> GetTenantIdentifierAsync()
        {
            var host = _httpContextAccessor.HttpContext?.Request.Host.Value ?? string.Empty;
            var domain = host.Split('.')[0]; // Get subdomain
            return Task.FromResult(domain);
        }
    }

    public class ClaimsResolutionStrategy : ITenantResolutionStrategy
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private const string TenantClaimType = "TenantId";

        public ClaimsResolutionStrategy(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public Task<string> GetTenantIdentifierAsync()
        {
            var tenantClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(TenantClaimType);
            return Task.FromResult(tenantClaim?.Value ?? string.Empty);
        }
    }
}
