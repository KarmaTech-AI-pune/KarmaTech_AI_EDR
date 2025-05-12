using NJS.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NJS.Application.Services.IContract
{
    public interface IProjectHistoryService
    {
        Task<List<WBSHistory>> GetAllHistoryAsync();
        Task<WBSHistory> GetHistoryByIdAsync(int id);
        Task AddHistoryAsync(WBSHistory projectHistory);
        Task UpdateHistoryAsync(WBSHistory projectHistory);
        Task DeleteHistoryAsync(int id);
       
    }
}
