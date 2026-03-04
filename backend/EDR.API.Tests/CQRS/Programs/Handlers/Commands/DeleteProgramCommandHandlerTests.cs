using System;
using System.Threading;
using System.Threading.Tasks;
using Moq;
using Xunit;
using Microsoft.EntityFrameworkCore;
using MediatR;
using EDR.Application.CQRS.Programs.Commands;
using EDR.Application.CQRS.Programs.Handlers.Commands;
using EDR.Domain.Database;
using EDR.Repositories.Interfaces;
using EDR.Domain.Services;
using Microsoft.Extensions.Configuration;

namespace EDR.API.Tests.CQRS.Programs.Handlers.Commands
{
    public class DeleteProgramCommandHandlerTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly Mock<IProgramRepository> _mockRepo;
        private readonly DeleteProgramCommandHandler _handler;

        public DeleteProgramCommandHandlerTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var mockCurrentTenantService = new Mock<ICurrentTenantService>();
            var mockConfig = new Mock<IConfiguration>();
            
            _context = new ProjectManagementContext(options, mockCurrentTenantService.Object, mockConfig.Object);
            _mockRepo = new Mock<IProgramRepository>();
            _handler = new DeleteProgramCommandHandler(_context, _mockRepo.Object);
        }

        [Fact]
        public async Task Handle_ExistingProgram_RemovesFromContext()
        {
            // Arrange
            var program = new EDR.Domain.Entities.Program { TenantId = 1, Name = "To Delete" };
            _context.Programs.Add(program);
            await _context.SaveChangesAsync();

            var request = new DeleteProgramCommand { Id = program.Id };

            // Act
            var result = await _handler.Handle(request, CancellationToken.None);

            // Assert
            Assert.Equal(Unit.Value, result);
            var programInDb = await _context.Programs.FindAsync(program.Id);
            Assert.Null(programInDb); // Should be removed
        }

        [Fact]
        public async Task Handle_NonExistingProgram_DoesNotThrow()
        {
            // Arrange
            var request = new DeleteProgramCommand { Id = 99 };

            // Act
            var result = await _handler.Handle(request, CancellationToken.None);

            // Assert
            Assert.Equal(Unit.Value, result);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
