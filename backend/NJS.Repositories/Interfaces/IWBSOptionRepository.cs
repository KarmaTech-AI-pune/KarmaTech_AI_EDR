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
    }
}
