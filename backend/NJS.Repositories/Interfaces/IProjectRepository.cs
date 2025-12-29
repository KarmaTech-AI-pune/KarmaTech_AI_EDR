using NJS.Domain.Entities;

namespace NJS.Repositories.Interfaces
{
    public interface IProjectRepository
    {
       Task<IEnumerable<Project>> GetAll(int? programId = null);
        Project GetById(int id);
        Task Add(Project project);
        void Update(Project project);
        void Delete(int id);
        Task<IEnumerable<Project>> GetAllByUserId(string userId);
    }
}
