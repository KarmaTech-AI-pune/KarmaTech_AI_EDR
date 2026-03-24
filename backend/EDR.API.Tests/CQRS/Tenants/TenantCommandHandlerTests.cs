using System;
using System.Threading;
using System.Threading.Tasks;
using Moq;
using Xunit;
using EDR.Application.CQRS.Tenants.Handlers;
using EDR.Application.CQRS.Tenants.Commands;
using EDR.Application.Dtos;
using EDR.Repositories.Interfaces;
using EDR.Domain.Entities;

namespace EDR.API.Tests.CQRS.Tenants
{
    public class TenantCommandHandlerTests
    {
        private readonly Mock<ITenantRepository> _mockRepo;

        public TenantCommandHandlerTests()
        {
            _mockRepo = new Mock<ITenantRepository>();
        }

        [Fact]
        public async Task CreateTenant_ValidRequest_ReturnsTenantDto()
        {
            // Arrange
            var handler = new CreateTenantCommandHandler(_mockRepo.Object);
            var command = new CreateTenantCommand { Name = "New Tenant", Domain = "new.example.com" };
            var createdTenant = new Tenant { Id = 1, Name = command.Name, Domain = command.Domain };

            _mockRepo.Setup(r => r.CreateAsync(It.IsAny<Tenant>()))
                .ReturnsAsync(createdTenant);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.Id);
            Assert.Equal(command.Name, result.Name);
            _mockRepo.Verify(r => r.CreateAsync(It.Is<Tenant>(t => t.Name == command.Name)), Times.Once);
        }

        [Fact]
        public async Task UpdateTenant_ValidRequest_ReturnsUpdatedDto()
        {
            // Arrange
            var handler = new UpdateTenantCommandHandler(_mockRepo.Object);
            var command = new UpdateTenantCommand { Id = 1, Name = "Updated Name", Domain = "upd.com" };
            var existingTenant = new Tenant { Id = 1, Name = "Old Name", Domain = "old.com" };

            _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(existingTenant);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Updated Name", result.Name);
            _mockRepo.Verify(r => r.UpdateAsync(It.Is<Tenant>(t => t.Name == "Updated Name")), Times.Once);
        }

        [Fact]
        public async Task UpdateTenant_NotFound_ReturnsNull()
        {
            // Arrange
            var handler = new UpdateTenantCommandHandler(_mockRepo.Object);
            var command = new UpdateTenantCommand { Id = 99 };
            _mockRepo.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((Tenant)null);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task DeleteTenant_ValidId_CallsDelete()
        {
            // Arrange
            var handler = new DeleteTenantCommandHandler(_mockRepo.Object);
            var command = new DeleteTenantCommand { Id = 1 };

            // Act
            await handler.Handle(command, CancellationToken.None);

            // Assert
            _mockRepo.Verify(r => r.DeleteAsync(1), Times.Once);
        }
    }
}
