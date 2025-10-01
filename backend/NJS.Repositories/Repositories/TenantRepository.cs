using Microsoft.EntityFrameworkCore;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;

namespace NJS.Repositories.Repositories
{
    public class TenantRepository : ITenantRepository
    {
        private readonly TenantDbContext _context;

        public TenantRepository(TenantDbContext context)
        {
            _context = context;
        }

        public async Task<Tenant> CreateAsync(Tenant tenant)
        {
            _context.Tenants.Add(tenant);
            await _context.SaveChangesAsync();
            return tenant;
        }

        public async Task DeleteAsync(int id)
        {
            var tenant = await _context.Tenants.FindAsync(id);
            if (tenant != null)
            {
                _context.Tenants.Remove(tenant);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<Tenant>> GetAllAsync()
        {
            return await _context.Tenants.ToListAsync();
        }

        public async Task<Tenant> GetByIdAsync(int id)
        {
            return await _context.Tenants.FindAsync(id);
        }

        public async Task UpdateAsync(Tenant tenant)
        {
            _context.Entry(tenant).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }
    }
}
