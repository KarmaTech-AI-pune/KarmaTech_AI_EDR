using EDR.Domain.Entities;

namespace EDR.Application.Helpers
{
    /// <summary>
    /// Helper class for Go No-Go Decision score calculations with percentage logic
    /// </summary>
    public static class ScoreCalculationHelper
    {
        /// <summary>
        /// Maximum possible total score for Go No-Go Decision (12 criteria Ã— 10 points each)
        /// </summary>
        public const int MAX_POSSIBLE_SCORE = 120;

        /// <summary>
        /// Calculates the raw total score for a Go No-Go Decision
        /// </summary>
        /// <param name="decision">The Go No-Go Decision entity</param>
        /// <returns>Sum of all individual criterion scores (0-120)</returns>
        public static int GetRawTotalScore(GoNoGoDecision decision)
        {
            if (decision == null)
                throw new ArgumentNullException(nameof(decision));

            return decision.MarketingPlanScore +
                   decision.ClientRelationshipScore +
                   decision.ProjectKnowledgeScore +
                   decision.TechnicalEligibilityScore +
                   decision.FinancialEligibilityScore +
                   decision.StaffAvailabilityScore +
                   decision.CompetitionAssessmentScore +
                   decision.CompetitivePositionScore +
                   decision.FutureWorkPotentialScore +
                   decision.ProfitabilityScore +
                   decision.ResourceAvailabilityScore +
                   decision.BidScheduleScore;
        }

        /// <summary>
        /// Calculates the score percentage for a Go No-Go Decision
        /// </summary>
        /// <param name="decision">The Go No-Go Decision entity</param>
        /// <returns>Percentage of maximum possible score (0-100%)</returns>
        public static int CalculateScorePercentage(GoNoGoDecision decision)
        {
            if (decision == null)
                throw new ArgumentNullException(nameof(decision));

            int rawTotal = GetRawTotalScore(decision);
            return (int)Math.Round((double)rawTotal / MAX_POSSIBLE_SCORE * 100);
        }

        /// <summary>
        /// Determines if the decision achieved a perfect score
        /// </summary>
        /// <param name="decision">The Go No-Go Decision entity</param>
        /// <returns>True if the raw total equals MAX_POSSIBLE_SCORE (120), false otherwise</returns>
        public static bool IsPerfectScore(GoNoGoDecision decision)
        {
            if (decision == null)
                throw new ArgumentNullException(nameof(decision));

            return GetRawTotalScore(decision) == MAX_POSSIBLE_SCORE;
        }

        /// <summary>
        /// Updates the TotalScore property of a Go No-Go Decision with the raw total value
        /// </summary>
        /// <param name="decision">The Go No-Go Decision entity to update</param>
        public static void ApplyRawScore(GoNoGoDecision decision)
        {
            if (decision == null)
                throw new ArgumentNullException(nameof(decision));

            decision.TotalScore = GetRawTotalScore(decision);
        }

        /// <summary>
        /// Gets comprehensive score information including raw total, percentage, and perfect score status
        /// </summary>
        /// <param name="decision">The Go No-Go Decision entity</param>
        /// <returns>ScoreInfo object containing all score-related information</returns>
        public static ScoreInfo GetScoreInfo(GoNoGoDecision decision)
        {
            if (decision == null)
                throw new ArgumentNullException(nameof(decision));

            int rawTotal = GetRawTotalScore(decision);
            int percentage = (int)Math.Round((double)rawTotal / MAX_POSSIBLE_SCORE * 100);
            bool isPerfect = rawTotal == MAX_POSSIBLE_SCORE;

            return new ScoreInfo
            {
                RawTotalScore = rawTotal,
                ScorePercentage = percentage,
                IsPerfectScore = isPerfect,
                MaxPossibleScore = MAX_POSSIBLE_SCORE
            };
        }

        // Legacy methods for backward compatibility
        /// <summary>
        /// Legacy method - now returns raw total score (no capping)
        /// </summary>
        /// <param name="decision">The Go No-Go Decision entity</param>
        /// <returns>Raw total score (same as GetRawTotalScore)</returns>
        [Obsolete("Use GetRawTotalScore instead. Capping logic has been replaced with percentage calculation.")]
        public static int CalculateCappedTotalScore(GoNoGoDecision decision)
        {
            return GetRawTotalScore(decision);
        }

        /// <summary>
        /// Legacy method - now always returns false (no capping)
        /// </summary>
        /// <param name="decision">The Go No-Go Decision entity</param>
        /// <returns>Always false (capping logic removed)</returns>
        [Obsolete("Use IsPerfectScore instead. Capping logic has been replaced with percentage calculation.")]
        public static bool IsScoreCapped(GoNoGoDecision decision)
        {
            return false;
        }

        /// <summary>
        /// Legacy method - now applies raw score (no capping)
        /// </summary>
        /// <param name="decision">The Go No-Go Decision entity to update</param>
        [Obsolete("Use ApplyRawScore instead. Capping logic has been replaced with percentage calculation.")]
        public static void ApplyScoreCap(GoNoGoDecision decision)
        {
            ApplyRawScore(decision);
        }
    }

    /// <summary>
    /// Contains comprehensive score information for a Go No-Go Decision
    /// </summary>
    public class ScoreInfo
    {
        /// <summary>
        /// The raw sum of all individual criterion scores (0-120)
        /// </summary>
        public int RawTotalScore { get; set; }

        /// <summary>
        /// The score expressed as a percentage of maximum possible score (0-100%)
        /// </summary>
        public int ScorePercentage { get; set; }

        /// <summary>
        /// Indicates whether the decision achieved a perfect score (120/120)
        /// </summary>
        public bool IsPerfectScore { get; set; }

        /// <summary>
        /// The maximum possible total score (120)
        /// </summary>
        public int MaxPossibleScore { get; set; }

        // Legacy properties for backward compatibility
        /// <summary>
        /// Legacy property - now returns the same as RawTotalScore
        /// </summary>
        [Obsolete("Use RawTotalScore instead. Capping logic has been replaced with percentage calculation.")]
        public int CappedTotalScore 
        { 
            get => RawTotalScore; 
            set => RawTotalScore = value; 
        }

        /// <summary>
        /// Legacy property - now always returns false
        /// </summary>
        [Obsolete("Use IsPerfectScore instead. Capping logic has been replaced with percentage calculation.")]
        public bool IsScoreCapped 
        { 
            get => false; 
            set { /* Ignored */ } 
        }
    }
}
