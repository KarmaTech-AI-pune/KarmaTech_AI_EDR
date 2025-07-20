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
    public class ProjectHistoryRepository : IProjectHistoryRepository
    {
        private readonly ProjectManagementContext _context;

        public ProjectHistoryRepository(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<WBSHistory> GetByIdAsync(int id)
        {
            return await _context.WBSHistories
                .Include(ph => ph.WBSTaskPlannedHourHeader)
                .Include(ph => ph.ActionUser)
                .FirstOrDefaultAsync(ph => ph.Id == id);
        }

        public async Task<List<WBSHistory>> GetAllAsync()
        {
            return await _context.WBSHistories
                .Include(ph => ph.WBSTaskPlannedHourHeader)
                .Include(ph => ph.ActionUser)
                .ToListAsync();
        }

        public async Task AddAsync(WBSHistory projectHistory)
        {
            _context.WBSHistories.Add(projectHistory);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(WBSHistory projectHistory)
        {
            _context.WBSHistories.Update(projectHistory);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var projectHistory = await GetByIdAsync(id);
            if (projectHistory != null)
            {
                _context.WBSHistories.Remove(projectHistory);
                await _context.SaveChangesAsync();
            }
        }
       
    }
}
