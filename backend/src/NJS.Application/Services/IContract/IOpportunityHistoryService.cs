using NJS.Domain.Entities;

namespace NJS.Application.Services.IContract
{
    public interface IOpportunityHistoryService
    {
        Task<List<OpportunityHistory>> GetAllHistoryAsync();
        Task<OpportunityHistory> GetHistoryByIdAsync(int id);
        Task AddHistoryAsync(OpportunityHistory opportunityHistory);
        Task UpdateHistoryAsync(OpportunityHistory opportunityHistory);
        Task DeleteHistoryAsync(int id);
    }

}
