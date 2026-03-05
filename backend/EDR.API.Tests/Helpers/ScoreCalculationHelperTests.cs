using EDR.Application.Helpers;
using EDR.Domain.Entities;
using System;
using Xunit;

namespace EDR.API.Tests.Helpers
{
    public class ScoreCalculationHelperTests
    {
        [Fact]
        public void GetRawTotalScore_WithScoresUnder100_ReturnsActualTotal()
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
            var result = ScoreCalculationHelper.GetRawTotalScore(decision);

            // Assert
            Assert.Equal(84, result);
        }

        [Fact]
        public void GetRawTotalScore_WithScoresOver100_ReturnsRawTotal()
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
        public void CalculateScorePercentage_ReturnsCorrectPercentage()
        {
            // Arrange
            var decision = new GoNoGoDecision
            {
                MarketingPlanScore = 5,
                ClientRelationshipScore = 5,
                ProjectKnowledgeScore = 5,
                TechnicalEligibilityScore = 5,
                FinancialEligibilityScore = 5,
                StaffAvailabilityScore = 5,
                CompetitionAssessmentScore = 5,
                CompetitivePositionScore = 5,
                FutureWorkPotentialScore = 5,
                ProfitabilityScore = 5,
                ResourceAvailabilityScore = 5,
                BidScheduleScore = 5
                // Total: 60
            };

            // Act
            var result = ScoreCalculationHelper.CalculateScorePercentage(decision);

            // Assert
            Assert.Equal(50, result); // 60/120 * 100 = 50%
        }

        [Fact]
        public void IsPerfectScore_WithPerfectScore_ReturnsTrue()
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
            var result = ScoreCalculationHelper.IsPerfectScore(decision);

            // Assert
            Assert.True(result);
        }

        [Fact]
        public void IsPerfectScore_WithNonPerfectScore_ReturnsFalse()
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
                BidScheduleScore = 9
                // Total: 119
            };

            // Act
            var result = ScoreCalculationHelper.IsPerfectScore(decision);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public void ApplyRawScore_UpdatesTotalScoreProperty()
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
                TotalScore = 0
            };

            // Act
            ScoreCalculationHelper.ApplyRawScore(decision);

            // Assert
            Assert.Equal(120, decision.TotalScore);
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
            Assert.Equal(96, result.ScorePercentage); // 115/120 * 100 = 95.83, rounded to 96
            Assert.False(result.IsPerfectScore);
            Assert.Equal(120, result.MaxPossibleScore);
        }

        [Fact]
        public void GetRawTotalScore_WithNullDecision_ThrowsArgumentNullException()
        {
            // Act & Assert
            Assert.Throws<ArgumentNullException>(() => 
                ScoreCalculationHelper.GetRawTotalScore(null));
        }
    }
}
