using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using EDR.Domain.Entities;
using Xunit;

namespace EDR.API.Tests.Validation
{
    public class EntityValidationTests
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
                FutureWorkPotentialComments = "High potential for future work"
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
            Assert.Contains(validationResults, v => v.ErrorMessage.Contains("required"));
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
                ClientRelationshipScore = 7,
                ClientRelationshipComments = "Strong relationship with client"
                // Other fields omitted for brevity
            };

            // Act
            var validationResults = ValidateModel(decision);

            // Assert
            Assert.NotEmpty(validationResults);
            Assert.Contains(validationResults, v => v.MemberNames.Contains("MarketingPlanScore"));
            Assert.Contains(validationResults, v => v.ErrorMessage.Contains("range"));
        }

        [Fact]
        public void OpportunityTracking_WithValidData_ShouldPassValidation()
        {
            // Arrange
            var opportunity = new OpportunityTracking
            {
                WorkName = "Test Project",
                Client = "Test Client",
                ClientSector = "Infrastructure",
                Status = Domain.Enums.OpportunityTrackingStatus.BID_UNDER_PREPERATION,
                Currency = "USD",
                CapitalValue = 1000000,
                DurationOfProject = 12,
                FundingStream = "Government",
                ContractType = "Fixed Price",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // Act
            var validationResults = ValidateModel(opportunity);

            // Assert
            Assert.Empty(validationResults);
        }

        [Fact]
        public void OpportunityTracking_WithMissingRequiredFields_ShouldFailValidation()
        {
            // Arrange
            var opportunity = new OpportunityTracking
            {
                // Missing required fields
                WorkName = "Test Project",
                // ClientName is missing
                // ClientSector is missing
                Status = Domain.Enums.OpportunityTrackingStatus.BID_UNDER_PREPERATION,
                // Currency is missing
                CapitalValue = 1000000,
                DurationOfProject = 12
                // Other required fields are missing
            };

            // Act
            var validationResults = ValidateModel(opportunity);

            // Assert
            Assert.NotEmpty(validationResults);
            Assert.Contains(validationResults, v => v.MemberNames.Contains("ClientName"));
            Assert.Contains(validationResults, v => v.MemberNames.Contains("Currency"));
            Assert.Contains(validationResults, v => v.MemberNames.Contains("FundingStream"));
            Assert.Contains(validationResults, v => v.ErrorMessage.Contains("required"));
        }

        [Fact]
        public void JobStartForm_WithValidData_ShouldPassValidation()
        {
            // Arrange
            var jobStartForm = new JobStartForm
            {
                ProjectId = 1,
                WorkBreakdownStructureId = 1,
                FormTitle = "Test Form",
                Description = "Test Description",
                StartDate = DateTime.UtcNow,
                PreparedBy = "Test User",
               // TimeDataJson = "{\"hours\": 40}",
               // ExpensesDataJson = "{\"travel\": 1000}",
               // ServiceTaxJson = "{\"tax\": 18}",
                GrandTotal = 5000,
                ProjectFees = 4000,
                TotalProjectFees = 4720,
                Profit = 1000,
                CreatedDate = DateTime.UtcNow
            };

            // Act
            var validationResults = ValidateModel(jobStartForm);

            // Assert
            Assert.Empty(validationResults);
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

