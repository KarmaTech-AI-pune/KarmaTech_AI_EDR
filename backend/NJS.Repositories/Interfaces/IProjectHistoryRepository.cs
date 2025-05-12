using NJS.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NJS.Repositories.Interfaces
{
    public interface IProjectHistoryRepository
    {
        Task<List<WBSHistory>> GetAllAsync();
        Task<WBSHistory> GetByIdAsync(int id);
        Task AddAsync(WBSHistory projectHistory);
        Task UpdateAsync(WBSHistory projectHistory);
        Task DeleteAsync(int id);
        
    }
}
