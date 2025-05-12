using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using NJS.Domain.Entities;
using NJS.Domain.Enums;
using Xunit;

namespace NJS.API.Tests.Validation
{
    public class GoNoGoDecisionValidationTests
    {
        [Fact]
        public void GoNoGoDecision_WithValidData_ShouldPassValidation()
        {
            // Arrange
            var decision = new GoNoGoDecision
            {
                ProjectId = 1,
                BidType = "Lumpsum",
                Sector = "Infrastructure",
                TenderFee = 1000,
                EMDAmount = 5000,
                MarketingPlanScore = 8,
                MarketingPlanComments = "Good marketing plan",
                ClientRelationshipScore = 7,
                ClientRelationshipComments = "Strong relationship with client",
                ProjectKnowledgeScore = 9,
                ProjectKnowledgeComments = "Team has excellent knowledge",
                TechnicalEligibilityScore = 8,
                TechnicalEligibilityComments = "Team is technically eligible",
                FinancialEligibilityScore = 7,
                FinancialEligibilityComments = "Financially sound",
                StaffAvailabilityScore = 6,
                StaffAvailabilityComments = "Staff is available",
                CompetitionAssessmentScore = 7,
                CompetitionAssessmentComments = "Moderate competition",
                CompetitivePositionScore = 8,
                CompetitivePositionComments = "Strong position",
                FutureWorkPotentialScore = 9,
                FutureWorkPotentialComments = "High potential for future work",
                ProfitabilityScore = 8,
                ProfitabilityComments = "Good profit margin",
                ResourceAvailabilityScore = 7,
                ResourceAvailabilityComments = "Resources are available",
                BidScheduleScore = 8,
                BidScheduleComments = "Schedule is feasible",
                TotalScore = 85,
                Status = GoNoGoStatus.Green,
                CompletedDate = DateTime.UtcNow,
                CompletedBy = "Test User",
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "Test User"
            };

            // Act
            var validationResults = ValidateModel(decision);

            // Assert
            Assert.Empty(validationResults);
        }

        [Fact]
        public void GoNoGoDecision_WithMissingRequiredFields_ShouldFailValidation()
        {
            // Arrange
            var decision = new GoNoGoDecision
            {
                // Missing required fields
                ProjectId = 1,
                // BidType is missing
                // Sector is missing
                TenderFee = 1000,
                EMDAmount = 5000
                // Other required fields are missing
            };

            // Act
            var validationResults = ValidateModel(decision);

            // Assert
            Assert.NotEmpty(validationResults);
            Assert.Contains(validationResults, v => v.MemberNames.Contains("BidType"));
            Assert.Contains(validationResults, v => v.MemberNames.Contains("Sector"));
            Assert.Contains(validationResults, v => v.MemberNames.Contains("MarketingPlanScore"));
            Assert.Contains(validationResults, v => v.MemberNames.Contains("MarketingPlanComments"));
            
            // Display validation error messages
            foreach (var validationResult in validationResults)
            {
                Console.WriteLine($"Property: {string.Join(", ", validationResult.MemberNames)}, Error: {validationResult.ErrorMessage}");
            }
        }

        [Fact]
        public void GoNoGoDecision_WithInvalidScoreRange_ShouldFailValidation()
        {
            // Arrange
            var decision = new GoNoGoDecision
            {
                ProjectId = 1,
                BidType = "Lumpsum",
                Sector = "Infrastructure",
                TenderFee = 1000,
                EMDAmount = 5000,
                MarketingPlanScore = 12, // Invalid: should be 0-10
                MarketingPlanComments = "Good marketing plan",
                ClientRelationshipScore = -1, // Invalid: should be 0-10
                ClientRelationshipComments = "Strong relationship with client",
                ProjectKnowledgeScore = 9,
                ProjectKnowledgeComments = "Team has excellent knowledge",
                TechnicalEligibilityScore = 8,
                TechnicalEligibilityComments = "Team is technically eligible",
                FinancialEligibilityScore = 7,
                FinancialEligibilityComments = "Financially sound",
                StaffAvailabilityScore = 6,
                StaffAvailabilityComments = "Staff is available",
                CompetitionAssessmentScore = 7,
                CompetitionAssessmentComments = "Moderate competition",
                CompetitivePositionScore = 8,
                CompetitivePositionComments = "Strong position",
                FutureWorkPotentialScore = 9,
                FutureWorkPotentialComments = "High potential for future work",
                ProfitabilityScore = 8,
                ProfitabilityComments = "Good profit margin",
                ResourceAvailabilityScore = 7,
                ResourceAvailabilityComments = "Resources are available",
                BidScheduleScore = 8,
                BidScheduleComments = "Schedule is feasible",
                TotalScore = 85,
                Status = GoNoGoStatus.Green,
                CompletedDate = DateTime.UtcNow,
                CompletedBy = "Test User",
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "Test User"
            };

            // Act
            var validationResults = ValidateModel(decision);

            // Assert
            Assert.NotEmpty(validationResults);
            Assert.Contains(validationResults, v => v.MemberNames.Contains("MarketingPlanScore"));
            Assert.Contains(validationResults, v => v.MemberNames.Contains("ClientRelationshipScore"));
            
            // Display validation error messages
            foreach (var validationResult in validationResults)
            {
                Console.WriteLine($"Property: {string.Join(", ", validationResult.MemberNames)}, Error: {validationResult.ErrorMessage}");
            }
        }

        [Fact]
        public void GoNoGoDecision_WithInvalidStringLength_ShouldFailValidation()
        {
            // Arrange
            var decision = new GoNoGoDecision
            {
                ProjectId = 1,
                BidType = new string('A', 51), // Exceeds max length of 50
                Sector = new string('B', 51), // Exceeds max length of 50
                TenderFee = 1000,
                EMDAmount = 5000,
                MarketingPlanScore = 8,
                MarketingPlanComments = new string('C', 1001), // Exceeds max length of 1000
                ClientRelationshipScore = 7,
                ClientRelationshipComments = "Strong relationship with client",
                ProjectKnowledgeScore = 9,
                ProjectKnowledgeComments = "Team has excellent knowledge",
                TechnicalEligibilityScore = 8,
                TechnicalEligibilityComments = "Team is technically eligible",
                FinancialEligibilityScore = 7,
                FinancialEligibilityComments = "Financially sound",
                StaffAvailabilityScore = 6,
                StaffAvailabilityComments = "Staff is available",
                CompetitionAssessmentScore = 7,
                CompetitionAssessmentComments = "Moderate competition",
                CompetitivePositionScore = 8,
                CompetitivePositionComments = "Strong position",
                FutureWorkPotentialScore = 9,
                FutureWorkPotentialComments = "High potential for future work",
                ProfitabilityScore = 8,
                ProfitabilityComments = "Good profit margin",
                ResourceAvailabilityScore = 7,
                ResourceAvailabilityComments = "Resources are available",
                BidScheduleScore = 8,
                BidScheduleComments = "Schedule is feasible",
                TotalScore = 85,
                Status = GoNoGoStatus.Green,
                CompletedDate = DateTime.UtcNow,
                CompletedBy = new string('D', 101), // Exceeds max length of 100
                CreatedAt = DateTime.UtcNow,
                CreatedBy = new string('E', 101) // Exceeds max length of 100
            };

            // Act
            var validationResults = ValidateModel(decision);

            // Assert
            Assert.NotEmpty(validationResults);
            Assert.Contains(validationResults, v => v.MemberNames.Contains("BidType"));
            Assert.Contains(validationResults, v => v.MemberNames.Contains("Sector"));
            Assert.Contains(validationResults, v => v.MemberNames.Contains("MarketingPlanComments"));
            Assert.Contains(validationResults, v => v.MemberNames.Contains("CompletedBy"));
            Assert.Contains(validationResults, v => v.MemberNames.Contains("CreatedBy"));
            
            // Display validation error messages
            foreach (var validationResult in validationResults)
            {
                Console.WriteLine($"Property: {string.Join(", ", validationResult.MemberNames)}, Error: {validationResult.ErrorMessage}");
            }
        }

        // Helper method to validate a model
        private IList<ValidationResult> ValidateModel(object model)
        {
            var validationResults = new List<ValidationResult>();
            var validationContext = new ValidationContext(model);
            Validator.TryValidateObject(model, validationContext, validationResults, true);
            return validationResults;
        }
    }
}
