using System.Security.Claims;
using EDR.Domain;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace EDR.API.Tests.Services
{
    public class MultiTenancyServicesTests
    {
        private readonly Mock<IHttpContextAccessor> _mockHttpContextAccessor;
        private readonly Mock<IConfiguration> _mockConfiguration;
        private readonly Mock<ILogger<CurrentTenantService>> _mockLogger;
        private readonly Mock<IServiceProvider> _mockServiceProvider;
        private readonly TenantDbContext _tenantContext;

        public MultiTenancyServicesTests()
        {
            _mockHttpContextAccessor = new Mock<IHttpContextAccessor>();
            _mockConfiguration = new Mock<IConfiguration>();
            _mockLogger = new Mock<ILogger<CurrentTenantService>>();
            _mockServiceProvider = new Mock<IServiceProvider>();

            var options = new DbContextOptionsBuilder<TenantDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _tenantContext = new TenantDbContext(options);
        }

        #region Resolution Strategy Tests

        [Fact]
        public async Task HeaderResolutionStrategy_ReturnsHeaderValue()
        {
            // Arrange
            var context = new DefaultHttpContext();
            context.Request.Headers["X-Tenant-Context"] = "tenant1";
            _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(context);

            var strategy = new HeaderResolutionStrategy(_mockHttpContextAccessor.Object);

            // Act
            var result = await strategy.GetTenantIdentifierAsync();

            // Assert
            Assert.Equal("tenant1", result);
        }

        [Fact]
        public async Task HeaderResolutionStrategy_ReturnsEmptyString_WhenHeaderMissing()
        {
            // Arrange
            var context = new DefaultHttpContext();
            _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(context);

            var strategy = new HeaderResolutionStrategy(_mockHttpContextAccessor.Object);

            // Act
            var result = await strategy.GetTenantIdentifierAsync();

            // Assert
            Assert.Equal(string.Empty, result);
        }

        [Fact]
        public async Task DomainResolutionStrategy_ReturnsSubdomain()
        {
            // Arrange
            var context = new DefaultHttpContext();
            context.Request.Host = new HostString("tenant1.example.com");
            _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(context);

            var strategy = new DomainResolutionStrategy(_mockHttpContextAccessor.Object);

            // Act
            var result = await strategy.GetTenantIdentifierAsync();

            // Assert
            Assert.Equal("tenant1", result);
        }

        [Fact]
        public async Task ClaimsResolutionStrategy_ReturnsClaimValue()
        {
            // Arrange
            var claims = new List<Claim> { new Claim("TenantId", "123") };
            var identity = new ClaimsIdentity(claims);
            var principal = new ClaimsPrincipal(identity);
            
            var context = new DefaultHttpContext();
            context.User = principal;
            _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(context);

            var strategy = new ClaimsResolutionStrategy(_mockHttpContextAccessor.Object);

            // Act
            var result = await strategy.GetTenantIdentifierAsync();

            // Assert
            Assert.Equal("123", result);
        }

        #endregion

        #region TenantConnectionResolver Tests

        [Fact]
        public async Task TenantConnectionResolver_GetDefaultConnectionString_ReturnsConfiguredValue()
        {
            // Arrange
            _mockConfiguration.Setup(x => x[Constants.DbType]).Returns(Constants.DbServerType);
            _mockConfiguration.Setup(x => x.GetSection("ConnectionStrings")["AppDbConnection"]).Returns("server_conn");
            
            var resolver = new TenantConnectionResolver(_tenantContext, _mockConfiguration.Object);

            // Act
            var result = await resolver.GetDefaultConnectionStringAsync();

            // Assert
            Assert.Equal("server_conn", result);
        }

        [Fact]
        public async Task TenantConnectionResolver_GetConnectionStringAsync_ReturnsDefault_ForAdmin()
        {
            // Arrange
            _mockConfiguration.Setup(x => x[Constants.DbType]).Returns(Constants.DbServerType);
            _mockConfiguration.Setup(x => x.GetSection("ConnectionStrings")["AppDbConnection"]).Returns("default_conn");
            
            var resolver = new TenantConnectionResolver(_tenantContext, _mockConfiguration.Object);

            // Act
            var result = await resolver.GetConnectionStringAsync(1);

            // Assert
            Assert.Equal("default_conn", result);
        }

        [Fact]
        public async Task TenantConnectionResolver_GetConnectionStringByDomainAsync_ReturnsTenantSpecificConnString()
        {
            // Arrange
            _mockConfiguration.Setup(x => x[Constants.DbType]).Returns(Constants.DbServerType);
            _mockConfiguration.Setup(x => x.GetSection("ConnectionStrings")["AppDbConnection"]).Returns("default_conn");

            var tenant = new Tenant { Id = 2, Domain = "tenant1", Name = "Tenant 1" };
            var tenantDb = new TenantDatabase { Id = 1, TenantId = 2, ConnectionString = "tenant_conn", DatabaseName = "tenant1_db" };
            
            _tenantContext.Tenants.Add(tenant);
            _tenantContext.TenantDatabases.Add(tenantDb);
            await _tenantContext.SaveChangesAsync();

            var resolver = new TenantConnectionResolver(_tenantContext, _mockConfiguration.Object);

            // Act
            var result = await resolver.GetConnectionStringByDomainAsync("tenant1");

            // Assert
            Assert.Equal("tenant_conn", result);
        }

        #endregion

        #region CurrentTenantService Tests

        [Fact]
        public async Task CurrentTenantService_SetTenant_ReturnsTrue_WhenTenantExists()
        {
            // Arrange
            var tenant = new Tenant { Id = 2, Domain = "tenant1", Name = "Tenant 1" };
            var tenantDb = new TenantDatabase { Id = 1, TenantId = 2, ConnectionString = "tenant_conn", DatabaseName = "tenant1_db" };
            
            _tenantContext.Tenants.Add(tenant);
            _tenantContext.TenantDatabases.Add(tenantDb);
            await _tenantContext.SaveChangesAsync();

            var service = new CurrentTenantService(
                _mockHttpContextAccessor.Object,
                _tenantContext,
                _mockLogger.Object,
                _mockServiceProvider.Object,
                _mockConfiguration.Object);

            // Act
            var result = await service.SetTenant(2);

            // Assert
            Assert.True(result);
            Assert.Equal(2, service.TenantId);
            Assert.Equal("tenant_conn", service.ConnectionString);
        }

        [Fact]
        public async Task CurrentTenantService_SetTenant_ReturnsFalse_WhenTenantMissing()
        {
            // Arrange
            var service = new CurrentTenantService(
                _mockHttpContextAccessor.Object,
                _tenantContext,
                _mockLogger.Object,
                _mockServiceProvider.Object,
                _mockConfiguration.Object);

            // Act
            var result = await service.SetTenant(999);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public void CurrentTenantService_TenantId_ReturnsFromContext_WhenSet()
        {
            // Arrange
            var context = new DefaultHttpContext();
            context.Items["TenantId"] = 5;
            _mockHttpContextAccessor.Setup(x => x.HttpContext).Returns(context);

            var service = new CurrentTenantService(
                _mockHttpContextAccessor.Object,
                _tenantContext,
                _mockLogger.Object,
                _mockServiceProvider.Object,
                _mockConfiguration.Object);

            // Act
            var result = service.TenantId;

            // Assert
            Assert.Equal(5, result);
        }

        #endregion
    }
}
