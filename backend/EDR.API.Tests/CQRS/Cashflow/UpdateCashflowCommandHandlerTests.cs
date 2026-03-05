using Moq;
using EDR.Application.CQRS.Cashflow.Commands;
using EDR.Application.CQRS.Cashflow.Handlers;
using EDR.Application.DTOs;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.Handlers
{
    public class UpdateCashflowCommandHandlerTests
    {
        private readonly Mock<ICashflowRepository> _cashflowRepositoryMock;
        private readonly UpdateCashflowCommandHandler _handler;

        public UpdateCashflowCommandHandlerTests()
        {
            _cashflowRepositoryMock = new Mock<ICashflowRepository>();
            _handler = new UpdateCashflowCommandHandler(_cashflowRepositoryMock.Object);
        }

        [Fact]
        public async Task Handle_ExistingCashflow_UpdatesAndReturnsDto()
        {
            // Arrange
            var cashflowId = 1;
            var commandDto = new CashflowDto
            {
                Month = "Feb 2026",
                TotalHours = 150,
                PersonnelCost = 20000m,
                OdcCost = 1000m,
                TotalProjectCost = 21000m,
                CumulativeCost = 36500m,
                Revenue = 25000m,
                CumulativeRevenue = 45000m,
                CashFlow = 4000m,
                ProjectId = 10
            };

            var command = new UpdateCashflowCommand { Id = cashflowId, Cashflow = commandDto };

            var existingCashflow = new Cashflow
            {
                Id = cashflowId,
                Month = "Jan 2026",
                ProjectId = 10
            };

            _cashflowRepositoryMock.Setup(repo => repo.GetByIdAsync(cashflowId))
                .ReturnsAsync(existingCashflow);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            _cashflowRepositoryMock.Verify(repo => repo.UpdateAsync(existingCashflow), Times.Once);
            _cashflowRepositoryMock.Verify(repo => repo.SaveChangesAsync(), Times.Once);

            Assert.NotNull(result);
            Assert.Equal(cashflowId, result.Id);
            Assert.Equal("Feb 2026", result.Month);
            Assert.Equal(150, result.TotalHours);
            Assert.Equal(20000m, result.PersonnelCost);
            Assert.Equal(10, result.ProjectId);
        }

        [Fact]
        public async Task Handle_NonExistingCashflow_ReturnsNull()
        {
            // Arrange
            var cashflowId = 999;
            var command = new UpdateCashflowCommand { Id = cashflowId, Cashflow = new CashflowDto() };

            _cashflowRepositoryMock.Setup(repo => repo.GetByIdAsync(cashflowId))
                .ReturnsAsync((Cashflow)null!);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            _cashflowRepositoryMock.Verify(repo => repo.UpdateAsync(It.IsAny<Cashflow>()), Times.Never);
            _cashflowRepositoryMock.Verify(repo => repo.SaveChangesAsync(), Times.Never);
            Assert.Null(result);
        }
    }
}
