using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;
using EDR.Application.CQRS.JobStartForm.Queries;
using EDR.Application.CQRS.JobStartForm.Handlers;
using EDR.Domain.UnitWork;
using EDR.Domain.GenericRepository;
using EDR.Domain.Entities;
using EDR.Domain.Database;
using EDR.API.Tests.Infrastructure;

namespace EDR.API.Tests.CQRS.JobStartForm.Handlers
{
    public class GetJobStartFormByProjectIdQueryHandlerTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly IUnitOfWork _unitOfWork;
        private readonly GetJobStartFormByProjectIdQueryHandler _handler;

        public GetJobStartFormByProjectIdQueryHandlerTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.InMemoryEventId.TransactionIgnoredWarning))
                .Options;

            _context = new ProjectManagementContext(options, new StubCurrentTenantService(), new Mock<Microsoft.Extensions.Configuration.IConfiguration>().Object);
            _unitOfWork = new UnitOfWork(_context);

            _handler = new GetJobStartFormByProjectIdQueryHandler(_unitOfWork);
        }

        [Fact]
        public async Task Handle_ValidProjectId_ReturnsMappedDtos()
        {
            // Arrange
            _context.JobStartForms.AddRange(new List<EDR.Domain.Entities.JobStartForm>
            {
                new EDR.Domain.Entities.JobStartForm
                {
                    FormId = 1, ProjectId = 5, FormTitle = "Test A",
                    Selections = new List<JobStartFormSelection>(),
                    Resources = new List<JobStartFormResource>()
                },
                new EDR.Domain.Entities.JobStartForm
                {
                    FormId = 2, ProjectId = 5, FormTitle = "Test B",
                    Selections = new List<JobStartFormSelection>(),
                    Resources = new List<JobStartFormResource>()
                }
            });
            await _context.SaveChangesAsync();

            var query = new GetJobStartFormByProjectIdQuery(5);

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count());
            Assert.All(result, r => Assert.Equal(5, r.ProjectId));
        }

        [Fact]
        public async Task Handle_InvalidProjectId_ReturnsEmpty()
        {
            // Arrange
            var query = new GetJobStartFormByProjectIdQuery(99);

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
