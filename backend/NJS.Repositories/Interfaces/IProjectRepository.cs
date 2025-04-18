using NJS.Domain.Entities;

namespace NJS.Repositories.Interfaces
{
    public interface IProjectRepository
    {
       Task<IEnumerable<Project>> GetAll();
        Project GetById(int id);
        Task Add(Project project);
        void Update(Project project);
        bool Delete(int id);
        Task<bool> ExistsAsync(int id);
    }
}
