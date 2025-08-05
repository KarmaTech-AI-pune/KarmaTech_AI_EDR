using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using NJS.Domain.Database;
using NJS.Domain.Entities;

namespace NJS.Application.Services
{
    public interface ITenantConnectionResolver
    {
        Task<string> GetConnectionStringAsync(int tenantId);
        Task<string> GetConnectionStringByDomainAsync(string domain);
    }

    public class TenantConnectionResolver : ITenantConnectionResolver
    {
        private readonly TenantDbContext _tenantDbContext;
        private readonly IConfiguration _configuration;

        public TenantConnectionResolver(TenantDbContext tenantDbContext, IConfiguration configuration)
        {
            _tenantDbContext = tenantDbContext;
            _configuration = configuration;
        }

        public async Task<string> GetConnectionStringAsync(int tenantId)
        {
            var tenantDb = await _tenantDbContext.Set<TenantDatabase>()
                .FirstOrDefaultAsync(t => t.TenantId == tenantId && t.Status == DatabaseStatus.Active);

            if (tenantDb == null)
            {
                throw new Exception($"No active database found for tenant {tenantId}");
            }

            return tenantDb.ConnectionString;
        }

        public async Task<string> GetConnectionStringByDomainAsync(string domain)
        {
            var tenant = await _tenantDbContext.Tenants
                .Include(t => t.TenantDatabases.Where(db => db.Status == DatabaseStatus.Active))
                .FirstOrDefaultAsync(t => t.Domain == domain);

            if (tenant == null || !tenant.TenantDatabases.Any())
            {
                throw new Exception($"No active database found for domain {domain}");
            }

            return tenant.TenantDatabases.First().ConnectionString;
        }
    }
} 