using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Moq;
using Xunit;
using EDR.Application.CQRS.Cashflow.Handlers;
using EDR.Application.CQRS.Cashflow.Queries;
using EDR.Application.Dtos;
using EDR.Repositories.Interfaces;
using EDR.Domain.Entities;

namespace EDR.API.Tests.CQRS.Cashflow.Handlers
{
    public class GetPaymentMilestonesQueryHandlerTests
    {
        private readonly Mock<IPaymentMilestoneRepository> _mockRepo;
        private readonly GetPaymentMilestonesQueryHandler _handler;

        public GetPaymentMilestonesQueryHandlerTests()
        {
            _mockRepo = new Mock<IPaymentMilestoneRepository>();
            _handler = new GetPaymentMilestonesQueryHandler(_mockRepo.Object);
        }

        [Fact]
        public async Task Handle_ValidProjectId_ReturnsMilestoneDtos()
        {
            // Arrange
            var projectId = 1;
            var query = new GetPaymentMilestonesQuery(projectId);
            var milestones = new List<PaymentMilestone>
            {
                new PaymentMilestone
                {
                    Id = 1,
                    Description = "Milestone 1",
                    Percentage = 10m,
                    AmountINR = 1000m,
                    DueDate = "2024-01-01"
                },
                new PaymentMilestone
                {
                    Id = 2,
                    Description = "Milestone 2",
                    Percentage = 20m,
                    AmountINR = 2000m,
                    DueDate = "2024-02-01"
                }
            };

            _mockRepo.Setup(r => r.GetByProjectIdAsync(projectId))
                .ReturnsAsync(milestones);

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count);
            Assert.Equal("Milestone 1", result[0].Description);
            Assert.Equal(10m, result[0].Percentage);
            Assert.Equal("Milestone 2", result[1].Description);
            Assert.Equal(2000m, result[1].AmountINR);
        }

        [Fact]
        public async Task Handle_NoMilestones_ReturnsEmptyList()
        {
            // Arrange
            var projectId = 1;
            var query = new GetPaymentMilestonesQuery(projectId);
            _mockRepo.Setup(r => r.GetByProjectIdAsync(projectId))
                .ReturnsAsync(new List<PaymentMilestone>());

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
        }
    }
}
