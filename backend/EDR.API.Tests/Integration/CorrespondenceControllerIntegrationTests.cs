using System;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using EDR.API.Tests.Infrastructure;
using EDR.Application.CQRS.Correspondence.Commands;
using EDR.Application.DTOs;
using Xunit;

namespace EDR.API.Tests.Integration
{
    public class CorrespondenceControllerIntegrationTests : IntegrationTestBase
    {
        private const string BaseInwardUrl = "/api/Correspondence/inward";
        private const string BaseOutwardUrl = "/api/Correspondence/outward";

        #region Inward Correspondence

        [Fact]
        public async Task GetAllInward_ShouldReturn200()
        {
            var response = await Client.GetAsync(BaseInwardUrl);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task CreateInward_ShouldReturn201_WhenValid()
        {
            var seed = await SeedProjectOnlyAsync();
            var command = new CreateCorrespondenceInwardCommand
            {
                ProjectId = seed.ProjectId,
                IncomingLetterNo = "IN-TEST-001",
                LetterDate = DateTime.UtcNow,
                EdrInwardNo = "EDR-IN-001",
                ReceiptDate = DateTime.UtcNow,
                From = "Integration Client",
                Subject = "Inward Test",
                AttachmentDetails = "", ActionTaken = "", StoragePath = "", Remarks = "", CreatedBy = ""
            };

            var response = await Client.PostAsJsonAsync(BaseInwardUrl, command);

            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        }

        [Fact]
        public async Task GetInwardById_ShouldReturn200_WhenExists()
        {
            var seed = await SeedProjectOnlyAsync();
            var command = new CreateCorrespondenceInwardCommand
            {
                ProjectId = seed.ProjectId,
                IncomingLetterNo = "IN-TEST-GET",
                LetterDate = DateTime.UtcNow,
                EdrInwardNo = "EDR-IN-GET",
                ReceiptDate = DateTime.UtcNow,
                From = "Integration Client",
                Subject = "Inward Get Test",
                AttachmentDetails = "", ActionTaken = "", StoragePath = "", Remarks = "", CreatedBy = ""
            };
            var createRes = await Client.PostAsJsonAsync(BaseInwardUrl, command);
            var created = await DeserializeResponseAsync<CorrespondenceInwardDto>(createRes);

            var response = await Client.GetAsync($"{BaseInwardUrl}/{created.Id}");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetInwardByProject_ShouldReturn200()
        {
            var seed = await SeedProjectOnlyAsync();
            var response = await Client.GetAsync($"{BaseInwardUrl}/project/{seed.ProjectId}");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task UpdateInward_ShouldReturn200_WhenExists()
        {
            var seed = await SeedProjectOnlyAsync();
            var command = new CreateCorrespondenceInwardCommand
            {
                ProjectId = seed.ProjectId,
                IncomingLetterNo = "IN-TEST-UPD",
                LetterDate = DateTime.UtcNow,
                EdrInwardNo = "EDR-IN-UPD",
                ReceiptDate = DateTime.UtcNow,
                From = "Client",
                Subject = "Test",
                AttachmentDetails = "", ActionTaken = "", StoragePath = "", Remarks = "", CreatedBy = ""
            };
            var createRes = await Client.PostAsJsonAsync(BaseInwardUrl, command);
            var created = await DeserializeResponseAsync<CorrespondenceInwardDto>(createRes);

            var updateCmd = new UpdateCorrespondenceInwardCommand
            {
                Id = created.Id,
                ProjectId = seed.ProjectId,
                IncomingLetterNo = "IN-TEST-UPD-MODIFIED",
                LetterDate = DateTime.UtcNow,
                EdrInwardNo = "EDR-IN-UPD",
                ReceiptDate = DateTime.UtcNow,
                From = "Client",
                Subject = "Test",
                AttachmentDetails = "", ActionTaken = "", StoragePath = "", Remarks = "", UpdatedBy = ""
            };

            var response = await Client.PutAsJsonAsync($"{BaseInwardUrl}/{created.Id}", updateCmd);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task DeleteInward_ShouldReturn204_WhenExists()
        {
            var seed = await SeedProjectOnlyAsync();
            var command = new CreateCorrespondenceInwardCommand
            {
                ProjectId = seed.ProjectId,
                IncomingLetterNo = "IN-TEST-DEL",
                LetterDate = DateTime.UtcNow,
                EdrInwardNo = "EDR-IN-DEL",
                ReceiptDate = DateTime.UtcNow,
                From = "Client",
                Subject = "Test",
                AttachmentDetails = "", ActionTaken = "", StoragePath = "", Remarks = "", CreatedBy = ""
            };
            var createRes = await Client.PostAsJsonAsync(BaseInwardUrl, command);
            var created = await DeserializeResponseAsync<CorrespondenceInwardDto>(createRes);

            var response = await Client.DeleteAsync($"{BaseInwardUrl}/{created.Id}");

            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        }

        #endregion

        #region Outward Correspondence

        [Fact]
        public async Task GetAllOutward_ShouldReturn200()
        {
            var response = await Client.GetAsync(BaseOutwardUrl);
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task CreateOutward_ShouldReturn201_WhenValid()
        {
            var seed = await SeedProjectOnlyAsync();
            var command = new CreateCorrespondenceOutwardCommand
            {
                ProjectId = seed.ProjectId,
                LetterNo = "OUT-TEST-001",
                LetterDate = DateTime.UtcNow,
                To = "Vendor",
                Subject = "Outward Test",
                AttachmentDetails = "", StoragePath = "", Remarks = "", CreatedBy = ""
            };

            var response = await Client.PostAsJsonAsync(BaseOutwardUrl, command);

            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        }

        [Fact]
        public async Task GetOutwardById_ShouldReturn200_WhenExists()
        {
            var seed = await SeedProjectOnlyAsync();
            var command = new CreateCorrespondenceOutwardCommand
            {
                ProjectId = seed.ProjectId,
                LetterNo = "OUT-TEST-GET",
                LetterDate = DateTime.UtcNow,
                To = "Vendor",
                Subject = "Outward Get Test",
                AttachmentDetails = "", StoragePath = "", Remarks = "", CreatedBy = ""
            };
            var createRes = await Client.PostAsJsonAsync(BaseOutwardUrl, command);
            var created = await DeserializeResponseAsync<CorrespondenceOutwardDto>(createRes);

            var response = await Client.GetAsync($"{BaseOutwardUrl}/{created.Id}");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetOutwardByProject_ShouldReturn200()
        {
            var seed = await SeedProjectOnlyAsync();
            var response = await Client.GetAsync($"{BaseOutwardUrl}/project/{seed.ProjectId}");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task UpdateOutward_ShouldReturn200_WhenExists()
        {
            var seed = await SeedProjectOnlyAsync();
            var command = new CreateCorrespondenceOutwardCommand
            {
                ProjectId = seed.ProjectId,
                LetterNo = "OUT-TEST-UPD",
                LetterDate = DateTime.UtcNow,
                To = "Vendor",
                Subject = "Test",
                AttachmentDetails = "", StoragePath = "", Remarks = "", CreatedBy = ""
            };
            var createRes = await Client.PostAsJsonAsync(BaseOutwardUrl, command);
            var created = await DeserializeResponseAsync<CorrespondenceOutwardDto>(createRes);

            var updateCmd = new UpdateCorrespondenceOutwardCommand
            {
                Id = created.Id,
                ProjectId = seed.ProjectId,
                LetterNo = "OUT-TEST-UPD-MODIFIED",
                LetterDate = DateTime.UtcNow,
                To = "Vendor",
                Subject = "Test",
                AttachmentDetails = "", StoragePath = "", Remarks = "", UpdatedBy = ""
            };

            var response = await Client.PutAsJsonAsync($"{BaseOutwardUrl}/{created.Id}", updateCmd);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task DeleteOutward_ShouldReturn204_WhenExists()
        {
            var seed = await SeedProjectOnlyAsync();
            var command = new CreateCorrespondenceOutwardCommand
            {
                ProjectId = seed.ProjectId,
                LetterNo = "OUT-TEST-DEL",
                LetterDate = DateTime.UtcNow,
                To = "Vendor",
                Subject = "Test",
                AttachmentDetails = "", StoragePath = "", Remarks = "", CreatedBy = ""
            };
            var createRes = await Client.PostAsJsonAsync(BaseOutwardUrl, command);
            var created = await DeserializeResponseAsync<CorrespondenceOutwardDto>(createRes);

            var response = await Client.DeleteAsync($"{BaseOutwardUrl}/{created.Id}");

            Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        }

        #endregion
    }
}
