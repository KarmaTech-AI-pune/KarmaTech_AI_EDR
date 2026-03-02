using System.Collections.Generic;
using System.Threading.Tasks;
using EDR.Domain.Entities;

namespace EDR.Repositories.Interfaces
{
    public interface IWBSOptionRepository
    {
        Task<IEnumerable<WBSOption>> GetByLevelAsync(int level);
        Task<IEnumerable<WBSOption>> GetByLevelAndParentAsync(int level, int? parentId);
        Task<IEnumerable<WBSOption>> GetAllAsync();
        Task<IEnumerable<WBSOption>> GetByFormTypeAsync(FormType formType);
        Task<IEnumerable<WBSOption>> GetByLevelAndFormTypeAsync(int level, FormType formType);
        Task<IEnumerable<WBSOption>> GetByLevelParentAndFormTypeAsync(int level, int? parentId, FormType formType);
        Task<WBSOption> AddAsync(WBSOption wbsOption);
        Task<WBSOption> UpdateAsync(WBSOption wbsOption);
        Task<bool> DeleteAsync(int id);
        Task<WBSOption> GetByIdAsync(int id);
        Task<IEnumerable<WBSOption>> GetByIdsAsync(List<int> ids);
    }
}

