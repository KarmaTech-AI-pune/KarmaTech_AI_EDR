//File: backend/src/NJS.Application/Interfaces/IFeasibilityStudyRepository.cs

//File: backend/src/NJS.Application/Interfaces/IFeasibilityStudyRepository.cs
using NJS.Domain.Entities;

namespace NJS.Repositories.Interfaces
{
    public interface IFeasibilityStudyRepository
    {
        IEnumerable<FeasibilityStudy> GetAll();
        FeasibilityStudy GetById(int id);
        FeasibilityStudy GetByProjectId(int projectId);
        void Add(FeasibilityStudy feasibilityStudy);
        void Update(FeasibilityStudy feasibilityStudy);
    }
}
