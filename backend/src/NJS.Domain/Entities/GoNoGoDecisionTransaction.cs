using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NJS.Domain.Enums;

namespace NJS.Domain.Entities
{
    public class GoNoGoDecisionTransaction : ITenantEntity
    {
        [Key]
        public int Id { get; set; }

        public int TenantId { get; set; }
        public int Score { get; set; }
        public string Commits { get; set; }
        public int? GoNoGoDecisionHeaderId { get; set; }

        [ForeignKey("GoNoGoDecisionHeaderId")]
        public GoNoGoDecisionHeader GoNoGoDecisionHeader { get; set; }

        public int? ScoringCriteriaId { get; set; }

        [ForeignKey("ScoringCriteriaId")]
        public ScoringCriteria ScoringCriterias { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string UpdatedBy { get; set; }
        public string CreatedBy { get; set; }
    }
}
