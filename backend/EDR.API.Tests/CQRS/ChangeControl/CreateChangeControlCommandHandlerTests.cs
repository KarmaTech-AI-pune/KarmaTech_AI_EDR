using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;
using EDR.Application.CQRS.ChangeControl.Commands;
using EDR.Application.CQRS.ChangeControl.Handlers;
using EDR.Application.Dtos;
using EDR.Application.Services.IContract;
using EDR.Domain.Entities;
using EDR.Domain.Enums;
using EDR.Domain.GenericRepository;
using EDR.Repositories.Interfaces;
using EDR.Domain.Database;
using EDR.API.Tests.Infrastructure;

namespace EDR.API.Tests.CQRS.ChangeControl.Handlers
{
    public class CreateChangeControlCommandHandlerTests : IDisposable
    {
        private readonly Mock<IChangeControlRepository> _mockChangeControlRepo;
        private readonly Mock<IProjectRepository> _mockProjectRepo;
        private readonly Mock<ICurrentUserService> _mockCurrentUserService;
        private readonly ProjectManagementContext _context;
        private readonly IRepository<User> _userRepo;
        private readonly CreateChangeControlCommandHandler _handler;

        public CreateChangeControlCommandHandlerTests()
        {
            _mockChangeControlRepo = new Mock<IChangeControlRepository>();
            _mockProjectRepo = new Mock<IProjectRepository>();
            _mockCurrentUserService = new Mock<ICurrentUserService>();
            
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.InMemoryEventId.TransactionIgnoredWarning))
                .Options;

            _context = new ProjectManagementContext(options, new StubCurrentTenantService(), new Mock<Microsoft.Extensions.Configuration.IConfiguration>().Object);
            _userRepo = new Repository<User>(_context);

            _handler = new CreateChangeControlCommandHandler(
                _mockChangeControlRepo.Object,
                _mockProjectRepo.Object,
                _mockCurrentUserService.Object,
                _userRepo
            );
        }

        [Fact]
        public async Task Handle_ValidRequest_CreatesChangeControlAndReturnsId()
        {
            // Arrange
            var dto = new ChangeControlDto
            {
                ProjectId = 10,
                SrNo = 1,
                DateLogged = DateTime.UtcNow,
                Originator = "TestOriginator",
                Description = "Desc"
            };

            var command = new CreateChangeControlCommand(dto);

            _mockProjectRepo.Setup(p => p.GetById(10)).Returns(new Project { Id = 10, TenantId = 1, ProjectManagerId = "PM1" });
            _mockCurrentUserService.Setup(c => c.UserId).Returns("User1");
            _mockCurrentUserService.Setup(c => c.UserName).Returns("TestUser");

            var user = new User { Id = "User1", UserName = "TestUser", Email = "test@test.com" };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            _mockChangeControlRepo.Setup(r => r.AddAsync(It.IsAny<EDR.Domain.Entities.ChangeControl>()))
                .ReturnsAsync(5); // Assuming it returns ID 5

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.Equal(5, result);
            _mockChangeControlRepo.Verify(r => r.AddAsync(It.IsAny<EDR.Domain.Entities.ChangeControl>()), Times.Once);
        }

        [Fact]
        public async Task Handle_ProjectNotFound_ThrowsKeyNotFoundException()
        {
            // Arrange
            var dto = new ChangeControlDto { ProjectId = 99 };
            var command = new CreateChangeControlCommand(dto);

            _mockProjectRepo.Setup(p => p.GetById(99)).Returns((Project)null);

            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() => _handler.Handle(command, CancellationToken.None));
        }

        [Fact]
        public async Task Handle_NullRequest_ThrowsArgumentNullException()
        {
            // Arrange
            var command = new CreateChangeControlCommand(null);

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentNullException>(() => _handler.Handle(command, CancellationToken.None));
        }
        
        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
