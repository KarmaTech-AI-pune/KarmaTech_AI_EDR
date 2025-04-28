using Moq;
using NJS.Application.CQRS.WorkBreakdownStructures.Commands;
using NJS.Application.CQRS.WorkBreakdownStructures.Handlers;
using NJS.Application.Dtos;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NJS.Application.Tests.Handler
{
    public class AddWBSTaskCommandHandlerTests
    {
        private readonly Mock<IProjectRepository> _repo;
        private readonly AddWBSTaskCommandHandler _addWBSTaskCommandHandler;
        public AddWBSTaskCommandHandlerTests()
        {
            _repo= new Mock<IProjectRepository>();
            _addWBSTaskCommandHandler= new AddWBSTaskCommandHandler(_repo.Object);
        }
        [Fact]
        public async Task Handle_ValidCommand_AddsTaskAndReturnsId()
        {
            // Arrange
            var mockRepo = new Mock<IProjectRepository>();
            var handler = new AddWBSTaskCommandHandler(mockRepo.Object);

            var dto = new WBSTaskDto
            {
                Title = "Test Task",
                Description = "Some description",
                Id = 999
            };

            var command = new AddWBSTaskCommand(projectId: 1, taskDto: dto);

           
            mockRepo.Setup(r => r.AddTaskAsync(It.IsAny<WBSTask>()))
                    .Callback<WBSTask>(t => t.Id = 123)
                    .Returns(Task.CompletedTask);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            mockRepo.Verify(r => r.AddTaskAsync(It.Is<WBSTask>(
                t => t.Name == "Test Task" &&
                     t.Description == "Some description" &&
                     t.ProjectId == 1)), Times.Once);

            Assert.Equal(123, result);
        }
    }
}
