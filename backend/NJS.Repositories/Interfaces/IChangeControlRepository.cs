using NJS.Domain.Entities;

namespace NJS.Repositories.Interfaces
{
    public interface IChangeControlRepository
    {
        Task<IEnumerable<ChangeControl>> GetAllAsync();
        Task<ChangeControl> GetByIdAsync(int id);
        Task<IEnumerable<ChangeControl>> GetByProjectIdAsync(int projectId);
        Task<int> AddAsync(ChangeControl changeControl);
        Task UpdateAsync(ChangeControl changeControl);
        Task DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task<int> GetNextIdAsync();
        Task ResetIdentitySeedAsync();
    }
}
