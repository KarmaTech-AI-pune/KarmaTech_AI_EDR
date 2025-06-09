using NJS.Domain.Entities;
using System.Threading.Tasks;

namespace NJS.Repositories.Interfaces
{
    public interface IMonthlyProgressRepository
    {
        Task<MonthlyProgress> GetByIdAsync(int id);
        Task AddAsync(MonthlyProgress entity);
        Task UpdateAsync(MonthlyProgress entity);
        Task DeleteAsync(MonthlyProgress entity);
        Task<List<MonthlyProgress>> GetAllAsync();
    }
}
