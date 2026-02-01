using Microsoft.Extensions.Configuration;
using NJS.Domain.Database;
using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace NJS.Domain.Services
{
    public interface ITenantConnectionResolver
    {
        Task<string> GetConnectionStringAsync(int tenantId);
        Task<string> GetConnectionStringByDomainAsync(string domain);
        Task<string> GetDefaultConnectionStringAsync();
    }

    public class TenantConnectionResolver : ITenantConnectionResolver
    {
        private readonly TenantDbContext _tenantDbContext;
        private readonly IConfiguration _configuration;
        private readonly string _defaultConnectionString;

        public TenantConnectionResolver(TenantDbContext tenantDbContext, IConfiguration configuration)
        {
            _tenantDbContext = tenantDbContext ?? throw new ArgumentNullException(nameof(tenantDbContext));
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
            _defaultConnectionString = GetDefaultConnectionString()
                                       ?? throw new InvalidOperationException(
                                           "Default connection string 'AppDbConnection' not found");
        }

        public async Task<string> GetConnectionStringAsync(int tenantId)
        {
            // For admin user (usually ID 1), always return the default connection string
            if (tenantId == 1)
            {
                return _defaultConnectionString;
            }

            var tenantDb = await _tenantDbContext.TenantDatabases
                .FirstOrDefaultAsync(t => t.Id == tenantId);

            if (tenantDb == null)
            {
                throw new Exception($"Tenant {tenantId} not found");
            }

            // For all other tenants, use the default connection string
            return _defaultConnectionString;
        }

        public async Task<string> GetConnectionStringByDomainAsync(string domain)
        {
            var tenant = await _tenantDbContext.Tenants
                .FirstOrDefaultAsync(t => t.Domain == domain);
            var tenantDb = await _tenantDbContext.TenantDatabases
                .FirstOrDefaultAsync(t => t.TenantId == tenant.Id);

            if (tenant == null)
            {
                throw new Exception($"Tenant with domain {domain} not found");
            }

            return !string.IsNullOrEmpty(tenantDb?.ConnectionString)
                ? tenantDb.ConnectionString
                : _defaultConnectionString;
        }

        public Task<string> GetDefaultConnectionStringAsync()
        {
            return Task.FromResult(_defaultConnectionString);
        }


        private string GetDefaultConnectionString()
        {
            var dbType = _configuration[Constants.DbType];

            return dbType switch
            {
                Constants.DbServerType =>
                    _configuration.GetConnectionString("AppDbConnection")
                    ?? throw new InvalidOperationException(
                        "Connection string 'AppDbConnection' not found"),


                _ => _configuration.GetConnectionString("SqlDbConnection")
                     ?? throw new InvalidOperationException(
                         "Connection string 'SqlDbConnection' not found"),
            };
        }
    }
}