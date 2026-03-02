using System;
using System.Collections.Generic;
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
    public class GetProjectClosureByIdQueryHandlerTests
    {
        private readonly Mock<IProjectClosureRepository> _mockRepo;
        private readonly GetProjectClosureByIdQueryHandler _handler;

        public GetProjectClosureByIdQueryHandlerTests()
        {
            _mockRepo = new Mock<IProjectClosureRepository>();
            _handler = new GetProjectClosureByIdQueryHandler(_mockRepo.Object);
        }

        [Fact]
        public async Task Handle_ValidRequest_ReturnsMappedDto()
        {
            // Arrange
            var entity = new EDR.Domain.Entities.ProjectClosure 
            { 
                Id = 10, 
                ProjectId = 5, 
                ClientFeedback = "Good",
                WorkflowHistories = new List<ProjectClosureWorkflowHistory>()
            };

            _mockRepo.Setup(r => r.GetById(10)).ReturnsAsync(entity);

            var query = new GetProjectClosureByIdQuery(10);

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(10, result.Id);
            Assert.Equal(5, result.ProjectId);
            Assert.Equal("Good", result.ClientFeedback);
        }

        [Fact]
        public async Task Handle_NotFound_ReturnsNull()
        {
            // Arrange
            _mockRepo.Setup(r => r.GetById(99)).ReturnsAsync((EDR.Domain.Entities.ProjectClosure)null);

            var query = new GetProjectClosureByIdQuery(99);

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Null(result);
        }
    }
}
