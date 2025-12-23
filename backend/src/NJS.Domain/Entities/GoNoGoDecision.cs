using NJS.Domain.Enums;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    [Table("GoNoGoDecisions")]
    public class GoNoGoDecision : ITenantEntity
    {
        [Key]
        public int Id { get; set; }

        public int TenantId { get; set; }

        // Foreign key to Project
        [Required]
        public int ProjectId { get; set; }

        [ForeignKey("ProjectId")]
        public virtual Project? Project { get; set; }

        // Basic Information
        [Required]
        [StringLength(50)]
        public string? BidType { get; set; } // Lumpsum/Item Rate

        [Required]
        [StringLength(50)]
        public string? Sector { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal TenderFee { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal EMDAmount { get; set; }

        // Removed SubmissionMode property

        // Rest of the class remains the same (all other properties)
        [Required]
        [Range(0, 10)]
        public int MarketingPlanScore { get; set; }

        [Required]
        [StringLength(1000)]
        public string? MarketingPlanComments { get; set; }

        [Required]
        [Range(0, 10)]
        public int ClientRelationshipScore { get; set; }

        [Required]
        [StringLength(1000)]
        public string? ClientRelationshipComments { get; set; }

        [Required]
        [Range(0, 10)]
        public int ProjectKnowledgeScore { get; set; }

        [Required]
        [StringLength(1000)]
        public string? ProjectKnowledgeComments { get; set; }

        [Required]
        [Range(0, 10)]
        public int TechnicalEligibilityScore { get; set; }

        [Required]
        [StringLength(1000)]
        public string? TechnicalEligibilityComments { get; set; }

        [Required]
        [Range(0, 10)]
        public int FinancialEligibilityScore { get; set; }

        [Required]
        [StringLength(1000)]
        public string? FinancialEligibilityComments { get; set; }

        [Required]
        [Range(0, 10)]
        public int StaffAvailabilityScore { get; set; }

        [Required]
        [StringLength(1000)]
        public string? StaffAvailabilityComments { get; set; }

        [Required]
        [Range(0, 10)]
        public int CompetitionAssessmentScore { get; set; }

        [Required]
        [StringLength(1000)]
        public string? CompetitionAssessmentComments { get; set; }

        [Required]
        [Range(0, 10)]
        public int CompetitivePositionScore { get; set; }

        [Required]
        [StringLength(1000)]
        public string? CompetitivePositionComments { get; set; }

        [Required]
        [Range(0, 10)]
        public int FutureWorkPotentialScore { get; set; }

        [Required]
        [StringLength(1000)]
        public string? FutureWorkPotentialComments { get; set; }

        [Required]
        [Range(0, 10)]
        public int ProfitabilityScore { get; set; }

        [Required]
        [StringLength(1000)]
        public string? ProfitabilityComments { get; set; }

        [Required]
        [Range(0, 10)]
        public int ResourceAvailabilityScore { get; set; }

        [Required]
        [StringLength(1000)]
        public string? ResourceAvailabilityComments { get; set; }

        [Required]
        [Range(0, 10)]
        public int BidScheduleScore { get; set; }

        [Required]
        [StringLength(1000)]
        public string? BidScheduleComments { get; set; }

        // Total Score and Decision
        [Required]
        public int TotalScore { get; set; }

        [Required]
        public GoNoGoStatus Status { get; set; }

        
        [StringLength(2000)]
        public string? DecisionComments { get; set; }

        // Approval Information
        [Required]
        public DateTime CompletedDate { get; set; }

        [Required]
        [StringLength(100)]
        public string? CompletedBy { get; set; }

        public DateTime? ReviewedDate { get; set; }

        [StringLength(100)]
        public string? ReviewedBy { get; set; }

        public DateTime? ApprovedDate { get; set; }

        [StringLength(100)]
        public string? ApprovedBy { get; set; }

        // Action Plan for Amber Status
        [StringLength(2000)]
        public string? ActionPlan { get; set; }

        // Audit Fields
        [Required]
        public DateTime CreatedAt { get; set; }

        [Required]
        [StringLength(100)]
        public string? CreatedBy { get; set; }

        public DateTime? LastModifiedAt { get; set; }

        [StringLength(100)]
        public string? LastModifiedBy { get; set; }

        /// <summary>
        /// Calculates the total score from all individual criterion scores
        /// TotalScore now stores the raw value (0-120) without capping
        /// </summary>
        /// <returns>Sum of all individual criterion scores</returns>
        public int CalculateRawTotalScore()
        {
            return MarketingPlanScore +
                   ClientRelationshipScore +
                   ProjectKnowledgeScore +
                   TechnicalEligibilityScore +
                   FinancialEligibilityScore +
                   StaffAvailabilityScore +
                   CompetitionAssessmentScore +
                   CompetitivePositionScore +
                   FutureWorkPotentialScore +
                   ProfitabilityScore +
                   ResourceAvailabilityScore +
                   BidScheduleScore;
        }

        /// <summary>
        /// Updates the TotalScore property with the raw total (no capping applied)
        /// </summary>
        public void UpdateTotalScore()
        {
            TotalScore = CalculateRawTotalScore();
        }

        /// <summary>
        /// Calculates the score percentage based on maximum possible score of 120
        /// </summary>
        /// <returns>Score percentage (0-100)</returns>
        public int CalculateScorePercentage()
        {
            int rawTotal = CalculateRawTotalScore();
            return (int)Math.Round((double)rawTotal / 120 * 100);
        }

        /// <summary>
        /// Determines if the total score is perfect (equals 120)
        /// </summary>
        /// <returns>True if score equals 120, false otherwise</returns>
        public bool IsPerfectScore()
        {
            return CalculateRawTotalScore() == 120;
        }

        /// <summary>
        /// Legacy method - replaced with percentage calculation
        /// </summary>
        /// <returns>Always false (capping logic removed)</returns>
        [Obsolete("Use IsPerfectScore instead. Capping logic has been replaced with percentage calculation.")]
        public bool IsScoreCapped()
        {
            return false;
        }
    }

   
}
