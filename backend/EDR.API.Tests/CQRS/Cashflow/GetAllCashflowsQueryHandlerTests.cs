using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;
using EDR.Application.CQRS.Cashflow.Handlers;
using EDR.Application.CQRS.Cashflow.Queries;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Services;
using MediatR;

namespace EDR.API.Tests.CQRS.Cashflow.Handlers
{
    public class GetAllCashflowsQueryHandlerTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly Mock<IMediator> _mockMediator;
        private readonly Mock<ICurrentTenantService> _mockTenantService;
        private readonly Mock<IConfiguration> _mockConfig;
        private readonly GetAllCashflowsQueryHandler _handler;

        public GetAllCashflowsQueryHandlerTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _mockTenantService = new Mock<ICurrentTenantService>();
            _mockTenantService.Setup(s => s.TenantId).Returns(1);

            _mockConfig = new Mock<IConfiguration>();
            _mockMediator = new Mock<IMediator>();

            _context = new ProjectManagementContext(options, _mockTenantService.Object, _mockConfig.Object);
            _handler = new GetAllCashflowsQueryHandler(_context, _mockMediator.Object);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public async Task Handle_ProjectNotFound_ReturnsNull()
        {
            // Arrange
            var query = new GetAllCashflowsQuery { ProjectId = 999 };

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task Handle_NoWbsData_ReturnsNull()
        {
            // Arrange
            var project = new EDR.Domain.Entities.Project { Id = 1, Name = "Test Project", TenantId = 1 };
            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            var query = new GetAllCashflowsQuery { ProjectId = 1 };

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task Handle_ValidData_ReturnsCashflowResponse()
        {
            // Arrange
            var projectId = 1;
            var project = new EDR.Domain.Entities.Project { Id = projectId, Name = "Test Project", TenantId = 1 };
            _context.Projects.Add(project);

            var wbsHeader = new WBSHeader { Id = 1, ProjectId = projectId, TenantId = 1 };
            _context.WBSHeaders.Add(wbsHeader);

            var wbs = new WorkBreakdownStructure { Id = 1, WBSHeaderId = 1, TenantId = 1 };
            _context.WorkBreakdownStructures.Add(wbs);

            // Adding Manpower Task
            var manpowerTask = new WBSTask
            {
                Id = 1,
                WorkBreakdownStructureId = 1,
                TaskType = TaskType.Manpower,
                EstimatedBudget = 500m,
                TenantId = 1,
                IsDeleted = false
            };
            manpowerTask.PlannedHours.Add(new WBSTaskPlannedHour
            {
                Year = "2024",
                Month = "Jan",
                PlannedHours = 10,
                TenantId = 1
            });
            _context.WBSTasks.Add(manpowerTask);

            // Adding ODC Task
            var odcTask = new WBSTask
            {
                Id = 2,
                WorkBreakdownStructureId = 1,
                TaskType = TaskType.ODC,
                EstimatedBudget = 200m,
                TenantId = 1,
                IsDeleted = false
            };
            odcTask.PlannedHours.Add(new WBSTaskPlannedHour
            {
                Year = "2024",
                Month = "Feb",
                PlannedHours = 5,
                TenantId = 1
            });
            _context.WBSTasks.Add(odcTask);

            // Adding Payment Milestone
            var milestone = new PaymentMilestone
            {
                Id = 1,
                ProjectId = projectId,
                Description = "M1",
                AmountINR = 10000m,
                DueDate = "2024-03-01",
                TenantId = 1
            };
            _context.PaymentMilestones.Add(milestone);

            await _context.SaveChangesAsync();

            var query = new GetAllCashflowsQuery { ProjectId = projectId };

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Test Project", result.ProjectName);
            Assert.Equal(2, result.Cashflows.Count); // Jan and Feb (periods are derived from PlannedHours)
            
            var janCashflow = result.Cashflows.First(c => c.Month == "Jan-24");
            Assert.Equal(5000m, janCashflow.PersonnelCost); // 10 * 500
            Assert.Equal(0, janCashflow.OdcCost);
            Assert.Equal(5000m, janCashflow.TotalProjectCost);
            Assert.Equal(5000m, janCashflow.CumulativeCost);

            var febCashflow = result.Cashflows.First(c => c.Month == "Feb-24");
            Assert.Equal(0, febCashflow.PersonnelCost);
            Assert.Equal(1000m, febCashflow.OdcCost); // 5 * 200
            Assert.Equal(1000m, febCashflow.TotalProjectCost);
            Assert.Equal(6000m, febCashflow.CumulativeCost); // 5000 + 1000

            // Summary asserts
            Assert.NotNull(result.Summary);
            Assert.Equal(5000m, result.Summary.PureManpowerCost);
            Assert.Equal(1000m, result.Summary.OtherODC);
            Assert.Equal(6000m, result.Summary.Total);
        }
    }
}
