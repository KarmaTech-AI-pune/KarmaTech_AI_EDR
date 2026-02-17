using Microsoft.EntityFrameworkCore;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;

namespace EDR.Repositories.Repositories
{
    /// <summary>
    /// Repository implementation for managing release notes data
    /// </summary>
    public class ReleaseNotesRepository : IReleaseNotesRepository
    {
        private readonly ProjectManagementContext _context;

        public ReleaseNotesRepository(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ReleaseNotes>> GetAllAsync()
        {
            return await _context.ReleaseNotes
                .Include(rn => rn.ChangeItems)
                .AsNoTracking() // Performance optimization for read-only operations
                .OrderByDescending(rn => rn.ReleaseDate)
                .ToListAsync();
        }

        public async Task<ReleaseNotes?> GetByIdAsync(int id)
        {
            return await _context.ReleaseNotes
                .Include(rn => rn.ChangeItems)
                .AsNoTracking() // Performance optimization for read-only operations
                .FirstOrDefaultAsync(rn => rn.Id == id);
        }

        public async Task<ReleaseNotes?> GetByVersionAsync(string version)
        {
            return await _context.ReleaseNotes
                .Include(rn => rn.ChangeItems)
                .AsNoTracking() // Performance optimization for read-only operations
                .FirstOrDefaultAsync(rn => rn.Version == version);
        }

        public async Task<IEnumerable<ReleaseNotes>> GetByEnvironmentAsync(string environment, int skip = 0, int take = 10)
        {
            return await _context.ReleaseNotes
                .Include(rn => rn.ChangeItems)
                .AsNoTracking() // Performance optimization for read-only operations
                .Where(rn => rn.Environment == environment)
                .OrderByDescending(rn => rn.ReleaseDate)
                .Skip(skip)
                .Take(take)
                .ToListAsync();
        }

        public async Task<ReleaseNotes?> GetLatestByEnvironmentAsync(string environment)
        {
            return await _context.ReleaseNotes
                .Include(rn => rn.ChangeItems)
                .AsNoTracking() // Performance optimization for read-only operations
                .Where(rn => rn.Environment == environment)
                .OrderByDescending(rn => rn.ReleaseDate)
                .FirstOrDefaultAsync();
        }

        public async Task<ReleaseNotes> AddAsync(ReleaseNotes releaseNotes)
        {
            _context.ReleaseNotes.Add(releaseNotes);
            await _context.SaveChangesAsync();
            return releaseNotes;
        }

        public async Task UpdateAsync(ReleaseNotes releaseNotes)
        {
            _context.ReleaseNotes.Update(releaseNotes);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var releaseNotes = await _context.ReleaseNotes.FindAsync(id);
            if (releaseNotes != null)
            {
                _context.ReleaseNotes.Remove(releaseNotes);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> ExistsAsync(string version)
        {
            return await _context.ReleaseNotes
                .AsNoTracking() // Performance optimization for read-only operations
                .AnyAsync(rn => rn.Version == version);
        }

        public async Task<IEnumerable<ReleaseNotes>> SearchAsync(string? searchTerm, string? environment, DateTime? fromDate, DateTime? toDate, int skip = 0, int take = 10)
        {
            var query = _context.ReleaseNotes
                .Include(rn => rn.ChangeItems)
                .AsNoTracking() // Performance optimization for read-only operations
                .AsQueryable();

            if (!string.IsNullOrEmpty(searchTerm))
            {
                query = query.Where(rn => 
                    rn.Version.Contains(searchTerm) ||
                    rn.ChangeItems.Any(ci => ci.Description.Contains(searchTerm)));
            }

            if (!string.IsNullOrEmpty(environment))
            {
                query = query.Where(rn => rn.Environment == environment);
            }

            if (fromDate.HasValue)
            {
                query = query.Where(rn => rn.ReleaseDate >= fromDate.Value);
            }

            if (toDate.HasValue)
            {
                query = query.Where(rn => rn.ReleaseDate <= toDate.Value);
            }

            return await query
                .OrderByDescending(rn => rn.ReleaseDate)
                .Skip(skip)
                .Take(take)
                .ToListAsync();
        }
    }
}
