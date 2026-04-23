using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using EDR.Application.CQRS.CreateAccount;
using EDR.Application.DTOs;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Services;
using EDR.Repositories.Interfaces;
using MediatR;
using EDR.Application.CQRS.Email.Notifications;

namespace EDR.API.Tests.CQRS.CreateAccount
{
    public class CreateAccountCommandHandlerTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly Mock<ICreateAccountRepository> _mockRepo;
        private readonly Mock<ILogger<CreateAccountCommandHandler>> _mockLogger;
        private readonly Mock<IMediator> _mockMediator;
        private readonly Mock<ICurrentTenantService> _mockTenantService;
        private readonly Mock<IConfiguration> _mockConfig;
        private readonly CreateAccountCommandHandler _handler;

        public CreateAccountCommandHandlerTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _mockTenantService = new Mock<ICurrentTenantService>();
            _mockTenantService.Setup(s => s.TenantId).Returns(1);
            _mockConfig = new Mock<IConfiguration>();

            _context = new ProjectManagementContext(options, _mockTenantService.Object, _mockConfig.Object);
            _mockRepo = new Mock<ICreateAccountRepository>();
            _mockLogger = new Mock<ILogger<CreateAccountCommandHandler>>();
            _mockMediator = new Mock<IMediator>();

            _handler = new CreateAccountCommandHandler(_mockRepo.Object, _mockLogger.Object, _context, _mockMediator.Object);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public async Task Handle_EmailAlreadyExists_ThrowsDuplicateEmailException()
        {
            // Arrange
            var email = "test@example.com";
            _context.CreateAccounts.Add(new EDR.Domain.Entities.CreateAccount { EmailAddress = email, Subdomain = "sub1" });
            await _context.SaveChangesAsync();

            var command = new CreateAccountCommand
            {
                CreateAccountDto = new CreateAccountDto { EmailAddress = email, Subdomain = "sub2" }
            };

            // Act & Assert
            await Assert.ThrowsAsync<DuplicateEmailException>(() => _handler.Handle(command, CancellationToken.None));
        }

        [Fact]
        public async Task Handle_SubdomainAlreadyExists_ThrowsDuplicateSubdomainException()
        {
            // Arrange
            var subdomain = "mysub";
            _context.CreateAccounts.Add(new EDR.Domain.Entities.CreateAccount { EmailAddress = "other@example.com", Subdomain = subdomain });
            await _context.SaveChangesAsync();

            var command = new CreateAccountCommand
            {
                CreateAccountDto = new CreateAccountDto { EmailAddress = "new@example.com", Subdomain = subdomain }
            };

            // Act & Assert
            await Assert.ThrowsAsync<DuplicateSubdomainException>(() => _handler.Handle(command, CancellationToken.None));
        }

        [Fact]
        public async Task Handle_ValidRequest_CreatesAccountAndSendsEmail()
        {
            // Arrange
            var dto = new CreateAccountDto
            {
                FirstName = "John",
                LastName = "Doe",
                EmailAddress = "john@example.com",
                PhoneNumber = "1234567890",
                CompanyName = "Test Co",
                CompanyAddress = "123 St",
                Subdomain = "johndoeco",
                SubscriptionPlan = "Basic"
            };
            var command = new CreateAccountCommand { CreateAccountDto = dto };

            _mockRepo.Setup(r => r.CreateAccountAsync(It.IsAny<EDR.Domain.Entities.CreateAccount>()))
                .ReturnsAsync(true);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result);
            _mockRepo.Verify(r => r.CreateAccountAsync(It.Is<EDR.Domain.Entities.CreateAccount>(a => 
                a.EmailAddress == dto.EmailAddress && a.Subdomain == dto.Subdomain)), Times.Once);
            
            _mockMediator.Verify(m => m.Publish(It.IsAny<AccountCreationEmailNotification>(), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task Handle_RepositoryFails_ReturnsFalse()
        {
            // Arrange
            var dto = new CreateAccountDto { EmailAddress = "fail@example.com", Subdomain = "fail" };
            var command = new CreateAccountCommand { CreateAccountDto = dto };

            _mockRepo.Setup(r => r.CreateAccountAsync(It.IsAny<EDR.Domain.Entities.CreateAccount>()))
                .ReturnsAsync(false);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.False(result);
        }
    }
}
