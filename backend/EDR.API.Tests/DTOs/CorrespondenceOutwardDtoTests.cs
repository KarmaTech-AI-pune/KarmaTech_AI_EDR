using EDR.Application.DTOs;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Xunit;

namespace EDR.API.Tests.DTOs
{
    public class CorrespondenceOutwardDtoTests
    {
        [Fact]
        public void CorrespondenceOutwardDto_ValidData_PassesValidation()
        {
            // Arrange
            var dto = new CorrespondenceOutwardDto
            {
                Id = 1,
                ProjectId = 1,
                LetterNo = "NJS/OUT/2024/001",
                LetterDate = DateTime.Now.AddDays(-1),
                To = "Public Health Engineering Department",
                Subject = "Response to Population Projections for STP Design",
                AttachmentDetails = "STP_Design_Review.pdf",
                ActionTaken = "Sent via email and hard copy",
                StoragePath = "/documents/outward/2024/001",
                Remarks = "Urgent review completed",
                Acknowledgement = "Received on 2024-01-15",
                CreatedBy = "Test Creator",
                CreatedAt = DateTime.Now.AddDays(-1),
                UpdatedBy = "Test Updater",
                UpdatedAt = DateTime.Now
            };

            // Act
            var validationResults = ValidateModel(dto);

            // Assert
            Assert.Empty(validationResults);
        }

        [Fact]
        public void CorrespondenceOutwardDto_HasAllRequiredProperties()
        {
            // Arrange
            var expectedProperties = new List<string>
            {
                "Id", "ProjectId", "LetterNo", "LetterDate", "To",
                "Subject", "AttachmentDetails", "ActionTaken", "StoragePath", 
                "Remarks", "Acknowledgement", "CreatedAt", "UpdatedAt",
                "CreatedBy", "UpdatedBy"
            };

            // Act
            var actualProperties = typeof(CorrespondenceOutwardDto).GetProperties();

            // Assert
            foreach (var expectedProperty in expectedProperties)
            {
                Assert.Contains(actualProperties, p => p.Name == expectedProperty);
            }
        }

        [Fact]
        public void CorrespondenceOutwardDto_PropertiesHaveCorrectTypes()
        {
            // Arrange & Act
            var idProperty = typeof(CorrespondenceOutwardDto).GetProperty("Id");
            var projectIdProperty = typeof(CorrespondenceOutwardDto).GetProperty("ProjectId");
            var letterNoProperty = typeof(CorrespondenceOutwardDto).GetProperty("LetterNo");
            var letterDateProperty = typeof(CorrespondenceOutwardDto).GetProperty("LetterDate");
            var toProperty = typeof(CorrespondenceOutwardDto).GetProperty("To");
            var subjectProperty = typeof(CorrespondenceOutwardDto).GetProperty("Subject");
            var acknowledgementProperty = typeof(CorrespondenceOutwardDto).GetProperty("Acknowledgement");
            var createdAtProperty = typeof(CorrespondenceOutwardDto).GetProperty("CreatedAt");
            var updatedAtProperty = typeof(CorrespondenceOutwardDto).GetProperty("UpdatedAt");

            // Assert
            Assert.Equal(typeof(int), idProperty.PropertyType);
            Assert.Equal(typeof(int), projectIdProperty.PropertyType);
            Assert.Equal(typeof(string), letterNoProperty.PropertyType);
            Assert.Equal(typeof(DateTime), letterDateProperty.PropertyType);
            Assert.Equal(typeof(string), toProperty.PropertyType);
            Assert.Equal(typeof(string), subjectProperty.PropertyType);
            Assert.Equal(typeof(string), acknowledgementProperty.PropertyType);
            Assert.Equal(typeof(DateTime), createdAtProperty.PropertyType);
            Assert.Equal(typeof(DateTime?), updatedAtProperty.PropertyType);
        }

        private IList<ValidationResult> ValidateModel(object model)
        {
            var validationResults = new List<ValidationResult>();
            var ctx = new ValidationContext(model, null, null);
            Validator.TryValidateObject(model, ctx, validationResults, true);
            return validationResults;
        }
    }
}

