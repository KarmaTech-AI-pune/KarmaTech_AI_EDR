using NJS.Domain.Enums;
using System;

namespace NJS.Application.Dtos
{
    public class GoNoGoSummaryDto
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public int TotalScore { get; set; } // Raw total score (0-120)
        public int RawTotalScore { get; set; } // For backward compatibility
        public int ScorePercentage { get; set; } // Percentage (0-100%)
        public int MaxPossibleScore { get; set; } = 120; // Always 120
        public bool IsPerfectScore { get; set; } // True if raw total = 120
        [Obsolete("Use IsPerfectScore instead. Capping logic has been replaced with percentage calculation.")]
        public bool IsScoreCapped { get; set; } = false; // Legacy property
        public GoNoGoStatus Status { get; set; }
        public string? DecisionComments { get; set; }
        public DateTime CompletedDate { get; set; }
        public string? CompletedBy { get; set; }
        public DateTime? ApprovedDate { get; set; }
        public string? ApprovedBy { get; set; }
    }
}