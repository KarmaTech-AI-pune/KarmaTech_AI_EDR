using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using EDR.Application.CQRS.CheckReview.Commands;
using EDR.Application.CQRS.CheckReview.Handlers;
using EDR.Application.CQRS.CheckReview.Notifications;
using EDR.Application.Services.IContract;
using EDR.Domain.Database;

namespace EDR.API.Tests.CQRS.CheckReview.Handlers
{
    public class DeleteCheckReviewCommandHandlerTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly Mock<IMediator> _mockMediator;
        private readonly Mock<ILogger<DeleteCheckReviewCommandHandler>> _mockLogger;
        private readonly Mock<ICurrentUserService> _mockCurrentUserService;
        private readonly DeleteCheckReviewCommandHandler _handler;

        public DeleteCheckReviewCommandHandlerTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.InMemoryEventId.TransactionIgnoredWarning))
                .Options;

            var tenantMock = new Mock<EDR.Domain.Services.ICurrentTenantService>();
            var configMock = new Mock<Microsoft.Extensions.Configuration.IConfiguration>();

            _context = new ProjectManagementContext(options, tenantMock.Object, configMock.Object);
            _mockMediator = new Mock<IMediator>();
            _mockLogger = new Mock<ILogger<DeleteCheckReviewCommandHandler>>();
            _mockCurrentUserService = new Mock<ICurrentUserService>();

            _mockCurrentUserService.Setup(s => s.UserName).Returns("testuser");

            _handler = new DeleteCheckReviewCommandHandler(_context, _mockMediator.Object, _mockLogger.Object, _mockCurrentUserService.Object);
        }

        [Fact]
        public async Task Handle_ExistingId_DeletesCheckReviewAndReturnsTrue()
        {
            // Arrange
            var review = new EDR.Domain.Entities.CheckReview { Id = 1, ProjectId = 1, ActivityNo = "A", ActivityName = "B", Objective = "C", Completion = "N" };
            _context.CheckReviews.Add(review);
            await _context.SaveChangesAsync();

            var command = new DeleteCheckReviewCommand { Id = 1 };

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result);
            var exists = await _context.CheckReviews.AnyAsync(c => c.Id == 1);
            Assert.False(exists);
        }

        [Fact]
        public async Task Handle_NonExistingId_ReturnsFalse()
        {
            // Arrange
            var command = new DeleteCheckReviewCommand { Id = 99 };

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.False(result);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
