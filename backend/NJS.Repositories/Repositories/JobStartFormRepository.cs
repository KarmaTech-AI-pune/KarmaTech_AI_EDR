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
            return await _context.JobStartForms.ToListAsync();
        }

        public async Task<JobStartForm> GetByIdAsync(int id)
        {
            // Corrected implementation
            return await _context.JobStartForms.FindAsync(id);
        }

        public async Task<IEnumerable<JobStartForm>> GetAllByProjectIdAsync(int projectId)
        {
            return await _context.JobStartForms
                .Where(j => j.ProjectId == projectId && !j.IsDeleted)
                .ToListAsync();
        }

        public async Task AddAsync(JobStartForm jobStartForm)
        {
            await _context.JobStartForms.AddAsync(jobStartForm);
            // SaveChanges is handled by UnitOfWork
        }

        public async Task UpdateAsync(JobStartForm jobStartForm)
        {
            _context.Entry(jobStartForm).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(JobStartForm jobStartForm)
        {
            if (jobStartForm != null)
            {
                jobStartForm.IsDeleted = true;
                _context.Entry(jobStartForm).State = EntityState.Modified;
                await _context.SaveChangesAsync();
            }
        }
    }
}
