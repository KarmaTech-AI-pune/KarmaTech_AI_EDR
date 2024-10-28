
using NJSAPI.Interfaces;
using NJSAPI.Models;
using System.Collections.Generic;
using System.Linq;

namespace NJSAPI.Repositories
{
    public class FeasibilityStudyRepository : IFeasibilityStudyRepository
    {
        private static List<FeasibilityStudy> _feasibilityStudies = new List<FeasibilityStudy>();

        public IEnumerable<FeasibilityStudy> GetAll()
        {
            return _feasibilityStudies;
        }

        public FeasibilityStudy GetById(int id)
        {
            return _feasibilityStudies.FirstOrDefault(fs => fs.Id == id);
        }

        public FeasibilityStudy GetByProjectId(int projectId)
        {
            return _feasibilityStudies.FirstOrDefault(fs => fs.ProjectId == projectId);
        }

        public void Add(FeasibilityStudy feasibilityStudy)
        {
            feasibilityStudy.Id = _feasibilityStudies.Count + 1;
            _feasibilityStudies.Add(feasibilityStudy);
        }

        public void Update(FeasibilityStudy feasibilityStudy)
        {
            var existingStudy = _feasibilityStudies.FirstOrDefault(fs => fs.Id == feasibilityStudy.Id);
            if (existingStudy != null)
            {
                existingStudy.ProjectDetails = feasibilityStudy.ProjectDetails;
                existingStudy.StrategicRanking = feasibilityStudy.StrategicRanking;
                existingStudy.FinancialInformation = feasibilityStudy.FinancialInformation;
                existingStudy.StudyDate = feasibilityStudy.StudyDate;
                existingStudy.ProbabilityAssessment = feasibilityStudy.ProbabilityAssessment;
                existingStudy.CompetitionAnalysis = feasibilityStudy.CompetitionAnalysis;
                existingStudy.FundingStream = feasibilityStudy.FundingStream;
                existingStudy.ContractType = feasibilityStudy.ContractType;
                existingStudy.QualifyingCriteria = feasibilityStudy.QualifyingCriteria;
            }
        }
    }
}