using FluentValidation;
using NJS.Application.CQRS.InputRegister.Commands;
using System;
using System.Threading.Tasks;
using Xunit;

namespace NJS.API.Tests.Validation
{
    public class CreateInputRegisterCommandValidatorTests
    {
        private readonly CreateInputRegisterCommandValidator _validator;

        public CreateInputRegisterCommandValidatorTests()
        {
            _validator = new CreateInputRegisterCommandValidator();
        }

        [Fact]
        public async Task Validate_WithValidCommand_ShouldPass()
        {
            // Arrange
            var command = new CreateInputRegisterCommand
            {
                ProjectId = 1,
                DataReceived = "Test Data",
                ReceiptDate = DateTime.Now,
                ReceivedFrom = "Test User",
                FilesFormat = "PDF",
                NoOfFiles = 1,
                FitForPurpose = true,
                Check = true,
                CheckedBy = "Test Checker",
                CheckedDate = DateTime.Now,
                Custodian = "Test Custodian",
                StoragePath = "/test/path",
                Remarks = "Test Remarks",
                CreatedBy = "Test Creator"
            };

            // Act
            var result = await _validator.ValidateAsync(command);

            // Assert
            Assert.True(result.IsValid);
            Assert.Empty(result.Errors);
        }

        [Theory]
        [InlineData(0, "Invalid ProjectId")]
        [InlineData(-1, "Invalid ProjectId")]
        public async Task Validate_WithInvalidProjectId_ShouldFail(int projectId, string expectedError)
        {
            // Arrange
            var command = new CreateInputRegisterCommand
            {
                ProjectId = projectId,
                DataReceived = "Test Data",
                ReceiptDate = DateTime.Now,
                ReceivedFrom = "Test User",
                FilesFormat = "PDF",
                NoOfFiles = 1,
                FitForPurpose = true,
                Check = true
            };

            // Act
            var result = await _validator.ValidateAsync(command);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.ErrorMessage.Contains(expectedError));
        }

        [Theory]
        [InlineData("", "DataReceived cannot be empty")]
        [InlineData(null, "DataReceived cannot be empty")]
        public async Task Validate_WithInvalidDataReceived_ShouldFail(string dataReceived, string expectedError)
        {
            // Arrange
            var command = new CreateInputRegisterCommand
            {
                ProjectId = 1,
                DataReceived = dataReceived,
                ReceiptDate = DateTime.Now,
                ReceivedFrom = "Test User",
                FilesFormat = "PDF",
                NoOfFiles = 1,
                FitForPurpose = true,
                Check = true
            };

            // Act
            var result = await _validator.ValidateAsync(command);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.ErrorMessage.Contains(expectedError));
        }

        [Theory]
        [InlineData("", "ReceivedFrom cannot be empty")]
        [InlineData(null, "ReceivedFrom cannot be empty")]
        public async Task Validate_WithInvalidReceivedFrom_ShouldFail(string receivedFrom, string expectedError)
        {
            // Arrange
            var command = new CreateInputRegisterCommand
            {
                ProjectId = 1,
                DataReceived = "Test Data",
                ReceiptDate = DateTime.Now,
                ReceivedFrom = receivedFrom,
                FilesFormat = "PDF",
                NoOfFiles = 1,
                FitForPurpose = true,
                Check = true
            };

            // Act
            var result = await _validator.ValidateAsync(command);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.ErrorMessage.Contains(expectedError));
        }

        [Theory]
        [InlineData("", "FilesFormat cannot be empty")]
        [InlineData(null, "FilesFormat cannot be empty")]
        public async Task Validate_WithInvalidFilesFormat_ShouldFail(string filesFormat, string expectedError)
        {
            // Arrange
            var command = new CreateInputRegisterCommand
            {
                ProjectId = 1,
                DataReceived = "Test Data",
                ReceiptDate = DateTime.Now,
                ReceivedFrom = "Test User",
                FilesFormat = filesFormat,
                NoOfFiles = 1,
                FitForPurpose = true,
                Check = true
            };

            // Act
            var result = await _validator.ValidateAsync(command);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.ErrorMessage.Contains(expectedError));
        }

        [Theory]
        [InlineData(0, "NoOfFiles must be greater than 0")]
        [InlineData(-1, "NoOfFiles must be greater than 0")]
        public async Task Validate_WithInvalidNoOfFiles_ShouldFail(int noOfFiles, string expectedError)
        {
            // Arrange
            var command = new CreateInputRegisterCommand
            {
                ProjectId = 1,
                DataReceived = "Test Data",
                ReceiptDate = DateTime.Now,
                ReceivedFrom = "Test User",
                FilesFormat = "PDF",
                NoOfFiles = noOfFiles,
                FitForPurpose = true,
                Check = true
            };

            // Act
            var result = await _validator.ValidateAsync(command);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.ErrorMessage.Contains(expectedError));
        }

        [Fact]
        public async Task Validate_WithFutureDateForReceiptDate_ShouldFail()
        {
            // Arrange
            var command = new CreateInputRegisterCommand
            {
                ProjectId = 1,
                DataReceived = "Test Data",
                ReceiptDate = DateTime.Now.AddDays(10), // Future date
                ReceivedFrom = "Test User",
                FilesFormat = "PDF",
                NoOfFiles = 1,
                FitForPurpose = true,
                Check = true
            };

            // Act
            var result = await _validator.ValidateAsync(command);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.ErrorMessage.Contains("ReceiptDate cannot be in the future"));
        }

        [Fact]
        public async Task Validate_WithLongDataReceived_ShouldFail()
        {
            // Arrange
            var command = new CreateInputRegisterCommand
            {
                ProjectId = 1,
                DataReceived = new string('A', 256), // 256 characters, exceeding the 255 limit
                ReceiptDate = DateTime.Now,
                ReceivedFrom = "Test User",
                FilesFormat = "PDF",
                NoOfFiles = 1,
                FitForPurpose = true,
                Check = true
            };

            // Act
            var result = await _validator.ValidateAsync(command);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.ErrorMessage.Contains("DataReceived must not exceed 255 characters"));
        }

        [Fact]
        public async Task Validate_WithLongReceivedFrom_ShouldFail()
        {
            // Arrange
            var command = new CreateInputRegisterCommand
            {
                ProjectId = 1,
                DataReceived = "Test Data",
                ReceiptDate = DateTime.Now,
                ReceivedFrom = new string('A', 256), // 256 characters, exceeding the 255 limit
                FilesFormat = "PDF",
                NoOfFiles = 1,
                FitForPurpose = true,
                Check = true
            };

            // Act
            var result = await _validator.ValidateAsync(command);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.ErrorMessage.Contains("ReceivedFrom must not exceed 255 characters"));
        }

        [Fact]
        public async Task Validate_WithLongFilesFormat_ShouldFail()
        {
            // Arrange
            var command = new CreateInputRegisterCommand
            {
                ProjectId = 1,
                DataReceived = "Test Data",
                ReceiptDate = DateTime.Now,
                ReceivedFrom = "Test User",
                FilesFormat = new string('A', 101), // 101 characters, exceeding the 100 limit
                NoOfFiles = 1,
                FitForPurpose = true,
                Check = true
            };

            // Act
            var result = await _validator.ValidateAsync(command);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.ErrorMessage.Contains("FilesFormat must not exceed 100 characters"));
        }

        [Fact]
        public async Task Validate_WithLongCheckedBy_ShouldFail()
        {
            // Arrange
            var command = new CreateInputRegisterCommand
            {
                ProjectId = 1,
                DataReceived = "Test Data",
                ReceiptDate = DateTime.Now,
                ReceivedFrom = "Test User",
                FilesFormat = "PDF",
                NoOfFiles = 1,
                FitForPurpose = true,
                Check = true,
                CheckedBy = new string('A', 256) // 256 characters, exceeding the 255 limit
            };

            // Act
            var result = await _validator.ValidateAsync(command);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.ErrorMessage.Contains("CheckedBy must not exceed 255 characters"));
        }

        [Fact]
        public async Task Validate_WithLongCustodian_ShouldFail()
        {
            // Arrange
            var command = new CreateInputRegisterCommand
            {
                ProjectId = 1,
                DataReceived = "Test Data",
                ReceiptDate = DateTime.Now,
                ReceivedFrom = "Test User",
                FilesFormat = "PDF",
                NoOfFiles = 1,
                FitForPurpose = true,
                Check = true,
                Custodian = new string('A', 256) // 256 characters, exceeding the 255 limit
            };

            // Act
            var result = await _validator.ValidateAsync(command);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.ErrorMessage.Contains("Custodian must not exceed 255 characters"));
        }

        [Fact]
        public async Task Validate_WithLongStoragePath_ShouldFail()
        {
            // Arrange
            var command = new CreateInputRegisterCommand
            {
                ProjectId = 1,
                DataReceived = "Test Data",
                ReceiptDate = DateTime.Now,
                ReceivedFrom = "Test User",
                FilesFormat = "PDF",
                NoOfFiles = 1,
                FitForPurpose = true,
                Check = true,
                StoragePath = new string('A', 501) // 501 characters, exceeding the 500 limit
            };

            // Act
            var result = await _validator.ValidateAsync(command);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.ErrorMessage.Contains("StoragePath must not exceed 500 characters"));
        }

        [Fact]
        public async Task Validate_WithLongRemarks_ShouldFail()
        {
            // Arrange
            var command = new CreateInputRegisterCommand
            {
                ProjectId = 1,
                DataReceived = "Test Data",
                ReceiptDate = DateTime.Now,
                ReceivedFrom = "Test User",
                FilesFormat = "PDF",
                NoOfFiles = 1,
                FitForPurpose = true,
                Check = true,
                Remarks = new string('A', 1001) // 1001 characters, exceeding the 1000 limit
            };

            // Act
            var result = await _validator.ValidateAsync(command);

            // Assert
            Assert.False(result.IsValid);
            Assert.Contains(result.Errors, e => e.ErrorMessage.Contains("Remarks must not exceed 1000 characters"));
        }
    }
}
