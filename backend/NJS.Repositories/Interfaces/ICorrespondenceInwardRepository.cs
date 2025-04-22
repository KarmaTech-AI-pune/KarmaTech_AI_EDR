using NJS.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NJS.Repositories.Interfaces
{
    public interface ICorrespondenceInwardRepository
    {
        Task<IEnumerable<CorrespondenceInward>> GetAllAsync();
        Task<CorrespondenceInward> GetByIdAsync(int id);
        Task<IEnumerable<CorrespondenceInward>> GetByProjectIdAsync(int projectId);
        Task<int> AddAsync(CorrespondenceInward correspondenceInward);
        Task UpdateAsync(CorrespondenceInward correspondenceInward);
        Task DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task<int> GetNextIdAsync();
        Task ResetIdentitySeedAsync();
    }
}
