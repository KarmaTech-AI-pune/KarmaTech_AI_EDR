using NJS.Domain.Entities;

namespace NJS.Repositories.Interfaces
{
    public interface IPermissionRepository
    {
        Task<IEnumerable<Permission>> GetAll();
        Task<Permission> GetById(int id);
        Task Add(Permission permission);
        Task Update(Permission permission);
        Task Delete(int id);
        Task<IEnumerable<Permission>> GetPermissionsByCategory(string category);
        Task<IEnumerable<Permission>> GetPermissionsByRoleId(string roleId);
        
    }
}
