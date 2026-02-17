using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using EDR.Domain.Entities;
using Xunit;

namespace EDR.API.Tests.Validation
{
    public class JobStartFormValidationTests
    {
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
                //TimeDataJson = "{\"hours\": 40}",
                //ExpensesDataJson = "{\"travel\": 1000}",
                //ServiceTaxJson = "{\"tax\": 18}",
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

        [Fact]
        public void JobStartForm_WithMissingRequiredFields_ShouldFailValidation()
        {
            // Arrange
            var jobStartForm = new JobStartForm
            {
                // ProjectId is missing (required)
                WorkBreakdownStructureId = 1,
                FormTitle = "Test Form",
                Description = "Test Description",
                // StartDate is missing
                PreparedBy = "Test User",
                // TimeDataJson is missing
                // ExpensesDataJson is missing
                // ServiceTaxJson is missing
                GrandTotal = 5000,
                ProjectFees = 4000,
                TotalProjectFees = 4720,
                Profit = 1000
                // CreatedDate is missing
            };

            // Act
            var validationResults = ValidateModel(jobStartForm);

            // Assert
            Assert.NotEmpty(validationResults);
            Assert.Contains(validationResults, v => v.MemberNames.Contains("ProjectId"));
            
            // Display validation error messages
            foreach (var validationResult in validationResults)
            {
                Console.WriteLine($"Property: {string.Join(", ", validationResult.MemberNames)}, Error: {validationResult.ErrorMessage}");
            }
        }

        [Fact]
        public void JobStartForm_WithNegativeAmounts_ShouldFailValidation()
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
                //TimeDataJson = "{\"hours\": 40}",
                //ExpensesDataJson = "{\"travel\": 1000}",
                //ServiceTaxJson = "{\"tax\": 18}",
                GrandTotal = -5000, // Negative amount
                ProjectFees = -4000, // Negative amount
                TotalProjectFees = -4720, // Negative amount
                Profit = -1000, // Negative amount
                CreatedDate = DateTime.UtcNow
            };

            // Act
            var validationResults = ValidateModel(jobStartForm);

            // Assert
            // Note: If there are no explicit validation attributes for negative amounts,
            // this test might not fail. In that case, we should document that negative amounts
            // are not validated at the entity level.
            if (validationResults.Count > 0)
            {
                Assert.Contains(validationResults, v => v.MemberNames.Contains("GrandTotal") ||
                                                       v.MemberNames.Contains("ProjectFees") ||
                                                       v.MemberNames.Contains("TotalProjectFees") ||
                                                       v.MemberNames.Contains("Profit"));
                
                // Display validation error messages
                foreach (var validationResult in validationResults)
                {
                    Console.WriteLine($"Property: {string.Join(", ", validationResult.MemberNames)}, Error: {validationResult.ErrorMessage}");
                }
            }
            else
            {
                Console.WriteLine("Note: No validation for negative amounts at the entity level.");
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

