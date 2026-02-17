using EDR.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EDR.Repositories.Interfaces
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
        Task<int> GetNextIdAsync();
        Task ResetIdentitySeedAsync();
    }
}

