using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;
using EDR.Application.CQRS.SprintDailyProgresses.Handlers;
using EDR.Application.CQRS.SprintDailyProgresses.Commands;
using EDR.Application.CQRS.SprintDailyProgresses.Queries;
using EDR.Application.Dtos;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Services;
using EDR.Domain.UnitWork;
using Microsoft.Extensions.Configuration;
using EDR.Application;

namespace EDR.API.Tests.CQRS.SprintDailyProgresses
{
    public class SprintDailyProgressTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public SprintDailyProgressTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var mockTenantService = new Mock<ICurrentTenantService>();
            mockTenantService.Setup(s => s.TenantId).Returns(1);

            _context = new ProjectManagementContext(options, mockTenantService.Object, Mock.Of<IConfiguration>());
            _unitOfWork = new UnitOfWork(_context);

            var config = new MapperConfiguration(cfg => cfg.AddProfile<MappingProfile>());
            _mapper = config.CreateMapper();
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public async Task Create_SprintPlanNotFound_ThrowsKeyNotFoundException()
        {
            // Arrange
            var handler = new CreateSprintDailyProgressCommandHandler(_unitOfWork, _mapper);
            var command = new CreateSprintDailyProgressCommand { SprintPlanId = 99 };

            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() => handler.Handle(command, CancellationToken.None));
        }

        [Fact]
        public async Task Create_Success_ReturnsDto()
        {
            // Arrange
            _context.SprintPlans.Add(new SprintPlan { SprintId = 1, TenantId = 1, ProjectId = 1 });
            await _context.SaveChangesAsync();

            var handler = new CreateSprintDailyProgressCommandHandler(_unitOfWork, _mapper);
            var command = new CreateSprintDailyProgressCommand 
            { 
                SprintPlanId = 1, 
                TenantId = 1, 
                Date = DateTime.UtcNow,
                PlannedStoryPoints = 10,
                CompletedStoryPoints = 5,
                RemainingStoryPoints = 5,
                CreatedBy = "Test"
            };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(5, result.CompletedStoryPoints);
            Assert.Equal(1, _context.SprintDailyProgresses.Count());
        }

        [Fact]
        public async Task Update_Success_ReturnsUpdatedDto()
        {
            // Arrange
            _context.SprintPlans.Add(new SprintPlan { SprintId = 1, TenantId = 1, ProjectId = 1 });
            var progress = new SprintDailyProgress 
            { 
                DailyProgressId = 1, 
                SprintPlanId = 1, 
                TenantId = 1,
                CompletedStoryPoints = 5 
            };
            _context.SprintDailyProgresses.Add(progress);
            await _context.SaveChangesAsync();

            var handler = new UpdateSprintDailyProgressCommandHandler(_unitOfWork, _mapper);
            var command = new UpdateSprintDailyProgressCommand 
            { 
                DailyProgressId = 1, 
                SprintPlanId = 1, 
                CompletedStoryPoints = 8,
                UpdatedBy = "Updater"
            };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.Equal(8, result.CompletedStoryPoints);
            var updated = _context.SprintDailyProgresses.First();
            Assert.Equal(8, updated.CompletedStoryPoints);
            Assert.Equal("Updater", updated.UpdatedBy);
        }

        [Fact]
        public async Task GetBySprintPlanId_ReturnsList()
        {
            // Arrange
            _context.SprintPlans.Add(new SprintPlan { SprintId = 1, TenantId = 1, ProjectId = 1 });
            _context.SprintDailyProgresses.AddRange(
                new SprintDailyProgress { DailyProgressId = 1, SprintPlanId = 1, TenantId = 1 },
                new SprintDailyProgress { DailyProgressId = 2, SprintPlanId = 1, TenantId = 1 }
            );
            await _context.SaveChangesAsync();

            var handler = new GetSprintDailyProgressBySprintPlanIdQueryHandler(_unitOfWork, _mapper);
            var query = new GetSprintDailyProgressBySprintPlanIdQuery { SprintPlanId = 1 };

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Equal(2, result.Count());
        }
    }
}
