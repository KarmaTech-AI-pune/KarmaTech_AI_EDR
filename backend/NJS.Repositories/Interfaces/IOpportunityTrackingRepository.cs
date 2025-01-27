using NJS.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NJS.Repositories.Interfaces
{
    public interface IOpportunityTrackingRepository
    {
        Task<OpportunityTracking> AddAsync(OpportunityTracking opportunityTracking);
        Task<OpportunityTracking> GetByIdAsync(int id);       
        Task<IEnumerable<OpportunityTracking>> GetByBidManagerIdAsync(string bidManagerId);
        Task<IEnumerable<OpportunityTracking>> GetByRegionalManagerIdAsync(string regionalManagerId);
        Task<IEnumerable<OpportunityTracking>> GetByRegionalDirectorIdAsync(string regionalDirectorId);
        Task<IEnumerable<OpportunityTracking>> GetAllAsync();
        Task<OpportunityTracking> UpdateAsync(OpportunityTracking opportunityTracking);
        Task DeleteAsync(int id);
    }
}
