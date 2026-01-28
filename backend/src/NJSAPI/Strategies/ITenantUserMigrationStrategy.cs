using NJS.Domain.Entities;

namespace NJSAPI.Strategies;

public interface ITenantUserMigrationStrategy
{
     bool IsIsolated { get; }
     Task MigrateUserAsync(Tenant tenant, User user, TenantUserRole role);
}