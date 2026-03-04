using System.Collections.Generic;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using EDR.API.Tests.Infrastructure;
using EDR.Application.Dtos;
using EDR.Application.CQRS.PMWorkflow.Commands;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Enums;
using Xunit;
using System.Linq;

namespace EDR.API.Tests.Integration
{
    public class PMWorkflowControllerIntegrationTests : IntegrationTestBase
    {
        private const string BaseUrl = "/api/PMWorkflow";
        private int _changeControlId;

        private async Task SeedChangeControlAsync()
        {
            using var scope = Factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ProjectManagementContext>();

            // Seed PMWorkflowStatus with Id=1 if not already present.
            // ChangeControl.WorkflowStatusId = 1, and GetWorkflowHistoryQueryHandler does
            // .Include(c => c.WorkflowStatus) — without this FK target the query returns null.
            if (!db.PMWorkflowStatuses.Any(s => s.Id == 1))
            {
                db.PMWorkflowStatuses.Add(new PMWorkflowStatus { Id = 1, Status = "Initial" });
                await db.SaveChangesAsync();
            }

            // Seed a Program and Project first to satisfy the FK on ChangeControl.ProjectId
            var program = new EDR.Domain.Entities.Program
            {
                TenantId = 1,
                Name = "Test Program",
                Description = "PM Workflow test program"
            };
            db.Programs.Add(program);
            await db.SaveChangesAsync();

            var project = new Project
            {
                TenantId = 1,
                Name = "Test Project",
                ClientName = "Test Client",
                Sector = "IT",
                Currency = "USD",
                ProgramId = program.Id,
                Status = ProjectStatus.Active,
                CreatedAt = System.DateTime.UtcNow
            };
            db.Projects.Add(project);
            await db.SaveChangesAsync();

            // Check if ChangeControl already seeded (idempotent within the same test instance)
            var existing = db.ChangeControls.FirstOrDefault(c => c.TenantId == 1 && c.SrNo == 1);
            if (existing != null)
            {
                _changeControlId = existing.Id;
                return;
            }

            var changeControl = new ChangeControl
            {
                TenantId = 1,
                ProjectId = project.Id,
                SrNo = 1,
                DateLogged = System.DateTime.UtcNow,
                Originator = "Test User",
                Description = "Test description",
                CostImpact = "High",
                TimeImpact = "High",
                ResourcesImpact = "High",
                QualityImpact = "High",
                ChangeOrderStatus = "Initial",
                ClientApprovalStatus = "Pending",
                ClaimSituation = "None",
                WorkflowStatusId = 1
            };
            db.ChangeControls.Add(changeControl);
            await db.SaveChangesAsync();
            _changeControlId = changeControl.Id;
        }

        [Fact]
        public async Task SendToReview_ShouldReturn200_WhenValidCommand()
        {
            await SeedChangeControlAsync();

            // Arrange
            var command = new ProjectSendToReviewCommand { EntityId = _changeControlId, EntityType = "ChangeControl", Comments = "Test", Action = "Review", AssignedToId = "1" };
            
            // Act
            // Tests the fallback logic / mediator in current auth state
            var response = await Client.PostAsJsonAsync($"{BaseUrl}/sendToReview", command);

            var content = await response.Content.ReadAsStringAsync();
            Assert.True(response.IsSuccessStatusCode, content);
        }

        [Fact]
        public async Task SendToApproval_ShouldReturn200_WhenValidCommand()
        {
            await SeedChangeControlAsync();

            // Arrange
            var command = new ProjectSendToApprovalCommand { EntityId = _changeControlId, EntityType = "ChangeControl", Comments = "Test", Action = "Approval", AssignedToId = "1" };

            // Act
            var response = await Client.PostAsJsonAsync($"{BaseUrl}/sendToApproval", command);

            var content = await response.Content.ReadAsStringAsync();
            Assert.True(response.IsSuccessStatusCode, content);
        }

        [Fact]
        public async Task RequestChanges_ShouldReturn200_WhenValidCommand()
        {
            await SeedChangeControlAsync();

            // Arrange
            var command = new RequestChangesCommand { EntityId = _changeControlId, EntityType = "ChangeControl", Comments = "Test", Action = "Reject", AssignedToId = "1" };

            // Act
            var response = await Client.PostAsJsonAsync($"{BaseUrl}/requestChanges", command);

            var content = await response.Content.ReadAsStringAsync();
            Assert.True(response.IsSuccessStatusCode, content);
        }

        [Fact]
        public async Task Approve_ShouldReturn200_WhenValidCommand()
        {
            await SeedChangeControlAsync();

            // Arrange
            var command = new ApproveCommand { EntityId = _changeControlId, EntityType = "ChangeControl", Comments = "Test", Action = "Approved", AssignedToId = "1" };

            // Act
            var response = await Client.PostAsJsonAsync($"{BaseUrl}/approve", command);

            var content = await response.Content.ReadAsStringAsync();
            Assert.True(response.IsSuccessStatusCode, content);
        }

        [Fact]
        public async Task GetWorkflowHistory_ShouldReturn200()
        {
            await SeedChangeControlAsync();

            // Act
            var response = await Client.GetAsync($"{BaseUrl}/history/ChangeControl/{_changeControlId}");

            var content = await response.Content.ReadAsStringAsync();
            Assert.True(response.IsSuccessStatusCode, content);
        }

        [Fact]
        public async Task CanViewEntity_ShouldReturn200()
        {
            // Act
            var response = await Client.GetAsync($"{BaseUrl}/canView/ChangeControl/1");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }
    }
}
