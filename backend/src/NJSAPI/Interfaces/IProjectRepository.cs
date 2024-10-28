// File: src/NJSAPI/Interfaces/IProjectRepository.cs
using NJSAPI.Interfaces;
using NJSAPI.Models;
using NJSAPI.Services;

namespace NJSAPI.Interfaces
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