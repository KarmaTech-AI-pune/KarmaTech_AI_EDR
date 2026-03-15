using Moq;
using EDR.Application.CQRS.Tenants.Commands;
using EDR.Application.CQRS.Tenants.Handlers;
using EDR.Application.Dtos;
using EDR.Domain.Entities;
using EDR.Repositories.Interfaces;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.CQRS.Tenants
{
    public class TenantCommandHandlersTests
    {
        private readonly Mock<ITenantRepository> _tenantRepoMock;

        public TenantCommandHandlersTests()
        {
            _tenantRepoMock = new Mock<ITenantRepository>();
        }

        [Fact]
        public async Task CreateTenantCommandHandler_ReturnsCreatedTenantDto()
        {
            // Arrange
            var command = new CreateTenantCommand { Name = "New Tenant", Domain = "newtenant.com" };
            var tenant = new Tenant { Id = 1, Name = "New Tenant", Domain = "newtenant.com" };
            
            _tenantRepoMock.Setup(repo => repo.CreateAsync(It.IsAny<Tenant>()))
                .ReturnsAsync(tenant);

            var handler = new CreateTenantCommandHandler(_tenantRepoMock.Object);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.Id);
            Assert.Equal("New Tenant", result.Name);
            _tenantRepoMock.Verify(repo => repo.CreateAsync(It.Is<Tenant>(t => t.Name == "New Tenant")), Times.Once);
        }

        [Fact]
        public async Task DeleteTenantCommandHandler_CallsDeleteAsync()
        {
            // Arrange
            var command = new DeleteTenantCommand { Id = 1 };
            var handler = new DeleteTenantCommandHandler(_tenantRepoMock.Object);

            // Act
            await handler.Handle(command, CancellationToken.None);

            // Assert
            _tenantRepoMock.Verify(repo => repo.DeleteAsync(1), Times.Once);
        }

        [Fact]
        public async Task UpdateTenantCommandHandler_UpdatesAndReturnsDto()
        {
            // Arrange
            var tenantId = 1;
            var existingTenant = new Tenant { Id = tenantId, Name = "Old Name", Domain = "old.com" };
            var command = new UpdateTenantCommand { Id = tenantId, Name = "New Name", Domain = "new.com" };

            _tenantRepoMock.Setup(repo => repo.GetByIdAsync(tenantId))
                .ReturnsAsync(existingTenant);

            var handler = new UpdateTenantCommandHandler(_tenantRepoMock.Object);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("New Name", result.Name);
            Assert.Equal("new.com", result.Domain);
            _tenantRepoMock.Verify(repo => repo.UpdateAsync(It.Is<Tenant>(t => t.Name == "New Name")), Times.Once);
        }

        [Fact]
        public async Task UpdateTenantCommandHandler_NonExistentTenant_ReturnsNull()
        {
            // Arrange
            _tenantRepoMock.Setup(repo => repo.GetByIdAsync(99))
                .ReturnsAsync((Tenant)null);

            var handler = new UpdateTenantCommandHandler(_tenantRepoMock.Object);
            var command = new UpdateTenantCommand { Id = 99 };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.Null(result);
        }
    }
}
