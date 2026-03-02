using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using EDR.Application.CQRS.JobStartForm.Commands;
using EDR.Application.CQRS.JobStartForm.Handlers;
using EDR.Domain.UnitWork;
using EDR.Domain.GenericRepository;
using EDR.Domain.Entities;

namespace EDR.API.Tests.CQRS.JobStartForm.Handlers
{
    public class DeleteJobStartFormCommandHandlerTests
    {
        private readonly Mock<IUnitOfWork> _mockUnitOfWork;
        private readonly Mock<IRepository<EDR.Domain.Entities.JobStartForm>> _mockRepo;
        private readonly DeleteJobStartFormCommandHandler _handler;

        public DeleteJobStartFormCommandHandlerTests()
        {
            _mockUnitOfWork = new Mock<IUnitOfWork>();
            _mockRepo = new Mock<IRepository<EDR.Domain.Entities.JobStartForm>>();

            _mockUnitOfWork.Setup(u => u.GetRepository<EDR.Domain.Entities.JobStartForm>())
                .Returns(_mockRepo.Object);

            _handler = new DeleteJobStartFormCommandHandler(_mockUnitOfWork.Object);
        }

        [Fact]
        public async Task Handle_ExistingId_DeletesForm()
        {
            // Arrange
            var form = new EDR.Domain.Entities.JobStartForm { FormId = 1 };
            _mockRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(form);

            var command = new DeleteJobStartFormCommand(1);

            // Act
            await _handler.Handle(command, CancellationToken.None);

            // Assert
            _mockRepo.Verify(r => r.RemoveAsync(form), Times.Once);
            _mockUnitOfWork.Verify(u => u.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task Handle_NonExistingId_DoesNothing()
        {
            // Arrange
            _mockRepo.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((EDR.Domain.Entities.JobStartForm)null);
            var command = new DeleteJobStartFormCommand(99);

            // Act
            await _handler.Handle(command, CancellationToken.None);

            // Assert
            _mockRepo.Verify(r => r.RemoveAsync(It.IsAny<EDR.Domain.Entities.JobStartForm>()), Times.Never);
            _mockUnitOfWork.Verify(u => u.SaveChangesAsync(), Times.Never);
        }
    }
}
