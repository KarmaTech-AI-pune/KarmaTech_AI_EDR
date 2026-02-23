using Moq;
using EDR.Application.CQRS.JobStartForm.Handlers;
using EDR.Application.CQRS.JobStartForm.Queries;
using EDR.Domain.Entities;
using EDR.Domain.GenericRepository;
using EDR.Domain.UnitWork;
using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace EDR.API.Tests.CQRS.JobStartForm
{
    public class GetJobStartFormByIdQueryHandlerTests
    {
        private readonly Mock<IUnitOfWork> _unitOfWorkMock;
        private readonly Mock<IRepository<EDR.Domain.Entities.JobStartForm>> _repositoryMock;
        private readonly EDR.Application.CQRS.JobStartForm.Handlers.GetJobStartFormByIdQueryHandler _handler;

        public GetJobStartFormByIdQueryHandlerTests()
        {
            _unitOfWorkMock = new Mock<IUnitOfWork>();
            _repositoryMock = new Mock<IRepository<EDR.Domain.Entities.JobStartForm>>();
            
            _unitOfWorkMock.Setup(u => u.GetRepository<EDR.Domain.Entities.JobStartForm>())
                .Returns(_repositoryMock.Object);
            
            _handler = new EDR.Application.CQRS.JobStartForm.Handlers.GetJobStartFormByIdQueryHandler(_unitOfWorkMock.Object);
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
                PreparedBy = "User1"
            };

            _repositoryMock.Setup(r => r.GetByIdAsync(formId))
                .ReturnsAsync(form);

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

            _repositoryMock.Setup(r => r.GetByIdAsync(formId))
                .ReturnsAsync((EDR.Domain.Entities.JobStartForm)null);

            var query = new GetJobStartFormByIdQuery(formId);

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Null(result);
        }
    }
}
