using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using EDR.API.Tests.Infrastructure;
using EDR.Application.CQRS.CheckReview.Commands;
using EDR.Application.DTOs;
using Xunit;

namespace EDR.API.Tests.Integration
{
    public class CheckReviewControllerIntegrationTests : IntegrationTestBase
    {
        private const string BaseUrl = "/api/checkreview";

        #region GetAll

        [Fact]
        public async Task GetAll_ShouldReturn200()
        {
            var response = await Client.GetAsync(BaseUrl);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        #endregion

        #region Create

        [Fact]
        public async Task Create_ShouldReturn201_WhenValid()
        {
            var seed = await SeedProjectOnlyAsync();
            var command = new CreateCheckReviewCommand
            {
                ProjectId = seed.ProjectId,
                ActivityNo = "CR-001",
                ActivityName = "Test Review",
                DocumentNumber = "DOC-TEST-001",
                DocumentName = "Test Spec",
                Objective = "Ensure quality",
                References = "Ref1",
                FileName = "File1.pdf",
                QualityIssues = "None",
                Completion = "Y",
                CheckedBy = "Tester",
                ApprovedBy = "Manager",
                ActionTaken = "None",
                Maker = "Maker1",
                Checker = "Checker1",
                CreatedBy = "Admin"
            };

            var response = await Client.PostAsJsonAsync(BaseUrl, command);
            var content = await response.Content.ReadAsStringAsync();
            Assert.True(response.IsSuccessStatusCode, $"Create failed with {response.StatusCode}: {content}");
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        }

        [Fact]
        public async Task Create_ShouldReturn400_WhenCommandIsNull()
        {
            var response = await Client.PostAsJsonAsync<CreateCheckReviewCommand>(BaseUrl, null);
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        #endregion

        #region GetById / Project

        [Fact]
        public async Task GetById_ShouldReturn200_WhenExists()
        {
            var seed = await SeedProjectOnlyAsync();
            var command = new CreateCheckReviewCommand
            {
                ProjectId = seed.ProjectId,
                ActivityNo = "CR-002",
                ActivityName = "Test Search",
                DocumentNumber = "", DocumentName = "", Objective = "", References = "", FileName = "", QualityIssues = "", Completion = "Y", CheckedBy = "", ApprovedBy = "", ActionTaken = "", Maker = "", Checker = "", CreatedBy = ""
            };
            var createRes = await Client.PostAsJsonAsync(BaseUrl, command);
            var created = await DeserializeResponseAsync<CheckReviewDto>(createRes);

            var response = await Client.GetAsync($"{BaseUrl}/{created.Id}");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetById_ShouldReturn404_WhenNotExists()
        {
            var response = await Client.GetAsync($"{BaseUrl}/99999");
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task GetByProject_ShouldReturn200()
        {
            var seed = await SeedProjectOnlyAsync();
            var response = await Client.GetAsync($"{BaseUrl}/project/{seed.ProjectId}");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        #endregion

        #region Update

        [Fact]
        public async Task Update_ShouldReturn200_WhenExists()
        {
            var seed = await SeedProjectOnlyAsync();
            var command = new CreateCheckReviewCommand
            {
                ProjectId = seed.ProjectId,
                ActivityNo = "CR-003",
                ActivityName = "Test Update",
                DocumentNumber = "", DocumentName = "", Objective = "", References = "", FileName = "", QualityIssues = "", Completion = "Y", CheckedBy = "", ApprovedBy = "", ActionTaken = "", Maker = "", Checker = "", CreatedBy = ""
            };
            var createRes = await Client.PostAsJsonAsync(BaseUrl, command);
            var created = await DeserializeResponseAsync<CheckReviewDto>(createRes);

            var updateCmd = new UpdateCheckReviewCommand
            {
                Id = created.Id,
                ProjectId = seed.ProjectId,
                ActivityNo = "CR-003-MODIFIED",
                ActivityName = "Test Update",
                DocumentNumber = "", DocumentName = "", Objective = "", References = "", FileName = "", QualityIssues = "", Completion = "Y", CheckedBy = "", ApprovedBy = "", ActionTaken = "", Maker = "", Checker = "", UpdatedBy = ""
            };

            var response = await Client.PutAsJsonAsync($"{BaseUrl}/{created.Id}", updateCmd);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task Update_ShouldReturn400_WhenIdMismatch()
        {
            var updateCmd = new UpdateCheckReviewCommand { Id = 999 };
            var response = await Client.PutAsJsonAsync($"{BaseUrl}/1", updateCmd);
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        #endregion

        #region Delete

        [Fact]
        public async Task Delete_ShouldReturn204_WhenExists()
        {
            var seed = await SeedProjectOnlyAsync();
            var command = new CreateCheckReviewCommand
            {
                ProjectId = seed.ProjectId,
                ActivityNo = "CR-004",
                ActivityName = "Test Delete",
                DocumentNumber = "", DocumentName = "", Objective = "", References = "", FileName = "", QualityIssues = "", Completion = "Y", CheckedBy = "", ApprovedBy = "", ActionTaken = "", Maker = "", Checker = "", CreatedBy = ""
            };
            var createRes = await Client.PostAsJsonAsync(BaseUrl, command);
            var created = await DeserializeResponseAsync<CheckReviewDto>(createRes);

            var response = await Client.DeleteAsync($"{BaseUrl}/{created.Id}");
            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

            var getRes = await Client.GetAsync($"{BaseUrl}/{created.Id}");
            Assert.Equal(HttpStatusCode.NotFound, getRes.StatusCode);
        }

        #endregion
    }
}
