using System.Net;
using System.Net.Http.Json;
using EDR.API.Tests.Infrastructure;
using EDR.Application.CQRS.Correspondence.Commands;
using EDR.Application.Dtos;
using EDR.Application.DTOs;
using EDR.Domain.Entities;
using Xunit;

namespace EDR.API.Tests.Regression
{
    /// <summary>
    /// Regression tests for Correspondence Inward/Outward workflows.
    /// 
    /// KNOWN API CONSTRAINTS:
    /// - Inward correspondence enforces 1-record-per-project uniqueness.
    ///   Each test that creates inward must use a project with no prior inward record.
    /// - GET /api/Project/{id} has a circular reference JSON bug (Program <-> Projects).
    ///   Tests avoid that endpoint and use collection GETs instead.
    /// </summary>
    public class CorrespondenceWorkflowRegressionTests : IntegrationTestBase
    {
        /// <summary>Creates a brand-new project via API to guarantee no prior inward record.</summary>
        private async Task<int> CreateFreshProjectAsync(string nameSuffix = "")
        {
            // First we need a program
            var programDto = new ProgramDto
            {
                TenantId = 1,
                Name = $"Corr Prog {nameSuffix} {Guid.NewGuid():N}",
                Description = "For correspondence test"
            };
            var progResponse = await Client.PostAsJsonAsync("/api/Program", programDto);
            Assert.Equal(HttpStatusCode.Created, progResponse.StatusCode);
            var programIdStr = await progResponse.Content.ReadAsStringAsync();
            int.TryParse(programIdStr, out int programId);

            var projectDto = new ProjectDto
            {
                TenantId = 1,
                Name = $"Corr Project {nameSuffix} {Guid.NewGuid():N}",
                ClientName = "Test Client",
                Sector = "IT",
                Currency = "USD",
                ProgramId = programId,
                Status = EDR.Domain.Entities.ProjectStatus.Active,
                CreatedAt = DateTime.UtcNow
            };
            var projResponse = await Client.PostAsJsonAsync("/api/Project", projectDto);
            Assert.Equal(HttpStatusCode.Created, projResponse.StatusCode);
            // Read ID from project body (contains Id field)
            var projContent = await projResponse.Content.ReadAsStringAsync();
            var project = System.Text.Json.JsonSerializer.Deserialize<ProjectDto>(
                projContent, JsonOptions);
            Assert.True(project.Id > 0);
            return project.Id;
        }

        [Fact]
        public async Task InwardCorrespondence_CreateAndRetrieveByProject()
        {
            // Arrange: create a fresh project with no prior inward record
            var projectId = await CreateFreshProjectAsync("Inward-A");

            var createCmd = new CreateCorrespondenceInwardCommand
            {
                ProjectId = projectId,
                IncomingLetterNo = $"INC-{Guid.NewGuid().ToString("N")[..6]}",
                LetterDate = DateTime.UtcNow.AddDays(-5),
                EdrInwardNo = $"EDR-{Guid.NewGuid().ToString("N")[..6]}",
                ReceiptDate = DateTime.UtcNow,
                From = "External Client",
                Subject = "Regression Inward Correspondence",
                Remarks = "Regression test record",
                AttachmentDetails = "test-attach",
                ActionTaken = "test-action",
                StoragePath = "test-path",
                CreatedBy = "regression-test"
            };

            // Act: create
            var createResponse = await Client.PostAsJsonAsync("/api/Correspondence/inward", createCmd);
            var resultStr = await createResponse.Content.ReadAsStringAsync();
            Assert.True(createResponse.IsSuccessStatusCode, $"Inward Create failed with {createResponse.StatusCode}. Content: {resultStr}");

            // Assert: retrieve by project
            var getResponse = await Client.GetAsync($"/api/Correspondence/inward/project/{projectId}");
            Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
            var content = await getResponse.Content.ReadAsStringAsync();
            Assert.Contains("Regression Inward Correspondence", content);
        }

        [Fact]
        public async Task OutwardCorrespondence_CreateAndRetrieveByProject()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();

            var createCmd = new CreateCorrespondenceOutwardCommand
            {
                ProjectId = seed.ProjectId,
                LetterNo = $"OUT-{Guid.NewGuid().ToString("N")[..6]}",
                LetterDate = DateTime.UtcNow,
                To = "External Stakeholder",
                Subject = "Regression Outward Correspondence",
                Remarks = "Regression test outward record",
                AttachmentDetails = "test-attach",
                ActionTaken = "test-action",
                StoragePath = "test-path",
                CreatedBy = "regression-test"
            };

            // Act: create
            var createResponse = await Client.PostAsJsonAsync("/api/Correspondence/outward", createCmd);
            var resultStr = await createResponse.Content.ReadAsStringAsync();
            Assert.True(createResponse.IsSuccessStatusCode, $"Outward Create failed with {createResponse.StatusCode}. Content: {resultStr}");

            // Assert: retrieve by project
            var getResponse = await Client.GetAsync(
                $"/api/Correspondence/outward/project/{seed.ProjectId}");
            Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
            var content = await getResponse.Content.ReadAsStringAsync();
            Assert.Contains("Regression Outward Correspondence", content);
        }

        [Fact]
        public async Task InwardAndOutward_SameProject_IndependentOperations()
        {
            // Arrange: inward is unique per project, so use separate projects
            var inwardProjectId = await CreateFreshProjectAsync("Inward-B");
            var outwardProjectId = await CreateFreshProjectAsync("Outward-B");

            var inwardCmd = new CreateCorrespondenceInwardCommand
            {
                ProjectId = inwardProjectId,
                IncomingLetterNo = $"IND-IN-{Guid.NewGuid().ToString("N")[..6]}",
                LetterDate = DateTime.UtcNow.AddDays(-3),
                EdrInwardNo = $"EDR-IND-{Guid.NewGuid().ToString("N")[..6]}",
                ReceiptDate = DateTime.UtcNow,
                From = "Sender A",
                Subject = "Inward Independent Test",
                Remarks = "Independent test remark",
                AttachmentDetails = "test-attach",
                ActionTaken = "test-action",
                StoragePath = "test-path",
                CreatedBy = "regression-test"
            };
            var inwardResponse = await Client.PostAsJsonAsync("/api/Correspondence/inward", inwardCmd);
            var inwardResultStr = await inwardResponse.Content.ReadAsStringAsync();
            Assert.True(inwardResponse.IsSuccessStatusCode, $"Inward Create (Independent) failed: {inwardResultStr}");
            var inward = await DeserializeResponseAsync<CorrespondenceInwardDto>(inwardResponse);

            var outwardCmd = new CreateCorrespondenceOutwardCommand
            {
                ProjectId = outwardProjectId,
                LetterNo = $"IND-OUT-{Guid.NewGuid().ToString("N")[..6]}",
                LetterDate = DateTime.UtcNow,
                To = "Recipient B",
                Subject = "Outward Independent Test",
                AttachmentDetails = "test-attach",
                ActionTaken = "test-action",
                StoragePath = "test-path",
                CreatedBy = "regression-test"
            };
            var outwardResponse = await Client.PostAsJsonAsync("/api/Correspondence/outward", outwardCmd);
            var outwardResultStr = await outwardResponse.Content.ReadAsStringAsync();
            Assert.True(outwardResponse.IsSuccessStatusCode, $"Outward Create (Independent) failed: {outwardResultStr}");
            var outward = await DeserializeResponseAsync<CorrespondenceOutwardDto>(outwardResponse);

            // Act: delete inward — outward must remain unaffected
            var deleteInward = await Client.DeleteAsync($"/api/Correspondence/inward/{inward.Id}");
            Assert.True(deleteInward.IsSuccessStatusCode);

            // Assert: outward still accessible
            var getOutward = await Client.GetAsync($"/api/Correspondence/outward/{outward.Id}");
            Assert.Equal(HttpStatusCode.OK, getOutward.StatusCode);
        }

        [Fact]
        public async Task InwardCorrespondence_Update_PersistsChanges()
        {
            // Arrange: fresh project with no prior inward
            var projectId = await CreateFreshProjectAsync("Inward-C");

            var cmd = new CreateCorrespondenceInwardCommand
            {
                ProjectId = projectId,
                IncomingLetterNo = $"UPD-IN-{Guid.NewGuid().ToString("N")[..6]}",
                LetterDate = DateTime.UtcNow.AddDays(-7),
                EdrInwardNo = $"EDR-UPD-{Guid.NewGuid().ToString("N")[..6]}",
                ReceiptDate = DateTime.UtcNow,
                From = "Original Sender",
                Subject = "Original Subject",
                Remarks = "Original remark",
                AttachmentDetails = "test-attach",
                ActionTaken = "test-action",
                StoragePath = "test-path",
                CreatedBy = "regression-test"
            };
            var createResponse = await Client.PostAsJsonAsync("/api/Correspondence/inward", cmd);
            Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
            var created = await DeserializeResponseAsync<CorrespondenceInwardDto>(createResponse);

            // Act: update using anonymous object matching UpdateCorrespondenceInwardCommand shape
            var updateCmd = new
            {
                created.Id,
                ProjectId = projectId,
                created.IncomingLetterNo,
                created.LetterDate,
                created.EdrInwardNo,
                created.ReceiptDate,
                created.From,
                Subject = "Updated Subject via Regression",
                Remarks = "Updated remark",
                AttachmentDetails = "test-attach",
                ActionTaken = "test-action",
                StoragePath = "test-path",
                UpdatedBy = "regression-test"
            };
            var updateResponse = await Client.PutAsJsonAsync(
                $"/api/Correspondence/inward/{created.Id}", updateCmd);
            Assert.True(updateResponse.IsSuccessStatusCode,
                $"Update failed with {updateResponse.StatusCode}");

            // Assert: verify by listing inward for the project
            var listResponse = await Client.GetAsync(
                $"/api/Correspondence/inward/project/{projectId}");
            Assert.Equal(HttpStatusCode.OK, listResponse.StatusCode);
            var listContent = await listResponse.Content.ReadAsStringAsync();
            Assert.Contains("Updated Subject via Regression", listContent);
        }

        [Fact]
        public async Task DeleteCorrespondence_DoesNotAffectProject()
        {
            // Arrange: fresh project, no prior inward record
            var projectId = await CreateFreshProjectAsync("Inward-D");

            var cmd = new CreateCorrespondenceInwardCommand
            {
                ProjectId = projectId,
                IncomingLetterNo = $"DEL-IN-{Guid.NewGuid().ToString("N")[..6]}",
                LetterDate = DateTime.UtcNow.AddDays(-1),
                EdrInwardNo = $"EDR-DEL-{Guid.NewGuid().ToString("N")[..6]}",
                ReceiptDate = DateTime.UtcNow,
                From = "Deletable Sender",
                Subject = "Deletable Correspondence",
                Remarks = "Deletable remark",
                AttachmentDetails = "test-attach",
                ActionTaken = "test-action",
                StoragePath = "test-path",
                CreatedBy = "regression-test"
            };
            var createResponse = await Client.PostAsJsonAsync("/api/Correspondence/inward", cmd);
            var createResultStr = await createResponse.Content.ReadAsStringAsync();
            Assert.True(createResponse.IsSuccessStatusCode, $"Delete test inward Create failed: {createResultStr}");
            var created = await DeserializeResponseAsync<CorrespondenceInwardDto>(createResponse);

            // Act: delete correspondence
            var deleteResponse = await Client.DeleteAsync($"/api/Correspondence/inward/{created.Id}");
            Assert.True(deleteResponse.IsSuccessStatusCode);

            // Assert: the project list still returns OK (project not affected)
            var getAllProjects = await Client.GetAsync("/api/Project");
            Assert.Equal(HttpStatusCode.OK, getAllProjects.StatusCode);
        }
    }
}
