using Microsoft.EntityFrameworkCore;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using Npgsql;

namespace NJSAPI.Strategies;

public abstract class TenantUserMigrationStrategyBase
{
    private readonly TenantDbContext _tenantDbContext;
    private readonly IConfiguration _configuration;

    public TenantUserMigrationStrategyBase(TenantDbContext context,
        IConfiguration configuration)
    {
        _tenantDbContext = context;
        _configuration = configuration;
    }

    protected async Task<(string? connectionString, string? sourceDb)> ResolveDbAsync(int tenantId)
    {
        var tenantDb = await _tenantDbContext.TenantDatabases.FirstOrDefaultAsync(td => td.TenantId == tenantId);
        if (tenantDb == null || string.IsNullOrWhiteSpace(tenantDb.ConnectionString))
        {
            return (null, null);
        }

        var source = _configuration.GetConnectionString("AppDbConnection");
        string? sourceDb = null;

        if (!string.IsNullOrWhiteSpace(source))
        {
            var npgsqlBuilder = new NpgsqlConnectionStringBuilder(source);
            sourceDb = npgsqlBuilder.Database; 
        }

        return (tenantDb.ConnectionString, sourceDb);
    }

    protected static string MapRole(TenantUserRole role) =>
        TenantRoleMapper.MapRoleName(role);

    protected static string MapPermission(TenantUserRole role) =>
        TenantRoleMapper.MapPermissionName(role);
}