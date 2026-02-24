using Moq;
using NJS.Application.Services;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace NJS.API.Tests.Services
{
    public class OpportunityHistoryServiceTests
    {
        private readonly Mock<IOpportunityHistoryRepository> _repositoryMock;
        private readonly OpportunityHistoryService _service;

        public OpportunityHistoryServiceTests()
        {
            _repositoryMock = new Mock<IOpportunityHistoryRepository>();
            _service = new OpportunityHistoryService(_repositoryMock.Object);
        }

        [Fact]
        public async Task GetAllHistoryAsync_ShouldReturnAllHistory()
        {
            // Arrange
            var histories = new List<OpportunityHistory>
            {
                new OpportunityHistory { Id = 1, OpportunityId = 1, Action = "Created" },
                new OpportunityHistory { Id = 2, OpportunityId = 1, Action = "Updated" },
                new OpportunityHistory { Id = 3, OpportunityId = 2, Action = "Created" }
            };

            _repositoryMock.Setup(r => r.GetAllAsync())
                .ReturnsAsync(histories);

            // Act
            var result = await _service.GetAllHistoryAsync();

            // Assert
            Assert.Equal(3, result.Count);
            Assert.Contains(result, h => h.Id == 1);
            Assert.Contains(result, h => h.Id == 2);
            Assert.Contains(result, h => h.Id == 3);
        }

        [Fact]
        public async Task GetHistoryByIdAsync_ShouldReturnHistory()
        {
            // Arrange
            var historyId = 1;
            var history = new OpportunityHistory { Id = historyId, OpportunityId = 1, Action = "Created" };

            _repositoryMock.Setup(r => r.GetByIdAsync(historyId))
                .ReturnsAsync(history);

            // Act
            var result = await _service.GetHistoryByIdAsync(historyId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(historyId, result.Id);
            Assert.Equal("Created", result.Action);
        }

        [Fact]
        public async Task AddHistoryAsync_ShouldCallRepositoryAddAsync()
        {
            // Arrange
            var history = new OpportunityHistory
            {
                OpportunityId = 1,
                Action = "Created",
                ActionBy = "user1",
                ActionDate = DateTime.UtcNow,
                Comments = "Initial creation"
            };

            // Act
            await _service.AddHistoryAsync(history);

            // Assert
            _repositoryMock.Verify(r => r.AddAsync(history), Times.Once);
        }

        [Fact]
        public async Task UpdateHistoryAsync_ShouldCallRepositoryUpdateAsync()
        {
            // Arrange
            var history = new OpportunityHistory
            {
                Id = 1,
                OpportunityId = 1,
                Action = "Updated",
                ActionBy = "user1",
                ActionDate = DateTime.UtcNow,
                Comments = "Updated comments"
            };

            // Act
            await _service.UpdateHistoryAsync(history);

            // Assert
            _repositoryMock.Verify(r => r.UpdateAsync(history), Times.Once);
        }

        [Fact]
        public async Task GetHistoryByOpportunityIdAsync_ShouldReturnHistoryForOpportunity()
        {
            // Arrange
            var opportunityId = 1;
            var histories = new List<OpportunityHistory>
            {
                new OpportunityHistory { Id = 1, OpportunityId = opportunityId, Action = "Created" },
                new OpportunityHistory { Id = 2, OpportunityId = opportunityId, Action = "Updated" }
            };

            _repositoryMock.Setup(r => r.GetByOpportunityIdAsync(opportunityId))
                .ReturnsAsync(histories);

            // Act
            var result = await _service.GetHistoryByOpportunityIdAsync(opportunityId);

            // Assert
            Assert.Equal(2, result.Count);
            Assert.All(result, h => Assert.Equal(opportunityId, h.OpportunityId));
        }

        [Fact]
        public async Task DeleteHistoryAsync_ShouldCallRepositoryDeleteAsync()
        {
            // Arrange
            var historyId = 1;

            // Act
            await _service.DeleteHistoryAsync(historyId);

            // Assert
            _repositoryMock.Verify(r => r.DeleteAsync(historyId), Times.Once);
        }
    }
}
