using NJS.Application.Services.IContract;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;

namespace NJS.Application.Services
{
    public class OpportunityHistoryService : IOpportunityHistoryService
    {
        private readonly IOpportunityHistoryRepository _repository;

        public OpportunityHistoryService(IOpportunityHistoryRepository repository)
        {
            _repository = repository;
        }

        public async Task<List<OpportunityHistory>> GetAllHistoryAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<OpportunityHistory> GetHistoryByIdAsync(int id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task AddHistoryAsync(OpportunityHistory opportunityHistory)
        {
            await _repository.AddAsync(opportunityHistory);
        }

        public async Task UpdateHistoryAsync(OpportunityHistory opportunityHistory)
        {
            await _repository.UpdateAsync(opportunityHistory);
        }

        public async Task DeleteHistoryAsync(int id)
        {
            await _repository.DeleteAsync(id);
        }
    }
}
