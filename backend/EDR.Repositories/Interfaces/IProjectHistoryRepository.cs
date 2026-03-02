using EDR.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EDR.Repositories.Interfaces
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

