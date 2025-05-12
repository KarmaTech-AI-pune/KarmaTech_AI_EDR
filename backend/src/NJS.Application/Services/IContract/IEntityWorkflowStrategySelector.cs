namespace NJS.Application.Services.IContract
{
    public interface IEntityWorkflowStrategySelector
    {
        IEntityWorkflowStrategy GetStrategy(string entityType);
    }
}
