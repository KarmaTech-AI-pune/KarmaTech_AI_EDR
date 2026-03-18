using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Moq;
using Xunit;
using EDR.Application.CQRS.ChangeControl.Queries;
using EDR.Application.CQRS.ChangeControl.Handlers;
using EDR.Application.Dtos;
using EDR.Repositories.Interfaces;
using EDR.Domain.Entities;

namespace EDR.API.Tests.CQRS.ChangeControl.Handlers
{
    public class GetChangeControlsByProjectIdQueryHandlerTests
    {
        private readonly Mock<IChangeControlRepository> _mockChangeControlRepo;
        private readonly GetChangeControlsByProjectIdQueryHandler _handler;

        public GetChangeControlsByProjectIdQueryHandlerTests()
        {
            _mockChangeControlRepo = new Mock<IChangeControlRepository>();
            _handler = new GetChangeControlsByProjectIdQueryHandler(_mockChangeControlRepo.Object);
        }

        [Fact]
        public async Task Handle_ValidProjectId_ReturnsMappedDtos()
        {
            // Arrange
            var request = new GetChangeControlsByProjectIdQuery(10);
            
            var workflowHistory = new ChangeControlWorkflowHistory
            {
                Id = 1,
                ChangeControlId = 5,
                ActionDate = new DateTime(2023, 1, 2),
                StatusId = 2,
                Action = "Reviewed",
                ActionBy = "UserA",
                AssignedToId = "UserB"
            };

            var entity1 = new EDR.Domain.Entities.ChangeControl
            {
                Id = 5,
                ProjectId = 10,
                SrNo = 1,
                DateLogged = new DateTime(2023, 1, 1),
                WorkflowHistories = new List<ChangeControlWorkflowHistory> { workflowHistory }
            };

            var entity2 = new EDR.Domain.Entities.ChangeControl
            {
                Id = 6,
                ProjectId = 10,
                SrNo = 2,
                WorkflowHistories = new List<ChangeControlWorkflowHistory>() // Empty history
            };

            var entityList = new List<EDR.Domain.Entities.ChangeControl> { entity1, entity2 };

            _mockChangeControlRepo.Setup(r => r.GetByProjectIdAsync(10)).ReturnsAsync(entityList);

            // Act
            var result = await _handler.Handle(request, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            var resultList = result.ToList();
            Assert.Equal(2, resultList.Count);
            
            Assert.Equal(5, resultList[0].Id);
            Assert.NotNull(resultList[0].WorkflowHistory);
            Assert.Equal(2, resultList[0].WorkflowHistory.StatusId);

            Assert.Equal(6, resultList[1].Id);
            Assert.Null(resultList[1].WorkflowHistory); // Because it has no workflow histories

            _mockChangeControlRepo.Verify(r => r.GetByProjectIdAsync(10), Times.Once);
        }

        [Fact]
        public async Task Handle_NullRequest_ThrowsArgumentNullException()
        {
            // Act & Assert
            await Assert.ThrowsAsync<ArgumentNullException>(() => _handler.Handle(null, CancellationToken.None));
        }

        [Fact]
        public void Constructor_NullRepository_ThrowsArgumentNullException()
        {
            // Act & Assert
            Assert.Throws<ArgumentNullException>(() => new GetChangeControlsByProjectIdQueryHandler(null));
        }
    }
}
