using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace NJS.Domain.Entities
{
    public enum BidPreparationStatus
    {
        Draft,
        PendingApproval,
        Approved,
        Rejected
    }



    public class BidPreparation : IAuditableEntity, ITenantEntity
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public string DocumentCategoriesJson { get; set; }
        public int OpportunityId { get; set; }
        [ForeignKey("OpportunityId")]
        public OpportunityTracking OpportunityTracking { get; set; }
        public string UserId { get; set; }
        public string? RegionalMangerId { get; set; }
        [ForeignKey("RegionalMangerId")]
        public User RegionalManger { get; set; }

        public string? RegionalDirectorId { get; set; }
        public User RegionalDirector { get; set; }
        public int Version { get; set; }
        public BidPreparationStatus Status { get; set; }
        public string Comments { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string CreatedBy { get; set; }
        public string UpdatedBy { get; set; }
        public virtual ICollection<BidVersionHistory> VersionHistory { get; set; } = [];
    }

    public class BidVersionHistory
    {
        public int Id { get; set; }
        public int BidPreparationId { get; set; }
        [ForeignKey("BidPreparationId")]
        public BidPreparation BidPreparation { get; set; }
        public int Version { get; set; }
        public string DocumentCategoriesJson { get; set; }
        public BidPreparationStatus Status { get; set; }
        public string Comments { get; set; }
        public string ModifiedBy { get; set; }
        public DateTime ModifiedDate { get; set; }
    }
}
