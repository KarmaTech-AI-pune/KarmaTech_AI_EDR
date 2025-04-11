using NJS.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NJS.Repositories.Interfaces
{
    public interface IJobStartFormRepository
    {
        Task<IEnumerable<JobStartForm>> GetAllAsync();
        Task<JobStartForm> GetByIdAsync(int id);
        Task<IEnumerable<JobStartForm>> GetByProjectIdAsync(int projectId); // Added specific method
        Task AddAsync(JobStartForm jobStartForm);
        void Update(JobStartForm jobStartForm); // Update might not be async depending on EF Core implementation
        void Delete(JobStartForm jobStartForm); // Delete might not be async depending on EF Core implementation
    }
}
