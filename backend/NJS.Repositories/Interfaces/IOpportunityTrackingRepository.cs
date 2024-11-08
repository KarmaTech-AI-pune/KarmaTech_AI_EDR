using NJS.Domain.Entities;

namespace NJS.Repositories.Interfaces
{
    public interface IOpportunityTrackingRepository
    {
        Task<OpportunityTracking?> GetByIdAsync(int id);
        Task<IEnumerable<OpportunityTracking>> GetAllAsync();
        Task<IEnumerable<OpportunityTracking>> GetByProjectIdAsync(int projectId);
        Task<OpportunityTracking> AddAsync(OpportunityTracking opportunityTracking);
        Task UpdateAsync(OpportunityTracking opportunityTracking);
        Task DeleteAsync(int id);
    }
}
