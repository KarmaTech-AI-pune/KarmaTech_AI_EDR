using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace EDR.Repositories.Repositories
{
    public class ProjectScheduleRepository : IProjectScheduleRepository
    {
        private readonly ProjectManagementContext _context;

        public ProjectScheduleRepository(ProjectManagementContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<Project> GetProjectSchedule(int projectId)
        {
            // Adjusted to use Project instead of TodoNewProject
            return await _context.Projects
                .FirstOrDefaultAsync(p => p.Id == projectId);
        }

        public async Task<int> CreateProjectSchedule(Project project)
        {
            _context.Projects.Add(project);
            await _context.SaveChangesAsync();
            return project.Id;
        }
    }
}

