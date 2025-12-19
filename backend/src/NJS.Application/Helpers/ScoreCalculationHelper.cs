using NJS.Domain.Entities;

namespace NJS.Application.Helpers
{
    /// <summary>
    /// Helper class for Go No-Go Decision score calculations with capping logic
    /// </summary>
    public static class ScoreCalculationHelper
    {
        /// <summary>
        /// Maximum allowable total score for Go No-Go Decision
        /// </summary>
        public const int MAX_TOTAL_SCORE = 100;

        /// <summary>
        /// Calculates the capped total score for a Go No-Go Decision
        /// </summary>
        /// <param name="decision">The Go No-Go Decision entity</param>
        /// <returns>Total score capped at MAX_TOTAL_SCORE (100)</returns>
        public static int CalculateCappedTotalScore(GoNoGoDecision decision)
        {
            if (decision == null)
                throw new ArgumentNullException(nameof(decision));

            int rawTotal = GetRawTotalScore(decision);
            return Math.Min(rawTotal, MAX_TOTAL_SCORE);
        }

        /// <summary>
        /// Calculates the raw (uncapped) total score for a Go No-Go Decision
        /// </summary>
        /// <param name="decision">The Go No-Go Decision entity</param>
        /// <returns>Sum of all individual criterion scores without capping</returns>
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
        /// Determines if the total score has been capped
        /// </summary>
        /// <param name="decision">The Go No-Go Decision entity</param>
        /// <returns>True if the raw total exceeds MAX_TOTAL_SCORE, false otherwise</returns>
        public static bool IsScoreCapped(GoNoGoDecision decision)
        {
            if (decision == null)
                throw new ArgumentNullException(nameof(decision));

            return GetRawTotalScore(decision) > MAX_TOTAL_SCORE;
        }

        /// <summary>
        /// Updates the TotalScore property of a Go No-Go Decision with the capped value
        /// </summary>
        /// <param name="decision">The Go No-Go Decision entity to update</param>
        public static void ApplyScoreCap(GoNoGoDecision decision)
        {
            if (decision == null)
                throw new ArgumentNullException(nameof(decision));

            decision.TotalScore = CalculateCappedTotalScore(decision);
        }

        /// <summary>
        /// Gets comprehensive score information including raw, capped, and capping status
        /// </summary>
        /// <param name="decision">The Go No-Go Decision entity</param>
        /// <returns>ScoreInfo object containing all score-related information</returns>
        public static ScoreInfo GetScoreInfo(GoNoGoDecision decision)
        {
            if (decision == null)
                throw new ArgumentNullException(nameof(decision));

            int rawTotal = GetRawTotalScore(decision);
            int cappedTotal = Math.Min(rawTotal, MAX_TOTAL_SCORE);
            bool isCapped = rawTotal > MAX_TOTAL_SCORE;

            return new ScoreInfo
            {
                RawTotalScore = rawTotal,
                CappedTotalScore = cappedTotal,
                IsScoreCapped = isCapped,
                MaxPossibleScore = MAX_TOTAL_SCORE
            };
        }
    }

    /// <summary>
    /// Contains comprehensive score information for a Go No-Go Decision
    /// </summary>
    public class ScoreInfo
    {
        /// <summary>
        /// The raw (uncapped) sum of all individual criterion scores
        /// </summary>
        public int RawTotalScore { get; set; }

        /// <summary>
        /// The total score after applying the cap (maximum 100)
        /// </summary>
        public int CappedTotalScore { get; set; }

        /// <summary>
        /// Indicates whether the score has been capped
        /// </summary>
        public bool IsScoreCapped { get; set; }

        /// <summary>
        /// The maximum possible total score (100)
        /// </summary>
        public int MaxPossibleScore { get; set; }
    }
}