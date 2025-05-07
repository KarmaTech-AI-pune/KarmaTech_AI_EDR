using NJS.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NJS.Application.Services.IContract
{
    public interface IProjectHistoryService
    {
        Task<List<ProjectHistory>> GetAllHistoryAsync();
        Task<ProjectHistory> GetHistoryByIdAsync(int id);
        Task AddHistoryAsync(ProjectHistory projectHistory);
        Task UpdateHistoryAsync(ProjectHistory projectHistory);
        Task DeleteHistoryAsync(int id);
        Task<ProjectHistory> GetCurrentStatusForProjectAsync(int id);
        Task<List<ProjectHistory>> GetByProjectIdAsync(int projectId);
    }
}
