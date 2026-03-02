using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Moq;
using Xunit;
using EDR.Application.CQRS.ProjectClosure.Queries;
using EDR.Application.CQRS.ProjectClosure.Handlers;
using EDR.Application.Dtos;
using EDR.Repositories.Interfaces;
using EDR.Domain.Entities;

namespace EDR.API.Tests.CQRS.ProjectClosure.Handlers
{
    public class GetAllProjectClosuresQueryHandlerTests
    {
        private readonly Mock<IProjectClosureRepository> _mockRepo;
        private readonly GetAllProjectClosuresQueryHandler _handler;

        public GetAllProjectClosuresQueryHandlerTests()
        {
            _mockRepo = new Mock<IProjectClosureRepository>();
            _handler = new GetAllProjectClosuresQueryHandler(_mockRepo.Object);
        }

        [Fact]
        public async Task Handle_ValidRequest_ReturnsMappedList()
        {
            // Arrange
            var entities = new List<EDR.Domain.Entities.ProjectClosure>
            {
                new EDR.Domain.Entities.ProjectClosure { Id = 1, ProjectId = 10, WorkflowHistories = new List<ProjectClosureWorkflowHistory>() },
                new EDR.Domain.Entities.ProjectClosure { Id = 2, ProjectId = 20, WorkflowHistories = new List<ProjectClosureWorkflowHistory>() }
            };

            _mockRepo.Setup(r => r.GetAll()).ReturnsAsync(entities);

            var query = new GetAllProjectClosuresQuery();

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
            Assert.Equal(1, result.First().Id);
            Assert.Equal(2, result.Last().Id);
        }

        [Fact]
        public async Task Handle_NoRecords_ReturnsEmptyList()
        {
            // Arrange
            _mockRepo.Setup(r => r.GetAll()).ReturnsAsync(new List<EDR.Domain.Entities.ProjectClosure>());

            var query = new GetAllProjectClosuresQuery();

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
        }
    }
}
