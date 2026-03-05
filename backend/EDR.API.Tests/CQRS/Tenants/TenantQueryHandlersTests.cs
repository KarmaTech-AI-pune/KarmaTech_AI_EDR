using Moq;
using EDR.Application.CQRS.Tenants.Queries;
using EDR.Application.CQRS.Tenants.Handlers;
using EDR.Application.Dtos;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.CQRS.Tenants
{
    public class TenantQueryHandlersTests : IDisposable
    {
        private readonly Mock<ITenantRepository> _tenantRepoMock;
        private readonly TenantDbContext _context;

        public TenantQueryHandlersTests()
        {
            _tenantRepoMock = new Mock<ITenantRepository>();

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
        public async Task GetAllTenantsQueryHandler_ReturnsAllTenants()
        {
            // Arrange
            var tenants = new List<Tenant>
            {
                new Tenant { Id = 1, Name = "T1", Domain = "d1.com" },
                new Tenant { Id = 2, Name = "T2", Domain = "d2.com" }
            };
            _tenantRepoMock.Setup(repo => repo.GetAllAsync())
                .ReturnsAsync(tenants);

            var handler = new GetAllTenantsQueryHandler(_tenantRepoMock.Object);
            var query = new GetAllTenantsQuery();

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Equal(2, result.Count());
            Assert.Equal("T1", result.First().Name);
        }

        [Fact]
        public async Task GetTenantByIdQueryHandler_ReturnsTenantDto()
        {
            // Arrange
            var tenant = new Tenant { Id = 1, Name = "T1", Domain = "d1.com" };
            _tenantRepoMock.Setup(repo => repo.GetByIdAsync(1))
                .ReturnsAsync(tenant);

            var handler = new GetTenantByIdQueryHandler(_tenantRepoMock.Object);
            var query = new GetTenantByIdQuery { Id = 1 };

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("T1", result.Name);
        }

        [Fact]
        public async Task GetTenantFeaturesQueryHandler_ReturnsFeaturesWithCorrectEnabledStatus()
        {
            // Arrange
            var plan = new SubscriptionPlan { Id = 1, Name = "Premium" };
            var feature1 = new Feature { Id = 1, Name = "Manpower" };
            var feature2 = new Feature { Id = 2, Name = "Finance" };
            
            _context.SubscriptionPlans.Add(plan);
            _context.Set<Feature>().AddRange(feature1, feature2);
            
            var tenant = new Tenant 
            { 
                Id = 1, 
                Name = "Tenant 1", 
                Domain = "t1.com", 
                SubscriptionPlanId = 1,
                SubscriptionPlan = plan
            };
            _context.Tenants.Add(tenant);

            _context.Set<SubscriptionPlanFeature>().Add(new SubscriptionPlanFeature 
            { 
                SubscriptionPlanId = 1, 
                FeatureId = 1 
            });

            await _context.SaveChangesAsync();

            var handler = new GetTenantFeaturesQueryHandler(_context);
            var query = new GetTenantFeaturesQuery(1);

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Premium", result.PlanName);
            Assert.Equal(2, result.Features.Count);
            
            var manpower = result.Features.First(f => f.Name == "Manpower");
            var finance = result.Features.First(f => f.Name == "Finance");
            
            Assert.True(manpower.Enabled);
            Assert.False(finance.Enabled);
        }
    }
}
