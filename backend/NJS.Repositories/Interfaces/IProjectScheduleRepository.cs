using NJS.Domain.Entities;
using System.Threading.Tasks;

namespace NJS.Repositories.Interfaces
{
    public interface IProjectScheduleRepository
    {
        Task<TodoNewProject> GetProjectSchedule(int projectId);
        Task<int> CreateProjectSchedule(TodoNewProject project);
    }
}
