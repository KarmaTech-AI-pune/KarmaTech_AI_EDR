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

        public async Task<IEnumerable<JobStartForm>> GetByProjectIdAsync(int projectId)
        {
            return await _context.JobStartForms
                .Where(j => j.ProjectId == projectId)
                .ToListAsync();
        }

        // Removed redundant GetAllByProjectIdAsync

        public async Task AddAsync(JobStartForm jobStartForm)
        {
            await _context.JobStartForms.AddAsync(jobStartForm);
            // SaveChangesAsync is typically handled by UnitOfWork, removed from here
        }

        // Changed UpdateAsync to Update (non-async) to match interface
        public void Update(JobStartForm jobStartForm)
        {
            _context.JobStartForms.Update(jobStartForm);
            // SaveChangesAsync is typically handled by UnitOfWork, removed from here
        }

        // Changed DeleteAsync(int id) to Delete(JobStartForm jobStartForm) (non-async) to match interface
        public void Delete(JobStartForm jobStartForm)
        {
             if (jobStartForm != null)
            {
                 _context.JobStartForms.Remove(jobStartForm);
                 // SaveChangesAsync is typically handled by UnitOfWork, removed from here
            }
        }
    }
}
