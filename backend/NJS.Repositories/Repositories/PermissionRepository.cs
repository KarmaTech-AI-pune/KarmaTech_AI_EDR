using NJS.Domain.Entities;
using NJS.Domain.GenericRepository;
using NJS.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace NJS.Repositories.Repositories
{
    public class PermissionRepository : IPermissionRepository
    {
        private readonly IRepository<Permission> _repository;

        public PermissionRepository(IRepository<Permission> repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<Permission>> GetAll()
        {
            return await _repository.GetAllAsync().ConfigureAwait(false);
        }

        public async Task<Permission> GetById(int id)
        {
            return await _repository.GetByIdAsync(id).ConfigureAwait(false);
        }

        public async Task Add(Permission permission)
        {
            await _repository.AddAsync(permission).ConfigureAwait(false);
            await _repository.SaveChangesAsync().ConfigureAwait(false);
        }

        public async Task Update(Permission permission)
        {
            await _repository.UpdateAsync(permission).ConfigureAwait(false);
        }

        public async Task Delete(int id)
        {
            var permission = await _repository.GetByIdAsync(id).ConfigureAwait(false);
            if (permission != null)
            {
                await _repository.RemoveAsync(permission).ConfigureAwait(false);
            }
        }

        public async Task<IEnumerable<Permission>> GetPermissionsByCategory(string category)
        {
            var query = _repository.Query();
            return await query.Where(p => p.Category == category)
                .ToListAsync()
                .ConfigureAwait(false);
        }

        public async Task<IEnumerable<Permission>> GetPermissionsByRoleId(string roleId)
        {
            var query = _repository.Query();
            return await query.Include(p => p.RolePermissions)
                .Where(p => p.RolePermissions.Any(rp => rp.RoleId == roleId))
                .ToListAsync()
                .ConfigureAwait(false);
        }
    }
}