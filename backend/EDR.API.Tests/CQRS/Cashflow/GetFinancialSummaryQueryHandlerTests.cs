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
    public class GetFinancialSummaryQueryHandlerTests
    {
        private readonly Mock<IMonthlyProgressRepository> _mockRepo;
        private readonly GetFinancialSummaryQueryHandler _handler;

        public GetFinancialSummaryQueryHandlerTests()
        {
            _mockRepo = new Mock<IMonthlyProgressRepository>();
            _handler = new GetFinancialSummaryQueryHandler(_mockRepo.Object);
        }

        [Fact]
        public async Task Handle_NoData_ReturnsEmptyDto()
        {
            // Arrange
            var projectId = 1;
            var query = new GetFinancialSummaryQuery(projectId);
            _mockRepo.Setup(r => r.GetByProjectIdAsync(projectId))
                .ReturnsAsync(new List<EDR.Domain.Entities.MonthlyProgress>());

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(0, result.TotalProjectValue);
        }

        [Fact]
        public async Task Handle_ValidData_CalculatesSummaryCorrectly()
        {
            // Arrange
            var projectId = 1;
            var query = new GetFinancialSummaryQuery(projectId);

            var monthlyProgresses = new List<EDR.Domain.Entities.MonthlyProgress>
            {
                new EDR.Domain.Entities.MonthlyProgress
                {
                    ProjectId = projectId,
                    Year = 2024,
                    Month = 1,
                    FinancialDetails = new FinancialDetails { Net = 50000m },
                    ContractAndCost = new ContractAndCost { TotalCumulativeCost = 10000m },
                    ProgressDeliverables = new List<ProgressDeliverable>
                    {
                        new ProgressDeliverable { PaymentDue = 5000m }
                    }
                },
                new EDR.Domain.Entities.MonthlyProgress
                {
                    ProjectId = projectId,
                    Year = 2024,
                    Month = 2,
                    FinancialDetails = new FinancialDetails { Net = 60000m }, // Latest value
                    ContractAndCost = new ContractAndCost { TotalCumulativeCost = 15000m }, // Latest value
                    ProgressDeliverables = new List<ProgressDeliverable>
                    {
                        new ProgressDeliverable { PaymentDue = 7000m }
                    }
                }
            };

            _mockRepo.Setup(r => r.GetByProjectIdAsync(projectId))
                .ReturnsAsync(monthlyProgresses);

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(60000m, result.TotalProjectValue); // From latest month (Feb)
            Assert.Equal(12000m, result.AmountInvoiced); // 5000 + 7000
            Assert.Equal(15000m, result.AmountSpent); // From latest month (Feb)
            Assert.Equal(-3000m, result.CurrentCashPosition); // 12000 - 15000
        }
    }
}
