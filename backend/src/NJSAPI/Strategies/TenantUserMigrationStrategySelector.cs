namespace NJSAPI.Strategies;

public class TenantUserMigrationStrategySelector : ITenantUserMigrationStrategySelector
{
    private readonly IEnumerable<ITenantUserMigrationStrategy> _strategies;

    public TenantUserMigrationStrategySelector(IEnumerable<ITenantUserMigrationStrategy> strategies)
    {
        _strategies = strategies;
    }

    public ITenantUserMigrationStrategy GetStrategy(bool isolated)
    {
        return _strategies.FirstOrDefault(x => x.IsIsolated == isolated);
    }
}