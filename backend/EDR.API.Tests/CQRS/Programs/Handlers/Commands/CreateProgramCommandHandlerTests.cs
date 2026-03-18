using System;
using System.Threading;
using System.Threading.Tasks;
using Moq;
using Xunit;
using Microsoft.EntityFrameworkCore;
using EDR.Application.CQRS.Programs.Commands;
using EDR.Application.CQRS.Programs.Handlers.Commands;
using EDR.Domain.Database;
using EDR.Repositories.Interfaces;
using EDR.Domain.Services;
using Microsoft.Extensions.Configuration;

namespace EDR.API.Tests.CQRS.Programs.Handlers.Commands
{
    public class CreateProgramCommandHandlerTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly Mock<IProgramRepository> _mockRepo;
        private readonly CreateProgramCommandHandler _handler;

        public CreateProgramCommandHandlerTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var mockCurrentTenantService = new Mock<ICurrentTenantService>();
            var mockConfig = new Mock<IConfiguration>();
            
            _context = new ProjectManagementContext(options, mockCurrentTenantService.Object, mockConfig.Object);
            _mockRepo = new Mock<IProgramRepository>();
            _handler = new CreateProgramCommandHandler(_context, _mockRepo.Object);
        }

        [Fact]
        public async Task Handle_ValidRequest_AddsToContextAndReturnsId()
        {
            // Arrange
            var request = new CreateProgramCommand
            {
                TenantId = 1,
                Name = "New Program",
                Description = "Desc",
                CreatedBy = "Admin"
            };

            // Act
            var resultId = await _handler.Handle(request, CancellationToken.None);

            // Assert
            Assert.True(resultId > 0);
            var programInDb = await _context.Programs.FindAsync(resultId);
            Assert.NotNull(programInDb);
            Assert.Equal("New Program", programInDb.Name);
            Assert.Equal("Admin", programInDb.CreatedBy);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
