using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using EDR.Domain.Entities;
using Xunit;

namespace EDR.API.Tests.Validation
{
    public class ProjectValidationTests
    {
        [Fact]
        public void Project_WithValidData_ShouldPassValidation()
        {
            // Arrange
            var project = new Project
            {
                Name = "Test Project",
                ClientName = "Test Client",
                TypeOfClient = "Government",
                ProjectManagerId = "user123",
                Sector = "Infrastructure",
                Currency = "USD",
                Status = ProjectStatus.InProgress,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "Test User"
            };

            // Act
            var validationResults = ValidateModel(project);

            // Assert
            Assert.Empty(validationResults);
        }

        [Fact(Skip = "User requested fields to be nullable")]
        public void Project_WithMissingRequiredFields_ShouldFailValidation()
        {
            // Arrange
            var project = new Project
            {
                // Missing required fields
                ProjectManagerId = "user123",
                Status = ProjectStatus.InProgress,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "Test User"
            };

            // Act
            var validationResults = ValidateModel(project);

            // Assert
            Assert.NotEmpty(validationResults);
            Assert.Contains(validationResults, v => v.MemberNames.Contains("Name"));
            Assert.Contains(validationResults, v => v.MemberNames.Contains("ClientName"));
            Assert.Contains(validationResults, v => v.MemberNames.Contains("Sector"));
            Assert.Contains(validationResults, v => v.MemberNames.Contains("Currency"));
            
            // Display validation error messages
            foreach (var validationResult in validationResults)
            {
                Console.WriteLine($"Property: {string.Join(", ", validationResult.MemberNames)}, Error: {validationResult.ErrorMessage}");
            }
        }

        [Fact(Skip = "User requested string lengths to be unvalidated at entity level")]
        public void Project_WithInvalidStringLength_ShouldFailValidation()
        {
            // Arrange
            var project = new Project
            {
                Name = new string('A', 101), // Exceeds max length of 100
                ClientName = new string('B', 101), // Exceeds max length of 100
                TypeOfClient = new string('C', 51), // Exceeds max length of 50
                ProjectManagerId = "user123",
                Sector = new string('D', 51), // Exceeds max length of 50
                Currency = "USDD", // Exceeds max length of 3
                Status = ProjectStatus.InProgress,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = new string('E', 101) // Exceeds max length of 100
            };

            // Act
            var validationResults = ValidateModel(project);

            // Assert
            Assert.NotEmpty(validationResults);
            Assert.Contains(validationResults, v => v.MemberNames.Contains("Name"));
            Assert.Contains(validationResults, v => v.MemberNames.Contains("ClientName"));
            Assert.Contains(validationResults, v => v.MemberNames.Contains("TypeOfClient"));
            Assert.Contains(validationResults, v => v.MemberNames.Contains("Sector"));
            Assert.Contains(validationResults, v => v.MemberNames.Contains("Currency"));
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

