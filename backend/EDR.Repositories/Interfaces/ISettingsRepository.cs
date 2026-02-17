using EDR.Domain.Entities;
using System.Threading.Tasks;

namespace EDR.Repositories.Interfaces
{
    public interface ISettingsRepository
    {
        Task<Settings> GetByKeyAsync(string key);
        Task<Settings> UpdateAsync(Settings settings);
        Task<Settings> AddAsync(Settings settings);
        Task<int> GetNextBidNumberAsync();
    }
}

