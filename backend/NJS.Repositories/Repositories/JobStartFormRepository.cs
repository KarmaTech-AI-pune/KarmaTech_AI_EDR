using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NJS.Domain.Database;
using NJS.Domain.GenericRepository; // Assuming GenericRepository might be used later, keeping it for now.
using NJS.Repositories.Interfaces; // Ensure interface namespace is used
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NJS.Domain.Database;
using NJS.Domain.Entities; // Ensure Entities namespace is used

namespace NJS.Repositories.Repositories
{
    public class JobStartFormRepository : IJobStartFormRepository // Implement the correct interface
    {
        private readonly ProjectManagementContext _context;

        public JobStartFormRepository(ProjectManagementContext context)
        {
            _context = context;
        }

        // Implementation for GetAllAsync as required by the interface
        public async Task<IEnumerable<JobStartForm>> GetAllAsync()
        {
            return await _context.JobStartForms
                .Include(jsf => jsf.Resources)
                .ToListAsync();
        }

        public async Task<JobStartForm> GetByIdAsync(int id)
        {
            // Use FirstOrDefaultAsync with Include to load related resources
            return await _context.JobStartForms
                                 .Include(jsf => jsf.Resources) // Corrected navigation property name
                                 .FirstOrDefaultAsync(jsf => jsf.FormId == id && !jsf.IsDeleted);
        }

        public async Task<IEnumerable<JobStartForm>> GetAllByProjectIdAsync(int projectId)
        {
            return await _context.JobStartForms
                .Where(j => j.ProjectId == projectId && !j.IsDeleted)
                .Include(jsf => jsf.Resources)
                .ToListAsync();
        }

        public async Task AddAsync(JobStartForm jobStartForm)
        {
            await _context.JobStartForms.AddAsync(jobStartForm);
            // SaveChanges is handled by UnitOfWork
        }

        public Task UpdateAsync(JobStartForm jobStartForm)
        {
            _context.JobStartForms.Update(jobStartForm);
            return Task.CompletedTask;
        }

        public Task DeleteAsync(JobStartForm jobStartForm) // Changed to Task, no longer async
        {
            if (jobStartForm != null)
            {
                jobStartForm.IsDeleted = true; // Soft delete
                _context.Entry(jobStartForm).State = EntityState.Modified;
                // Removed SaveChangesAsync - Handled by UnitOfWork
            }
            return Task.CompletedTask; // Return completed task
        }
    }
}
