//File: backend/src/NJS.Domain/Entities/FeasibilityStudy.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NJS.Domain.Entities
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
