using EDR.Domain.Entities;
using System.Threading.Tasks;

namespace EDR.Repositories.Interfaces
{
    public interface IProjectScheduleRepository
    {
        Task<Project> GetProjectSchedule(int projectId);
        Task<int> CreateProjectSchedule(Project project);
    }
}

