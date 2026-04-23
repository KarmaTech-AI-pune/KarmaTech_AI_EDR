using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Xunit;
using EDR.API.Controllers;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Enums;

namespace EDR.API.Tests.Controllers
{
    public class JobStartFormHeaderControllerTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly JobStartFormHeaderController _controller;

        public JobStartFormHeaderControllerTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new ProjectManagementContext(options, null, null);
            _controller = new JobStartFormHeaderController(_context);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public async Task GetJobStartFormHeader_ReturnsOk_WhenFound()
        {
            // Arrange
            _context.JobStartFormHeaders.Add(new JobStartFormHeader { Id = 1, ProjectId = 1, FormId = 1 });
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetJobStartFormHeader(1, 1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var header = Assert.IsType<JobStartFormHeader>(okResult.Value);
            Assert.Equal(1, header.Id);
        }

        [Fact]
        public async Task GetJobStartFormHeader_ReturnsNotFound_WhenMissing()
        {
            // Act
            var result = await _controller.GetJobStartFormHeader(99, 99);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
            Assert.Contains("not found", notFoundResult.Value.ToString());
        }

        [Fact]
        public async Task GetJobStartFormHeaderStatus_ReturnsApprovedStatus_WhenHeaderIsApproved()
        {
            // Arrange
            _context.JobStartFormHeaders.Add(new JobStartFormHeader 
            { 
                Id = 1, ProjectId = 1, FormId = 1, StatusId = (int)PMWorkflowStatusEnum.Approved 
            });
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetJobStartFormHeaderStatus(1, 1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var statusProp = okResult.Value.GetType().GetProperty("status");
            Assert.Equal("Approved", statusProp.GetValue(okResult.Value));
        }

        [Fact]
        public async Task GetJobStartFormHeaderHistory_ReturnsOk_WhenFound()
        {
            // Arrange
            // 1. Status
            var status = new PMWorkflowStatus { Id = (int)PMWorkflowStatusEnum.Initial, Status = "Initial" };
            _context.PMWorkflowStatuses.Add(status);
            
            // 2. Program (required for Project)
            _context.Programs.Add(new EDR.Domain.Entities.Program { Id = 1, Name = "Prog" });
            
            // 3. Project
            _context.Projects.Add(new Project { Id = 1, Name = "Proj", ProgramId = 1 });
            
            // 4. JobStartForm
            _context.JobStartForms.Add(new JobStartForm { FormId = 1, ProjectId = 1 });
            
            // 5. Header
            var header = new JobStartFormHeader { Id = 1, ProjectId = 1, FormId = 1, StatusId = (int)PMWorkflowStatusEnum.Initial };
            _context.JobStartFormHeaders.Add(header);

            // 6. History
            var history = new JobStartFormHistory 
            { 
                Id = 1, 
                JobStartFormHeaderId = 1, 
                ActionDate = DateTime.UtcNow, 
                StatusId = (int)PMWorkflowStatusEnum.Initial,
                Action = "Initial Submission" // Added required property
            };
            _context.JobStartFormHistories.Add(history);
            
            try 
            {
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                var innerMessage = ex.InnerException?.Message ?? "No inner exception";
                throw new Exception($"SAVE FAILED: {ex.Message}. Inner: {innerMessage}", ex);
            }

            // Act
            var result = await _controller.GetJobStartFormHeaderHistory(1, 1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var histories = Assert.IsAssignableFrom<IEnumerable<JobStartFormHistory>>(okResult.Value);
            Assert.Single(histories);
        }

        [Fact]
        public async Task GetJobStartFormHeaderHistory_ReturnsNotFound_WhenMissing()
        {
            // Act
            var result = await _controller.GetJobStartFormHeaderHistory(99, 99);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
            Assert.Contains("not found", notFoundResult.Value.ToString());
        }
    }
}
