using EDR.Domain.Entities;

namespace EDR.Repositories.Interfaces
{
    public interface IPermissionRepository
    {
        Task<IEnumerable<Permission>> GetAllAsync();
        Task<Permission?> GetByIdAsync(int id);
        Task<int> AddAsync(Permission permission);
        Task UpdateAsync(Permission permission);
        Task DeleteAsync(int id);
        Task<IEnumerable<Permission>> GetPermissionsByCategoryAsync(string category);
        Task<IEnumerable<Permission>> GetPermissionsByRoleIdAsync(string roleId);
        Task<Permission?> GetByNameAsync(string name);
    }
}

