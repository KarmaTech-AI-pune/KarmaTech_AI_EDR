using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NJS.Domain.Enums;

namespace NJS.Domain.Entities
{
    public class GoNoGoDecisionHeader
    {
        [Key]
        public int Id { get; set; }
        public TypeOfBid TypeOfBid { get; set; }
        public string Sector { get; set; }
        public string BdHead { get; set; }
        public string Office { get; set; }
        public string? RegionalBDHead { get; set; }
        public string? Region{ get; set; }
        public string? TypeOfClient { get; set; }
        public double TenderFee { get; set; }
        public double Emd { get; set; }
        public int TotalScore { get; set; }
        public GoNoGoStatus Status { get; set; }

        public int OpportunityId { get; set; }

        [ForeignKey("OpportunityId")]
        public OpportunityTracking OpportunityTracking { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string UpdatedBy { get; set; }
        public string CreatedBy { get; set; }

        public int? CurrentVersion { get; set; }
        public GoNoGoVersionStatus? VersionStatus { get; set; }
        
        public virtual ICollection<GoNoGoVersion> Versions { get; set; }
    }
}
