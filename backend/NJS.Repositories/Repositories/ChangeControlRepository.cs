using Microsoft.EntityFrameworkCore;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NJS.Repositories.Repositories
{
    public class ChangeControlRepository : IChangeControlRepository
    {
        private readonly ProjectManagementContext _context;

        public ChangeControlRepository(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ChangeControl>> GetAllAsync()
        {
            return await _context.ChangeControls
                .Include(cc => cc.WorkflowHistories)
                .OrderBy(cc => cc.ProjectId)
                .ThenBy(cc => cc.SrNo)
                .ToListAsync();
        }

        public async Task<ChangeControl> GetByIdAsync(int id)
        {
            return await _context.ChangeControls.FindAsync(id);
        }

        public async Task<IEnumerable<ChangeControl>> GetByProjectIdAsync(int projectId)
        {
            return await _context.ChangeControls
                .Include(cc => cc.WorkflowHistories)
                .Where(cc => cc.ProjectId == projectId)
                .OrderBy(cc => cc.SrNo)
                .ToListAsync();
        }

        public async Task<int> AddAsync(ChangeControl changeControl)
        {
            if (changeControl == null) throw new ArgumentNullException(nameof(changeControl));

            // Check if we need to reset the identity seed before adding a new entry
            await ResetIdentitySeedAsync();

            // Set creation timestamp
            changeControl.CreatedAt = DateTime.UtcNow;

            _context.ChangeControls.Add(changeControl);
            await _context.SaveChangesAsync();

            return changeControl.Id;
        }

        public async Task UpdateAsync(ChangeControl changeControl)
        {
            if (changeControl == null) throw new ArgumentNullException(nameof(changeControl));

            var existingEntity = await _context.ChangeControls.FindAsync(changeControl.Id);
            if (existingEntity == null)
                throw new KeyNotFoundException($"ChangeControl with ID {changeControl.Id} not found.");

            // Update timestamp
            changeControl.CreatedAt = existingEntity.CreatedAt; // Preserve original creation date
            changeControl.UpdatedAt = DateTime.UtcNow;

            _context.Entry(existingEntity).CurrentValues.SetValues(changeControl);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var changeControl = await _context.ChangeControls.FindAsync(id);
            if (changeControl == null)
                throw new KeyNotFoundException($"ChangeControl with ID {id} not found.");

            _context.ChangeControls.Remove(changeControl);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.ChangeControls.AnyAsync(cc => cc.Id == id);
        }

        public async Task<int> GetNextIdAsync()
        {
            if (!await _context.ChangeControls.AnyAsync())
                return 1;

            return await _context.ChangeControls.MaxAsync(cc => cc.Id) + 1;
        }

        public async Task ResetIdentitySeedAsync()
        {
            // If there are no records, reset the identity seed to 1
            if (!await _context.ChangeControls.AnyAsync())
            {
                // SQL Server specific command to reset identity seed
                await _context.Database.ExecuteSqlRawAsync("DBCC CHECKIDENT('[ChangeControls]', RESEED, 0)");
            }
        }
    }
}
