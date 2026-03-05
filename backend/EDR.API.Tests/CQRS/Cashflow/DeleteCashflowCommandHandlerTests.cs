using Moq;
using EDR.Application.CQRS.Cashflow.Commands;
using EDR.Application.CQRS.Cashflow.Handlers;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.Handlers
{
    public class DeleteCashflowCommandHandlerTests
    {
        private readonly Mock<ICashflowRepository> _cashflowRepositoryMock;
        private readonly DeleteCashflowCommandHandler _handler;

        public DeleteCashflowCommandHandlerTests()
        {
            _cashflowRepositoryMock = new Mock<ICashflowRepository>();
            _handler = new DeleteCashflowCommandHandler(_cashflowRepositoryMock.Object);
        }

        [Fact]
        public async Task Handle_ExistingCashflow_RemovesFromRepository()
        {
            // Arrange
            var cashflowId = 1;
            var command = new DeleteCashflowCommand { Id = cashflowId };
            var existingCashflow = new Cashflow { Id = cashflowId, ProjectId = 10 };

            _cashflowRepositoryMock.Setup(repo => repo.GetByIdAsync(cashflowId))
                .ReturnsAsync(existingCashflow);

            // Act
            await _handler.Handle(command, CancellationToken.None);

            // Assert
            _cashflowRepositoryMock.Verify(repo => repo.GetByIdAsync(cashflowId), Times.Once);
            _cashflowRepositoryMock.Verify(repo => repo.RemoveAsync(existingCashflow), Times.Once);
            _cashflowRepositoryMock.Verify(repo => repo.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task Handle_NonExistingCashflow_DoesNothing()
        {
            // Arrange
            var cashflowId = 999;
            var command = new DeleteCashflowCommand { Id = cashflowId };

            _cashflowRepositoryMock.Setup(repo => repo.GetByIdAsync(cashflowId))
                .ReturnsAsync((Cashflow)null!);

            // Act
            await _handler.Handle(command, CancellationToken.None);

            // Assert
            _cashflowRepositoryMock.Verify(repo => repo.GetByIdAsync(cashflowId), Times.Once);
            _cashflowRepositoryMock.Verify(repo => repo.RemoveAsync(It.IsAny<Cashflow>()), Times.Never);
            _cashflowRepositoryMock.Verify(repo => repo.SaveChangesAsync(), Times.Never);
        }
    }
}
