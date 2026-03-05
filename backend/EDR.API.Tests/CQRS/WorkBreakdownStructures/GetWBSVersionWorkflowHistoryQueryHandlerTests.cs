using EDR.Application.CQRS.WorkBreakdownStructures.Handlers;
using EDR.Application.CQRS.WorkBreakdownStructures.Queries;
using EDR.Application.Dtos;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using Microsoft.Extensions.Logging;
using Moq;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.CQRS.PMWorkflow
{
    public class GetWBSVersionWorkflowHistoryQueryHandlerTests
    {
        private readonly Mock<IWBSVersionRepository> _repositoryMock;
        private readonly Mock<ILogger<GetWBSVersionWorkflowHistoryQueryHandler>> _loggerMock;
        private readonly GetWBSVersionWorkflowHistoryQueryHandler _handler;

        public GetWBSVersionWorkflowHistoryQueryHandlerTests()
        {
            _repositoryMock = new Mock<IWBSVersionRepository>();
            _loggerMock = new Mock<ILogger<GetWBSVersionWorkflowHistoryQueryHandler>>();
            _handler = new GetWBSVersionWorkflowHistoryQueryHandler(_repositoryMock.Object, _loggerMock.Object);
        }

        [Fact]
        public async Task Handle_ReturnsWorkflowHistory()
        {
            // Arrange
            var query = new GetWBSVersionWorkflowHistoryQuery(1);
            
            var user = new User { Id = "u1", UserName = "TestUser" };
            var status = new EDR.Domain.Entities.PMWorkflowStatus { Id = 1, Status = "Pending" };
            
            var history = new List<WBSVersionWorkflowHistory>
            {
                new WBSVersionWorkflowHistory 
                { 
                    Id = 1, 
                    WBSVersionHistoryId = 1, 
                    StatusId = 1,
                    Status = status,
                    Action = "Submitted",
                    ActionDate = DateTime.UtcNow,
                    ActionBy = "u1",
                    ActionUser = user
                }
            };

            _repositoryMock.Setup(r => r.GetWorkflowHistoryAsync(query.WBSVersionHistoryId))
                .ReturnsAsync(history);

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Single(result);
            Assert.Equal(1, result[0].WBSVersionHistoryId);
            Assert.Equal("Submitted", result[0].Action);
            Assert.Equal("Pending", result[0].Status);
            Assert.Equal("TestUser", result[0].ActionByName);
        }

        [Fact]
        public async Task Handle_RepositoryThrowsException_ThrowsException()
        {
            // Arrange
            var query = new GetWBSVersionWorkflowHistoryQuery(1);
            _repositoryMock.Setup(r => r.GetWorkflowHistoryAsync(query.WBSVersionHistoryId))
                .ThrowsAsync(new Exception("Database error"));

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => _handler.Handle(query, CancellationToken.None));
        }
    }
}
