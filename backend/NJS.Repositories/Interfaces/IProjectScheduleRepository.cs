using NJS.Domain.Entities;
using System.Threading.Tasks;

namespace NJS.Repositories.Interfaces
{
    public interface IProjectScheduleRepository
    {
        Task<Project> GetProjectSchedule(int projectId);
        Task<int> CreateProjectSchedule(Project project);
    }
}
