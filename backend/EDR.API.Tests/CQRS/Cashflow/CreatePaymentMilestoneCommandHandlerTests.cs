using System;
using System.Threading;
using System.Threading.Tasks;
using Moq;
using Xunit;
using EDR.Application.CQRS.Cashflow.Commands;
using EDR.Application.CQRS.Cashflow.Handlers;
using EDR.Application.Dtos;
using EDR.Repositories.Interfaces;
using EDR.Domain.Entities;
using Microsoft.Extensions.Logging;

namespace EDR.API.Tests.CQRS.Cashflow.Handlers
{
    public class CreatePaymentMilestoneCommandHandlerTests
    {
        private readonly Mock<IPaymentMilestoneRepository> _mockRepo;
        private readonly Mock<ILogger<CreatePaymentMilestoneCommandHandler>> _mockLogger;
        private readonly CreatePaymentMilestoneCommandHandler _handler;

        public CreatePaymentMilestoneCommandHandlerTests()
        {
            _mockRepo = new Mock<IPaymentMilestoneRepository>();
            _mockLogger = new Mock<ILogger<CreatePaymentMilestoneCommandHandler>>();
            _handler = new CreatePaymentMilestoneCommandHandler(_mockRepo.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task Handle_ValidRequest_CreatesAndReturnsDto()
        {
            // Arrange
            var command = new CreatePaymentMilestoneCommand
            {
                ProjectId = 1,
                Description = "Test Milestone",
                Percentage = 10.5m,
                AmountINR = 1000m,
                DueDate = "2025-12-31",
                ChangedBy = "User1"
            };

            var savedEntity = new PaymentMilestone
            {
                Id = 100,
                ProjectId = 1,
                Description = "Test Milestone",
                Percentage = 10.5m,
                AmountINR = 1000m,
                DueDate = "2025-12-31"
            };

            _mockRepo.Setup(r => r.AddAsync(It.IsAny<PaymentMilestone>()))
                .ReturnsAsync(savedEntity);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(100, result.Id);
            Assert.Equal("Test Milestone", result.Description);
            Assert.Equal(10.5m, result.Percentage);
            Assert.Equal(1000m, result.AmountINR);
            Assert.Equal("2025-12-31", result.DueDate);
            
            _mockRepo.Verify(r => r.AddAsync(It.Is<PaymentMilestone>(e => 
                e.ProjectId == command.ProjectId &&
                e.Description == command.Description &&
                e.Percentage == command.Percentage &&
                e.AmountINR == command.AmountINR &&
                e.DueDate == command.DueDate &&
                e.CreatedBy == command.ChangedBy
            )), Times.Once);
        }

        [Fact]
        public void Constructor_NullRepository_ThrowsArgumentNullException()
        {
            Assert.Throws<ArgumentNullException>(() => new CreatePaymentMilestoneCommandHandler(null, _mockLogger.Object));
        }

        [Fact]
        public void Constructor_NullLogger_ThrowsArgumentNullException()
        {
            Assert.Throws<ArgumentNullException>(() => new CreatePaymentMilestoneCommandHandler(_mockRepo.Object, null));
        }
    }
}
