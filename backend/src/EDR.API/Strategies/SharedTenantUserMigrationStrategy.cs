using EDR.Application.Services.IContract;
using EDR.Domain.Database;
using EDR.Domain.Entities;

namespace EDR.API.Strategies;

public class SharedTenantUserMigrationStrategy : TenantUserMigrationStrategyBase, ITenantUserMigrationStrategy
{
    private readonly ITenantMigrationService _tenantMigrationService;
    private readonly ILogger<TenantUserMigrationStrategyBase> _logger;

    public SharedTenantUserMigrationStrategy(TenantDbContext context, ITenantMigrationService tenantMigrationService,
        IConfiguration configuration, ILogger<TenantUserMigrationStrategyBase> logger) : base(context, configuration)
    {
        _tenantMigrationService = tenantMigrationService;
        _logger = logger;
    }

    public bool IsIsolated => false;

    public async Task MigrateUserAsync(Tenant tenant, User user, TenantUserRole role)
    {
        if (string.IsNullOrWhiteSpace(user.Email))
        {
            _logger.LogInformation("User {UserId} has no email, skipping migration", user.Id);
            return;
        }

        var (connectionString, sourceDb) = await ResolveDbAsync(tenant.Id);
        if (connectionString == null) return;

        var success = await _tenantMigrationService.ExecuteNonIsolatedTenantUserMigrationsAsync(connectionString,
            tenant.Id, user.Email, TenantRoleMapper.MapRoleName(role), TenantRoleMapper.MapPermissionName(role),
            sourceDb);
        LogResult(success, tenant.Id, user.Email);
    }
    
    private void LogResult(bool success, int tenantId, string email)
    {
        if (!success)
            _logger.LogWarning("User migration failed for tenant {TenantId}, user {Email}", tenantId, email);
        else
            _logger.LogInformation("User migrated for tenant {TenantId}, user {Email}", tenantId, email);
    }
}
