using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Xunit;
using Moq;
using EDR.Application.CQRS.JobStartForm.Commands;
using EDR.Application.CQRS.JobStartForm.Handlers;
using EDR.Application.Dtos;
using EDR.Domain.UnitWork;
using EDR.Repositories.Interfaces;
using EDR.Domain.Entities;
using System.Collections.Generic;

namespace EDR.API.Tests.CQRS.JobStartForm.Handlers
{
    public class CreateJobStartFormCommandHandlerTests
    {
        private readonly Mock<IJobStartFormRepository> _mockJobStartFormRepo;
        private readonly Mock<IUnitOfWork> _mockUnitOfWork;
        private readonly Mock<IProjectRepository> _mockProjectRepo;
        private readonly CreateJobStartFormCommandHandler _handler;

        public CreateJobStartFormCommandHandlerTests()
        {
            _mockJobStartFormRepo = new Mock<IJobStartFormRepository>();
            _mockUnitOfWork = new Mock<IUnitOfWork>();
            _mockProjectRepo = new Mock<IProjectRepository>();

            _handler = new CreateJobStartFormCommandHandler(
                _mockJobStartFormRepo.Object,
                _mockUnitOfWork.Object,
                _mockProjectRepo.Object);
        }

        [Fact]
        public async Task Handle_ValidCommand_ReturnsFormId()
        {
            // Arrange
            var formDto = new Application.Dtos.JobStartFormDto
            {
                ProjectId = 1,
                WorkBreakdownStructureId = 2,
                FormTitle = "Test Form",
                Description = "Test Desc",
                StartDate = DateTime.UtcNow,
                PreparedBy = "Tester",
                FormId = 0
            };

            var command = new CreateJobStartFormCommand(formDto);

            _mockProjectRepo.Setup(p => p.GetById(1))
                .Returns(new Project { Id = 1, Status = ProjectStatus.Opportunity });

            _mockJobStartFormRepo.Setup(r => r.AddAsync(It.IsAny<EDR.Domain.Entities.JobStartForm>()))
                .Callback<EDR.Domain.Entities.JobStartForm>(form => { form.FormId = 123; })
                .Returns(Task.CompletedTask);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.Equal(123, result);
            _mockProjectRepo.Verify(p => p.Update(It.Is<Project>(proj => proj.Status == ProjectStatus.Active)), Times.Once);
            _mockJobStartFormRepo.Verify(r => r.AddAsync(It.IsAny<EDR.Domain.Entities.JobStartForm>()), Times.Once);
            _mockUnitOfWork.Verify(u => u.SaveChangesAsync(), Times.Once);
        }

//        [Fact]
//        public async Task Handle_NullJobStartForm_ThrowsArgumentNullException()
//        {
//            // Arrange
//            var command = new CreateJobStartFormCommand(null);
//
//            // Act & Assert
//            await Assert.ThrowsAsync<ArgumentNullException>(() => _handler.Handle(command, CancellationToken.None));
//        }

        [Fact]
        public async Task Handle_FormIdProvided_ThrowsArgumentException()
        {
            // Arrange
            var formDto = new Application.Dtos.JobStartFormDto
            {
                ProjectId = 1,
                FormId = 10
            };
            var command = new CreateJobStartFormCommand(formDto);

            // Act & Assert
            var ex = await Assert.ThrowsAsync<ArgumentException>(() => _handler.Handle(command, CancellationToken.None));
            Assert.Contains("FormID must not be provided", ex.Message);
        }
    }
}
