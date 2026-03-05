
using EDR.Application.CQRS.JobStartForm.Queries;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Services;
using EDR.Domain.UnitWork;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.CQRS.JobStartForm
{
    public class GetJobStartFormByIdQueryHandlerTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly IUnitOfWork _unitOfWork;
        private readonly EDR.Application.CQRS.JobStartForm.Handlers.GetJobStartFormByIdQueryHandler _handler;

        public GetJobStartFormByIdQueryHandlerTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            
            var tenantMock = new Mock<ICurrentTenantService>();
            var configMock = new Mock<IConfiguration>();

            _context = new ProjectManagementContext(options, tenantMock.Object, configMock.Object);
            _unitOfWork = new UnitOfWork(_context);
            _handler = new EDR.Application.CQRS.JobStartForm.Handlers.GetJobStartFormByIdQueryHandler(_unitOfWork);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
            _unitOfWork.Dispose();
        }

        [Fact]
        public async Task Handle_WithValidId_ReturnsJobStartFormDto()
        {
            // Arrange
            var formId = 1;
            var form = new EDR.Domain.Entities.JobStartForm
            {
                FormId = formId,
                ProjectId = 1,
                WorkBreakdownStructureId = 2,
                FormTitle = "Test Form",
                Description = "Test Description",
                StartDate = DateTime.Now,
                PreparedBy = "User1",
                Selections = new List<JobStartFormSelection>(),
                Resources = new List<JobStartFormResource>()
            };

            await _context.JobStartForms.AddAsync(form);
            await _context.SaveChangesAsync();

            var query = new GetJobStartFormByIdQuery(formId);

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(formId, result.FormId);
            Assert.Equal(form.ProjectId, result.ProjectId);
            Assert.Equal(form.WorkBreakdownStructureId, result.WorkBreakdownStructureId);
            Assert.Equal(form.FormTitle, result.FormTitle);
            Assert.Equal(form.Description, result.Description);
            Assert.Equal(form.StartDate, result.StartDate);
            Assert.Equal(form.PreparedBy, result.PreparedBy);
        }

        [Fact]
        public async Task Handle_WithInvalidId_ReturnsNull()
        {
            // Arrange
            var formId = 999;
            var query = new GetJobStartFormByIdQuery(formId);

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Null(result);
        }
    }
}
