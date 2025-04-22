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
    public class CreateInputRegisterCommandHandlerTests
    {
        private readonly Mock<IInputRegisterRepository> _mockRepository;
        private readonly CreateInputRegisterCommandHandler _handler;

        public CreateInputRegisterCommandHandlerTests()
        {
            _mockRepository = new Mock<IInputRegisterRepository>();
            _handler = new CreateInputRegisterCommandHandler(_mockRepository.Object);
        }

        [Fact]
        public void Constructor_NullRepository_ThrowsArgumentNullException()
        {
            // Act & Assert
            Assert.Throws<ArgumentNullException>(() => new CreateInputRegisterCommandHandler(null));
        }

        [Fact]
        public async Task Handle_ValidCommand_CreatesInputRegisterAndReturnsDto()
        {
            // Arrange
            var command = new CreateInputRegisterCommand
            {
                ProjectId = 1,
                DataReceived = "Test Data",
                ReceiptDate = new DateTime(2023, 1, 1),
                ReceivedFrom = "Test User",
                FilesFormat = "PDF",
                NoOfFiles = 1,
                FitForPurpose = true,
                Check = true,
                CheckedBy = "Test Checker",
                CheckedDate = new DateTime(2023, 1, 2),
                Custodian = "Test Custodian",
                StoragePath = "/test/path",
                Remarks = "Test Remarks",
                CreatedBy = "Test Creator"
            };

            var createdId = 1;

            _mockRepository.Setup(r => r.AddAsync(It.IsAny<Domain.Entities.InputRegister>()))
                .ReturnsAsync(createdId);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(createdId, result.Id);
            Assert.Equal(command.ProjectId, result.ProjectId);
            Assert.Equal(command.DataReceived, result.DataReceived);
            Assert.Equal(command.ReceiptDate, result.ReceiptDate);
            Assert.Equal(command.ReceivedFrom, result.ReceivedFrom);
            Assert.Equal(command.FilesFormat, result.FilesFormat);
            Assert.Equal(command.NoOfFiles, result.NoOfFiles);
            Assert.Equal(command.FitForPurpose, result.FitForPurpose);
            Assert.Equal(command.Check, result.Check);
            Assert.Equal(command.CheckedBy, result.CheckedBy);
            Assert.Equal(command.CheckedDate, result.CheckedDate);
            Assert.Equal(command.Custodian, result.Custodian);
            Assert.Equal(command.StoragePath, result.StoragePath);
            Assert.Equal(command.Remarks, result.Remarks);
            Assert.Equal(command.CreatedBy, result.CreatedBy);
            Assert.NotEqual(default, result.CreatedAt);

            // Verify repository was called correctly
            _mockRepository.Verify(r => r.AddAsync(It.Is<Domain.Entities.InputRegister>(
                ir => ir.ProjectId == command.ProjectId &&
                      ir.DataReceived == command.DataReceived &&
                      ir.ReceiptDate == command.ReceiptDate &&
                      ir.ReceivedFrom == command.ReceivedFrom &&
                      ir.FilesFormat == command.FilesFormat &&
                      ir.NoOfFiles == command.NoOfFiles &&
                      ir.FitForPurpose == command.FitForPurpose &&
                      ir.Check == command.Check &&
                      ir.CheckedBy == command.CheckedBy &&
                      ir.CheckedDate == command.CheckedDate &&
                      ir.Custodian == command.Custodian &&
                      ir.StoragePath == command.StoragePath &&
                      ir.Remarks == command.Remarks &&
                      ir.CreatedBy == command.CreatedBy &&
                      ir.CreatedAt != default
            )), Times.Once);
        }

        [Fact]
        public async Task Handle_MinimalRequiredFields_CreatesInputRegisterCorrectly()
        {
            // Arrange
            var command = new CreateInputRegisterCommand
            {
                ProjectId = 1,
                DataReceived = "Test Data",
                ReceiptDate = new DateTime(2023, 1, 1),
                ReceivedFrom = "Test User",
                FilesFormat = "PDF",
                NoOfFiles = 1,
                FitForPurpose = true,
                Check = true,
                // Optional fields not provided
                CheckedBy = null,
                CheckedDate = null,
                Custodian = null,
                StoragePath = null,
                Remarks = null,
                CreatedBy = "Test Creator"
            };

            var createdId = 1;

            _mockRepository.Setup(r => r.AddAsync(It.IsAny<Domain.Entities.InputRegister>()))
                .ReturnsAsync(createdId);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(createdId, result.Id);
            Assert.Equal(command.ProjectId, result.ProjectId);
            Assert.Equal(command.DataReceived, result.DataReceived);
            Assert.Equal(command.ReceiptDate, result.ReceiptDate);
            Assert.Equal(command.ReceivedFrom, result.ReceivedFrom);
            Assert.Equal(command.FilesFormat, result.FilesFormat);
            Assert.Equal(command.NoOfFiles, result.NoOfFiles);
            Assert.Equal(command.FitForPurpose, result.FitForPurpose);
            Assert.Equal(command.Check, result.Check);
            Assert.Null(result.CheckedBy);
            Assert.Null(result.CheckedDate);
            Assert.Null(result.Custodian);
            Assert.Null(result.StoragePath);
            Assert.Null(result.Remarks);
            Assert.Equal(command.CreatedBy, result.CreatedBy);
            Assert.NotEqual(default, result.CreatedAt);

            // Verify repository was called correctly
            _mockRepository.Verify(r => r.AddAsync(It.Is<Domain.Entities.InputRegister>(
                ir => ir.ProjectId == command.ProjectId &&
                      ir.DataReceived == command.DataReceived &&
                      ir.ReceiptDate == command.ReceiptDate &&
                      ir.ReceivedFrom == command.ReceivedFrom &&
                      ir.FilesFormat == command.FilesFormat &&
                      ir.NoOfFiles == command.NoOfFiles &&
                      ir.FitForPurpose == command.FitForPurpose &&
                      ir.Check == command.Check &&
                      ir.CheckedBy == null &&
                      ir.CheckedDate == null &&
                      ir.Custodian == null &&
                      ir.StoragePath == null &&
                      ir.Remarks == null &&
                      ir.CreatedBy == command.CreatedBy &&
                      ir.CreatedAt != default
            )), Times.Once);
        }

        [Fact]
        public async Task Handle_MaxLengthStrings_CreatesInputRegisterCorrectly()
        {
            // Arrange
            var command = new CreateInputRegisterCommand
            {
                ProjectId = 1,
                DataReceived = new string('A', 255),
                ReceiptDate = new DateTime(2023, 1, 1),
                ReceivedFrom = new string('B', 255),
                FilesFormat = new string('C', 100),
                NoOfFiles = 1,
                FitForPurpose = true,
                Check = true,
                CheckedBy = new string('D', 255),
                CheckedDate = new DateTime(2023, 1, 2),
                Custodian = new string('E', 255),
                StoragePath = new string('F', 500),
                Remarks = new string('G', 1000),
                CreatedBy = "Test Creator"
            };

            var createdId = 1;

            _mockRepository.Setup(r => r.AddAsync(It.IsAny<Domain.Entities.InputRegister>()))
                .ReturnsAsync(createdId);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(createdId, result.Id);
            Assert.Equal(command.ProjectId, result.ProjectId);
            Assert.Equal(command.DataReceived, result.DataReceived);
            Assert.Equal(255, result.DataReceived.Length);
            Assert.Equal(command.ReceivedFrom, result.ReceivedFrom);
            Assert.Equal(255, result.ReceivedFrom.Length);
            Assert.Equal(command.FilesFormat, result.FilesFormat);
            Assert.Equal(100, result.FilesFormat.Length);
            Assert.Equal(command.CheckedBy, result.CheckedBy);
            Assert.Equal(255, result.CheckedBy.Length);
            Assert.Equal(command.Custodian, result.Custodian);
            Assert.Equal(255, result.Custodian.Length);
            Assert.Equal(command.StoragePath, result.StoragePath);
            Assert.Equal(500, result.StoragePath.Length);
            Assert.Equal(command.Remarks, result.Remarks);
            Assert.Equal(1000, result.Remarks.Length);

            // Verify repository was called correctly
            _mockRepository.Verify(r => r.AddAsync(It.Is<Domain.Entities.InputRegister>(
                ir => ir.ProjectId == command.ProjectId &&
                      ir.DataReceived == command.DataReceived &&
                      ir.DataReceived.Length == 255 &&
                      ir.ReceivedFrom == command.ReceivedFrom &&
                      ir.ReceivedFrom.Length == 255 &&
                      ir.FilesFormat == command.FilesFormat &&
                      ir.FilesFormat.Length == 100 &&
                      ir.CheckedBy == command.CheckedBy &&
                      ir.CheckedBy.Length == 255 &&
                      ir.Custodian == command.Custodian &&
                      ir.Custodian.Length == 255 &&
                      ir.StoragePath == command.StoragePath &&
                      ir.StoragePath.Length == 500 &&
                      ir.Remarks == command.Remarks &&
                      ir.Remarks.Length == 1000
            )), Times.Once);
        }

        [Fact]
        public async Task Handle_CreatedAtTimestamp_SetsCurrentTime()
        {
            // Arrange
            var command = new CreateInputRegisterCommand
            {
                ProjectId = 1,
                DataReceived = "Test Data",
                ReceiptDate = new DateTime(2023, 1, 1),
                ReceivedFrom = "Test User",
                FilesFormat = "PDF",
                NoOfFiles = 1,
                FitForPurpose = true,
                Check = true,
                CreatedBy = "Test Creator"
            };

            var createdId = 1;
            DateTime beforeCreate = DateTime.UtcNow.AddSeconds(-1);

            _mockRepository.Setup(r => r.AddAsync(It.IsAny<Domain.Entities.InputRegister>()))
                .ReturnsAsync(createdId);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);
            DateTime afterCreate = DateTime.UtcNow.AddSeconds(1);

            // Assert
            Assert.NotNull(result);
            Assert.NotEqual(default, result.CreatedAt);
            
            // CreatedAt should be between beforeCreate and afterCreate
            Assert.True(result.CreatedAt >= beforeCreate);
            Assert.True(result.CreatedAt <= afterCreate);
            
            // Verify repository was called with current timestamp
            _mockRepository.Verify(r => r.AddAsync(It.Is<Domain.Entities.InputRegister>(
                ir => ir.CreatedAt >= beforeCreate && ir.CreatedAt <= afterCreate
            )), Times.Once);
        }
    }
}
