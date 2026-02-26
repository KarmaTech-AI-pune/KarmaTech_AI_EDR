using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Xunit;
using Moq;
using EDR.Application.CQRS.JobStartForm.Commands;
using EDR.Application.CQRS.JobStartForm.Handlers;
using EDR.Domain.UnitWork;
using EDR.Domain.Database;
using EDR.Application.Dtos;
using System.Collections.Generic;

namespace EDR.API.Tests.CQRS.JobStartForm.Handlers
{
    public class UpdateJobStartFormCommandHandlerTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly Mock<IUnitOfWork> _mockUnitOfWork;
        private readonly UpdateJobStartFormCommandHandler _handler;

        public UpdateJobStartFormCommandHandlerTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.InMemoryEventId.TransactionIgnoredWarning))
                .Options;

            var tenantMock = new Mock<EDR.Domain.Services.ICurrentTenantService>();
            var configMock = new Mock<Microsoft.Extensions.Configuration.IConfiguration>();

            _context = new ProjectManagementContext(options, tenantMock.Object, configMock.Object);
            _mockUnitOfWork = new Mock<IUnitOfWork>();

            _handler = new UpdateJobStartFormCommandHandler(_mockUnitOfWork.Object, _context);
        }

        [Fact]
        public async Task Handle_ValidCommand_UpdatesJobStartForm()
        {
            // Arrange
            var existingForm = new EDR.Domain.Entities.JobStartForm
            {
                FormId = 1,
                ProjectId = 10,
                FormTitle = "Old Title"
            };
            
            _context.JobStartForms.Add(existingForm);
            await _context.SaveChangesAsync();

            var formDto = new JobStartFormDto
            {
                FormId = 1,
                ProjectId = 20,
                FormTitle = "New Title",
                Selections = new List<JobStartFormSelectionDto>
                {
                    new JobStartFormSelectionDto { OptionName = "Opt1", IsSelected = true }
                },
                Resources = new List<JobStartFormResourceDto>
                {
                    new JobStartFormResourceDto { Name = "Res1", TaskType = 1 }
                }
            };

            var command = new UpdateJobStartFormCommand(formDto);

            // Act
            await _handler.Handle(command, CancellationToken.None);

            // Assert
            _mockUnitOfWork.Verify(u => u.SaveChangesAsync(), Times.Once);
            
            var savedForm = await _context.JobStartForms.FirstOrDefaultAsync(f => f.FormId == 1);
            Assert.NotNull(savedForm);
            Assert.Equal("New Title", savedForm.FormTitle);
            Assert.Equal(20, savedForm.ProjectId);
        }

        [Fact]
        public async Task Handle_NullDto_ThrowsArgumentNullException()
        {
            var command = new UpdateJobStartFormCommand(null);
            await Assert.ThrowsAsync<ArgumentNullException>(() => _handler.Handle(command, CancellationToken.None));
        }

        [Fact]
        public async Task Handle_InvalidFormId_ThrowsArgumentException()
        {
            var command = new UpdateJobStartFormCommand(new JobStartFormDto { FormId = 0 });
            await Assert.ThrowsAsync<ArgumentException>(() => _handler.Handle(command, CancellationToken.None));
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}
