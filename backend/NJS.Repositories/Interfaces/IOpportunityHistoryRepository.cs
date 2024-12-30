using NJS.Domain.Entities;

namespace NJS.Repositories.Interfaces
{
    public interface IOpportunityHistoryRepository
    {
        Task<OpportunityHistory> GetByIdAsync(int id);
        Task<List<OpportunityHistory>> GetAllAsync();
        Task AddAsync(OpportunityHistory opportunityHistory);
        Task UpdateAsync(OpportunityHistory opportunityHistory);
        Task DeleteAsync(int id);
        Task<List<OpportunityHistory>> GetByOpportunityIdAsync(int opportunityId);
    }
}
