using System.Collections.Generic;
using System.Threading.Tasks;
using NJS.Domain.Entities;

namespace NJS.Repositories.Interfaces
{
    public interface IWBSOptionRepository
    {
        Task<IEnumerable<WBSOption>> GetByLevelAsync(int level);
        Task<IEnumerable<WBSOption>> GetByLevelAndParentAsync(int level, string parentValue);
        Task<IEnumerable<WBSOption>> GetAllAsync();
        Task<IEnumerable<WBSOption>> GetByFormTypeAsync(FormType formType);
        Task<IEnumerable<WBSOption>> GetByLevelAndFormTypeAsync(int level, FormType formType);
        Task<IEnumerable<WBSOption>> GetByLevelParentAndFormTypeAsync(int level, string parentValue, FormType formType);
    }
}
