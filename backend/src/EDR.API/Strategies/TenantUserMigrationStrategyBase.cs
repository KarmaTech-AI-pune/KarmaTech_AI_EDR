using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using Npgsql;
namespace EDR.API.Strategies;

public abstract class TenantUserMigrationStrategyBase
{
    private readonly TenantDbContext _tenantDbContext;
    protected readonly IConfiguration _configuration;

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

        var dbType = _configuration["DbType"] ?? "postgresql";
        string? sourceDb = null;

        if (dbType.Equals("sqlserver", StringComparison.OrdinalIgnoreCase))
        {
            var source = _configuration.GetConnectionString("SqlDbConnection");
            if (!string.IsNullOrWhiteSpace(source))
            {
                var sqlBuilder = new SqlConnectionStringBuilder(source);
                sourceDb = sqlBuilder.InitialCatalog;
            }
        }
        else
        {
            var source = _configuration.GetConnectionString("AppDbConnection");
            if (!string.IsNullOrWhiteSpace(source))
            {
                var npgsqlBuilder = new NpgsqlConnectionStringBuilder(source);
                sourceDb = npgsqlBuilder.Database;
            }
        }

        return (tenantDb.ConnectionString, sourceDb);
    }

    protected static string MapRole(TenantUserRole role) =>
        TenantRoleMapper.MapRoleName(role);

    protected static string MapPermission(TenantUserRole role) =>
        TenantRoleMapper.MapPermissionName(role);
}

