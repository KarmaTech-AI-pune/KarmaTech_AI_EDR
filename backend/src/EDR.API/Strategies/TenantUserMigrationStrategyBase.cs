using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain;
using EDR.Domain.Services;
using Npgsql;
namespace EDR.API.Strategies;

public abstract class TenantUserMigrationStrategyBase
{
    private readonly TenantDbContext _tenantDbContext;
    private readonly IConfiguration _configuration;
    private readonly ITenantConnectionResolver _connectionResolver;

    public TenantUserMigrationStrategyBase(TenantDbContext context,
        IConfiguration configuration,
        ITenantConnectionResolver connectionResolver)
    {
        _tenantDbContext = context;
        _configuration = configuration;
        _connectionResolver = connectionResolver;
    }

    protected async Task<(string? connectionString, string? sourceDb)> ResolveDbAsync(int tenantId)
    {
        var tenantDb = await _tenantDbContext.TenantDatabases.FirstOrDefaultAsync(td => td.TenantId == tenantId);
        if (tenantDb == null || string.IsNullOrWhiteSpace(tenantDb.ConnectionString))
        {
            return (null, null);
        }

        var dbType = _configuration[Constants.DbType];
        string? source = await _connectionResolver.GetDefaultConnectionStringAsync();
        string? sourceDb = null;

        if (!string.IsNullOrWhiteSpace(source))
        {
            if (dbType == Constants.DbServerType)
            {
                var npgsqlBuilder = new NpgsqlConnectionStringBuilder(source);
                sourceDb = npgsqlBuilder.Database;
            }
            else
            {
                var sqlBuilder = new SqlConnectionStringBuilder(source);
                sourceDb = sqlBuilder.InitialCatalog;
            }
        }

        return (tenantDb.ConnectionString, sourceDb);
    }

    protected static string MapRole(TenantUserRole role) =>
        TenantRoleMapper.MapRoleName(role);

    protected static string MapPermission(TenantUserRole role) =>
        TenantRoleMapper.MapPermissionName(role);
}

