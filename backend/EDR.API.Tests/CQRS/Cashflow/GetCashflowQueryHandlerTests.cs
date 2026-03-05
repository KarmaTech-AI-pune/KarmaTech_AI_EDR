using Moq;
using EDR.Application.CQRS.Cashflow.Handlers;
using EDR.Application.CQRS.Cashflow.Queries;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.Handlers
{
    public class GetCashflowQueryHandlerTests
    {
        private readonly Mock<ICashflowRepository> _cashflowRepositoryMock;
        private readonly GetCashflowQueryHandler _handler;

        public GetCashflowQueryHandlerTests()
        {
            _cashflowRepositoryMock = new Mock<ICashflowRepository>();
            _handler = new GetCashflowQueryHandler(_cashflowRepositoryMock.Object);
        }

        [Fact]
        public async Task Handle_ExistingCashflow_ReturnsDto()
        {
            // Arrange
            var cashflowId = 1;
            var query = new GetCashflowQuery { Id = cashflowId };

            var existingCashflow = new Cashflow
            {
                Id = cashflowId,
                Month = "Mar 2026",
                TotalHours = 200,
                PersonnelCost = 25000m,
                ProjectId = 10
            };

            _cashflowRepositoryMock.Setup(repo => repo.GetByIdAsync(cashflowId))
                .ReturnsAsync(existingCashflow);

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            _cashflowRepositoryMock.Verify(repo => repo.GetByIdAsync(cashflowId), Times.Once);

            Assert.NotNull(result);
            Assert.Equal(cashflowId, result.Id);
            Assert.Equal("Mar 2026", result.Month);
            Assert.Equal(200, result.TotalHours);
            Assert.Equal(10, result.ProjectId);
        }

        [Fact]
        public async Task Handle_NonExistingCashflow_ReturnsNull()
        {
            // Arrange
            var cashflowId = 999;
            var query = new GetCashflowQuery { Id = cashflowId };

            _cashflowRepositoryMock.Setup(repo => repo.GetByIdAsync(cashflowId))
                .ReturnsAsync((Cashflow)null!);

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            _cashflowRepositoryMock.Verify(repo => repo.GetByIdAsync(cashflowId), Times.Once);
            Assert.Null(result);
        }
    }
}
