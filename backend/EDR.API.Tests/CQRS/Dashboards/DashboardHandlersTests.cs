using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;
using EDR.Application.CQRS.Dashboard.Handlers;
using EDR.Application.CQRS.Dashboard;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Enums;
using EDR.Domain.Services;
using Microsoft.Extensions.Configuration;

namespace EDR.API.Tests.CQRS.Dashboards
{
    public class DashboardHandlersTests : IDisposable
    {
        private readonly ProjectManagementContext _context;

        public DashboardHandlersTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var mockTenantService = new Mock<ICurrentTenantService>();
            mockTenantService.Setup(s => s.TenantId).Returns(1);

            _context = new ProjectManagementContext(options, mockTenantService.Object, Mock.Of<IConfiguration>());
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public async Task GetProjectDashboardQueryHandler_ReturnsValidData()
        {
            // Arrange
            var projectId = 1;
            var project = new Project 
            { 
                Id = projectId, 
                Name = "Test Project", 
                TenantId = 1, 
                Region = "North",
                EstimatedProjectCost = 1000000,
                StartDate = DateTime.UtcNow.AddMonths(-6),
                EndDate = DateTime.UtcNow.AddMonths(6),
                Status = ProjectStatus.Active
            };
            _context.Projects.Add(project);

            // JobStartForm for Revenue & Profit
            var jsf = new EDR.Domain.Entities.JobStartForm
            {
                FormId = 1,
                ProjectId = projectId,
                TotalProjectFees = 500000,
                ProjectFees = 200000,
                ProfitPercentage = 15,
                TotalExpenses = 100000,
                CreatedDate = DateTime.UtcNow,
                TenantId = 1,
                FormTitle = "JSF 1",
                IsDeleted = false
            };
            _context.JobStartForms.Add(jsf);

            // WBS & Planned Hours for Cashflow
            var wbsHeader = new WBSHeader { Id = 1, ProjectId = projectId, TenantId = 1 };
            _context.WBSHeaders.Add(wbsHeader);
            var wbs = new WorkBreakdownStructure { Id = 1, WBSHeaderId = 1, TenantId = 1 };
            _context.WorkBreakdownStructures.Add(wbs);
            var task = new WBSTask { Id = 1, WorkBreakdownStructureId = 1, TenantId = 1, Title = "Task 1", IsDeleted = false };
            _context.WBSTasks.Add(task);
            var ph = new WBSTaskPlannedHour 
            { 
                Id = 1, 
                WBSTaskId = 1, 
                Month = DateTime.UtcNow.Month.ToString("D2"), 
                Year = DateTime.UtcNow.Year.ToString(), 
                PlannedHours = 100,
                TenantId = 1
            };
            _context.WBSTaskPlannedHours.Add(ph);

            // Sprint Tasks for Priority Matrix
            var sprintPlan = new SprintPlan { SprintId = 1, ProjectId = projectId, TenantId = 1 };
            _context.SprintPlans.Add(sprintPlan);
            var sprintTask = new SprintTask 
            { 
                Taskid = 1, 
                SprintPlanId = 1, 
                TaskTitle = "Priority Task", 
                Taskstatus = "In Progress", 
                Taskpriority = "High",
                TenantId = 1,
                SprintPlan = sprintPlan
            };
            _context.SprintTasks.Add(sprintTask);

            await _context.SaveChangesAsync();

            var handler = new GetProjectDashboardQueryHandler(_context);
            var query = new GetProjectDashboardQuery { ProjectId = projectId };

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(projectId, result.ProjectId);
            Assert.Equal(500000, result.TotalRevenueExpected);
            Assert.Equal(15, result.ProfitMargin);
            Assert.Equal(10, result.BudgetPercentage); // 100000 / 1000000 * 100
            Assert.NotEmpty(result.MonthlyCashflow);
            Assert.NotEmpty(result.TaskPriorityMatrix);
        }

        [Fact]
        public async Task GetProgramDashboardQueryHandler_ReturnsAggregatedData()
        {
            // Arrange
            var programId = 1;
            _context.Programs.Add(new EDR.Domain.Entities.Program { Id = programId, Name = "Test Program", TenantId = 1 });

            // Project 1
            var p1 = new Project { Id = 101, ProgramId = programId, Name = "P1", TenantId = 1, EstimatedProjectCost = 500000 };
            _context.Projects.Add(p1);
            _context.JobStartForms.Add(new EDR.Domain.Entities.JobStartForm 
            { 
                FormId = 101, ProjectId = 101, TotalProjectFees = 200000, ProjectFees = 100000, ProfitPercentage = 10, TenantId = 1, CreatedDate = DateTime.UtcNow, IsDeleted = false, FormTitle = "JSF P1"
            });

            // Project 2
            var p2 = new Project { Id = 102, ProgramId = programId, Name = "P2", TenantId = 1, EstimatedProjectCost = 500000 };
            _context.Projects.Add(p2);
            _context.JobStartForms.Add(new EDR.Domain.Entities.JobStartForm 
            { 
                FormId = 102, ProjectId = 102, TotalProjectFees = 300000, ProjectFees = 150000, ProfitPercentage = 20, TenantId = 1, CreatedDate = DateTime.UtcNow, IsDeleted = false, FormTitle = "JSF P2"
            });

            await _context.SaveChangesAsync();

            var handler = new GetProgramDashboardQueryHandler(_context);
            var query = new GetProgramDashboardQuery { ProgramId = programId };

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(programId, result.ProgramId);
            Assert.Equal(2, result.TotalProjects);
            Assert.Equal(500000, result.TotalRevenueExpected); // 200000 + 300000
            Assert.Equal(15, result.ProfitMargin); // Average of 10 and 20
        }
    }
}
