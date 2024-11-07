//File: backend/src/NJS.Domain/Entities/Project.cs
using System.ComponentModel.DataAnnotations;

namespace NJS.Domain.Entities
{
    public class Project
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
        public string ClientName { get; set; }
        public decimal EstimatedCost { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string Status { get; set; }
        public int Progress { get; set; }

        public ICollection<FeasibilityStudy>? FeasibilityStudies { get; set; }
        public ICollection<GoNoGoDecision>? GoNoGoDecisions { get; set; }
        public WorkBreakdownStructure? WorkBreakdownStructure { get; set; }
    }
}
