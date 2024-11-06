//File:backend/src/NJS.Application/Interfaces/IProjectRepository.cs
using NJS.Domain.Entities;

namespace NJS.Application.Interfaces
{
    public interface IProjectRepository
    {
        IEnumerable<Project> GetAll();
        Project GetById(int id);
        void Add(Project project);
        void Update(Project project);
        void Delete(int id);
    }
}
