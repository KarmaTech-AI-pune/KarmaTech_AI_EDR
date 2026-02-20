using EDR.Application.Services.IContract;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EDR.Application.Services
{
    public class ProjectHistoryService : IProjectHistoryService
    {
        private readonly IProjectHistoryRepository _repository;

        public ProjectHistoryService(IProjectHistoryRepository repository)
        {
            _repository = repository;
        }

        public async Task<List<WBSHistory>> GetAllHistoryAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<WBSHistory> GetHistoryByIdAsync(int id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task AddHistoryAsync(WBSHistory projectHistory)
        {
            await _repository.AddAsync(projectHistory);
        }

        public async Task UpdateHistoryAsync(WBSHistory projectHistory)
        {
            await _repository.UpdateAsync(projectHistory);
        }

        public async Task DeleteHistoryAsync(int id)
        {
            await _repository.DeleteAsync(id);
        }
        
    }
}

