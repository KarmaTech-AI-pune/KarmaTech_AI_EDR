using EDR.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EDR.Repositories.Interfaces
{
    public interface IWBSTaskRepository
    {
        Task<WBSTask> GetByIdAsync(int id);
        Task<WBSTask> GetByIdWithDetailsAsync(int id);
        Task<IEnumerable<WBSTask>> GetByWBSIdAsync(int wbsId);
        Task<IEnumerable<WBSTask>> GetByWBSIdWithDetailsAsync(int wbsId);
        Task<int> AddAsync(WBSTask task);
        Task UpdateAsync(WBSTask task);
        Task DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task<List<WorkBreakdownStructure>> GetApprovedWBSAsync(int? projectId); // New method for approved WBS
    }
}

