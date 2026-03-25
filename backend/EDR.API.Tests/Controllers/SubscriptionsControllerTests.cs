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
using EDR.Application.DTOs;
using EDR.Application.Services.IContract;
using EDR.Domain.Database;
using EDR.Domain.Entities;

namespace EDR.API.Tests.Controllers
{
    public class SubscriptionsControllerTests : IDisposable
    {
        private readonly TenantDbContext _tenantContext;
        private readonly ProjectManagementContext _pmContext;
        private readonly Mock<ISubscriptionService> _subscriptionServiceMock;
        private readonly Mock<ILogger<SubscriptionsController>> _loggerMock;
        private readonly SubscriptionsController _controller;

        public SubscriptionsControllerTests()
        {
            var tenantOptions = new DbContextOptionsBuilder<TenantDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _tenantContext = new TenantDbContext(tenantOptions);

            var pmOptions = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _pmContext = new ProjectManagementContext(pmOptions, null, null);

            _subscriptionServiceMock = new Mock<ISubscriptionService>();
            _loggerMock = new Mock<ILogger<SubscriptionsController>>();

            _controller = new SubscriptionsController(
                _tenantContext,
                _subscriptionServiceMock.Object,
                _loggerMock.Object,
                _pmContext);
        }

        public void Dispose()
        {
            _tenantContext.Database.EnsureDeleted();
            _tenantContext.Dispose();
            _pmContext.Database.EnsureDeleted();
            _pmContext.Dispose();
        }

        [Fact]
        public async Task GetSubscriptionPlans_ReturnsOk()
        {
            _subscriptionServiceMock.Setup(s => s.GetAllSubscriptionPlansAsync())
                .ReturnsAsync(new List<SubscriptionPlan>());

            var result = await _controller.GetSubscriptionPlans();

            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task GetSubscriptionPlan_ReturnsPlan_WhenFound()
        {
            var plan = new SubscriptionPlan { Id = 1, Name = "Basic" };
            _subscriptionServiceMock.Setup(s => s.GetSubscriptionPlanAsync(1))
                .ReturnsAsync(plan);

            var result = await _controller.GetSubscriptionPlan(1);

            Assert.Same(plan, result.Value);
        }

        [Fact]
        public async Task GetSubscriptionPlan_ReturnsNotFound_WhenNull()
        {
            _subscriptionServiceMock.Setup(s => s.GetSubscriptionPlanAsync(1))
                .ReturnsAsync((SubscriptionPlan)null);

            var result = await _controller.GetSubscriptionPlan(1);

            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task CreateSubscriptionPlan_ReturnsCreatedAtAction()
        {
            var plan = new SubscriptionPlan { Id = 1, Name = "Basic" };
            _subscriptionServiceMock.Setup(s => s.CreateSubscriptionPlanAsync(It.IsAny<SubscriptionPlan>()))
                .ReturnsAsync(plan);

            var result = await _controller.CreateSubscriptionPlan(plan);

            var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            Assert.Equal("GetSubscriptionPlan", createdResult.ActionName);
        }

        [Fact]
        public async Task DeleteSubscriptionPlan_ReturnsNoContent()
        {
            var plan = new SubscriptionPlan { Id = 1, Name = "Basic" };
            _pmContext.SubscriptionPlans.Add(plan);
            await _pmContext.SaveChangesAsync();
            _tenantContext.SubscriptionPlans.Add(plan); // Ensure it's in both
            await _tenantContext.SaveChangesAsync();

            var result = await _controller.DeleteSubscriptionPlan(1);

            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task DeleteSubscriptionPlan_ReturnsNotFound()
        {
            var result = await _controller.DeleteSubscriptionPlan(1);

            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task DeleteSubscriptionPlan_ReturnsBadRequest_WhenInUse()
        {
            var plan = new SubscriptionPlan { Id = 1, Name = "Basic" };
            _pmContext.SubscriptionPlans.Add(plan);
            await _pmContext.SaveChangesAsync();
            _tenantContext.SubscriptionPlans.Add(plan); // Ensure it's in both
            await _tenantContext.SaveChangesAsync();

            _tenantContext.Tenants.Add(new Tenant { Id = 1, Name = "Tenant", Domain = "test.com", SubscriptionPlanId = 1 });
            await _tenantContext.SaveChangesAsync();

            var result = await _controller.DeleteSubscriptionPlan(1);

            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task CreateTenantSubscription_ReturnsOk()
        {
            _subscriptionServiceMock.Setup(s => s.CreateTenantSubscriptionAsync(1, 1))
                .ReturnsAsync(true);

            var result = await _controller.CreateTenantSubscription(1, new CreateSubscriptionRequest { PlanId = 1 });

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task UpdateTenantSubscription_ReturnsOk()
        {
            _subscriptionServiceMock.Setup(s => s.UpdateTenantSubscriptionAsync(1, 1))
                .ReturnsAsync(true);

            var result = await _controller.UpdateTenantSubscription(1, new UpdateSubscriptionRequest { PlanId = 1 });

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.NotNull(okResult.Value);
        }
    }
}
