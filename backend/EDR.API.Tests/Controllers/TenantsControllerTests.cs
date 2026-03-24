using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using EDR.API.Controllers;
using EDR.API.Strategies;
using EDR.Application.CQRS.Tenants.Queries;
using EDR.Application.Dtos;
using EDR.Application.Services.IContract;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Services;

namespace EDR.API.Tests.Controllers
{
    public class TenantsControllerTests : IDisposable
    {
        private readonly ProjectManagementContext _pmContext;
        private readonly TenantDbContext _tenantContext;
        private readonly Mock<IDNSManagementService> _dnsMock;
        private readonly Mock<ISubscriptionService> _subMock;
        private readonly Mock<IDatabaseManagementService> _dbMock;
        private readonly Mock<ICurrentTenantService> _currentTenantMock;
        private readonly Mock<ITenantMigrationService> _migrationMock;
        private readonly Mock<ITenantUserMigrationStrategySelector> _strategyMock;
        private readonly Mock<IConfiguration> _configMock;
        private readonly Mock<IMediator> _mediatorMock;
        private readonly Mock<ILogger<TenantsController>> _loggerMock;
        private readonly TenantsController _controller;

        public TenantsControllerTests()
        {
            var pmOptions = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _pmContext = new ProjectManagementContext(pmOptions, null, null);

            var tenantOptions = new DbContextOptionsBuilder<TenantDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _tenantContext = new TenantDbContext(tenantOptions);

            _dnsMock = new Mock<IDNSManagementService>();
            _subMock = new Mock<ISubscriptionService>();
            _dbMock = new Mock<IDatabaseManagementService>();
            _currentTenantMock = new Mock<ICurrentTenantService>();
            _migrationMock = new Mock<ITenantMigrationService>();
            _strategyMock = new Mock<ITenantUserMigrationStrategySelector>();
            _configMock = new Mock<IConfiguration>();
            _mediatorMock = new Mock<IMediator>();
            _loggerMock = new Mock<ILogger<TenantsController>>();

            _controller = new TenantsController(
                _pmContext,
                _tenantContext,
                _dnsMock.Object,
                _subMock.Object,
                _dbMock.Object,
                _currentTenantMock.Object,
                _migrationMock.Object,
                _configMock.Object,
                _mediatorMock.Object,
                _loggerMock.Object,
                _strategyMock.Object);
        }

        public void Dispose()
        {
            _pmContext.Database.EnsureDeleted();
            _pmContext.Dispose();
            _tenantContext.Database.EnsureDeleted();
            _tenantContext.Dispose();
        }

        [Fact]
        public async Task GetTenants_ReturnsOk()
        {
            var result = await _controller.GetTenants();
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task GetTenantFeatures_ReturnsOk_WhenFound()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetTenantFeaturesQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new TenantPlanDetailsDto());

            var result = await _controller.GetTenantFeatures(1);

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task GetTenantFeatures_ReturnsNotFound_WhenNull()
        {
            _mediatorMock.Setup(m => m.Send(It.IsAny<GetTenantFeaturesQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((TenantPlanDetailsDto)null);

            var result = await _controller.GetTenantFeatures(1);

            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task GetTenant_ReturnsTenant_WhenFound()
        {
            var tenant = new Tenant { Id = 1, Domain = "test", Name = "Test" };
            _tenantContext.Tenants.Add(tenant);
            await _tenantContext.SaveChangesAsync();

            var result = await _controller.GetTenant(1);

            Assert.Same(tenant, result.Value);
        }

        [Fact]
        public async Task GetTenant_ReturnsNotFound_WhenMissing()
        {
            var result = await _controller.GetTenant(1);

            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task CreateTenantSQL_ReturnsBadRequest_OnInvalidSubdomain()
        {
            _dnsMock.Setup(d => d.ValidateSubdomainAsync(It.IsAny<string>())).ReturnsAsync(false);

            var result = await _controller.CreateTenantSQL(new Tenant { Domain = "test" });

            Assert.IsType<BadRequestObjectResult>(result.Result);
        }

        [Fact]
        public async Task UpdateTenant_ReturnsNotFound_WhenMissing()
        {
            var result = await _controller.UpdateTenant(1, new Tenant { Id = 1 });

            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task DeleteTenant_ReturnsNotFound_WhenMissing()
        {
            var result = await _controller.DeleteTenant(1);

            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task DeleteTenant_ReturnsNoContent_WhenSuccessful()
        {
            var tenant = new Tenant { Id = 1, Domain = "test", Name = "Test" };
            _tenantContext.Tenants.Add(tenant);
            await _tenantContext.SaveChangesAsync();

            var result = await _controller.DeleteTenant(1);

            Assert.IsType<NoContentResult>(result);
        }

        [Fact]
        public async Task ValidateSubdomain_ReturnsOk()
        {
            _dnsMock.Setup(d => d.ValidateSubdomainAsync(It.IsAny<string>())).ReturnsAsync(true);

            var result = await _controller.ValidateSubdomain(new ValidateSubdomainRequest { Subdomain = "test" });

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task SuggestSubdomain_ReturnsOk()
        {
            _dnsMock.Setup(d => d.ValidateSubdomainAsync(It.IsAny<string>())).ReturnsAsync(true);

            var result = await _controller.SuggestSubdomain(new SuggestSubdomainRequest { CompanyName = "Test Company" });

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.NotNull(okResult.Value);
        }
    }
}
