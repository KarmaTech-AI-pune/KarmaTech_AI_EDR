// File: backend/src/models/FeasibilityStudy.cs
// Purpose: Feasibility Study model definition

namespace NJSAPI.Models
{
     public class FeasibilityStudy
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public string ProjectDetails { get; set; }
        public int StrategicRanking { get; set; }
        public decimal FinancialInformation { get; set; }
        public DateTime StudyDate { get; set; }
        public decimal ProbabilityAssessment { get; set; }
        public string CompetitionAnalysis { get; set; }
        public string FundingStream { get; set; }
        public string ContractType { get; set; }
        public string QualifyingCriteria { get; set; }
    }
}
