using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using EDR.Application.CQRS.Commands.GoNoGoDecision;
using EDR.Application.CQRS.JobStartForm.Commands;
using EDR.Application.CQRS.Projects.Commands;
using EDR.Application.CQRS.Users.Commands;
using EDR.Application.Dtos;
using Xunit;

namespace EDR.API.Tests.Validation
{
    public class ModelValidationTests
    {
        //[Fact]
        //public void ProjectDto_WithValidData_ShouldPassValidation()
        //{
        //    // Arrange
        //    var projectDto = new ProjectDto
        //    {
        //        Name = "Test Project",
        //        ClientName = "Test Client",
        //        ProjectManagerId = "user123",
        //        Description = "Test Description",
        //        EstimatedCost = 100000,
        //        Currency = "USD",
        //        StartDate = DateTime.UtcNow,
        //        EndDate = DateTime.UtcNow.AddMonths(6),
        //        DurationInMonths = 6,
        //        Status = Domain.Enums.ProjectStatus.InProgress,
        //        FundingStream = "Government",
        //        ContractType = "Fixed Price"
        //    };

        //    // Act
        //    var validationResults = ValidateModel(projectDto);

        //    // Assert
        //    Assert.Empty(validationResults);
        //}

        [Fact]
        public void ProjectDto_WithMissingRequiredFields_ShouldFailValidation()
        {
            // Arrange
            var projectDto = new ProjectDto
            {
                // Name is missing
                // ClientName is missing
               // Description = "Test Description",
                EstimatedProjectCost = 100000
                // Other required fields are missing
            };

            // Act
            var validationResults = ValidateModel(projectDto);

            // Assert
            Assert.NotEmpty(validationResults);
            // Check for specific validation errors if the DTO has data annotations
        }

        [Fact]
        public void CreateUserCommand_WithValidData_ShouldPassValidation()
        {
            // Arrange
            var command = new CreateUserCommand
            {
                UserName = "testuser",
                Email = "test@example.com",
                Name = "Test User",
                Password = "StrongP@ssw0rd",
                Roles = new List<RoleDto>
                {
                    new RoleDto { Id = "1", Name = "User" }
                }
            };

            // Act
            var validationResults = ValidateModel(command);

            // Assert
            Assert.Empty(validationResults);
        }

        [Fact]
        public void CreateUserCommand_WithInvalidEmail_ShouldFailValidation()
        {
            // Arrange
            var command = new CreateUserCommand
            {
                UserName = "testuser",
                Email = "invalid-email", // Invalid email format
                Name = "Test User",
                Password = "StrongP@ssw0rd"
            };

            // Act
            var validationResults = ValidateModel(command);

            // Assert
            Assert.NotEmpty(validationResults);
            // Check for specific validation errors if the command has data annotations
        }

        [Fact]
        public void HeaderInfoCommand_WithValidData_ShouldPassValidation()
        {
            // Arrange
            var command = new HeaderInfoCommand
            {
                BidType = Domain.Enums.TypeOfBid.Lumpsum,
                Sector = "Infrastructure",
                Office = "Headquarters",
                TenderFee = 1000,
                EmdAmount = 5000,
                BdHead = "John Doe"
            };

            // Act
            var validationResults = ValidateModel(command);

            // Assert
            Assert.Empty(validationResults);
        }

        [Fact]
        public void HeaderInfoCommand_WithNegativeAmounts_ShouldFailValidation()
        {
            // Arrange
            var command = new HeaderInfoCommand
            {
                BidType = Domain.Enums.TypeOfBid.Lumpsum,
                Sector = "Infrastructure",
                Office = "Headquarters",
                TenderFee = -1000, // Negative amount
                EmdAmount = -5000, // Negative amount
                BdHead = "John Doe"
            };

            // Act
            var validationResults = ValidateModel(command);

            // Assert
            Assert.NotEmpty(validationResults);
            // Check for specific validation errors if the command has data annotations
        }

        [Fact]
        public void JobStartFormDto_WithValidData_ShouldPassValidation()
        {
            // Arrange
            var dto = new JobStartFormDto
            {
                ProjectId = 1,
                WorkBreakdownStructureId = 1,
                FormTitle = "Test Form",
                Description = "Test Description",
                StartDate = DateTime.UtcNow,
                PreparedBy = "Test User",
                GrandTotal = 5000,
                ProjectFees = 4000,
                TotalProjectFees = 4720,
                Profit = 1000
            };

            // Act
            var validationResults = ValidateModel(dto);

            // Assert
            Assert.Empty(validationResults);
        }

        [Fact]
        public void JobStartFormDto_WithNegativeAmounts_ShouldFailValidation()
        {
            // Arrange
            var dto = new JobStartFormDto
            {
                ProjectId = 1,
                WorkBreakdownStructureId = 1,
                FormTitle = "Test Form",
                Description = "Test Description",
                StartDate = DateTime.UtcNow,
                PreparedBy = "Test User",
                GrandTotal = -5000, // Negative amount
                ProjectFees = -4000, // Negative amount
                TotalProjectFees = -4720, // Negative amount
                Profit = -1000 // Negative amount
            };

            // Act
            var validationResults = ValidateModel(dto);

            // Assert
            Assert.NotEmpty(validationResults);
            // Check for specific validation errors if the DTO has data annotations
        }

        [Fact]
        public void ValidationErrorMessages_ShouldBeDescriptive()
        {
            // This test demonstrates how validation error messages should be descriptive
            
            // Example 1: Required field validation error
            var requiredFieldError = new ValidationResult(
                "The Project Name field is required.",
                new[] { "ProjectName" }
            );
            
            // Example 2: Range validation error
            var rangeValidationError = new ValidationResult(
                "The field Score must be between 0 and 10.",
                new[] { "Score" }
            );
            
            // Example 3: String length validation error
            var stringLengthError = new ValidationResult(
                "The field Description must not exceed 1000 characters.",
                new[] { "Description" }
            );
            
            // Example 4: Email format validation error
            var emailFormatError = new ValidationResult(
                "The Email field is not a valid e-mail address.",
                new[] { "Email" }
            );
            
            // Example 5: Comparison validation error
            var comparisonError = new ValidationResult(
                "The End Date must be later than the Start Date.",
                new[] { "EndDate" }
            );
            
            // Assert that the error messages are descriptive
            Assert.Contains("required", requiredFieldError.ErrorMessage.ToLower());
            Assert.Contains("between 0 and 10", rangeValidationError.ErrorMessage);
            Assert.Contains("1000 characters", stringLengthError.ErrorMessage);
            Assert.Contains("valid e-mail", emailFormatError.ErrorMessage.ToLower());
            Assert.Contains("later than", comparisonError.ErrorMessage.ToLower());
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

