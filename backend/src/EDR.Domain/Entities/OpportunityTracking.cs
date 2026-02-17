using EDR.Domain.Enums;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EDR.Domain.Entities
{
    public class OpportunityTracking : IAuditableEntity, ITenantEntity
    {
        [Key]
        public int Id { get; set; }

        public int TenantId { get; set; }
        
        public string? BidNumber { get; set; }
        
        [Required]
        public string StrategicRanking { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal? BidFees { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal? Emd { get; set; }
        
        public string? FormOfEMD { get; set; }
        
        public string? BidManagerId { get; set; }
        
        public string? ReviewManagerId { get; set; }
        
        public string? ApprovalManagerId { get; set; }
        
        public string? ContactPersonAtClient { get; set; }
        
        public DateTime? DateOfSubmission { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal? PercentageChanceOfProjectHappening { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal? PercentageChanceOfNJSSuccess { get; set; }
        
        public string? LikelyCompetition { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal? GrossRevenue { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal? NetNJSRevenue { get; set; }
        
        public string? FollowUpComments { get; set; }
        
        public string? Notes { get; set; }
        
        public string? ProbableQualifyingCriteria { get; set; }
        
        [Required]
        public string? Operation { get; set; }
        
        [Required]
        public string? WorkName { get; set; }
        
        [Required]
        public string? Client { get; set; }
        
        [Required]
        public string? ClientSector { get; set; }
        
        public DateTime LikelyStartDate { get; set; }
        public OpportunityStage Stage { get; set; }
        
        [Required]
        public Enums.OpportunityTrackingStatus Status { get; set; }
        
        [Required]
        public string? Currency { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal CapitalValue { get; set; }
        
        public int DurationOfProject { get; set; }
        
        [Required]
        public string? FundingStream { get; set; }
        
        [Required]
        public string? ContractType { get; set; }       
      
      

        [ForeignKey("BidManagerId")]
        public User? BidManager { get; set; }

        [ForeignKey("ReviewManagerId")]
        public User? ReviewManager { get; set; }

        [ForeignKey("ApprovalManagerId")]
        public User? ApprovalManager { get; set; }

        // Audit fields
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }

        public ICollection<OpportunityHistory> OpportunityHistories { get; set; } = [];
    }
}

