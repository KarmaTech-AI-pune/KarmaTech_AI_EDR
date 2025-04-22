using MediatR;
using Moq;
using NJS.Application.CQRS.InputRegister.Commands;
using NJS.Application.CQRS.InputRegister.Handlers;
using NJS.Application.DTOs;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace NJS.API.Tests.CQRS.InputRegister.Handlers
{
    public class UpdateInputRegisterCommandHandlerTests
    {
        private readonly Mock<IInputRegisterRepository> _mockRepository;
        private readonly UpdateInputRegisterCommandHandler _handler;

        public UpdateInputRegisterCommandHandlerTests()
        {
            _mockRepository = new Mock<IInputRegisterRepository>();
            _handler = new UpdateInputRegisterCommandHandler(_mockRepository.Object);
        }

        [Fact]
        public void Constructor_NullRepository_ThrowsArgumentNullException()
        {
            // Act & Assert
            Assert.Throws<ArgumentNullException>(() => new UpdateInputRegisterCommandHandler(null));
        }

        [Fact]
        public async Task Handle_ValidCommand_UpdatesInputRegisterAndReturnsDto()
        {
            // Arrange
            var inputRegisterId = 1;
            var existingInputRegister = new Domain.Entities.InputRegister
            {
                Id = inputRegisterId,
                ProjectId = 1,
                DataReceived = "Original Data",
                ReceiptDate = new DateTime(2023, 1, 1),
                ReceivedFrom = "Original User",
                FilesFormat = "PDF",
                NoOfFiles = 1,
                FitForPurpose = true,
                Check = true,
                CheckedBy = "Original Checker",
                CheckedDate = new DateTime(2023, 1, 2),
                Custodian = "Original Custodian",
                StoragePath = "/original/path",
                Remarks = "Original Remarks",
                CreatedBy = "Original Creator",
                CreatedAt = new DateTime(2023, 1, 1),
                UpdatedBy = null,
                UpdatedAt = null
            };

            var updateCommand = new UpdateInputRegisterCommand
            {
                Id = inputRegisterId,
                ProjectId = 2,
                DataReceived = "Updated Data",
                ReceiptDate = new DateTime(2023, 2, 1),
                ReceivedFrom = "Updated User",
                FilesFormat = "DOCX",
                NoOfFiles = 2,
                FitForPurpose = false,
                Check = false,
                CheckedBy = "Updated Checker",
                CheckedDate = new DateTime(2023, 2, 2),
                Custodian = "Updated Custodian",
                StoragePath = "/updated/path",
                Remarks = "Updated Remarks",
                UpdatedBy = "Test Updater"
            };

            _mockRepository.Setup(r => r.GetByIdAsync(inputRegisterId))
                .ReturnsAsync(existingInputRegister);

            _mockRepository.Setup(r => r.UpdateAsync(It.IsAny<Domain.Entities.InputRegister>()))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _handler.Handle(updateCommand, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(inputRegisterId, result.Id);
            Assert.Equal(updateCommand.ProjectId, result.ProjectId);
            Assert.Equal(updateCommand.DataReceived, result.DataReceived);
            Assert.Equal(updateCommand.ReceiptDate, result.ReceiptDate);
            Assert.Equal(updateCommand.ReceivedFrom, result.ReceivedFrom);
            Assert.Equal(updateCommand.FilesFormat, result.FilesFormat);
            Assert.Equal(updateCommand.NoOfFiles, result.NoOfFiles);
            Assert.Equal(updateCommand.FitForPurpose, result.FitForPurpose);
            Assert.Equal(updateCommand.Check, result.Check);
            Assert.Equal(updateCommand.CheckedBy, result.CheckedBy);
            Assert.Equal(updateCommand.CheckedDate, result.CheckedDate);
            Assert.Equal(updateCommand.Custodian, result.Custodian);
            Assert.Equal(updateCommand.StoragePath, result.StoragePath);
            Assert.Equal(updateCommand.Remarks, result.Remarks);
            Assert.Equal(updateCommand.UpdatedBy, result.UpdatedBy);
            Assert.NotNull(result.UpdatedAt);
            
            // Verify original creation data is preserved
            Assert.Equal(existingInputRegister.CreatedBy, result.CreatedBy);
            Assert.Equal(existingInputRegister.CreatedAt, result.CreatedAt);

            // Verify repository was called correctly
            _mockRepository.Verify(r => r.GetByIdAsync(inputRegisterId), Times.Once);
            _mockRepository.Verify(r => r.UpdateAsync(It.Is<Domain.Entities.InputRegister>(
                ir => ir.Id == inputRegisterId &&
                      ir.ProjectId == updateCommand.ProjectId &&
                      ir.DataReceived == updateCommand.DataReceived &&
                      ir.ReceiptDate == updateCommand.ReceiptDate &&
                      ir.ReceivedFrom == updateCommand.ReceivedFrom &&
                      ir.FilesFormat == updateCommand.FilesFormat &&
                      ir.NoOfFiles == updateCommand.NoOfFiles &&
                      ir.FitForPurpose == updateCommand.FitForPurpose &&
                      ir.Check == updateCommand.Check &&
                      ir.CheckedBy == updateCommand.CheckedBy &&
                      ir.CheckedDate == updateCommand.CheckedDate &&
                      ir.Custodian == updateCommand.Custodian &&
                      ir.StoragePath == updateCommand.StoragePath &&
                      ir.Remarks == updateCommand.Remarks &&
                      ir.UpdatedBy == updateCommand.UpdatedBy &&
                      ir.UpdatedAt != null
            )), Times.Once);
        }

        [Fact]
        public async Task Handle_InputRegisterNotFound_ThrowsException()
        {
            // Arrange
            var inputRegisterId = 999;
            var updateCommand = new UpdateInputRegisterCommand
            {
                Id = inputRegisterId,
                ProjectId = 1,
                DataReceived = "Test Data",
                ReceiptDate = DateTime.Now,
                ReceivedFrom = "Test User",
                FilesFormat = "PDF",
                NoOfFiles = 1,
                FitForPurpose = true,
                Check = true
            };

            _mockRepository.Setup(r => r.GetByIdAsync(inputRegisterId))
                .ReturnsAsync((Domain.Entities.InputRegister)null);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() => 
                _handler.Handle(updateCommand, CancellationToken.None));
            
            Assert.Contains($"Input Register with ID {inputRegisterId} not found", exception.Message);
            _mockRepository.Verify(r => r.GetByIdAsync(inputRegisterId), Times.Once);
            _mockRepository.Verify(r => r.UpdateAsync(It.IsAny<Domain.Entities.InputRegister>()), Times.Never);
        }

        [Fact]
        public async Task Handle_MinimalRequiredFields_UpdatesCorrectly()
        {
            // Arrange
            var inputRegisterId = 1;
            var existingInputRegister = new Domain.Entities.InputRegister
            {
                Id = inputRegisterId,
                ProjectId = 1,
                DataReceived = "Original Data",
                ReceiptDate = new DateTime(2023, 1, 1),
                ReceivedFrom = "Original User",
                FilesFormat = "PDF",
                NoOfFiles = 1,
                FitForPurpose = true,
                Check = true,
                CreatedBy = "Original Creator",
                CreatedAt = new DateTime(2023, 1, 1)
            };

            var updateCommand = new UpdateInputRegisterCommand
            {
                Id = inputRegisterId,
                ProjectId = 2,
                DataReceived = "Updated Data",
                ReceiptDate = new DateTime(2023, 2, 1),
                ReceivedFrom = "Updated User",
                FilesFormat = "DOCX",
                NoOfFiles = 2,
                FitForPurpose = false,
                Check = false,
                // Optional fields not provided
                CheckedBy = null,
                CheckedDate = null,
                Custodian = null,
                StoragePath = null,
                Remarks = null,
                UpdatedBy = "Test Updater"
            };

            _mockRepository.Setup(r => r.GetByIdAsync(inputRegisterId))
                .ReturnsAsync(existingInputRegister);

            _mockRepository.Setup(r => r.UpdateAsync(It.IsAny<Domain.Entities.InputRegister>()))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _handler.Handle(updateCommand, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(inputRegisterId, result.Id);
            Assert.Equal(updateCommand.ProjectId, result.ProjectId);
            Assert.Equal(updateCommand.DataReceived, result.DataReceived);
            Assert.Equal(updateCommand.ReceiptDate, result.ReceiptDate);
            Assert.Equal(updateCommand.ReceivedFrom, result.ReceivedFrom);
            Assert.Equal(updateCommand.FilesFormat, result.FilesFormat);
            Assert.Equal(updateCommand.NoOfFiles, result.NoOfFiles);
            Assert.Equal(updateCommand.FitForPurpose, result.FitForPurpose);
            Assert.Equal(updateCommand.Check, result.Check);
            Assert.Null(result.CheckedBy);
            Assert.Null(result.CheckedDate);
            Assert.Null(result.Custodian);
            Assert.Null(result.StoragePath);
            Assert.Null(result.Remarks);
            Assert.Equal(updateCommand.UpdatedBy, result.UpdatedBy);
            Assert.NotNull(result.UpdatedAt);

            // Verify repository was called correctly
            _mockRepository.Verify(r => r.UpdateAsync(It.Is<Domain.Entities.InputRegister>(
                ir => ir.Id == inputRegisterId &&
                      ir.ProjectId == updateCommand.ProjectId &&
                      ir.DataReceived == updateCommand.DataReceived &&
                      ir.ReceiptDate == updateCommand.ReceiptDate &&
                      ir.ReceivedFrom == updateCommand.ReceivedFrom &&
                      ir.FilesFormat == updateCommand.FilesFormat &&
                      ir.NoOfFiles == updateCommand.NoOfFiles &&
                      ir.FitForPurpose == updateCommand.FitForPurpose &&
                      ir.Check == updateCommand.Check &&
                      ir.CheckedBy == null &&
                      ir.CheckedDate == null &&
                      ir.Custodian == null &&
                      ir.StoragePath == null &&
                      ir.Remarks == null &&
                      ir.UpdatedBy == updateCommand.UpdatedBy &&
                      ir.UpdatedAt != null
            )), Times.Once);
        }

        [Fact]
        public async Task Handle_MaxLengthStrings_UpdatesCorrectly()
        {
            // Arrange
            var inputRegisterId = 1;
            var existingInputRegister = new Domain.Entities.InputRegister
            {
                Id = inputRegisterId,
                ProjectId = 1,
                DataReceived = "Original Data",
                ReceiptDate = new DateTime(2023, 1, 1),
                ReceivedFrom = "Original User",
                FilesFormat = "PDF",
                NoOfFiles = 1,
                FitForPurpose = true,
                Check = true,
                CreatedBy = "Original Creator",
                CreatedAt = new DateTime(2023, 1, 1)
            };

            var updateCommand = new UpdateInputRegisterCommand
            {
                Id = inputRegisterId,
                ProjectId = 2,
                DataReceived = new string('A', 255), // Max length for DataReceived
                ReceiptDate = new DateTime(2023, 2, 1),
                ReceivedFrom = new string('B', 255), // Max length for ReceivedFrom
                FilesFormat = new string('C', 100), // Max length for FilesFormat
                NoOfFiles = 2,
                FitForPurpose = false,
                Check = false,
                CheckedBy = new string('D', 255), // Max length for CheckedBy
                CheckedDate = new DateTime(2023, 2, 2),
                Custodian = new string('E', 255), // Max length for Custodian
                StoragePath = new string('F', 500), // Max length for StoragePath
                Remarks = new string('G', 1000), // Max length for Remarks
                UpdatedBy = "Test Updater"
            };

            _mockRepository.Setup(r => r.GetByIdAsync(inputRegisterId))
                .ReturnsAsync(existingInputRegister);

            _mockRepository.Setup(r => r.UpdateAsync(It.IsAny<Domain.Entities.InputRegister>()))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _handler.Handle(updateCommand, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(inputRegisterId, result.Id);
            Assert.Equal(updateCommand.ProjectId, result.ProjectId);
            Assert.Equal(updateCommand.DataReceived, result.DataReceived);
            Assert.Equal(updateCommand.ReceiptDate, result.ReceiptDate);
            Assert.Equal(updateCommand.ReceivedFrom, result.ReceivedFrom);
            Assert.Equal(updateCommand.FilesFormat, result.FilesFormat);
            Assert.Equal(updateCommand.NoOfFiles, result.NoOfFiles);
            Assert.Equal(updateCommand.FitForPurpose, result.FitForPurpose);
            Assert.Equal(updateCommand.Check, result.Check);
            Assert.Equal(updateCommand.CheckedBy, result.CheckedBy);
            Assert.Equal(updateCommand.CheckedDate, result.CheckedDate);
            Assert.Equal(updateCommand.Custodian, result.Custodian);
            Assert.Equal(updateCommand.StoragePath, result.StoragePath);
            Assert.Equal(updateCommand.Remarks, result.Remarks);
            Assert.Equal(updateCommand.UpdatedBy, result.UpdatedBy);
            Assert.NotNull(result.UpdatedAt);

            // Verify repository was called correctly
            _mockRepository.Verify(r => r.UpdateAsync(It.Is<Domain.Entities.InputRegister>(
                ir => ir.Id == inputRegisterId &&
                      ir.ProjectId == updateCommand.ProjectId &&
                      ir.DataReceived == updateCommand.DataReceived &&
                      ir.DataReceived.Length == 255 &&
                      ir.ReceivedFrom == updateCommand.ReceivedFrom &&
                      ir.ReceivedFrom.Length == 255 &&
                      ir.FilesFormat == updateCommand.FilesFormat &&
                      ir.FilesFormat.Length == 100 &&
                      ir.CheckedBy == updateCommand.CheckedBy &&
                      ir.CheckedBy.Length == 255 &&
                      ir.Custodian == updateCommand.Custodian &&
                      ir.Custodian.Length == 255 &&
                      ir.StoragePath == updateCommand.StoragePath &&
                      ir.StoragePath.Length == 500 &&
                      ir.Remarks == updateCommand.Remarks &&
                      ir.Remarks.Length == 1000
            )), Times.Once);
        }

        [Fact]
        public async Task Handle_UpdatedAtIsSetToCurrentTime()
        {
            // Arrange
            var inputRegisterId = 1;
            var existingInputRegister = new Domain.Entities.InputRegister
            {
                Id = inputRegisterId,
                ProjectId = 1,
                DataReceived = "Original Data",
                ReceiptDate = new DateTime(2023, 1, 1),
                ReceivedFrom = "Original User",
                FilesFormat = "PDF",
                NoOfFiles = 1,
                FitForPurpose = true,
                Check = true,
                CreatedBy = "Original Creator",
                CreatedAt = new DateTime(2023, 1, 1),
                UpdatedAt = new DateTime(2023, 1, 15),
                UpdatedBy = "Previous Updater"
            };

            var updateCommand = new UpdateInputRegisterCommand
            {
                Id = inputRegisterId,
                ProjectId = 2,
                DataReceived = "Updated Data",
                ReceiptDate = new DateTime(2023, 2, 1),
                ReceivedFrom = "Updated User",
                FilesFormat = "DOCX",
                NoOfFiles = 2,
                FitForPurpose = false,
                Check = false,
                UpdatedBy = "New Updater"
            };

            DateTime beforeUpdate = DateTime.UtcNow.AddSeconds(-1);
            
            _mockRepository.Setup(r => r.GetByIdAsync(inputRegisterId))
                .ReturnsAsync(existingInputRegister);

            _mockRepository.Setup(r => r.UpdateAsync(It.IsAny<Domain.Entities.InputRegister>()))
                .Returns(Task.CompletedTask)
                .Callback<Domain.Entities.InputRegister>(ir => 
                {
                    // Capture the UpdatedAt value for verification
                    existingInputRegister.UpdatedAt = ir.UpdatedAt;
                });

            // Act
            var result = await _handler.Handle(updateCommand, CancellationToken.None);
            DateTime afterUpdate = DateTime.UtcNow.AddSeconds(1);

            // Assert
            Assert.NotNull(result.UpdatedAt);
            Assert.NotEqual(new DateTime(2023, 1, 15), result.UpdatedAt); // Should not be the old value
            
            // UpdatedAt should be between beforeUpdate and afterUpdate
            Assert.True(result.UpdatedAt >= beforeUpdate);
            Assert.True(result.UpdatedAt <= afterUpdate);
            
            // Verify repository was called with updated timestamp
            _mockRepository.Verify(r => r.UpdateAsync(It.Is<Domain.Entities.InputRegister>(
                ir => ir.UpdatedAt >= beforeUpdate && ir.UpdatedAt <= afterUpdate
            )), Times.Once);
        }
    }
}
