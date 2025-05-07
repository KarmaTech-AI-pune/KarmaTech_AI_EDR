using NJS.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NJS.Repositories.Interfaces
{
    public interface IProjectHistoryRepository
    {
        Task<List<ProjectHistory>> GetAllAsync();
        Task<ProjectHistory> GetByIdAsync(int id);
        Task AddAsync(ProjectHistory projectHistory);
        Task UpdateAsync(ProjectHistory projectHistory);
        Task DeleteAsync(int id);
        Task<List<ProjectHistory>> GetByProjectIdAsync(int projectId);
        Task<ProjectHistory> GetCurrentStatusForProjectAsync(int id);
    }
}
