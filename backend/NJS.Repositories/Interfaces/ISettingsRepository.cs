using NJS.Domain.Entities;
using System.Threading.Tasks;

namespace NJS.Repositories.Interfaces
{
    public interface ISettingsRepository
    {
        Task<Settings> GetByKeyAsync(string key);
        Task<Settings> UpdateAsync(Settings settings);
        Task<Settings> AddAsync(Settings settings);
        Task<int> GetNextBidNumberAsync();
    }
}
