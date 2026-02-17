using FluentValidation;
using EDR.API.Tests.CQRS.Correspondence.Validators;
using EDR.Application.CQRS.Correspondence.Commands;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using Xunit;

namespace EDR.API.Tests.CQRS.Correspondence.Commands
{
    public class CorrespondenceOutwardCommandsTests
    {
        [Fact]
        public void CreateCorrespondenceOutwardCommand_ValidData_PassesValidation()
        {
            // Arrange
            var command = new CreateCorrespondenceOutwardCommand
            {
                ProjectId = 1,
                LetterNo = "EDR/OUT/2024/001",
                LetterDate = DateTime.Now.AddDays(-1),
                To = "Public Health Engineering Department",
                Subject = "Response to Population Projections for STP Design",
                AttachmentDetails = "STP_Design_Review.pdf",
                ActionTaken = "Sent via email and hard copy",
                StoragePath = "/documents/outward/2024/001",
                Remarks = "Urgent review completed",
                Acknowledgement = "Received on 2024-01-15",
                CreatedBy = "Test Creator"
            };

            // Act
            var validationResults = ValidateModel(command);

            // Assert
            Assert.Empty(validationResults);
        }

        [Fact]
        public void UpdateCorrespondenceOutwardCommand_ValidData_PassesValidation()
        {
            // Arrange
            var command = new UpdateCorrespondenceOutwardCommand
            {
                Id = 1,
                ProjectId = 1,
                LetterNo = "EDR/OUT/2024/001",
                LetterDate = DateTime.Now.AddDays(-1),
                To = "Public Health Engineering Department",
                Subject = "Response to Population Projections for STP Design",
                AttachmentDetails = "STP_Design_Review.pdf",
                ActionTaken = "Sent via email and hard copy",
                StoragePath = "/documents/outward/2024/001",
                Remarks = "Urgent review completed",
                Acknowledgement = "Received on 2024-01-15",
                UpdatedBy = "Test Updater"
            };

            // Act
            var validationResults = ValidateModel(command);

            // Assert
            Assert.Empty(validationResults);
        }

        [Fact]
        public void DeleteCorrespondenceOutwardCommand_ValidData_PassesValidation()
        {
            // Arrange
            var command = new DeleteCorrespondenceOutwardCommand
            {
                Id = 1
            };

            // Act
            var validationResults = ValidateModel(command);

            // Assert
            Assert.Empty(validationResults);
        }

        [Fact]
        public void CreateCorrespondenceOutwardCommand_MissingRequiredFields_FailsValidation()
        {
            // Arrange
            var command = new CreateCorrespondenceOutwardCommand();
            var validator = new CreateCorrespondenceOutwardCommandValidator();

            // Act
            var validationResult = validator.Validate(command);

            // Assert
            Assert.False(validationResult.IsValid);
            Assert.Contains(validationResult.Errors, e => e.PropertyName == "ProjectId");
            Assert.Contains(validationResult.Errors, e => e.PropertyName == "LetterNo");
            Assert.Contains(validationResult.Errors, e => e.PropertyName == "To");
            Assert.Contains(validationResult.Errors, e => e.PropertyName == "Subject");
        }

        [Fact]
        public void UpdateCorrespondenceOutwardCommand_MissingRequiredFields_FailsValidation()
        {
            // Arrange
            var command = new UpdateCorrespondenceOutwardCommand();
            var validator = new UpdateCorrespondenceOutwardCommandValidator();

            // Act
            var validationResult = validator.Validate(command);

            // Assert
            Assert.False(validationResult.IsValid);
            Assert.Contains(validationResult.Errors, e => e.PropertyName == "Id");
            Assert.Contains(validationResult.Errors, e => e.PropertyName == "ProjectId");
            Assert.Contains(validationResult.Errors, e => e.PropertyName == "LetterNo");
            Assert.Contains(validationResult.Errors, e => e.PropertyName == "To");
            Assert.Contains(validationResult.Errors, e => e.PropertyName == "Subject");
        }

        [Fact]
        public void DeleteCorrespondenceOutwardCommand_MissingRequiredFields_FailsValidation()
        {
            // Arrange
            var command = new DeleteCorrespondenceOutwardCommand();
            var validator = new DeleteCorrespondenceOutwardCommandValidator();

            // Act
            var validationResult = validator.Validate(command);

            // Assert
            Assert.False(validationResult.IsValid);
            Assert.Contains(validationResult.Errors, e => e.PropertyName == "Id");
        }

        [Fact]
        public void CreateCorrespondenceOutwardCommand_TooLongStrings_FailsValidation()
        {
            // Arrange
            var command = new CreateCorrespondenceOutwardCommand
            {
                ProjectId = 1,
                LetterNo = new string('A', 256), // Too long
                LetterDate = DateTime.Now.AddDays(-1),
                To = "Public Health Engineering Department",
                Subject = "Response to Population Projections for STP Design",
                CreatedBy = "Test Creator"
            };

            // Act
            var validationResults = ValidateModel(command);

            // Assert
            Assert.NotEmpty(validationResults);
            Assert.Contains(validationResults, v => v.MemberNames.Contains("LetterNo"));
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


