using NJS.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NJS.Repositories.Interfaces
{
    public interface IOpportunityTrackingRepository
    {
        Task<OpportunityTracking> AddAsync(OpportunityTracking opportunityTracking);
        Task<OpportunityTracking> GetByIdAsync(int id);
        Task<IEnumerable<OpportunityTracking>> GetByUserIdAsync(string userId);
        Task<IEnumerable<OpportunityTracking>> GetByReviewManagerIdAsync(string reviewManagerId);
        Task<IEnumerable<OpportunityTracking>> GetByApprovalManagerIdAsync(string approvalManagerId);
        Task<IEnumerable<OpportunityTracking>> GetAllAsync();
        Task<OpportunityTracking> UpdateAsync(OpportunityTracking opportunityTracking);
        Task DeleteAsync(int id);
    }
}
