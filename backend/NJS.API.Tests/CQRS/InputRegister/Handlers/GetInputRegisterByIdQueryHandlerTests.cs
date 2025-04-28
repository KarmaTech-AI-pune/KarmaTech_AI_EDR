using Moq;
using NJS.Application.CQRS.InputRegister.Handlers;
using NJS.Application.CQRS.InputRegister.Queries;
using NJS.Repositories.Interfaces;

namespace NJS.API.Tests.CQRS.InputRegister.Handlers
{
    public class GetInputRegisterByIdQueryHandlerTests
    {
        private readonly Mock<IInputRegisterRepository> _mockRepository;
        private readonly GetInputRegisterByIdQueryHandler _handler;

        public GetInputRegisterByIdQueryHandlerTests()
        {
            _mockRepository = new Mock<IInputRegisterRepository>();
            _handler = new GetInputRegisterByIdQueryHandler(_mockRepository.Object);
        }

        [Fact]
        public void Constructor_NullRepository_ThrowsArgumentNullException()
        {
            // Act & Assert
            Assert.Throws<ArgumentNullException>(() => new GetInputRegisterByIdQueryHandler(null));
        }

        [Fact]
        public async Task Handle_ExistingInputRegister_ReturnsInputRegisterDto()
        {
            // Arrange
            var inputRegisterId = 1;
            var inputRegister = new Domain.Entities.InputRegister
            {
                Id = inputRegisterId,
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
                CreatedBy = "Test Creator",
                CreatedAt = new DateTime(2023, 1, 1),
                UpdatedBy = "Test Updater",
                UpdatedAt = new DateTime(2023, 1, 3)
            };

            _mockRepository.Setup(r => r.GetByIdAsync(inputRegisterId))
                .ReturnsAsync(inputRegister);

            var query = new GetInputRegisterByIdQuery(inputRegisterId);

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(inputRegisterId, result.Id);
            Assert.Equal(inputRegister.ProjectId, result.ProjectId);
            Assert.Equal(inputRegister.DataReceived, result.DataReceived);
            Assert.Equal(inputRegister.ReceiptDate, result.ReceiptDate);
            Assert.Equal(inputRegister.ReceivedFrom, result.ReceivedFrom);
            Assert.Equal(inputRegister.FilesFormat, result.FilesFormat);
            Assert.Equal(inputRegister.NoOfFiles, result.NoOfFiles);
            Assert.Equal(inputRegister.FitForPurpose, result.FitForPurpose);
            Assert.Equal(inputRegister.Check, result.Check);
            Assert.Equal(inputRegister.CheckedBy, result.CheckedBy);
            Assert.Equal(inputRegister.CheckedDate, result.CheckedDate);
            Assert.Equal(inputRegister.Custodian, result.Custodian);
            Assert.Equal(inputRegister.StoragePath, result.StoragePath);
            Assert.Equal(inputRegister.Remarks, result.Remarks);
            Assert.Equal(inputRegister.CreatedBy, result.CreatedBy);
            Assert.Equal(inputRegister.CreatedAt, result.CreatedAt);
            Assert.Equal(inputRegister.UpdatedBy, result.UpdatedBy);
            Assert.Equal(inputRegister.UpdatedAt, result.UpdatedAt);
            
            // Verify repository was called
            _mockRepository.Verify(r => r.GetByIdAsync(inputRegisterId), Times.Once);
        }

        [Fact]
        public async Task Handle_NonExistingInputRegister_ReturnsNull()
        {
            // Arrange
            var inputRegisterId = 999;
            
            _mockRepository.Setup(r => r.GetByIdAsync(inputRegisterId))
                .ReturnsAsync((Domain.Entities.InputRegister)null);

            var query = new GetInputRegisterByIdQuery(inputRegisterId);

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Null(result);
            
            // Verify repository was called
            _mockRepository.Verify(r => r.GetByIdAsync(inputRegisterId), Times.Once);
        }

        [Fact]
        public async Task Handle_RepositoryThrowsException_PropagatesException()
        {
            // Arrange
            var inputRegisterId = 1;
            var expectedException = new Exception("Database error");
            
            _mockRepository.Setup(r => r.GetByIdAsync(inputRegisterId))
                .ThrowsAsync(expectedException);

            var query = new GetInputRegisterByIdQuery(inputRegisterId);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() => 
                _handler.Handle(query, CancellationToken.None));
            
            Assert.Same(expectedException, exception);
            
            // Verify repository was called
            _mockRepository.Verify(r => r.GetByIdAsync(inputRegisterId), Times.Once);
        }

        [Fact]
        public async Task Handle_InputRegisterWithNullOptionalFields_MapsCorrectly()
        {
            // Arrange
            var inputRegisterId = 1;
            var inputRegister = new Domain.Entities.InputRegister
            {
                Id = inputRegisterId,
                ProjectId = 1,
                DataReceived = "Test Data",
                ReceiptDate = new DateTime(2023, 1, 1),
                ReceivedFrom = "Test User",
                FilesFormat = "PDF",
                NoOfFiles = 1,
                FitForPurpose = true,
                Check = true,
                // Optional fields are null
                CheckedBy = null,
                CheckedDate = null,
                Custodian = null,
                StoragePath = null,
                Remarks = null,
                CreatedBy = "Test Creator",
                CreatedAt = new DateTime(2023, 1, 1),
                UpdatedBy = null,
                UpdatedAt = null
            };

            _mockRepository.Setup(r => r.GetByIdAsync(inputRegisterId))
                .ReturnsAsync(inputRegister);

            var query = new GetInputRegisterByIdQuery(inputRegisterId);

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(inputRegisterId, result.Id);
            Assert.Equal(inputRegister.ProjectId, result.ProjectId);
            Assert.Equal(inputRegister.DataReceived, result.DataReceived);
            Assert.Equal(inputRegister.ReceiptDate, result.ReceiptDate);
            Assert.Equal(inputRegister.ReceivedFrom, result.ReceivedFrom);
            Assert.Equal(inputRegister.FilesFormat, result.FilesFormat);
            Assert.Equal(inputRegister.NoOfFiles, result.NoOfFiles);
            Assert.Equal(inputRegister.FitForPurpose, result.FitForPurpose);
            Assert.Equal(inputRegister.Check, result.Check);
            Assert.Null(result.CheckedBy);
            Assert.Null(result.CheckedDate);
            Assert.Null(result.Custodian);
            Assert.Null(result.StoragePath);
            Assert.Null(result.Remarks);
            Assert.Equal(inputRegister.CreatedBy, result.CreatedBy);
            Assert.Equal(inputRegister.CreatedAt, result.CreatedAt);
            Assert.Null(result.UpdatedBy);
            Assert.Null(result.UpdatedAt);
            
            // Verify repository was called
            _mockRepository.Verify(r => r.GetByIdAsync(inputRegisterId), Times.Once);
        }
    }
}
