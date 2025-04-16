using Moq;
using NJS.Application.Tests.CQRS.InputRegister.Queries;
using NJS.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace NJS.Application.Tests.CQRS.InputRegister.Handlers
{
    public class GetAllInputRegistersQueryHandlerTests
    {
        private readonly Mock<IInputRegisterRepository> _mockRepository;
        private readonly GetAllInputRegistersQueryHandler _handler;

        public GetAllInputRegistersQueryHandlerTests()
        {
            _mockRepository = new Mock<IInputRegisterRepository>();
            _handler = new GetAllInputRegistersQueryHandler(_mockRepository.Object);
        }

        [Fact]
        public async Task Handle_WithData_ReturnsAllInputRegisterDtos()
        {
            // Arrange
            var query = new GetAllInputRegistersQuery();
            var entities = new List<Domain.Entities.InputRegister>
            {
                new Domain.Entities.InputRegister
                {
                    Id = 1,
                    ProjectId = 1,
                    DataReceived = "Test Data 1",
                    ReceiptDate = DateTime.Now,
                    ReceivedFrom = "Test User 1",
                    FilesFormat = "PDF",
                    NoOfFiles = 1,
                    FitForPurpose = true,
                    Check = true,
                    CreatedAt = DateTime.UtcNow
                },
                new Domain.Entities.InputRegister
                {
                    Id = 2,
                    ProjectId = 2,
                    DataReceived = "Test Data 2",
                    ReceiptDate = DateTime.Now,
                    ReceivedFrom = "Test User 2",
                    FilesFormat = "DOCX",
                    NoOfFiles = 2,
                    FitForPurpose = false,
                    Check = false,
                    CreatedAt = DateTime.UtcNow
                }
            };

            _mockRepository.Setup(r => r.GetAllAsync())
                .ReturnsAsync(entities);

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            var resultList = result.ToList();
            Assert.Equal(2, resultList.Count);
            
            Assert.Equal(entities[0].Id, resultList[0].Id);
            Assert.Equal(entities[0].ProjectId, resultList[0].ProjectId);
            Assert.Equal(entities[0].DataReceived, resultList[0].DataReceived);
            
            Assert.Equal(entities[1].Id, resultList[1].Id);
            Assert.Equal(entities[1].ProjectId, resultList[1].ProjectId);
            Assert.Equal(entities[1].DataReceived, resultList[1].DataReceived);

            _mockRepository.Verify(r => r.GetAllAsync(), Times.Once);
        }

        [Fact]
        public async Task Handle_NoData_ReturnsEmptyList()
        {
            // Arrange
            var query = new GetAllInputRegistersQuery();

            _mockRepository.Setup(r => r.GetAllAsync())
                .ReturnsAsync(new List<Domain.Entities.InputRegister>());

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
            _mockRepository.Verify(r => r.GetAllAsync(), Times.Once);
        }

        [Fact]
        public async Task Handle_NullQuery_ThrowsArgumentNullException()
        {
            // Arrange
            GetAllInputRegistersQuery query = null;

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentNullException>(() => 
                _handler.Handle(query, CancellationToken.None));
        }

        [Fact]
        public async Task Handle_RepositoryThrowsException_PropagatesException()
        {
            // Arrange
            var query = new GetAllInputRegistersQuery();

            var expectedException = new Exception("Database error");
            _mockRepository.Setup(r => r.GetAllAsync())
                .ThrowsAsync(expectedException);

            // Act & Assert
            var exception = await Assert.ThrowsAsync<Exception>(() => 
                _handler.Handle(query, CancellationToken.None));
            
            Assert.Same(expectedException, exception);
        }
    }
}
