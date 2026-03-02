using Moq;
using EDR.Application.CQRS.JobStartForm.Commands;
using EDR.Application.CQRS.JobStartForm.Handlers;
using EDR.Application.Dtos;
using EDR.Domain.Entities;
using EDR.Domain.GenericRepository;
using EDR.Domain.UnitWork;
using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.CQRS.JobStartForm
{
    public class AddJobStartFormCommandHandlerTests
    {
        private readonly Mock<IUnitOfWork> _unitOfWorkMock;
        private readonly Mock<IRepository<EDR.Domain.Entities.JobStartForm>> _repositoryMock;
        private readonly AddJobStartFormCommandHandler _handler;

        public AddJobStartFormCommandHandlerTests()
        {
            _unitOfWorkMock = new Mock<IUnitOfWork>();
            _repositoryMock = new Mock<IRepository<EDR.Domain.Entities.JobStartForm>>();
            
            _unitOfWorkMock.Setup(u => u.GetRepository<EDR.Domain.Entities.JobStartForm>())
                .Returns(_repositoryMock.Object);
            
            _handler = new AddJobStartFormCommandHandler(_unitOfWorkMock.Object);
        }

        [Fact]
        public async Task Handle_WithValidCommand_CreatesJobStartFormAndReturnsId()
        {
            // Arrange
            var formDto = new JobStartFormDto
            {
                ProjectId = 1,
                WorkBreakdownStructureId = 2,
                FormTitle = "New Form",
                Description = "Description",
                StartDate = DateTime.Now,
                PreparedBy = "User1"
            };

            var command = new AddJobStartFormCommand(formDto);

            // Capture the entity being added
            EDR.Domain.Entities.JobStartForm capturedEntity = null;
            _repositoryMock.Setup(r => r.AddAsync(It.IsAny<EDR.Domain.Entities.JobStartForm>()))
                .Callback<EDR.Domain.Entities.JobStartForm>(e => 
                {
                    capturedEntity = e;
                    capturedEntity.FormId = 1; // Simulate auto-increment ID
                });

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.Equal(1, result);
            
            // Verify entity was added with correct properties
            _repositoryMock.Verify(r => r.AddAsync(It.IsAny<EDR.Domain.Entities.JobStartForm>()), Times.Once);
            _unitOfWorkMock.Verify(u => u.SaveChangesAsync(), Times.Once);
            
            Assert.NotNull(capturedEntity);
            Assert.Equal(formDto.ProjectId, capturedEntity.ProjectId);
            Assert.Equal(formDto.WorkBreakdownStructureId, capturedEntity.WorkBreakdownStructureId);
            Assert.Equal(formDto.FormTitle, capturedEntity.FormTitle);
            Assert.Equal(formDto.Description, capturedEntity.Description);
            Assert.Equal(formDto.StartDate, capturedEntity.StartDate);
            Assert.Equal(formDto.PreparedBy, capturedEntity.PreparedBy);
        }
    }
}
