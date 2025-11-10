using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NJS.Domain.Enums;


namespace NJS.Domain.Entities
{
    public class GoNoGoDecisionOpportunity : ITenantEntity
    {
        [Key]
        public int Id { get; set; }

        public int TenantId { get; set; }
        public TypeOfBid TypeOfBid { get; set; }
        public string Sector { get; set; }
        public string BdHead { get; set; }
        public string Office { get; set; }
        public string RegionalBDHead { get; set; }
        public string Region { get; set; }
        public string TypeOfClient { get; set; }
        public string EnderFee { get; set; }
        public string Emd { get; set; }

        public int  OpportunityId { get; set; }


        public int? ScoringCriteriaId { get; set; }

        [ForeignKey("ScoringCriteriaId")]
        public ScoringCriteria ScoringCriterias { get; set; }

        public int? ScoreRangeId { get; set; }

        [ForeignKey("ScoreRangeId")]
        public ScoreRange ScoreRanges { get; set; }

        

        


    }
}
