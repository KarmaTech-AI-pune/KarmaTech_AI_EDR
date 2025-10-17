using Microsoft.EntityFrameworkCore;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;

namespace NJS.Repositories.Repositories
{
    public class WBSOptionRepository : IWBSOptionRepository
    {
        private readonly ProjectManagementContext _context;

        public WBSOptionRepository(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<WBSOption>> GetAllAsync()
        {
            return await _context.WBSOptions
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<WBSOption>> GetByLevelAsync(int level)
        {
            return await _context.WBSOptions
                .Where(o => o.Level == level)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<WBSOption>> GetByLevelAndParentAsync(int level, string parentValue)
        {
            return await _context.WBSOptions
                .Where(o => o.Level == level && o.ParentValue == parentValue)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<WBSOption>> GetByFormTypeAsync(FormType formType)
        {
            return await _context.WBSOptions
                .Where(o => o.FormType == formType)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<WBSOption>> GetByLevelAndFormTypeAsync(int level, FormType formType)
        {
            return await _context.WBSOptions
                .Where(o => o.Level == level && o.FormType == formType)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<WBSOption>> GetByLevelParentAndFormTypeAsync(int level, string parentValue,
            FormType formType)
        {
            return await _context.WBSOptions
                .Where(o => o.Level == level && o.ParentValue == parentValue && o.FormType == formType)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<WBSOption> AddAsync(WBSOption wbsOption)
        {
            await _context.WBSOptions.AddAsync(wbsOption);
            await _context.SaveChangesAsync();
            return wbsOption;
        }

        public async Task<WBSOption> UpdateAsync(WBSOption wbsOption)
        {
            _context.Entry(wbsOption).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return wbsOption;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var wbsOption = await _context.WBSOptions.FindAsync(id);
            if (wbsOption == null)
            {
                return false;
            }

            _context.WBSOptions.Remove(wbsOption);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<WBSOption> GetByIdAsync(int id)
        {
            return await _context.WBSOptions.FindAsync(id);
        }

        public async Task<IEnumerable<WBSOption>> GetByIdsAsync(List<int> ids)
        {
            return await _context.WBSOptions
                .Where(o => ids.Contains(o.Id))
                .AsNoTracking()
                .ToListAsync();
        }
    }
}
