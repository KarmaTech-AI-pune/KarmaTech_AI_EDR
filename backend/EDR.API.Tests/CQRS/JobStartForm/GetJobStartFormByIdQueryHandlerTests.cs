using Moq;
using NJS.Application.CQRS.JobStartForm.Handlers;
using NJS.Application.CQRS.JobStartForm.Queries;
using NJS.Domain.Entities;
using NJS.Domain.GenericRepository;
using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace NJS.API.Tests.CQRS.JobStartForm
{
    public class GetJobStartFormByIdQueryHandlerTests
    {
        private readonly Mock<IUnitOfWork> _unitOfWorkMock;
        private readonly Mock<IRepository<JobStartForm>> _repositoryMock;
        private readonly GetJobStartFormByIdQueryHandler _handler;

        public GetJobStartFormByIdQueryHandlerTests()
        {
            _unitOfWorkMock = new Mock<IUnitOfWork>();
            _repositoryMock = new Mock<IRepository<JobStartForm>>();
            
            _unitOfWorkMock.Setup(u => u.GetRepository<JobStartForm>())
                .Returns(_repositoryMock.Object);
            
            _handler = new GetJobStartFormByIdQueryHandler(_unitOfWorkMock.Object);
        }

        [Fact]
        public async Task Handle_WithValidId_ReturnsJobStartFormDto()
        {
            // Arrange
            var formId = 1;
            var form = new JobStartForm
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
                .ReturnsAsync((JobStartForm)null);

            var query = new GetJobStartFormByIdQuery(formId);

            // Act
            var result = await _handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Null(result);
        }
    }
}
