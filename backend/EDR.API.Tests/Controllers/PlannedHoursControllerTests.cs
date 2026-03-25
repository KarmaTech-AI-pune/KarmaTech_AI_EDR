using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Xunit;
using EDR.API.Controllers;
using EDR.Domain.Database;
using EDR.Domain.Entities;

namespace EDR.API.Tests.Controllers
{
    public class PlannedHoursControllerTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly PlannedHoursController _controller;

        public PlannedHoursControllerTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new ProjectManagementContext(options, null, null);
            _controller = new PlannedHoursController(_context);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public async Task GetPlannedHours_ReturnsOk_EmptyArrayWhenWbsNotFound()
        {
            // Act
            var result = await _controller.GetPlannedHours(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task UpdatePlannedHours_ReturnsNotFound_WhenTaskMissing()
        {
            // Arrange
            var request = new UpdatePlannedHoursRequest
            {
                PlannedHours = new[] { new PlannedHourData { Year = "2023", Month = "1", PlannedHours = 10 } }
            };

            // Act
            var result = await _controller.UpdatePlannedHours(1, 1, request);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }
    }
}
