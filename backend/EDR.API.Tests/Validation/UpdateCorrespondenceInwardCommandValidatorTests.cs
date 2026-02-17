using FluentValidation;
using EDR.Application.CQRS.Correspondence.Commands;
using System;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.Validation
{
    public class UpdateCorrespondenceInwardCommandValidatorTests
    {
        private readonly UpdateCorrespondenceInwardCommandValidator _validator;

        public UpdateCorrespondenceInwardCommandValidatorTests()
        {
            _validator = new UpdateCorrespondenceInwardCommandValidator();
        }

        [Fact]
        public async Task Validate_WithValidCommand_ShouldPass()
        {
            // Arrange
            var command = new UpdateCorrespondenceInwardCommand
            {
                Id = 1,
                ProjectId = 1,
                IncomingLetterNo = "PHED/2024/001",
                LetterDate = DateTime.Now.AddDays(-1),
                NjsInwardNo = "NJS/IN/2024/001",
                ReceiptDate = DateTime.Now,
                From = "Public Health Engineering Department",
                Subject = "Revised Population Projections for STP Design",
                AttachmentDetails = "Population_Projection_2045.pdf",
                ActionTaken = "Forwarded to Design Team for STP Capacity Review",
                StoragePath = "/documents/inward/2024/001",
                Remarks = "Urgent review required for capacity enhancement",
                RepliedDate = DateTime.Now.AddDays(-1),
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
            var command = new UpdateCorrespondenceInwardCommand
            {
                Id = 0, // Invalid Id
                ProjectId = 1,
                IncomingLetterNo = "PHED/2024/001",
                LetterDate = DateTime.Now.AddDays(-1),
                NjsInwardNo = "NJS/IN/2024/001",
                ReceiptDate = DateTime.Now,
                From = "Public Health Engineering Department",
                Subject = "Revised Population Projections for STP Design",
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
            var command = new UpdateCorrespondenceInwardCommand
            {
                Id = 1,
                ProjectId = 0, // Invalid ProjectId
                IncomingLetterNo = "PHED/2024/001",
                LetterDate = DateTime.Now.AddDays(-1),
                NjsInwardNo = "NJS/IN/2024/001",
                ReceiptDate = DateTime.Now,
                From = "Public Health Engineering Department",
                Subject = "Revised Population Projections for STP Design",
                UpdatedBy = "Test User"
            };

            // Act
            var result = await _validator.ValidateAsync(command);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.PropertyName == "ProjectId");
        }

        [Fact]
        public async Task Validate_WithEmptyIncomingLetterNo_ShouldFail()
        {
            // Arrange
            var command = new UpdateCorrespondenceInwardCommand
            {
                Id = 1,
                ProjectId = 1,
                IncomingLetterNo = "", // Empty IncomingLetterNo
                LetterDate = DateTime.Now.AddDays(-1),
                NjsInwardNo = "NJS/IN/2024/001",
                ReceiptDate = DateTime.Now,
                From = "Public Health Engineering Department",
                Subject = "Revised Population Projections for STP Design",
                UpdatedBy = "Test User"
            };

            // Act
            var result = await _validator.ValidateAsync(command);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.PropertyName == "IncomingLetterNo");
        }

        [Fact]
        public async Task Validate_WithEmptyUpdatedBy_ShouldFail()
        {
            // Arrange
            var command = new UpdateCorrespondenceInwardCommand
            {
                Id = 1,
                ProjectId = 1,
                IncomingLetterNo = "PHED/2024/001",
                LetterDate = DateTime.Now.AddDays(-1),
                NjsInwardNo = "NJS/IN/2024/001",
                ReceiptDate = DateTime.Now,
                From = "Public Health Engineering Department",
                Subject = "Revised Population Projections for STP Design",
                UpdatedBy = "" // Empty UpdatedBy
            };

            // Act
            var result = await _validator.ValidateAsync(command);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.PropertyName == "UpdatedBy");
        }

        [Fact]
        public async Task Validate_WithFutureRepliedDate_ShouldFail()
        {
            // Arrange
            var command = new UpdateCorrespondenceInwardCommand
            {
                Id = 1,
                ProjectId = 1,
                IncomingLetterNo = "PHED/2024/001",
                LetterDate = DateTime.Now.AddDays(-1),
                NjsInwardNo = "NJS/IN/2024/001",
                ReceiptDate = DateTime.Now,
                From = "Public Health Engineering Department",
                Subject = "Revised Population Projections for STP Design",
                RepliedDate = DateTime.Now.AddDays(1), // Future date
                UpdatedBy = "Test User"
            };

            // Act
            var result = await _validator.ValidateAsync(command);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.PropertyName == "RepliedDate");
        }
    }
}

