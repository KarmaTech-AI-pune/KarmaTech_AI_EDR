using FluentValidation;
using EDR.Application.CQRS.Correspondence.Commands;
using System;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.Validation
{
    public class UpdateCorrespondenceOutwardCommandValidatorTests
    {
        private readonly UpdateCorrespondenceOutwardCommandValidator _validator;

        public UpdateCorrespondenceOutwardCommandValidatorTests()
        {
            _validator = new UpdateCorrespondenceOutwardCommandValidator();
        }

        [Fact]
        public async Task Validate_WithValidCommand_ShouldPass()
        {
            // Arrange
            var command = new UpdateCorrespondenceOutwardCommand
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
                UpdatedBy = "Test User"
            };

            // Act
            var result = await _validator.ValidateAsync(command);

            // Assert
            Assert.True(result.IsValid);
            Assert.Empty(result.Errors);
        }

        [Fact]
        public async Task Validate_WithInvalidId_ShouldFail()
        {
            // Arrange
            var command = new UpdateCorrespondenceOutwardCommand
            {
                Id = 0, // Invalid Id
                ProjectId = 1,
                LetterNo = "NJS/OUT/2024/001",
                LetterDate = DateTime.Now.AddDays(-1),
                To = "Public Health Engineering Department",
                Subject = "Response to Population Projections for STP Design",
                UpdatedBy = "Test User"
            };

            // Act
            var result = await _validator.ValidateAsync(command);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.PropertyName == "Id");
        }

        [Fact]
        public async Task Validate_WithInvalidProjectId_ShouldFail()
        {
            // Arrange
            var command = new UpdateCorrespondenceOutwardCommand
            {
                Id = 1,
                ProjectId = 0, // Invalid ProjectId
                LetterNo = "NJS/OUT/2024/001",
                LetterDate = DateTime.Now.AddDays(-1),
                To = "Public Health Engineering Department",
                Subject = "Response to Population Projections for STP Design",
                UpdatedBy = "Test User"
            };

            // Act
            var result = await _validator.ValidateAsync(command);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.PropertyName == "ProjectId");
        }

        [Fact]
        public async Task Validate_WithEmptyLetterNo_ShouldFail()
        {
            // Arrange
            var command = new UpdateCorrespondenceOutwardCommand
            {
                Id = 1,
                ProjectId = 1,
                LetterNo = "", // Empty LetterNo
                LetterDate = DateTime.Now.AddDays(-1),
                To = "Public Health Engineering Department",
                Subject = "Response to Population Projections for STP Design",
                UpdatedBy = "Test User"
            };

            // Act
            var result = await _validator.ValidateAsync(command);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.PropertyName == "LetterNo");
        }

        [Fact]
        public async Task Validate_WithEmptyUpdatedBy_ShouldFail()
        {
            // Arrange
            var command = new UpdateCorrespondenceOutwardCommand
            {
                Id = 1,
                ProjectId = 1,
                LetterNo = "NJS/OUT/2024/001",
                LetterDate = DateTime.Now.AddDays(-1),
                To = "Public Health Engineering Department",
                Subject = "Response to Population Projections for STP Design",
                UpdatedBy = "" // Empty UpdatedBy
            };

            // Act
            var result = await _validator.ValidateAsync(command);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.PropertyName == "UpdatedBy");
        }

        [Fact]
        public async Task Validate_WithTooLongAcknowledgement_ShouldFail()
        {
            // Arrange
            var command = new UpdateCorrespondenceOutwardCommand
            {
                Id = 1,
                ProjectId = 1,
                LetterNo = "NJS/OUT/2024/001",
                LetterDate = DateTime.Now.AddDays(-1),
                To = "Public Health Engineering Department",
                Subject = "Response to Population Projections for STP Design",
                Acknowledgement = new string('A', 256), // Too long
                UpdatedBy = "Test User"
            };

            // Act
            var result = await _validator.ValidateAsync(command);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.PropertyName == "Acknowledgement");
        }
    }
}

