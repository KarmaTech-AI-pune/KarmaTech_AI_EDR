using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Xunit;
using EDR.Application.CQRS.CheckReview.Queries;
using EDR.Application.CQRS.CheckReview.Handlers;
using EDR.Domain.Database;
using EDR.Domain.Entities;

namespace EDR.API.Tests.CQRS.CheckReview.Handlers
{
    public class GetCheckReviewByIdQueryHandlerTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly GetCheckReviewByIdQueryHandler _handler;

        public GetCheckReviewByIdQueryHandlerTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var tenantMock = new Moq.Mock<EDR.Domain.Services.ICurrentTenantService>();
            var configMock = new Moq.Mock<Microsoft.Extensions.Configuration.IConfiguration>();

            _context = new ProjectManagementContext(options, tenantMock.Object, configMock.Object);
            _handler = new GetCheckReviewByIdQueryHandler(_context);
        }

        [Fact]
        public async Task Handle_ExistingId_ReturnsCheckReviewDto()
        {
            // Arrange
            var review = new EDR.Domain.Entities.CheckReview 
            { 
                Id = 1, ProjectId = 1, ActivityNo = "ACT-1", ActivityName = "Test", Objective = "Obj", Completion = "N" 
            };
            _context.CheckReviews.Add(review);
            await _context.SaveChangesAsync();

            var query = new GetCheckReviewByIdQuery { Id = 1 };

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.Id);
            Assert.Equal("ACT-1", result.ActivityNo);
        }

        [Fact]
        public async Task Handle_NonExistingId_ReturnsNull()
        {
            // Arrange
            var query = new GetCheckReviewByIdQuery { Id = 99 };

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Null(result);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
