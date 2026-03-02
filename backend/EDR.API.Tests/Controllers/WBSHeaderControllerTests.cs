using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using EDR.API.Controllers;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Enums;
using EDR.Application.Services.IContract;
using EDR.Application.Dtos;
using EDR.Domain.Services;

namespace EDR.API.Tests.Controllers
{
    public class WBSHeaderControllerTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly Mock<ILogger<WBSHeaderController>> _loggerMock;
        private readonly Mock<IUserContext> _userContextMock;
        private readonly WBSHeaderController _controller;

        public WBSHeaderControllerTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
                
            var tenantServiceMock = new Mock<ICurrentTenantService>();
            var configMock = new Mock<Microsoft.Extensions.Configuration.IConfiguration>();
            _context = new ProjectManagementContext(options, tenantServiceMock.Object, configMock.Object);
            _loggerMock = new Mock<ILogger<WBSHeaderController>>();
            _userContextMock = new Mock<IUserContext>();
            
            _controller = new WBSHeaderController(_context, _loggerMock.Object, _userContextMock.Object);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public async Task GetWBSHeader_ReturnsNotFound_WhenNotExists()
        {
            // Act
            var result = await _controller.GetWBSHeader(1, TaskType.Manpower);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result.Result);
        }

        [Fact]
        public async Task GetWBSHeader_ReturnsOkResult_WhenExists()
        {
            // Arrange
            var header = new WBSTaskPlannedHourHeader
            {
                ProjectId = 1,
                TaskType = TaskType.Manpower,
                StatusId = 1,
                WBSHistories = new List<WBSHistory>()
            };
            _context.Set<WBSTaskPlannedHourHeader>().Add(header);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetWBSHeader(1, TaskType.Manpower);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnValue = Assert.IsType<WBSTaskPlannedHourHeader>(okResult.Value);
            Assert.Equal(header.ProjectId, returnValue.ProjectId);
        }

        [Fact]
        public async Task GetWBSHeaderStatus_ReturnsInitial_WhenNoHistory()
        {
            // Arrange
            var header = new WBSTaskPlannedHourHeader
            {
                ProjectId = 1,
                TaskType = TaskType.Manpower,
                StatusId = 1,
                WBSHistories = new List<WBSHistory>()
            };
            _context.Set<WBSTaskPlannedHourHeader>().Add(header);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetWBSHeaderStatus(1, TaskType.Manpower);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var wbsWorkflowDto = Assert.IsType<WbsWorkflowDto>(okResult.Value);
            Assert.Equal("Initial", wbsWorkflowDto.Status);
            Assert.Equal(1, wbsWorkflowDto.StatusId);
        }

        [Fact]
        public async Task GetWBSHeaderStatus_ReturnsApproved_WhenStatusIsApproved()
        {
            // Arrange
            var header = new WBSTaskPlannedHourHeader
            {
                ProjectId = 1,
                TaskType = TaskType.Manpower,
                StatusId = (int)PMWorkflowStatusEnum.Approved,
                WBSHistories = new List<WBSHistory>()
            };
            _context.Set<WBSTaskPlannedHourHeader>().Add(header);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetWBSHeaderStatus(1, TaskType.Manpower);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var wbsWorkflowDto = Assert.IsType<WbsWorkflowDto>(okResult.Value);
            Assert.Equal("Approved", wbsWorkflowDto.Status);
        }

        [Fact]
        public async Task GetWBSHeaderStatus_ReturnsStatusFromLatestHistory()
        {
            // Arrange
            var header = new WBSTaskPlannedHourHeader
            {
                ProjectId = 1,
                TaskType = TaskType.Manpower,
                StatusId = 1,
                WBSHistories = new List<WBSHistory>
                {
                    new WBSHistory { StatusId = (int)PMWorkflowStatusEnum.SentForApproval, ActionDate = DateTime.UtcNow.AddDays(-1) },
                    new WBSHistory { StatusId = (int)PMWorkflowStatusEnum.ReviewChanges, ActionDate = DateTime.UtcNow }
                }
            };
            _context.Set<WBSTaskPlannedHourHeader>().Add(header);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetWBSHeaderStatus(1, TaskType.Manpower);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var wbsWorkflowDto = Assert.IsType<WbsWorkflowDto>(okResult.Value);
            Assert.Equal("Review Changes", wbsWorkflowDto.Status);
            Assert.Equal((int)PMWorkflowStatusEnum.ReviewChanges, wbsWorkflowDto.StatusId);
        }
    }
}
