using NJS.Domain.Enums;
using System;

namespace NJS.Application.Dtos
{
    /// <summary>
    /// Summary Data Transfer Object for Go/No-Go Decision with percentage-based scoring
    /// </summary>
    public class GoNoGoSummaryDto
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        
        /// <summary>
        /// Raw total score (sum of all individual criterion scores, range: 0-120)
        /// </summary>
        public int TotalScore { get; set; }
        
        /// <summary>
        /// Raw total score for backward compatibility (same as TotalScore)
        /// </summary>
        public int RawTotalScore { get; set; }
        
        /// <summary>
        /// Score expressed as percentage of maximum possible score (range: 0-100%)
        /// Calculated as: (RawTotalScore / 120) × 100
        /// </summary>
        public int ScorePercentage { get; set; }
        
        /// <summary>
        /// Maximum possible total score (always 120 = 12 criteria × 10 points each)
        /// </summary>
        public int MaxPossibleScore { get; set; } = 120;
        
        /// <summary>
        /// Indicates whether a perfect score was achieved (true if RawTotalScore = 120)
        /// </summary>
        public bool IsPerfectScore { get; set; }
        
        /// <summary>
        /// Legacy property - always false (capping logic has been replaced with percentage calculation)
        /// </summary>
        [Obsolete("Use IsPerfectScore instead. Capping logic has been replaced with percentage calculation.")]
        public bool IsScoreCapped { get; set; } = false;
        
        public GoNoGoStatus Status { get; set; }
        public string? DecisionComments { get; set; }
        public DateTime CompletedDate { get; set; }
        public string? CompletedBy { get; set; }
        public DateTime? ApprovedDate { get; set; }
        public string? ApprovedBy { get; set; }
    }
}