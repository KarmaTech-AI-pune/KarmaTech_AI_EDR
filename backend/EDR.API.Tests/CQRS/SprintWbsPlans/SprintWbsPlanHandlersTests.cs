using EDR.Application.CQRS.SprintWbsPlans.Commands;
using EDR.Application.CQRS.SprintWbsPlans.Queries;
using EDR.Application.Dtos;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Services;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.CQRS.SprintWbsPlans
{
    public class SprintWbsPlanHandlersTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly Mock<ICurrentTenantService> _tenantServiceMock;

        public SprintWbsPlanHandlersTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _tenantServiceMock = new Mock<ICurrentTenantService>();
            _tenantServiceMock.SetupProperty(t => t.TenantId, 1);

            var configMock = new Mock<IConfiguration>();
            _context = new ProjectManagementContext(options, _tenantServiceMock.Object, configMock.Object);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public async Task BulkCreateSprintWbsPlanCommandHandler_CreatesPlans()
        {
            // Arrange
            var handler = new BulkCreateSprintWbsPlanCommandHandler(_context);
            var command = new BulkCreateSprintWbsPlanCommand
            {
                Items = new List<CreateSprintWbsPlanDto>
                {
                    new CreateSprintWbsPlanDto { ProjectId = 1, WBSTaskName = "Task 1", SprintNumber = 1 },
                    new CreateSprintWbsPlanDto { ProjectId = 1, WBSTaskName = "Task 2", SprintNumber = 1 }
                }
            };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.Equal(2, result.Count);
            Assert.Equal(2, _context.SprintWbsPlans.Count());
        }

        [Fact]
        public async Task GetCurrentSprintWbsPlanQueryHandler_ReturnsPlans()
        {
            // Arrange
            _context.Projects.Add(new Project { Id = 1, Name = "P1", TenantId = 1 });
            _context.SprintWbsPlans.Add(new SprintWbsPlan { ProjectId = 1, MonthYear = "03-2024", TenantId = 1, IsConsumed = false });
            await _context.SaveChangesAsync();

            var handler = new GetCurrentSprintWbsPlanQueryHandler(_context);
            var query = new GetCurrentSprintWbsPlanQuery(1);

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Single(result.WbsPlans);
        }

        [Fact]
        public async Task GetSprintWbsPlansByProjectQueryHandler_ReturnsPlans()
        {
            // Arrange
            _context.SprintWbsPlans.Add(new SprintWbsPlan { ProjectId = 1, TenantId = 1 });
            _context.SprintWbsPlans.Add(new SprintWbsPlan { ProjectId = 1, TenantId = 1 });
            _context.SprintWbsPlans.Add(new SprintWbsPlan { ProjectId = 2, TenantId = 1 });
            await _context.SaveChangesAsync();

            var handler = new GetSprintWbsPlansByProjectQueryHandler(_context);
            var query = new GetSprintWbsPlansByProjectQuery(1);

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Equal(2, result.Count());
        }
    }
}
