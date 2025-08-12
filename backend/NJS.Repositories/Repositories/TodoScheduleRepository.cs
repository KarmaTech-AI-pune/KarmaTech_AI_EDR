using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace NJS.Repositories.Repositories
{
    public class TodoScheduleRepository : ITodoScheduleRepository
    {
        private readonly ProjectManagementContext _context;

        public TodoScheduleRepository(ProjectManagementContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<todoProjectSchedule> GetTodoSchedule(int projectId)
        {
            return await _context.TodoProjectSchedules
                .Include(ps => ps.Project)
                    .ThenInclude(p => p.ProjectLead)
                .Include(ps => ps.Tasks!)
                    .ThenInclude(t => t.Activities)
                .Include(ps => ps.Tasks!)
                    .ThenInclude(t => t.AssignedTo)
                .FirstOrDefaultAsync(ps => ps.Project.Id == projectId);
        }

        public async Task<int> CreateTodoSchedule(todoProjectSchedule todoSchedule)
        {
            _context.TodoProjectSchedules.Add(todoSchedule);
            await _context.SaveChangesAsync();
            return todoSchedule.Project?.Id ?? todoSchedule.Id;
        }
    }
}
