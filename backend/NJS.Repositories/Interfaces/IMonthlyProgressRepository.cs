using NJS.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NJS.Repositories.Interfaces
{
    public interface IMonthlyProgressRepository
    {
        Task<MonthlyProgress> GetByIdAsync(int id);
        Task<List<MonthlyProgress>> GetByProjectIdAsync(int projectId);
        Task AddAsync(MonthlyProgress entity);
        Task UpdateAsync(MonthlyProgress entity);
        Task DeleteAsync(MonthlyProgress entity);
        Task<List<MonthlyProgress>> GetAllAsync();
    }
}
