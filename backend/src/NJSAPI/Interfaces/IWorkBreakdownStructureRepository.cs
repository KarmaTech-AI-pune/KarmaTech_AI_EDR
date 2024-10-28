// File: src/NJSAPI/Interfaces/IWorkBreakdownStructureRepository.cs
using NJSAPI.Interfaces;
using NJSAPI.Models;
using NJSAPI.Services;

using NJSAPI.Models;

namespace NJSAPI.Interfaces
{
    public interface IWorkBreakdownStructureRepository
    {
        IEnumerable<WorkBreakdownStructure> GetAllByProjectId(int projectId);
        WorkBreakdownStructure GetById(int id);
        WorkBreakdownStructure GetByProjectId(int projectId);
        void Add(WorkBreakdownStructure wbs);
        void Update(WorkBreakdownStructure wbs);
        void Delete(int id);
    }
}