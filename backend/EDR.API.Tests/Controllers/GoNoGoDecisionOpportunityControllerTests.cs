using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Xunit;
using EDR.API.Controllers;
using EDR.API.Model;
using EDR.Domain.Database;
using EDR.Domain.Entities;

namespace EDR.API.Tests.Controllers
{
    public class GoNoGoDecisionOpportunityControllerTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly GoNoGoDecisionOpportunityController _controller;

        public GoNoGoDecisionOpportunityControllerTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new ProjectManagementContext(options, null, null);
            _controller = new GoNoGoDecisionOpportunityController(_context);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public async Task GetScoringCriteria_ReturnsOk_WithData()
        {
            // ScoringCriteria uses Label, not Name
            _context.ScoringCriteria.Add(new ScoringCriteria { Id = 1, Label = "Criteria1" });
            await _context.SaveChangesAsync();

            var result = await _controller.GetScoringCriteria();

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var items = Assert.IsType<List<ScoringCriteria>>(okResult.Value);
            Assert.Single(items);
        }

        [Fact]
        public async Task GetScoringRange_ReturnsOk_WithData()
        {
            // ScoreRange uses lowercase property name 'range'
            _context.ScoreRange.Add(new ScoreRange { Id = 1, range = "1-10" });
            await _context.SaveChangesAsync();

            var result = await _controller.GetScoringRange();

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var items = Assert.IsType<List<ScoreRange>>(okResult.Value);
            Assert.Single(items);
        }

        [Fact]
        public async Task GetScoringRDescription_ReturnsOk_WithData()
        {
            // The entity class is ScoringDescriptions (plural), mapped to ScoringDescription table
            _context.ScoringDescription.Add(new ScoringDescriptions { Id = 1, Label = "Label1" });
            await _context.SaveChangesAsync();

            var result = await _controller.GetScoringRDescription();

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var items = Assert.IsType<List<ScoringDescriptionModel>>(okResult.Value);
            Assert.Single(items);
            Assert.Equal("Label1", items[0].Label);
            Assert.NotNull(items[0].listModels);
        }

        [Fact]
        public async Task GetScoringCriteria_ReturnsOk_WithEmptyData()
        {
            var result = await _controller.GetScoringCriteria();

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var items = Assert.IsType<List<ScoringCriteria>>(okResult.Value);
            Assert.Empty(items);
        }

        [Fact]
        public async Task GetScoringRange_ReturnsOk_WithEmptyData()
        {
            var result = await _controller.GetScoringRange();

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var items = Assert.IsType<List<ScoreRange>>(okResult.Value);
            Assert.Empty(items);
        }

        [Fact]
        public async Task GetScoringRDescription_ReturnsOk_WithEmptyData()
        {
            var result = await _controller.GetScoringRDescription();

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var items = Assert.IsType<List<ScoringDescriptionModel>>(okResult.Value);
            Assert.Empty(items);
        }

        [Fact]
        public async Task GetScoringCriteria_Returns500_OnException()
        {
            // Force an exception by using a null context
            var controller = new GoNoGoDecisionOpportunityController(null);

            var result = await controller.GetScoringCriteria();

            var objectResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, objectResult.StatusCode);
        }

        [Fact]
        public async Task GetScoringRange_Returns500_OnException()
        {
            // Force an exception by using a null context
            var controller = new GoNoGoDecisionOpportunityController(null);

            var result = await controller.GetScoringRange();

            var objectResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, objectResult.StatusCode);
        }

        [Fact]
        public async Task GetScoringRDescription_Returns500_OnException()
        {
            // Force an exception by using a null context
            var controller = new GoNoGoDecisionOpportunityController(null);

            var result = await controller.GetScoringRDescription();

            var objectResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, objectResult.StatusCode);
        }
    }
}
