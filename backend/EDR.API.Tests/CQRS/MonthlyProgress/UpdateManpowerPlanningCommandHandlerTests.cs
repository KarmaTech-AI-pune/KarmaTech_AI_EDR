using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Moq;
using Xunit;
using EDR.Application.CQRS.MonthlyProgress.Commands;
using EDR.Application.CQRS.MonthlyProgress.Handlers;
using EDR.Application.DTOs;
using EDR.Repositories.Interfaces;
using EDR.Domain.Entities;

namespace EDR.API.Tests.CQRS.MonthlyProgress.Handlers
{
    public class UpdateManpowerPlanningCommandHandlerTests
    {
        private readonly Mock<IMonthlyProgressRepository> _mockRepo;
        private readonly UpdateManpowerPlanningCommandHandler _handler;

        public UpdateManpowerPlanningCommandHandlerTests()
        {
            _mockRepo = new Mock<IMonthlyProgressRepository>();
            _handler = new UpdateManpowerPlanningCommandHandler(_mockRepo.Object);
        }

        [Fact]
        public async Task Handle_ValidRequest_UpdatesAndReturnsDto()
        {
            // Arrange
            var manpowerId = 100;
            var monthlyProgressId = 10;
            
            var existingEntity = new EDR.Domain.Entities.MonthlyProgress
            {
                Id = monthlyProgressId,
                ManpowerEntries = new List<ManpowerPlanning>
                {
                    new ManpowerPlanning { Id = manpowerId, WorkAssignment = "OldTask", Planned = 5 }
                }
            };

            var dto = new ManpowerDto { WorkAssignment = "NewTask", Planned = 10 };
            var command = new UpdateManpowerPlanningCommand { MonthlyProgressId = monthlyProgressId, ManpowerPlanningId = manpowerId, ManpowerPlanning = dto };

            _mockRepo.Setup(r => r.GetByIdAsync(monthlyProgressId)).ReturnsAsync(existingEntity);
            _mockRepo.Setup(r => r.UpdateManpowerPlanningAsync(It.IsAny<ManpowerPlanning>())).Returns(Task.CompletedTask);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("NewTask", result.WorkAssignment);
            Assert.Equal(10, result.Planned);

            // Verify the nested entity was actually updated
            var updatedManpower = existingEntity.ManpowerEntries.First();
            Assert.Equal("NewTask", updatedManpower.WorkAssignment);
            Assert.Equal(10, updatedManpower.Planned);

            _mockRepo.Verify(r => r.UpdateManpowerPlanningAsync(updatedManpower), Times.Once);
        }

        [Fact]
        public async Task Handle_ManpowerNotFound_ReturnsNull()
        {
            // Arrange
            var monthlyProgressId = 10;
            var existingEntity = new EDR.Domain.Entities.MonthlyProgress
            {
                Id = monthlyProgressId,
                ManpowerEntries = new List<ManpowerPlanning>()
            };

            var dto = new ManpowerDto();
            var command = new UpdateManpowerPlanningCommand { MonthlyProgressId = monthlyProgressId, ManpowerPlanningId = 999, ManpowerPlanning = dto };

            _mockRepo.Setup(r => r.GetByIdAsync(monthlyProgressId)).ReturnsAsync(existingEntity);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.Null(result);
            _mockRepo.Verify(r => r.UpdateManpowerPlanningAsync(It.IsAny<ManpowerPlanning>()), Times.Never);
        }
    }
}
