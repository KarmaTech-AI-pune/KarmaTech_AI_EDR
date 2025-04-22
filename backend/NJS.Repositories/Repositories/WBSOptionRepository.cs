using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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

        public async Task<IEnumerable<WBSOption>> GetByLevelParentAndFormTypeAsync(int level, string parentValue, FormType formType)
        {
            return await _context.WBSOptions
                .Where(o => o.Level == level && o.ParentValue == parentValue && o.FormType == formType)
                .AsNoTracking()
                .ToListAsync();
        }
    }
}
