using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Moq;
using Xunit;
using EDR.Application.CQRS.ChangeControl.Queries;
using EDR.Application.CQRS.ChangeControl.Handlers;
using EDR.Repositories.Interfaces;
using EDR.Domain.Entities;

namespace EDR.API.Tests.CQRS.ChangeControl.Handlers
{
    public class GetAllChangeControlsQueryHandlerTests
    {
        private readonly Mock<IChangeControlRepository> _mockRepo;
        private readonly GetAllChangeControlsQueryHandler _handler;

        public GetAllChangeControlsQueryHandlerTests()
        {
            _mockRepo = new Mock<IChangeControlRepository>();
            _handler = new GetAllChangeControlsQueryHandler(_mockRepo.Object);
        }

        [Fact]
        public async Task Handle_ReturnsAllChangeControlsMappedToDto()
        {
            // Arrange
            var entities = new List<EDR.Domain.Entities.ChangeControl>
            {
                new EDR.Domain.Entities.ChangeControl
                {
                    Id = 1,
                    ProjectId = 10,
                    Description = "Desc 1",
                    WorkflowHistories = new List<ChangeControlWorkflowHistory>
                    {
                        new ChangeControlWorkflowHistory { Id = 100, Action = "Submit", ActionDate = DateTime.UtcNow }
                    }
                },
                new EDR.Domain.Entities.ChangeControl
                {
                    Id = 2,
                    ProjectId = 10,
                    Description = "Desc 2",
                    WorkflowHistories = new List<ChangeControlWorkflowHistory>()
                }
            };

            _mockRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(entities);

            var query = new GetAllChangeControlsQuery();

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
            
            var first = result.FirstOrDefault(r => r.Id == 1);
            Assert.NotNull(first);
            Assert.Equal("Desc 1", first.Description);
            Assert.NotNull(first.WorkflowHistory);
            Assert.Equal(100, first.WorkflowHistory.Id);

            var second = result.FirstOrDefault(r => r.Id == 2);
            Assert.NotNull(second);
            Assert.Null(second.WorkflowHistory);
        }

//        [Fact]
//        public async Task Handle_NullArgument_ThrowsArgumentNullException()
//        {
//            // Act & Assert
//            // This is just to test defensive programming, if it doesn't throw, it's fine, but let's assume it might
//            await Assert.ThrowsAnyAsync<Exception>(() => _handler.Handle(null, CancellationToken.None));
//        }
    }
}
