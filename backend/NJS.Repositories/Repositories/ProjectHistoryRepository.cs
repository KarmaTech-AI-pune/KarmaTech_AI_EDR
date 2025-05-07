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

        public async Task<ProjectHistory> GetByIdAsync(int id)
        {
            return await _context.ProjectHistories
                .Include(ph => ph.Project)
                .Include(ph => ph.ActionUser)
                .FirstOrDefaultAsync(ph => ph.Id == id);
        }

        public async Task<List<ProjectHistory>> GetAllAsync()
        {
            return await _context.ProjectHistories
                .Include(ph => ph.Project)
                .Include(ph => ph.ActionUser)
                .ToListAsync();
        }

        public async Task AddAsync(ProjectHistory projectHistory)
        {
            _context.ProjectHistories.Add(projectHistory);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(ProjectHistory projectHistory)
        {
            _context.ProjectHistories.Update(projectHistory);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var projectHistory = await GetByIdAsync(id);
            if (projectHistory != null)
            {
                _context.ProjectHistories.Remove(projectHistory);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<List<ProjectHistory>> GetByProjectIdAsync(int projectId)
        {
            return await _context.ProjectHistories
                .Where(ph => ph.ProjectId == projectId)
                .Include(ph => ph.Project)
                .Include(ph => ph.ActionUser)
                .ToListAsync();
        }

        public async Task<ProjectHistory> GetCurrentStatusForProjectAsync(int id)
        {
            var result = await _context.ProjectHistories
                .Where(ph => ph.ProjectId == id)
                .OrderByDescending(ph => ph.ActionDate)
                .FirstOrDefaultAsync();
            
            return result;
        }
    }
}
