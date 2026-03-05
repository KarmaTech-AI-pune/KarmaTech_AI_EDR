using Moq;
using EDR.Application.CQRS.Cashflow.Commands;
using EDR.Application.CQRS.Cashflow.Handlers;
using EDR.Application.DTOs;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.Handlers
{
    public class CreateCashflowCommandHandlerTests
    {
        private readonly Mock<ICashflowRepository> _cashflowRepositoryMock;
        private readonly CreateCashflowCommandHandler _handler;

        public CreateCashflowCommandHandlerTests()
        {
            _cashflowRepositoryMock = new Mock<ICashflowRepository>();
            _handler = new CreateCashflowCommandHandler(_cashflowRepositoryMock.Object);
        }

        [Fact]
        public async Task Handle_ValidRequest_AddsCashflowAndReturnsDto()
        {
            // Arrange
            var projectId = 1;
            var commandDto = new CashflowDto
            {
                Month = "Jan 2026",
                TotalHours = 120,
                PersonnelCost = 15000m,
                OdcCost = 500m,
                TotalProjectCost = 15500m,
                CumulativeCost = 15500m,
                Revenue = 20000m,
                CumulativeRevenue = 20000m,
                CashFlow = 4500m,
                ProjectId = projectId
            };

            var command = new CreateCashflowCommand { Cashflow = commandDto };

            _cashflowRepositoryMock.Setup(repo => repo.AddAsync(It.IsAny<Cashflow>()))
                .Callback<Cashflow>(c => c.Id = 10); // simulate ID assigned by DB

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            _cashflowRepositoryMock.Verify(repo => repo.AddAsync(It.IsAny<Cashflow>()), Times.Once);
            _cashflowRepositoryMock.Verify(repo => repo.SaveChangesAsync(), Times.Once);

            Assert.NotNull(result);
            Assert.Equal(10, result.Id);
            Assert.Equal(commandDto.Month, result.Month);
            Assert.Equal(commandDto.TotalHours, result.TotalHours);
            Assert.Equal(commandDto.PersonnelCost, result.PersonnelCost);
            Assert.Equal(commandDto.OdcCost, result.OdcCost);
            Assert.Equal(projectId, result.ProjectId);
        }
    }
}
