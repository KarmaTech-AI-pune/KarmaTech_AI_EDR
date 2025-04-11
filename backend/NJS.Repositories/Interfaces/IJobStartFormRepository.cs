using NJS.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NJS.Repositories.Interfaces
{
    public interface IJobStartFormRepository
    {
        Task<IEnumerable<JobStartForm>> GetAllAsync();
        Task<JobStartForm> GetByIdAsync(int id);
        Task<IEnumerable<JobStartForm>> GetAllByProjectIdAsync(int projectId);
        Task AddAsync(JobStartForm jobStartForm);
        Task UpdateAsync(JobStartForm jobStartForm);
        Task DeleteAsync(JobStartForm jobStartForm);
    }
}
