using Moq;
using NJS.Application.Tests.CQRS.InputRegister.Commands;
using NJS.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace NJS.Application.Tests.CQRS.InputRegister.Handlers
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
        public async Task Handle_ValidCommand_ReturnsInputRegisterDto()
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

            _mockRepository.Setup(r => r.AddAsync(It.IsAny<Domain.Entities.InputRegister>()))
                .ReturnsAsync(1);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.Id);
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
            Assert.Equal(command.CreatedBy, result.CreatedBy);

            _mockRepository.Verify(r => r.AddAsync(It.IsAny<Domain.Entities.InputRegister>()), Times.Once);
        }

        [Fact]
        public async Task Handle_NullCommand_ThrowsArgumentNullException()
        {
            // Arrange
            CreateInputRegisterCommand command = null;

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentNullException>(() => 
                _handler.Handle(command, CancellationToken.None));
        }

        [Fact]
        public async Task Handle_RepositoryThrowsException_PropagatesException()
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
                Check = true
            };

            var expectedException = new Exception("Database error");
            _mockRepository.Setup(r => r.AddAsync(It.IsAny<Domain.Entities.InputRegister>()))
                .ThrowsAsync(expectedException);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() => 
                _handler.Handle(command, CancellationToken.None));
            
            Assert.Same(expectedException, exception);
        }
    }
}
