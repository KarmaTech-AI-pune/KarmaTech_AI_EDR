using EDR.Domain.Entities;

namespace EDR.Application.Services.IContract
{
    public interface IOpportunityHistoryService
    {
        Task<List<OpportunityHistory>> GetAllHistoryAsync();
        Task<OpportunityHistory> GetHistoryByIdAsync(int id);
        Task AddHistoryAsync(OpportunityHistory opportunityHistory);
        Task UpdateHistoryAsync(OpportunityHistory opportunityHistory);
        Task DeleteHistoryAsync(int id);
        Task<OpportunityHistory> GetCurrentStatusForTractingAsync(int id);
        Task<List<OpportunityHistory>> GetByOpportunityIdAsync(int opportunityId);
    }

}

