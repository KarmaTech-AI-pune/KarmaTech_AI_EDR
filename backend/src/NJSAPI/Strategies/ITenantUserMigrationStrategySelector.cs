namespace NJSAPI.Strategies;

public interface ITenantUserMigrationStrategySelector
{
    ITenantUserMigrationStrategy GetStrategy(bool isolated);
}