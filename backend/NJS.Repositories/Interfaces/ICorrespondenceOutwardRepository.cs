using NJS.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NJS.Repositories.Interfaces
{
    public interface ICorrespondenceOutwardRepository
    {
        Task<IEnumerable<CorrespondenceOutward>> GetAllAsync();
        Task<CorrespondenceOutward> GetByIdAsync(int id);
        Task<IEnumerable<CorrespondenceOutward>> GetByProjectIdAsync(int projectId);
        Task<int> AddAsync(CorrespondenceOutward correspondenceOutward);
        Task UpdateAsync(CorrespondenceOutward correspondenceOutward);
        Task DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
    }
}
