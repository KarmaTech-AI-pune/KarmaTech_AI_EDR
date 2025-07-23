using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using NJS.Domain.Database;
using NJS.Repositories.Interfaces;

namespace NJS.Application.Services
{
    public class TenantService : ITenantService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly TenantDbContext _tenantDbContext;

        public TenantService(IHttpContextAccessor httpContextAccessor, TenantDbContext tenantDbContext)
        {
            _httpContextAccessor = httpContextAccessor;
            _tenantDbContext = tenantDbContext;
        }

        public async Task<string> GetTenantDomain()
        {
            return _httpContextAccessor.HttpContext?.Request.Host.Value ?? string.Empty;
        }

        public async Task<int?> GetTenantId(string domain)
        {
            var tenant = await _tenantDbContext.Tenants.FirstOrDefaultAsync(t => t.Domain == domain);
            return tenant?.Id;
        }
    }
}
