// File: src/NJSAPI/Interfaces/IFeasibilityStudyRepository.cs
using NJSAPI.Interfaces;
using NJSAPI.Models;
using NJSAPI.Services;


namespace NJSAPI.Interfaces
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