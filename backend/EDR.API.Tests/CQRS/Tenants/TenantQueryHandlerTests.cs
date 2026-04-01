using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;
using EDR.Application.CQRS.Tenants.Handlers;
using EDR.Application.CQRS.Tenants.Queries;
using EDR.Application.Dtos;
using EDR.Repositories.Interfaces;
using EDR.Domain.Entities;
using EDR.Domain.Database;

namespace EDR.API.Tests.CQRS.Tenants
{
    public class TenantQueryHandlerTests : IDisposable
    {
        private readonly Mock<ITenantRepository> _mockRepo;
        private readonly TenantDbContext _context;

        public TenantQueryHandlerTests()
        {
            _mockRepo = new Mock<ITenantRepository>();

            var options = new DbContextOptionsBuilder<TenantDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new TenantDbContext(options);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public async Task GetAllTenants_ReturnsList()
        {
            // Arrange
            var handler = new GetAllTenantsQueryHandler(_mockRepo.Object);
            var tenants = new List<Tenant>
            {
                new Tenant { Id = 1, Name = "T1", Domain = "d1" },
                new Tenant { Id = 2, Name = "T2", Domain = "d2" }
            };
            _mockRepo.Setup(r => r.GetAllAsync()).ReturnsAsync(tenants);

            // Act
            var result = await handler.Handle(new GetAllTenantsQuery(), CancellationToken.None);

            // Assert
            Assert.Equal(2, result.Count());
            Assert.Equal("T1", result.First().Name);
        }

        [Fact]
        public async Task GetTenantById_Found_ReturnsDto()
        {
            // Arrange
            var handler = new GetTenantByIdQueryHandler(_mockRepo.Object);
            var tenant = new Tenant { Id = 1, Name = "T1", Domain = "d1" };
            _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(tenant);

            // Act
            var result = await handler.Handle(new GetTenantByIdQuery { Id = 1 }, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("T1", result.Name);
        }

        [Fact]
        public async Task GetTenantById_NotFound_ReturnsNull()
        {
            // Arrange
            var handler = new GetTenantByIdQueryHandler(_mockRepo.Object);
            _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync((Tenant)null);

            // Act
            var result = await handler.Handle(new GetTenantByIdQuery { Id = 1 }, CancellationToken.None);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task GetTenantFeatures_ValidTenant_ReturnsPlanDetails()
        {
            // Arrange
            var handler = new GetTenantFeaturesQueryHandler(_context);
            
            var feature1 = new Feature { Id = 1, Name = "Manpower" };
            var feature2 = new Feature { Id = 2, Name = "Asset" };
            _context.Features.AddRange(feature1, feature2);

            var plan = new SubscriptionPlan { Id = 1, Name = "Basic", SubscriptionPlanFeatures = new List<SubscriptionPlanFeature>() };
            plan.SubscriptionPlanFeatures.Add(new SubscriptionPlanFeature { FeatureId = 1 });
            _context.SubscriptionPlans.Add(plan);

            var tenant = new Tenant { Id = 1, Name = "T1", Domain = "d1", SubscriptionPlanId = 1 };
            _context.Tenants.Add(tenant);
            
            await _context.SaveChangesAsync();

            // Act
            var result = await handler.Handle(new GetTenantFeaturesQuery(1), CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Basic", result.PlanName);
            Assert.Equal(2, result.Features.Count);
            
            var manpower = result.Features.First(f => f.Name == "Manpower");
            Assert.True(manpower.Enabled);
            
            var asset = result.Features.First(f => f.Name == "Asset");
            Assert.False(asset.Enabled);
        }
    }
}
