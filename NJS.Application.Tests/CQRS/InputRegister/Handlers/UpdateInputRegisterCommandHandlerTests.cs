using Moq;
using NJS.Application.Tests.CQRS.InputRegister.Commands;
using NJS.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace NJS.Application.Tests.CQRS.InputRegister.Handlers
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
        public async Task Handle_ValidCommand_ReturnsUpdatedInputRegisterDto()
        {
            // Arrange
            var command = new UpdateInputRegisterCommand
            {
                Id = 1,
                ProjectId = 1,
                DataReceived = "Updated Data",
                ReceiptDate = DateTime.Now,
                ReceivedFrom = "Updated User",
                FilesFormat = "PDF, DOCX",
                NoOfFiles = 2,
                FitForPurpose = true,
                Check = true,
                CheckedBy = "Updated Checker",
                CheckedDate = DateTime.Now,
                Custodian = "Updated Custodian",
                StoragePath = "/updated/path",
                Remarks = "Updated Remarks",
                UpdatedBy = "Test Updater"
            };

            var existingEntity = new Domain.Entities.InputRegister
            {
                Id = 1,
                ProjectId = 1,
                DataReceived = "Original Data",
                ReceiptDate = DateTime.Now.AddDays(-1),
                ReceivedFrom = "Original User",
                FilesFormat = "PDF",
                NoOfFiles = 1,
                FitForPurpose = false,
                Check = false,
                CreatedAt = DateTime.UtcNow.AddDays(-1)
            };

            _mockRepository.Setup(r => r.GetByIdAsync(command.Id))
                .ReturnsAsync(existingEntity);

            _mockRepository.Setup(r => r.UpdateAsync(It.IsAny<Domain.Entities.InputRegister>()))
                .Returns(Task.CompletedTask);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(command.Id, result.Id);
            Assert.Equal(command.ProjectId, result.ProjectId);
            Assert.Equal(command.DataReceived, result.DataReceived);
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
            Assert.Equal(command.UpdatedBy, result.UpdatedBy);
            Assert.NotNull(result.UpdatedAt);

            _mockRepository.Verify(r => r.GetByIdAsync(command.Id), Times.Once);
            _mockRepository.Verify(r => r.UpdateAsync(It.IsAny<Domain.Entities.InputRegister>()), Times.Once);
        }

        [Fact]
        public async Task Handle_EntityNotFound_ThrowsException()
        {
            // Arrange
            var command = new UpdateInputRegisterCommand
            {
                Id = 999,
                ProjectId = 1,
                DataReceived = "Updated Data",
                ReceiptDate = DateTime.Now,
                ReceivedFrom = "Updated User",
                FilesFormat = "PDF, DOCX",
                NoOfFiles = 2,
                FitForPurpose = true,
                Check = true
            };

            _mockRepository.Setup(r => r.GetByIdAsync(command.Id))
                .ReturnsAsync((Domain.Entities.InputRegister)null);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() => 
                _handler.Handle(command, CancellationToken.None));
            
            Assert.Contains("not found", exception.Message);
            _mockRepository.Verify(r => r.GetByIdAsync(command.Id), Times.Once);
            _mockRepository.Verify(r => r.UpdateAsync(It.IsAny<Domain.Entities.InputRegister>()), Times.Never);
        }

        [Fact]
        public async Task Handle_NullCommand_ThrowsArgumentNullException()
        {
            // Arrange
            UpdateInputRegisterCommand command = null;

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentNullException>(() => 
                _handler.Handle(command, CancellationToken.None));
        }

        [Fact]
        public async Task Handle_RepositoryThrowsException_PropagatesException()
        {
            // Arrange
            var command = new UpdateInputRegisterCommand
            {
                Id = 1,
                ProjectId = 1,
                DataReceived = "Updated Data",
                ReceiptDate = DateTime.Now,
                ReceivedFrom = "Updated User",
                FilesFormat = "PDF, DOCX",
                NoOfFiles = 2,
                FitForPurpose = true,
                Check = true
            };

            var existingEntity = new Domain.Entities.InputRegister
            {
                Id = 1,
                ProjectId = 1,
                DataReceived = "Original Data",
                ReceiptDate = DateTime.Now.AddDays(-1),
                ReceivedFrom = "Original User",
                FilesFormat = "PDF",
                NoOfFiles = 1,
                FitForPurpose = false,
                Check = false,
                CreatedAt = DateTime.UtcNow.AddDays(-1)
            };

            _mockRepository.Setup(r => r.GetByIdAsync(command.Id))
                .ReturnsAsync(existingEntity);

            var expectedException = new Exception("Database error");
            _mockRepository.Setup(r => r.UpdateAsync(It.IsAny<Domain.Entities.InputRegister>()))
                .ThrowsAsync(expectedException);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() => 
                _handler.Handle(command, CancellationToken.None));
            
            Assert.Same(expectedException, exception);
        }
    }
}
