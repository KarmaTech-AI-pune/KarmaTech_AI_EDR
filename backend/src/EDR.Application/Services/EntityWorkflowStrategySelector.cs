using EDR.Application.Services.IContract;

namespace EDR.Application.Services
{
    public class EntityWorkflowStrategySelector : IEntityWorkflowStrategySelector
    {
        private readonly IEnumerable<IEntityWorkflowStrategy> _strategies;

        public EntityWorkflowStrategySelector(IEnumerable<IEntityWorkflowStrategy> strategies)
        {
            _strategies = strategies;
        }

        public IEntityWorkflowStrategy GetStrategy(string entityType)
        {
            var strategy = _strategies.FirstOrDefault(s => s.EntityType.Equals(entityType, StringComparison.OrdinalIgnoreCase));
            return strategy!;
        }
    }
}

