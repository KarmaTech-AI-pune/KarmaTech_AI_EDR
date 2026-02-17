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
    public class CorrespondenceInwardCommandsTests
    {
        [Fact]
        public void CreateCorrespondenceInwardCommand_ValidData_PassesValidation()
        {
            // Arrange
            var command = new CreateCorrespondenceInwardCommand
            {
                ProjectId = 1,
                IncomingLetterNo = "PHED/2024/001",
                LetterDate = DateTime.Now.AddDays(-1),
                EdrInwardNo = "EDR/IN/2024/001",
                ReceiptDate = DateTime.Now,
                From = "Public Health Engineering Department",
                Subject = "Revised Population Projections for STP Design",
                AttachmentDetails = "Population_Projection_2045.pdf",
                ActionTaken = "Forwarded to Design Team for STP Capacity Review",
                StoragePath = "/documents/inward/2024/001",
                Remarks = "Urgent review required for capacity enhancement",
                RepliedDate = DateTime.Now.AddDays(-1),
                CreatedBy = "Test Creator"
            };

            // Act
            var validationResults = ValidateModel(command);

            // Assert
            Assert.Empty(validationResults);
        }

        [Fact]
        public void UpdateCorrespondenceInwardCommand_ValidData_PassesValidation()
        {
            // Arrange
            var command = new UpdateCorrespondenceInwardCommand
            {
                Id = 1,
                ProjectId = 1,
                IncomingLetterNo = "PHED/2024/001",
                LetterDate = DateTime.Now.AddDays(-1),
                EdrInwardNo = "EDR/IN/2024/001",
                ReceiptDate = DateTime.Now,
                From = "Public Health Engineering Department",
                Subject = "Revised Population Projections for STP Design",
                AttachmentDetails = "Population_Projection_2045.pdf",
                ActionTaken = "Forwarded to Design Team for STP Capacity Review",
                StoragePath = "/documents/inward/2024/001",
                Remarks = "Urgent review required for capacity enhancement",
                RepliedDate = DateTime.Now.AddDays(-1),
                UpdatedBy = "Test Updater"
            };

            // Act
            var validationResults = ValidateModel(command);

            // Assert
            Assert.Empty(validationResults);
        }

        [Fact]
        public void DeleteCorrespondenceInwardCommand_ValidData_PassesValidation()
        {
            // Arrange
            var command = new DeleteCorrespondenceInwardCommand
            {
                Id = 1
            };

            // Act
            var validationResults = ValidateModel(command);

            // Assert
            Assert.Empty(validationResults);
        }

        [Fact]
        public void CreateCorrespondenceInwardCommand_MissingRequiredFields_FailsValidation()
        {
            // Arrange
            var command = new CreateCorrespondenceInwardCommand();
            var validator = new CreateCorrespondenceInwardCommandValidator();

            // Act
            var validationResult = validator.Validate(command);

            // Assert
            Assert.False(validationResult.IsValid);
            Assert.Contains(validationResult.Errors, e => e.PropertyName == "ProjectId");
            Assert.Contains(validationResult.Errors, e => e.PropertyName == "IncomingLetterNo");
            Assert.Contains(validationResult.Errors, e => e.PropertyName == "EdrInwardNo");
            Assert.Contains(validationResult.Errors, e => e.PropertyName == "From");
            Assert.Contains(validationResult.Errors, e => e.PropertyName == "Subject");
        }

        [Fact]
        public void UpdateCorrespondenceInwardCommand_MissingRequiredFields_FailsValidation()
        {
            // Arrange
            var command = new UpdateCorrespondenceInwardCommand();
            var validator = new UpdateCorrespondenceInwardCommandValidator();

            // Act
            var validationResult = validator.Validate(command);

            // Assert
            Assert.False(validationResult.IsValid);
            Assert.Contains(validationResult.Errors, e => e.PropertyName == "Id");
            Assert.Contains(validationResult.Errors, e => e.PropertyName == "ProjectId");
            Assert.Contains(validationResult.Errors, e => e.PropertyName == "IncomingLetterNo");
            Assert.Contains(validationResult.Errors, e => e.PropertyName == "EdrInwardNo");
            Assert.Contains(validationResult.Errors, e => e.PropertyName == "From");
            Assert.Contains(validationResult.Errors, e => e.PropertyName == "Subject");
        }

        [Fact]
        public void DeleteCorrespondenceInwardCommand_MissingRequiredFields_FailsValidation()
        {
            // Arrange
            var command = new DeleteCorrespondenceInwardCommand();
            var validator = new DeleteCorrespondenceInwardCommandValidator();

            // Act
            var validationResult = validator.Validate(command);

            // Assert
            Assert.False(validationResult.IsValid);
            Assert.Contains(validationResult.Errors, e => e.PropertyName == "Id");
        }

        [Fact]
        public void CreateCorrespondenceInwardCommand_TooLongStrings_FailsValidation()
        {
            // Arrange
            var command = new CreateCorrespondenceInwardCommand
            {
                ProjectId = 1,
                IncomingLetterNo = new string('A', 256), // Too long
                LetterDate = DateTime.Now.AddDays(-1),
                EdrInwardNo = "EDR/IN/2024/001",
                ReceiptDate = DateTime.Now,
                From = "Public Health Engineering Department",
                Subject = "Revised Population Projections for STP Design",
                CreatedBy = "Test Creator"
            };

            // Act
            var validationResults = ValidateModel(command);

            // Assert
            Assert.NotEmpty(validationResults);
            Assert.Contains(validationResults, v => v.MemberNames.Contains("IncomingLetterNo"));
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


