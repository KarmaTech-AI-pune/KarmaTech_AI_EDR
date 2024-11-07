//File: backend/src/NJS.Application/Interfaces/IWorkBreakdownStructureRepository.cs
using NJS.Domain.Entities;

namespace NJS.Repositories.Interfaces
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
