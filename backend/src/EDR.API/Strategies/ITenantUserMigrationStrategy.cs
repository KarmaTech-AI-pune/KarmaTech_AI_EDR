using EDR.Domain.Entities;

namespace EDR.API.Strategies;

public interface ITenantUserMigrationStrategy
{
     bool IsIsolated { get; }
     Task MigrateUserAsync(Tenant tenant, User user, TenantUserRole role);
}
