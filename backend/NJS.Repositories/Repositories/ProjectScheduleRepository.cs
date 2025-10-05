using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace NJS.Repositories.Repositories
{
    public class ProjectScheduleRepository : IProjectScheduleRepository
    {
        private readonly ProjectManagementContext _context;

        public ProjectScheduleRepository(ProjectManagementContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<TodoNewProject> GetProjectSchedule(int projectId)
        {
            return await _context.TodoNewProjects
                .Include(p => p.Tasks!)
                    .ThenInclude(t => t.Subtasks!)
                .FirstOrDefaultAsync(p => p.ProjectId == projectId);
        }

        public async Task<int> CreateProjectSchedule(TodoNewProject project)
        {
            _context.TodoNewProjects.Add(project);
            await _context.SaveChangesAsync();
            return project.ProjectId;
        }
    }
}
