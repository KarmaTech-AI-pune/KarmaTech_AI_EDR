using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EDR.API.Tests.Infrastructure
{
    /// <summary>
    /// TEST FILE ONLY — InMemory-compatible fake for IInputRegisterRepository.
    /// Overrides ResetIdentitySeedAsync with a no-op: DBCC CHECKIDENT is not supported by InMemory DB.
    /// </summary>
    public class FakeInputRegisterRepository : IInputRegisterRepository
    {
        private readonly ProjectManagementContext _context;
        public FakeInputRegisterRepository(ProjectManagementContext context)
            => _context = context ?? throw new ArgumentNullException(nameof(context));

        public async Task<IEnumerable<InputRegister>> GetAllAsync()
            => await _context.InputRegisters.ToListAsync();

        public async Task<InputRegister> GetByIdAsync(int id)
            => await _context.InputRegisters.FindAsync(id);

        public async Task<IEnumerable<InputRegister>> GetByProjectIdAsync(int projectId)
            => await _context.InputRegisters.Where(i => i.ProjectId == projectId).ToListAsync();

        public async Task<int> AddAsync(InputRegister entity)
        {
            if (entity == null) throw new ArgumentNullException(nameof(entity));
            entity.CreatedAt = DateTime.UtcNow;
            _context.InputRegisters.Add(entity);
            await _context.SaveChangesAsync();
            return entity.Id;
        }

        public async Task UpdateAsync(InputRegister entity)
        {
            if (entity == null) throw new ArgumentNullException(nameof(entity));
            entity.UpdatedAt = DateTime.UtcNow;
            _context.Entry(entity).State = EntityState.Modified;
            _context.Entry(entity).Property(x => x.CreatedAt).IsModified = false;
            _context.Entry(entity).Property(x => x.CreatedBy).IsModified = false;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _context.InputRegisters.FindAsync(id);
            if (entity != null) { _context.InputRegisters.Remove(entity); await _context.SaveChangesAsync(); }
        }

        public async Task<bool> ExistsAsync(int id)
            => await _context.InputRegisters.AnyAsync(i => i.Id == id);

        public async Task<int> GetNextIdAsync()
        {
            if (!await _context.InputRegisters.AnyAsync()) return 1;
            return await _context.InputRegisters.MaxAsync(i => i.Id) + 1;
        }

        /// <summary>No-op — DBCC CHECKIDENT is not supported by InMemory DB.</summary>
        public Task ResetIdentitySeedAsync() => Task.CompletedTask;
    }

    /// <summary>
    /// TEST FILE ONLY — InMemory-compatible fake for ICorrespondenceInwardRepository.
    /// Overrides ResetIdentitySeedAsync with a no-op.
    /// </summary>
    public class FakeCorrespondenceInwardRepository : ICorrespondenceInwardRepository
    {
        private readonly ProjectManagementContext _context;
        public FakeCorrespondenceInwardRepository(ProjectManagementContext context)
            => _context = context ?? throw new ArgumentNullException(nameof(context));

        public async Task<IEnumerable<CorrespondenceInward>> GetAllAsync()
            => await _context.CorrespondenceInwards.ToListAsync();

        public async Task<CorrespondenceInward> GetByIdAsync(int id)
            => await _context.CorrespondenceInwards.FindAsync(id);

        public async Task<IEnumerable<CorrespondenceInward>> GetByProjectIdAsync(int projectId)
            => await _context.CorrespondenceInwards.Where(i => i.ProjectId == projectId).ToListAsync();

        public async Task<int> AddAsync(CorrespondenceInward entity)
        {
            if (entity == null) throw new ArgumentNullException(nameof(entity));
            entity.CreatedAt = DateTime.UtcNow;
            _context.CorrespondenceInwards.Add(entity);
            await _context.SaveChangesAsync();
            return entity.Id;
        }

        public async Task UpdateAsync(CorrespondenceInward entity)
        {
            if (entity == null) throw new ArgumentNullException(nameof(entity));
            entity.UpdatedAt = DateTime.UtcNow;
            _context.Entry(entity).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _context.CorrespondenceInwards.FindAsync(id);
            if (entity != null) { _context.CorrespondenceInwards.Remove(entity); await _context.SaveChangesAsync(); }
        }

        public async Task<bool> ExistsAsync(int id)
            => await _context.CorrespondenceInwards.AnyAsync(i => i.Id == id);

        public async Task<int> GetNextIdAsync()
        {
            if (!await _context.CorrespondenceInwards.AnyAsync()) return 1;
            return await _context.CorrespondenceInwards.MaxAsync(i => i.Id) + 1;
        }

        /// <summary>No-op — DBCC CHECKIDENT is not supported by InMemory DB.</summary>
        public Task ResetIdentitySeedAsync() => Task.CompletedTask;
    }

    /// <summary>
    /// TEST FILE ONLY — InMemory-compatible fake for ICorrespondenceOutwardRepository.
    /// Overrides ResetIdentitySeedAsync with a no-op.
    /// </summary>
    public class FakeCorrespondenceOutwardRepository : ICorrespondenceOutwardRepository
    {
        private readonly ProjectManagementContext _context;
        public FakeCorrespondenceOutwardRepository(ProjectManagementContext context)
            => _context = context ?? throw new ArgumentNullException(nameof(context));

        public async Task<IEnumerable<CorrespondenceOutward>> GetAllAsync()
            => await _context.CorrespondenceOutwards.ToListAsync();

        public async Task<CorrespondenceOutward> GetByIdAsync(int id)
            => await _context.CorrespondenceOutwards.FindAsync(id);

        public async Task<IEnumerable<CorrespondenceOutward>> GetByProjectIdAsync(int projectId)
            => await _context.CorrespondenceOutwards.Where(i => i.ProjectId == projectId).ToListAsync();

        public async Task<int> AddAsync(CorrespondenceOutward entity)
        {
            if (entity == null) throw new ArgumentNullException(nameof(entity));
            entity.CreatedAt = DateTime.UtcNow;
            _context.CorrespondenceOutwards.Add(entity);
            await _context.SaveChangesAsync();
            return entity.Id;
        }

        public async Task UpdateAsync(CorrespondenceOutward entity)
        {
            if (entity == null) throw new ArgumentNullException(nameof(entity));
            entity.UpdatedAt = DateTime.UtcNow;
            _context.Entry(entity).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _context.CorrespondenceOutwards.FindAsync(id);
            if (entity != null) { _context.CorrespondenceOutwards.Remove(entity); await _context.SaveChangesAsync(); }
        }

        public async Task<bool> ExistsAsync(int id)
            => await _context.CorrespondenceOutwards.AnyAsync(i => i.Id == id);

        public async Task<int> GetNextIdAsync()
        {
            if (!await _context.CorrespondenceOutwards.AnyAsync()) return 1;
            return await _context.CorrespondenceOutwards.MaxAsync(i => i.Id) + 1;
        }

        /// <summary>No-op — DBCC CHECKIDENT is not supported by InMemory DB.</summary>
        public Task ResetIdentitySeedAsync() => Task.CompletedTask;
    }
}
