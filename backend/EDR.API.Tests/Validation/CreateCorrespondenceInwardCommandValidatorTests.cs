using FluentValidation;
using EDR.Application.CQRS.Correspondence.Commands;
using System;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.Validation
{
    public class CreateCorrespondenceInwardCommandValidatorTests
    {
        private readonly CreateCorrespondenceInwardCommandValidator _validator;

        public CreateCorrespondenceInwardCommandValidatorTests()
        {
            _validator = new CreateCorrespondenceInwardCommandValidator();
        }

        [Fact]
        public async Task Validate_WithValidCommand_ShouldPass()
        {
            // Arrange
            var command = new CreateCorrespondenceInwardCommand
            {
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
            var command = new CreateCorrespondenceInwardCommand
            {
                ProjectId = 0, // Invalid ProjectId
                IncomingLetterNo = "PHED/2024/001",
                LetterDate = DateTime.Now.AddDays(-1),
                NjsInwardNo = "NJS/IN/2024/001",
                ReceiptDate = DateTime.Now,
                From = "Public Health Engineering Department",
                Subject = "Revised Population Projections for STP Design",
                CreatedBy = "Test User"
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
            var command = new CreateCorrespondenceInwardCommand
            {
                ProjectId = 1,
                IncomingLetterNo = "", // Empty IncomingLetterNo
                LetterDate = DateTime.Now.AddDays(-1),
                NjsInwardNo = "NJS/IN/2024/001",
                ReceiptDate = DateTime.Now,
                From = "Public Health Engineering Department",
                Subject = "Revised Population Projections for STP Design",
                CreatedBy = "Test User"
            };

            // Act
            var result = await _validator.ValidateAsync(command);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.PropertyName == "IncomingLetterNo");
        }

        [Fact]
        public async Task Validate_WithFutureLetterDate_ShouldFail()
        {
            // Arrange
            var command = new CreateCorrespondenceInwardCommand
            {
                ProjectId = 1,
                IncomingLetterNo = "PHED/2024/001",
                LetterDate = DateTime.Now.AddDays(1), // Future date
                NjsInwardNo = "NJS/IN/2024/001",
                ReceiptDate = DateTime.Now,
                From = "Public Health Engineering Department",
                Subject = "Revised Population Projections for STP Design",
                CreatedBy = "Test User"
            };

            // Act
            var result = await _validator.ValidateAsync(command);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.PropertyName == "LetterDate");
        }

        [Fact]
        public async Task Validate_WithEmptyNjsInwardNo_ShouldFail()
        {
            // Arrange
            var command = new CreateCorrespondenceInwardCommand
            {
                ProjectId = 1,
                IncomingLetterNo = "PHED/2024/001",
                LetterDate = DateTime.Now.AddDays(-1),
                NjsInwardNo = "", // Empty NjsInwardNo
                ReceiptDate = DateTime.Now,
                From = "Public Health Engineering Department",
                Subject = "Revised Population Projections for STP Design",
                CreatedBy = "Test User"
            };

            // Act
            var result = await _validator.ValidateAsync(command);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.PropertyName == "NjsInwardNo");
        }

        [Fact]
        public async Task Validate_WithFutureReceiptDate_ShouldFail()
        {
            // Arrange
            var command = new CreateCorrespondenceInwardCommand
            {
                ProjectId = 1,
                IncomingLetterNo = "PHED/2024/001",
                LetterDate = DateTime.Now.AddDays(-1),
                NjsInwardNo = "NJS/IN/2024/001",
                ReceiptDate = DateTime.Now.AddDays(1), // Future date
                From = "Public Health Engineering Department",
                Subject = "Revised Population Projections for STP Design",
                CreatedBy = "Test User"
            };

            // Act
            var result = await _validator.ValidateAsync(command);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.PropertyName == "ReceiptDate");
        }

        [Fact]
        public async Task Validate_WithEmptyFrom_ShouldFail()
        {
            // Arrange
            var command = new CreateCorrespondenceInwardCommand
            {
                ProjectId = 1,
                IncomingLetterNo = "PHED/2024/001",
                LetterDate = DateTime.Now.AddDays(-1),
                NjsInwardNo = "NJS/IN/2024/001",
                ReceiptDate = DateTime.Now,
                From = "", // Empty From
                Subject = "Revised Population Projections for STP Design",
                CreatedBy = "Test User"
            };

            // Act
            var result = await _validator.ValidateAsync(command);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.PropertyName == "From");
        }

        [Fact]
        public async Task Validate_WithEmptySubject_ShouldFail()
        {
            // Arrange
            var command = new CreateCorrespondenceInwardCommand
            {
                ProjectId = 1,
                IncomingLetterNo = "PHED/2024/001",
                LetterDate = DateTime.Now.AddDays(-1),
                NjsInwardNo = "NJS/IN/2024/001",
                ReceiptDate = DateTime.Now,
                From = "Public Health Engineering Department",
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
        public async Task Validate_WithFutureRepliedDate_ShouldFail()
        {
            // Arrange
            var command = new CreateCorrespondenceInwardCommand
            {
                ProjectId = 1,
                IncomingLetterNo = "PHED/2024/001",
                LetterDate = DateTime.Now.AddDays(-1),
                NjsInwardNo = "NJS/IN/2024/001",
                ReceiptDate = DateTime.Now,
                From = "Public Health Engineering Department",
                Subject = "Revised Population Projections for STP Design",
                RepliedDate = DateTime.Now.AddDays(1), // Future date
                CreatedBy = "Test User"
            };

            // Act
            var result = await _validator.ValidateAsync(command);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.PropertyName == "RepliedDate");
        }
    }
}

