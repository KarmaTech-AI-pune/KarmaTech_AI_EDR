using EDR.Application.CQRS.Dashboard.PendingApproval.Handler;
using EDR.Application.CQRS.Dashboard.PendingApproval.Query;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Enums;
using EDR.Domain.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;





namespace EDR.API.Tests.CQRS.Dashboards
{
    public class GetPendingFormsHandlerTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly GetPendingFormsHandler _handler;

        public GetPendingFormsHandlerTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var tenantServiceMock = new Mock<ICurrentTenantService>();
            tenantServiceMock.SetupProperty(t => t.TenantId, 1);
            var configMock = new Mock<IConfiguration>();

            _context = new ProjectManagementContext(options, tenantServiceMock.Object, configMock.Object);
            _handler = new GetPendingFormsHandler(_context);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public async Task Handle_ReturnsPendingForms()
        {
            // Arrange
            var user = new User { Id = "u1", Name = "Test User" };
            _context.Users.Add(user);

            var project = new Project { Id = 1, Name = "Project 1", TenantId = 1 };
            _context.Projects.Add(project);

            var jsfHeader = new EDR.Domain.Entities.JobStartFormHeader { Id = 1, StatusId = (int)PMWorkflowStatusEnum.SentForReview, TenantId = 1 };
            jsfHeader.JobStartFormHistories = new System.Collections.Generic.List<EDR.Domain.Entities.JobStartFormHistory> 
            { 
                new EDR.Domain.Entities.JobStartFormHistory { Id = 1, AssignedToId = "u1", Action = "Pending", ActionDate = DateTime.UtcNow, AssignedTo = user, TenantId = 1 } 
            };
            _context.JobStartFormHeaders.Add(jsfHeader);

            var jsf = new EDR.Domain.Entities.JobStartForm { FormId = 1, ProjectId = 1, FormTitle = "Form 1", Header = jsfHeader, TenantId = 1 };
            _context.JobStartForms.Add(jsf);

            await _context.SaveChangesAsync();

            var query = new GetPendingFormsQuery();

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.TotalPendingForms);
            Assert.Equal("JobStartForm", result.PendingForms[0].FormType);
            Assert.Equal("Test User", result.PendingForms[0].HoldingUserName);
        }
    }
}
