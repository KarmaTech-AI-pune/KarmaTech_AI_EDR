using Moq;
using NJS.Application.Tests.CQRS.InputRegister.Queries;
using NJS.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace NJS.Application.Tests.CQRS.InputRegister.Handlers
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
        public async Task Handle_ExistingEntity_ReturnsInputRegisterDto()
        {
            // Arrange
            var query = new GetInputRegisterByIdQuery(1);
            var entity = new Domain.Entities.InputRegister
            {
                Id = 1,
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
                CreatedBy = "Test Creator",
                CreatedAt = DateTime.UtcNow
            };

            _mockRepository.Setup(r => r.GetByIdAsync(query.Id))
                .ReturnsAsync(entity);

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(entity.Id, result.Id);
            Assert.Equal(entity.ProjectId, result.ProjectId);
            Assert.Equal(entity.DataReceived, result.DataReceived);
            Assert.Equal(entity.ReceivedFrom, result.ReceivedFrom);
            Assert.Equal(entity.FilesFormat, result.FilesFormat);
            Assert.Equal(entity.NoOfFiles, result.NoOfFiles);
            Assert.Equal(entity.FitForPurpose, result.FitForPurpose);
            Assert.Equal(entity.Check, result.Check);
            Assert.Equal(entity.CheckedBy, result.CheckedBy);
            Assert.Equal(entity.CheckedDate, result.CheckedDate);
            Assert.Equal(entity.Custodian, result.Custodian);
            Assert.Equal(entity.StoragePath, result.StoragePath);
            Assert.Equal(entity.Remarks, result.Remarks);
            Assert.Equal(entity.CreatedBy, result.CreatedBy);
            Assert.Equal(entity.CreatedAt, result.CreatedAt);

            _mockRepository.Verify(r => r.GetByIdAsync(query.Id), Times.Once);
        }

        [Fact]
        public async Task Handle_NonExistingEntity_ReturnsNull()
        {
            // Arrange
            var query = new GetInputRegisterByIdQuery(999);

            _mockRepository.Setup(r => r.GetByIdAsync(query.Id))
                .ReturnsAsync((Domain.Entities.InputRegister)null);

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Null(result);
            _mockRepository.Verify(r => r.GetByIdAsync(query.Id), Times.Once);
        }

        [Fact]
        public async Task Handle_NullQuery_ThrowsArgumentNullException()
        {
            // Arrange
            GetInputRegisterByIdQuery query = null;

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentNullException>(() => 
                _handler.Handle(query, CancellationToken.None));
        }

        [Fact]
        public async Task Handle_RepositoryThrowsException_PropagatesException()
        {
            // Arrange
            var query = new GetInputRegisterByIdQuery(1);

            var expectedException = new Exception("Database error");
            _mockRepository.Setup(r => r.GetByIdAsync(query.Id))
                .ThrowsAsync(expectedException);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() => 
                _handler.Handle(query, CancellationToken.None));
            
            Assert.Same(expectedException, exception);
        }
    }
}
