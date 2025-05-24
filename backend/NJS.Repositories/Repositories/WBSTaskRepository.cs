using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;

namespace NJS.Repositories.Repositories
{
    public class WBSTaskRepository : IWBSTaskRepository
    {
        private readonly ProjectManagementContext _context;
        private readonly ILogger<WBSTaskRepository> _logger;

        public WBSTaskRepository(ProjectManagementContext context, ILogger<WBSTaskRepository> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger;
        }

        public async Task<int> AddAsync(WBSTask task)
        {
            if (task == null) throw new ArgumentNullException(nameof(task));
            _context.WBSTasks.Add(task);
            await _context.SaveChangesAsync();
            return task.Id; // Assuming Id is generated on save
        }

        public async Task DeleteAsync(int id)
        {
            var task = await _context.WBSTasks.FindAsync(id);
            if (task != null)
            {
                // Consider soft delete if IsDeleted property is used consistently
                // task.IsDeleted = true;
                // await _context.SaveChangesAsync();
                // Or hard delete:
                 _context.WBSTasks.Remove(task);
                 await _context.SaveChangesAsync();
            }
            // Handle case where task is not found? Maybe throw exception or return status.
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.WBSTasks.AnyAsync(t => t.Id == id);
        }

        public async Task<WBSTask> GetByIdAsync(int id)
        {
            // FindAsync is good for primary key lookups
            return await _context.WBSTasks.FindAsync(id);
        }

        public async Task<WBSTask> GetByIdWithDetailsAsync(int id)
        {
            // Use Include to load related entities
            return await _context.WBSTasks
                                 .Include(t => t.UserWBSTasks) 
                                 .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<IEnumerable<WBSTask>> GetByParentIdAsync(int parentId)
        {
            return await _context.WBSTasks
                                 .Where(t => t.ParentId == parentId)
                                 .ToListAsync();
        }

        public async Task<IEnumerable<WBSTask>> GetByWBSIdAsync(int wbsId)
        {
            return await _context.WBSTasks
                                 .Where(t => t.WorkBreakdownStructureId == wbsId)
                                 .OrderBy(t => t.DisplayOrder) // Example ordering
                                 .ToListAsync();
        }

        public async Task<IEnumerable<WBSTask>> GetByWBSIdWithDetailsAsync(int wbsId)
        {
            // Use Include to load related entities, specifically UserWBSTasks for the handler
            return await _context.WBSTasks
                                 .Where(t => t.WorkBreakdownStructureId == wbsId)
                                 .Include(t => t.UserWBSTasks) 
                               
                                 .OrderBy(t => t.DisplayOrder) 
                                 .ToListAsync();
        }

        public async Task UpdateAsync(WBSTask task)
        {
            if (task == null) throw new ArgumentNullException(nameof(task));

            // Ensure the entity is tracked by the context before updating
            _context.Entry(task).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException ex)
            {
                // Handle concurrency conflicts if necessary
                // Log the error, rethrow, or implement conflict resolution strategy
                _logger.LogInformation($"Concurrency error updating WBSTask {task.Id}: {ex.Message}");
                throw;
            }
        }
    }
}
