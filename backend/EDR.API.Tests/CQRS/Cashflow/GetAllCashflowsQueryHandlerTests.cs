using Moq;
using EDR.Application.CQRS.Cashflow.Handlers;
using EDR.Application.CQRS.Cashflow.Queries;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.Handlers
{
    public class GetAllCashflowsQueryHandlerTests
    {
        private readonly Mock<ICashflowRepository> _cashflowRepositoryMock;
        private readonly GetAllCashflowsQueryHandler _handler;

        public GetAllCashflowsQueryHandlerTests()
        {
            _cashflowRepositoryMock = new Mock<ICashflowRepository>();
            _handler = new GetAllCashflowsQueryHandler(_cashflowRepositoryMock.Object);
        }

        [Fact]
        public async Task Handle_ValidRequest_ReturnsMappedCashflowDtos()
        {
            // Arrange
            var projectId = 1;
            var query = new GetAllCashflowsQuery { ProjectId = projectId };

            var cashflows = new List<Cashflow>
            {
                new Cashflow { Id = 1, Month = "Jan", ProjectId = projectId, TotalHours = 100 },
                new Cashflow { Id = 2, Month = "Feb", ProjectId = projectId, TotalHours = 120 }
            };

            _cashflowRepositoryMock.Setup(repo => repo.GetAllAsync(projectId))
                .ReturnsAsync(cashflows);

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            _cashflowRepositoryMock.Verify(repo => repo.GetAllAsync(projectId), Times.Once);

            Assert.NotNull(result);
            Assert.Equal(2, result.Count);

            var firstResult = result.First(c => c.Id == 1);
            Assert.Equal("Jan", firstResult.Month);
            Assert.Equal(100, firstResult.TotalHours);
            Assert.Equal(projectId, firstResult.ProjectId);
        }

        [Fact]
        public async Task Handle_NoCashflows_ReturnsEmptyList()
        {
            // Arrange
            var projectId = 99;
            var query = new GetAllCashflowsQuery { ProjectId = projectId };

            _cashflowRepositoryMock.Setup(repo => repo.GetAllAsync(projectId))
                .ReturnsAsync(new List<Cashflow>());

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
        }
    }
}
