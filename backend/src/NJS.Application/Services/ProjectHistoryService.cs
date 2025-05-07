using NJS.Application.Services.IContract;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NJS.Application.Services
{
    public class ProjectHistoryService : IProjectHistoryService
    {
        private readonly IProjectHistoryRepository _repository;

        public ProjectHistoryService(IProjectHistoryRepository repository)
        {
            _repository = repository;
        }

        public async Task<List<ProjectHistory>> GetAllHistoryAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<ProjectHistory> GetHistoryByIdAsync(int id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task AddHistoryAsync(ProjectHistory projectHistory)
        {
            await _repository.AddAsync(projectHistory);
        }

        public async Task UpdateHistoryAsync(ProjectHistory projectHistory)
        {
            await _repository.UpdateAsync(projectHistory);
        }

        public async Task DeleteHistoryAsync(int id)
        {
            await _repository.DeleteAsync(id);
        }

        public async Task<ProjectHistory> GetCurrentStatusForProjectAsync(int id)
        {
            return await _repository.GetCurrentStatusForProjectAsync(id);
        }

        public async Task<List<ProjectHistory>> GetByProjectIdAsync(int projectId)
        {
            return await _repository.GetByProjectIdAsync(projectId);
        }
    }
}
