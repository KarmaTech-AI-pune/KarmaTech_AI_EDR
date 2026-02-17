namespace EDR.API.Strategies;

public interface ITenantUserMigrationStrategySelector
{
    ITenantUserMigrationStrategy GetStrategy(bool isolated);
}
