using Moq;
using EDR.Application.DTOs;
using EDR.Application.CQRS.Cashflow.Commands;
using EDR.Application.CQRS.Cashflow.Queries;
using EDR.Application.CQRS.Cashflow.Handlers;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.CQRS.Cashflow
{
    /// <summary>
    /// Unit tests for all Cashflow CQRS handlers.
    /// Uses mocked ICashflowRepository — no database required.
    /// </summary>
    public class CashflowHandlerTests
    {
        private readonly Mock<ICashflowRepository> _mockRepo;

        public CashflowHandlerTests()
        {
            _mockRepo = new Mock<ICashflowRepository>();
        }

        private Domain.Entities.Cashflow BuildEntity(int id = 1, int projectId = 1) => new()
        {
            Id = id,
            ProjectId = projectId,
            Month = "January",
            TotalHours = 160,
            PersonnelCost = 10000m,
            OdcCost = 2000m,
            TotalProjectCost = 12000m,
            CumulativeCost = 12000m,
            Revenue = 15000m,
            CumulativeRevenue = 15000m,
            CashFlow = 3000m
        };

        private CashflowDto BuildDto(int id = 0, int projectId = 1) => new()
        {
            Id = id,
            ProjectId = projectId,
            Month = "January",
            TotalHours = 160,
            PersonnelCost = 10000m,
            OdcCost = 2000m,
            TotalProjectCost = 12000m,
            CumulativeCost = 12000m,
            Revenue = 15000m,
            CumulativeRevenue = 15000m,
            CashFlow = 3000m
        };

        // ==================== CreateCashflowCommandHandler ====================

        [Fact]
        public async Task CreateCashflowCommandHandler_Handle_ReturnsCreatedDto()
        {
            // Arrange
            var handler = new CreateCashflowCommandHandler(_mockRepo.Object);
            var dto = BuildDto();
            var command = new CreateCashflowCommand { Cashflow = dto };

            Domain.Entities.Cashflow capturedEntity = null;
            _mockRepo.Setup(r => r.AddAsync(It.IsAny<Domain.Entities.Cashflow>()))
                     .Callback<Domain.Entities.Cashflow>(e => { capturedEntity = e; e.Id = 10; })
                     .Returns(Task.CompletedTask);
            _mockRepo.Setup(r => r.SaveChangesAsync()).ReturnsAsync(1);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.IsType<CashflowDto>(result);
            Assert.Equal(dto.Month, result.Month);
            Assert.Equal(dto.ProjectId, result.ProjectId);
            _mockRepo.Verify(r => r.AddAsync(It.IsAny<Domain.Entities.Cashflow>()), Times.Once);
            _mockRepo.Verify(r => r.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task CreateCashflowCommandHandler_Handle_ThrowsWhenRepoFails()
        {
            // Arrange
            var handler = new CreateCashflowCommandHandler(_mockRepo.Object);
            var command = new CreateCashflowCommand { Cashflow = BuildDto() };
            _mockRepo.Setup(r => r.AddAsync(It.IsAny<Domain.Entities.Cashflow>()))
                     .ThrowsAsync(new Exception("DB error"));

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() => handler.Handle(command, CancellationToken.None));
        }

        // ==================== GetAllCashflowsQueryHandler ====================

        [Fact]
        public async Task GetAllCashflowsQueryHandler_Handle_ReturnsMappedList()
        {
            // Arrange
            var handler = new GetAllCashflowsQueryHandler(_mockRepo.Object);
            var entities = new List<Domain.Entities.Cashflow>
            {
                BuildEntity(1, 5),
                BuildEntity(2, 5)
            };
            _mockRepo.Setup(r => r.GetAllAsync(5)).ReturnsAsync(entities);

            // Act
            var result = await handler.Handle(new GetAllCashflowsQuery { ProjectId = 5 }, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count);
            Assert.All(result, item => Assert.Equal(5, item.ProjectId));
        }

        [Fact]
        public async Task GetAllCashflowsQueryHandler_Handle_ReturnsEmptyList_WhenNoneExist()
        {
            // Arrange
            var handler = new GetAllCashflowsQueryHandler(_mockRepo.Object);
            _mockRepo.Setup(r => r.GetAllAsync(99)).ReturnsAsync(new List<Domain.Entities.Cashflow>());

            // Act
            var result = await handler.Handle(new GetAllCashflowsQuery { ProjectId = 99 }, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
        }

        // ==================== GetCashflowQueryHandler ====================

        [Fact]
        public async Task GetCashflowQueryHandler_Handle_ReturnsMappedDto_WhenFound()
        {
            // Arrange
            var handler = new GetCashflowQueryHandler(_mockRepo.Object);
            var entity = BuildEntity(1, 5);
            _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(entity);

            // Act
            var result = await handler.Handle(new GetCashflowQuery { Id = 1 }, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.Id);
            Assert.Equal("January", result.Month);
        }

        [Fact]
        public async Task GetCashflowQueryHandler_Handle_ReturnsNull_WhenNotFound()
        {
            // Arrange
            var handler = new GetCashflowQueryHandler(_mockRepo.Object);
            _mockRepo.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((Domain.Entities.Cashflow)null);

            // Act
            var result = await handler.Handle(new GetCashflowQuery { Id = 999 }, CancellationToken.None);

            // Assert
            Assert.Null(result);
        }

        // ==================== UpdateCashflowCommandHandler ====================

        [Fact]
        public async Task UpdateCashflowCommandHandler_Handle_UpdatesSuccessfully()
        {
            // Arrange
            var handler = new UpdateCashflowCommandHandler(_mockRepo.Object);
            var entity = BuildEntity(5, 1);
            var dto = BuildDto(5, 1);
            dto.Month = "February";

            _mockRepo.Setup(r => r.GetByIdAsync(5)).ReturnsAsync(entity);
            _mockRepo.Setup(r => r.UpdateAsync(It.IsAny<Domain.Entities.Cashflow>())).Returns(Task.CompletedTask);
            _mockRepo.Setup(r => r.SaveChangesAsync()).ReturnsAsync(1);

            // Act
            await handler.Handle(new UpdateCashflowCommand { Id = 5, Cashflow = dto }, CancellationToken.None);

            // Assert
            _mockRepo.Verify(r => r.UpdateAsync(It.IsAny<Domain.Entities.Cashflow>()), Times.Once);
            _mockRepo.Verify(r => r.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task UpdateCashflowCommandHandler_Handle_ReturnsNull_WhenNotFound()
        {
            // Arrange
            var handler = new UpdateCashflowCommandHandler(_mockRepo.Object);
            _mockRepo.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((Domain.Entities.Cashflow)null);

            // Act
            var result = await handler.Handle(new UpdateCashflowCommand { Id = 999, Cashflow = BuildDto(999) }, CancellationToken.None);

            // Assert
            Assert.Null(result);
        }

        // ==================== DeleteCashflowCommandHandler ====================

        [Fact]
        public async Task DeleteCashflowCommandHandler_Handle_DeletesSuccessfully()
        {
            // Arrange
            var handler = new DeleteCashflowCommandHandler(_mockRepo.Object);
            var entity = BuildEntity(3, 1);

            _mockRepo.Setup(r => r.GetByIdAsync(3)).ReturnsAsync(entity);
            _mockRepo.Setup(r => r.RemoveAsync(It.IsAny<Domain.Entities.Cashflow>())).Returns(Task.CompletedTask);
            _mockRepo.Setup(r => r.SaveChangesAsync()).ReturnsAsync(1);

            // Act
            await handler.Handle(new DeleteCashflowCommand { Id = 3 }, CancellationToken.None);

            // Assert
            _mockRepo.Verify(r => r.RemoveAsync(entity), Times.Once);
            _mockRepo.Verify(r => r.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task DeleteCashflowCommandHandler_Handle_ReturnsUnitValue_WhenNotFound()
        {
            // Arrange
            var handler = new DeleteCashflowCommandHandler(_mockRepo.Object);
            _mockRepo.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((Domain.Entities.Cashflow)null);

            // Act
            await handler.Handle(new DeleteCashflowCommand { Id = 999 }, CancellationToken.None);
            
            // Assert
            // No exception implies success/ignored for Not Found.
        }
    }
}
