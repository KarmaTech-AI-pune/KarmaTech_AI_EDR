using EDR.Domain.Entities;

namespace EDR.Repositories.Interfaces
{
    public interface IProjectRepository
    {
       Task<IEnumerable<Project>> GetAll();
       Task<IEnumerable<Project>> GetAllByProgramId(int programId);
        Project GetById(int id);
        Task Add(Project project);
        void Update(Project project);
        void Delete(int id);
        Task<IEnumerable<Project>> GetAllByUserId(string userId);
    }
}
