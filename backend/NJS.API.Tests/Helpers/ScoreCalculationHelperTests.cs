using NJS.Application.Helpers;
using NJS.Domain.Entities;
using Xunit;

namespace NJS.API.Tests.Helpers
{
    public class ScoreCalculationHelperTests
    {
        [Fact]
        public void CalculateCappedTotalScore_WithScoresUnder100_ReturnsActualTotal()
        {
            // Arrange
            var decision = new GoNoGoDecision
            {
                MarketingPlanScore = 8,
                ClientRelationshipScore = 7,
                ProjectKnowledgeScore = 6,
                TechnicalEligibilityScore = 8,
                FinancialEligibilityScore = 7,
                StaffAvailabilityScore = 6,
                CompetitionAssessmentScore = 8,
                CompetitivePositionScore = 7,
                FutureWorkPotentialScore = 6,
                ProfitabilityScore = 8,
                ResourceAvailabilityScore = 7,
                BidScheduleScore = 6
                // Total: 84
            };

            // Act
            var result = ScoreCalculationHelper.CalculateCappedTotalScore(decision);

            // Assert
            Assert.Equal(84, result);
        }

        [Fact]
        public void CalculateCappedTotalScore_WithScoresOver100_ReturnsCappedAt100()
        {
            // Arrange
            var decision = new GoNoGoDecision
            {
                MarketingPlanScore = 10,
                ClientRelationshipScore = 10,
                ProjectKnowledgeScore = 10,
                TechnicalEligibilityScore = 10,
                FinancialEligibilityScore = 10,
                StaffAvailabilityScore = 10,
                CompetitionAssessmentScore = 10,
                CompetitivePositionScore = 10,
                FutureWorkPotentialScore = 10,
                ProfitabilityScore = 10,
                ResourceAvailabilityScore = 10,
                BidScheduleScore = 10
                // Total: 120
            };

            // Act
            var result = ScoreCalculationHelper.CalculateCappedTotalScore(decision);

            // Assert
            Assert.Equal(100, result);
        }

        [Fact]
        public void GetRawTotalScore_ReturnsUncappedSum()
        {
            // Arrange
            var decision = new GoNoGoDecision
            {
                MarketingPlanScore = 10,
                ClientRelationshipScore = 10,
                ProjectKnowledgeScore = 10,
                TechnicalEligibilityScore = 10,
                FinancialEligibilityScore = 10,
                StaffAvailabilityScore = 10,
                CompetitionAssessmentScore = 10,
                CompetitivePositionScore = 10,
                FutureWorkPotentialScore = 10,
                ProfitabilityScore = 10,
                ResourceAvailabilityScore = 10,
                BidScheduleScore = 10
                // Total: 120
            };

            // Act
            var result = ScoreCalculationHelper.GetRawTotalScore(decision);

            // Assert
            Assert.Equal(120, result);
        }

        [Fact]
        public void IsScoreCapped_WithScoresOver100_ReturnsTrue()
        {
            // Arrange
            var decision = new GoNoGoDecision
            {
                MarketingPlanScore = 10,
                ClientRelationshipScore = 10,
                ProjectKnowledgeScore = 10,
                TechnicalEligibilityScore = 10,
                FinancialEligibilityScore = 10,
                StaffAvailabilityScore = 10,
                CompetitionAssessmentScore = 10,
                CompetitivePositionScore = 10,
                FutureWorkPotentialScore = 10,
                ProfitabilityScore = 10,
                ResourceAvailabilityScore = 10,
                BidScheduleScore = 1
                // Total: 111
            };

            // Act
            var result = ScoreCalculationHelper.IsScoreCapped(decision);

            // Assert
            Assert.True(result);
        }

        [Fact]
        public void IsScoreCapped_WithScoresUnder100_ReturnsFalse()
        {
            // Arrange
            var decision = new GoNoGoDecision
            {
                MarketingPlanScore = 8,
                ClientRelationshipScore = 7,
                ProjectKnowledgeScore = 6,
                TechnicalEligibilityScore = 8,
                FinancialEligibilityScore = 7,
                StaffAvailabilityScore = 6,
                CompetitionAssessmentScore = 8,
                CompetitivePositionScore = 7,
                FutureWorkPotentialScore = 6,
                ProfitabilityScore = 8,
                ResourceAvailabilityScore = 7,
                BidScheduleScore = 6
                // Total: 84
            };

            // Act
            var result = ScoreCalculationHelper.IsScoreCapped(decision);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public void ApplyScoreCap_UpdatesTotalScoreProperty()
        {
            // Arrange
            var decision = new GoNoGoDecision
            {
                MarketingPlanScore = 10,
                ClientRelationshipScore = 10,
                ProjectKnowledgeScore = 10,
                TechnicalEligibilityScore = 10,
                FinancialEligibilityScore = 10,
                StaffAvailabilityScore = 10,
                CompetitionAssessmentScore = 10,
                CompetitivePositionScore = 10,
                FutureWorkPotentialScore = 10,
                ProfitabilityScore = 10,
                ResourceAvailabilityScore = 10,
                BidScheduleScore = 10,
                TotalScore = 0 // Initially 0
            };

            // Act
            ScoreCalculationHelper.ApplyScoreCap(decision);

            // Assert
            Assert.Equal(100, decision.TotalScore);
        }

        [Fact]
        public void GetScoreInfo_ReturnsCompleteScoreInformation()
        {
            // Arrange
            var decision = new GoNoGoDecision
            {
                MarketingPlanScore = 10,
                ClientRelationshipScore = 10,
                ProjectKnowledgeScore = 10,
                TechnicalEligibilityScore = 10,
                FinancialEligibilityScore = 10,
                StaffAvailabilityScore = 10,
                CompetitionAssessmentScore = 10,
                CompetitivePositionScore = 10,
                FutureWorkPotentialScore = 10,
                ProfitabilityScore = 10,
                ResourceAvailabilityScore = 10,
                BidScheduleScore = 5
                // Total: 115
            };

            // Act
            var result = ScoreCalculationHelper.GetScoreInfo(decision);

            // Assert
            Assert.Equal(115, result.RawTotalScore);
            Assert.Equal(100, result.CappedTotalScore);
            Assert.True(result.IsScoreCapped);
            Assert.Equal(100, result.MaxPossibleScore);
        }

        [Fact]
        public void CalculateCappedTotalScore_WithNullDecision_ThrowsArgumentNullException()
        {
            // Act & Assert
            Assert.Throws<ArgumentNullException>(() => 
                ScoreCalculationHelper.CalculateCappedTotalScore(null));
        }
    }
}