using NJS.Domain.Entities;
using System.Threading.Tasks;

namespace NJS.Repositories.Interfaces
{
    public interface ITodoScheduleRepository
    {
        Task<todoProjectSchedule> GetTodoSchedule(int projectId);
        Task<int> CreateTodoSchedule(todoProjectSchedule todoSchedule);
    }
}
