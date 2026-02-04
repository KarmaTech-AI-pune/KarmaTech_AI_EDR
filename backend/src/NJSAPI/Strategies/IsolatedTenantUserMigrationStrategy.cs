using NJS.Application.Services.IContract;
using NJS.Domain.Database;
using NJS.Domain.Entities;

namespace NJSAPI.Strategies;

public class IsolatedTenantUserMigrationStrategy : TenantUserMigrationStrategyBase, ITenantUserMigrationStrategy
{
    private readonly ITenantMigrationService _tenantMigrationService;
    private readonly ILogger<TenantUserMigrationStrategyBase> _logger;

    public IsolatedTenantUserMigrationStrategy(TenantDbContext context, ITenantMigrationService tenantMigrationService,
        IConfiguration configuration, ILogger<TenantUserMigrationStrategyBase> logger) : base(context, configuration)
    {
        _tenantMigrationService = tenantMigrationService;
        _logger = logger;
    }

    public bool IsIsolated => true;

    public async Task MigrateUserAsync(Tenant tenant, User user, TenantUserRole role)
    {
        if (string.IsNullOrWhiteSpace(user.Email))
        {
            _logger.LogInformation("User {UserId} has no email, skipping migration", user.Id);
            return;
        }

        var (connectionString, sourceDb) = await ResolveDbAsync(tenant.Id);
        if (connectionString == null) return;

        var success = await _tenantMigrationService.ExecuteTenantUserMigrationsAsync(connectionString,
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