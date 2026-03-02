using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Xunit;
using EDR.Application.CQRS.CheckReview.Queries;
using EDR.Application.CQRS.CheckReview.Handlers;
using EDR.Domain.Database;

namespace EDR.API.Tests.CQRS.CheckReview.Handlers
{
    public class GetCheckReviewsByProjectQueryHandlerTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly GetCheckReviewsByProjectQueryHandler _handler;

        public GetCheckReviewsByProjectQueryHandlerTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var tenantMock = new Moq.Mock<EDR.Domain.Services.ICurrentTenantService>();
            var configMock = new Moq.Mock<Microsoft.Extensions.Configuration.IConfiguration>();

            _context = new ProjectManagementContext(options, tenantMock.Object, configMock.Object);
            _handler = new GetCheckReviewsByProjectQueryHandler(_context);
        }

        [Fact]
        public async Task Handle_ExistingProjectId_ReturnsCheckReviews()
        {
            // Arrange
            _context.CheckReviews.AddRange(
                new EDR.Domain.Entities.CheckReview { Id = 1, ProjectId = 10, ActivityNo = "A1", ActivityName = "B1", Objective = "C1", Completion = "N" },
                new EDR.Domain.Entities.CheckReview { Id = 2, ProjectId = 10, ActivityNo = "A2", ActivityName = "B2", Objective = "C2", Completion = "Y" },
                new EDR.Domain.Entities.CheckReview { Id = 3, ProjectId = 20, ActivityNo = "A3", ActivityName = "B3", Objective = "C3", Completion = "N" }
            );
            await _context.SaveChangesAsync();

            var query = new GetCheckReviewsByProjectQuery { ProjectId = 10 };

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
            Assert.All(result, r => Assert.Equal(10, r.ProjectId));
        }

        [Fact]
        public async Task Handle_NonExistingProjectId_ReturnsEmptyList()
        {
            // Arrange
            var query = new GetCheckReviewsByProjectQuery { ProjectId = 99 };

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
