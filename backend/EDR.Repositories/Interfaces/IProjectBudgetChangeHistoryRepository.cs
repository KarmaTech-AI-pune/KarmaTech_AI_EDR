using EDR.Domain.Entities;

namespace EDR.Repositories.Interfaces
{
    public interface IProjectBudgetChangeHistoryRepository
    {
        Task<IEnumerable<ProjectBudgetChangeHistory>> GetAll();
        Task<ProjectBudgetChangeHistory?> GetById(int id);
        Task Add(ProjectBudgetChangeHistory history);
        void Update(ProjectBudgetChangeHistory history);
        void Delete(int id);
        
        // Specific methods for budget change history
        Task<IEnumerable<ProjectBudgetChangeHistory>> GetByProjectIdAsync(int projectId);
        Task<IEnumerable<ProjectBudgetChangeHistory>> GetByProjectIdWithFilteringAsync(
            int projectId, 
            string? fieldName = null, 
            int pageNumber = 1, 
            int pageSize = 10);
        Task<int> GetCountByProjectIdAsync(int projectId, string? fieldName = null);
        Task<IEnumerable<ProjectBudgetChangeHistory>> GetRecentChangesAsync(int projectId, int count = 5);
    }
}
