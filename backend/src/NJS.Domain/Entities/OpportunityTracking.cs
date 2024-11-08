using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    [Table("OpportunityTrackings")]
    public class OpportunityTracking
    {
        [Key]
        public int Id { get; set; }

        // Foreign key to Project
        public int? ProjectId { get; set; }

        [ForeignKey("ProjectId")]
        public virtual Project? Project { get; set; }

        [Required]
        [StringLength(1)]
        public string? Stage { get; set; } // A, B, C, or D

        [Required]
        [StringLength(1)]
        public string? StrategicRanking { get; set; } // H, M, or L

        [Column(TypeName = "decimal(18,2)")]
        public decimal? BidFees { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? EMD { get; set; }

        [StringLength(20)]
        public string? FormOfEMD { get; set; }

        [Required]
        [StringLength(100)]
        public string? BidManager { get; set; }

        [StringLength(100)]
        public string? ContactPersonAtClient { get; set; }

        [Column(TypeName = "date")]
        public DateTime? DateOfSubmission { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal? PercentageChanceOfProjectHappening { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal? PercentageChanceOfNJSSuccess { get; set; }

        [StringLength(500)]
        public string? LikelyCompetition { get; set; }

        [Column(TypeName = "date")]
        public DateTime? DateOfResult { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? GrossRevenue { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? NetNJSRevenue { get; set; }

        [StringLength(1000)]
        public string? FollowUpComments { get; set; }

        [StringLength(1000)]
        public string? Notes { get; set; }

        [StringLength(500)]
        public string? ProbableQualifyingCriteria { get; set; }

        // Tracking Info
        [Required]
        public int Month { get; set; }

        [Required]
        public int Year { get; set; }

        [Required]
        [StringLength(100)]
        public string? TrackedBy { get; set; }

        // Audit Fields
        [Required]
        public DateTime CreatedAt { get; set; }

        [Required]
        [StringLength(100)]
        public string? CreatedBy { get; set; }

        public DateTime? LastModifiedAt { get; set; }

        [StringLength(100)]
        public string? LastModifiedBy { get; set; }
    }
}