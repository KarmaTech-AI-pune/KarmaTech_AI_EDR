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
    public class GetProjectClosuresByProjectIdQueryHandlerTests
    {
        private readonly Mock<IProjectClosureRepository> _mockRepo;
        private readonly GetProjectClosuresByProjectIdQueryHandler _handler;

        public GetProjectClosuresByProjectIdQueryHandlerTests()
        {
            _mockRepo = new Mock<IProjectClosureRepository>();
            _handler = new GetProjectClosuresByProjectIdQueryHandler(_mockRepo.Object);
        }

        [Fact]
        public async Task Handle_ValidRequest_ReturnsMappedList()
        {
            // Arrange
            var entities = new List<EDR.Domain.Entities.ProjectClosure>
            {
                new EDR.Domain.Entities.ProjectClosure { Id = 1, ProjectId = 5, WorkflowHistories = new List<ProjectClosureWorkflowHistory>() },
                new EDR.Domain.Entities.ProjectClosure { Id = 2, ProjectId = 5, WorkflowHistories = new List<ProjectClosureWorkflowHistory>() }
            };

            _mockRepo.Setup(r => r.GetAllByProjectId(5)).ReturnsAsync(entities);

            var query = new GetProjectClosuresByProjectIdQuery(5);

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
            _mockRepo.Setup(r => r.GetAllByProjectId(99)).ReturnsAsync(new List<EDR.Domain.Entities.ProjectClosure>());

            var query = new GetProjectClosuresByProjectIdQuery(99);

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
        }
    }
}
