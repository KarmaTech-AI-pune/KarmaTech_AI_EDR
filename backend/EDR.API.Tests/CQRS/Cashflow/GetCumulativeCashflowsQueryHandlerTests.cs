using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Moq;
using Xunit;
using EDR.Application.CQRS.Cashflow.Handlers;
using EDR.Application.CQRS.Cashflow.Queries;
using EDR.Application.DTOs;
using EDR.Repositories.Interfaces;
using EDR.Domain.Entities;

namespace EDR.API.Tests.CQRS.Cashflow.Handlers
{
    public class GetCumulativeCashflowsQueryHandlerTests
    {
        private readonly Mock<IMonthlyProgressRepository> _mockRepo;
        private readonly GetCumulativeCashflowsQueryHandler _handler;

        public GetCumulativeCashflowsQueryHandlerTests()
        {
            _mockRepo = new Mock<IMonthlyProgressRepository>();
            _handler = new GetCumulativeCashflowsQueryHandler(_mockRepo.Object);
        }

        [Fact]
        public async Task Handle_ValidData_CalculatesCumulativeCorrectly()
        {
            // Arrange
            var projectId = 1;
            var query = new GetCumulativeCashflowsQuery(projectId);

            var monthlyProgresses = new List<EDR.Domain.Entities.MonthlyProgress>
            {
                new EDR.Domain.Entities.MonthlyProgress
                {
                    ProjectId = projectId,
                    Year = 2024,
                    Month = 1,
                    ContractAndCost = new ContractAndCost { TotalCumulativeCost = 5000m },
                    ProgressDeliverables = new List<ProgressDeliverable>
                    {
                        new ProgressDeliverable { AchievedDate = DateTime.Now, PaymentDue = 3000m },
                        new ProgressDeliverable { AchievedDate = null, PaymentDue = 1000m }
                    }
                },
                new EDR.Domain.Entities.MonthlyProgress
                {
                    ProjectId = projectId,
                    Year = 2024,
                    Month = 2,
                    ContractAndCost = new ContractAndCost { TotalCumulativeCost = 8000m },
                    ProgressDeliverables = new List<ProgressDeliverable>
                    {
                        new ProgressDeliverable { AchievedDate = DateTime.Now, PaymentDue = 4000m }
                    }
                }
            };

            _mockRepo.Setup(r => r.GetByProjectIdAsync(projectId))
                .ReturnsAsync(monthlyProgresses);

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count);

            var jan = result[0];
            Assert.Equal("Jan-24", jan.Period);
            Assert.Equal(5000m, jan.CumulativeCosts);
            Assert.Equal(3000m, jan.CumulativeRevenue);
            Assert.Equal(-2000m, jan.NetPosition);
            Assert.Equal("Negative", jan.CashPosition);

            var feb = result[1];
            Assert.Equal("Feb-24", feb.Period);
            Assert.Equal(8000m, feb.CumulativeCosts);
            Assert.Equal(7000m, feb.CumulativeRevenue); // 3000 + 4000
            Assert.Equal(-1000m, feb.NetPosition);
            Assert.Equal("Negative", feb.CashPosition);
        }

        [Fact]
        public async Task Handle_PositiveNetPosition_SetsCashPositionToPositive()
        {
            // Arrange
            var projectId = 1;
            var query = new GetCumulativeCashflowsQuery(projectId);

            var monthlyProgresses = new List<EDR.Domain.Entities.MonthlyProgress>
            {
                new EDR.Domain.Entities.MonthlyProgress
                {
                    ProjectId = projectId,
                    Year = 2024,
                    Month = 1,
                    ContractAndCost = new ContractAndCost { TotalCumulativeCost = 2000m },
                    ProgressDeliverables = new List<ProgressDeliverable>
                    {
                        new ProgressDeliverable { AchievedDate = DateTime.Now, PaymentDue = 5000m }
                    }
                }
            };

            _mockRepo.Setup(r => r.GetByProjectIdAsync(projectId))
                .ReturnsAsync(monthlyProgresses);

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            var jan = result[0];
            Assert.Equal(3000m, jan.NetPosition);
            Assert.Equal("Positive", jan.CashPosition);
        }
    }
}
