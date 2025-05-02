using FluentValidation;
using NJS.Application.CQRS.Correspondence.Commands;
using System;
using System.Threading.Tasks;
using Xunit;

namespace NJS.API.Tests.Validation
{
    public class CreateCorrespondenceOutwardCommandValidatorTests
    {
        private readonly CreateCorrespondenceOutwardCommandValidator _validator;

        public CreateCorrespondenceOutwardCommandValidatorTests()
        {
            _validator = new CreateCorrespondenceOutwardCommandValidator();
        }

        [Fact]
        public async Task Validate_WithValidCommand_ShouldPass()
        {
            // Arrange
            var command = new CreateCorrespondenceOutwardCommand
            {
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
                CreatedBy = "Test User"
            };

            // Act
            var result = await _validator.ValidateAsync(command);

            // Assert
            Assert.True(result.IsValid);
            Assert.Empty(result.Errors);
        }

        [Fact]
        public async Task Validate_WithInvalidProjectId_ShouldFail()
        {
            // Arrange
            var command = new CreateCorrespondenceOutwardCommand
            {
                ProjectId = 0, // Invalid ProjectId
                LetterNo = "NJS/OUT/2024/001",
                LetterDate = DateTime.Now.AddDays(-1),
                To = "Public Health Engineering Department",
                Subject = "Response to Population Projections for STP Design",
                CreatedBy = "Test User"
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
            var command = new CreateCorrespondenceOutwardCommand
            {
                ProjectId = 1,
                LetterNo = "", // Empty LetterNo
                LetterDate = DateTime.Now.AddDays(-1),
                To = "Public Health Engineering Department",
                Subject = "Response to Population Projections for STP Design",
                CreatedBy = "Test User"
            };

            // Act
            var result = await _validator.ValidateAsync(command);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.PropertyName == "LetterNo");
        }

        [Fact]
        public async Task Validate_WithFutureLetterDate_ShouldFail()
        {
            // Arrange
            var command = new CreateCorrespondenceOutwardCommand
            {
                ProjectId = 1,
                LetterNo = "NJS/OUT/2024/001",
                LetterDate = DateTime.Now.AddDays(1), // Future date
                To = "Public Health Engineering Department",
                Subject = "Response to Population Projections for STP Design",
                CreatedBy = "Test User"
            };

            // Act
            var result = await _validator.ValidateAsync(command);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.PropertyName == "LetterDate");
        }

        [Fact]
        public async Task Validate_WithEmptyTo_ShouldFail()
        {
            // Arrange
            var command = new CreateCorrespondenceOutwardCommand
            {
                ProjectId = 1,
                LetterNo = "NJS/OUT/2024/001",
                LetterDate = DateTime.Now.AddDays(-1),
                To = "", // Empty To
                Subject = "Response to Population Projections for STP Design",
                CreatedBy = "Test User"
            };

            // Act
            var result = await _validator.ValidateAsync(command);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.PropertyName == "To");
        }

        [Fact]
        public async Task Validate_WithEmptySubject_ShouldFail()
        {
            // Arrange
            var command = new CreateCorrespondenceOutwardCommand
            {
                ProjectId = 1,
                LetterNo = "NJS/OUT/2024/001",
                LetterDate = DateTime.Now.AddDays(-1),
                To = "Public Health Engineering Department",
                Subject = "", // Empty Subject
                CreatedBy = "Test User"
            };

            // Act
            var result = await _validator.ValidateAsync(command);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.PropertyName == "Subject");
        }

        [Fact]
        public async Task Validate_WithTooLongAttachmentDetails_ShouldFail()
        {
            // Arrange
            var command = new CreateCorrespondenceOutwardCommand
            {
                ProjectId = 1,
                LetterNo = "NJS/OUT/2024/001",
                LetterDate = DateTime.Now.AddDays(-1),
                To = "Public Health Engineering Department",
                Subject = "Response to Population Projections for STP Design",
                AttachmentDetails = new string('A', 501), // Too long
                CreatedBy = "Test User"
            };

            // Act
            var result = await _validator.ValidateAsync(command);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.PropertyName == "AttachmentDetails");
        }

        [Fact]
        public async Task Validate_WithTooLongRemarks_ShouldFail()
        {
            // Arrange
            var command = new CreateCorrespondenceOutwardCommand
            {
                ProjectId = 1,
                LetterNo = "NJS/OUT/2024/001",
                LetterDate = DateTime.Now.AddDays(-1),
                To = "Public Health Engineering Department",
                Subject = "Response to Population Projections for STP Design",
                Remarks = new string('A', 1001), // Too long
                CreatedBy = "Test User"
            };

            // Act
            var result = await _validator.ValidateAsync(command);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.PropertyName == "Remarks");
        }
    }
}
