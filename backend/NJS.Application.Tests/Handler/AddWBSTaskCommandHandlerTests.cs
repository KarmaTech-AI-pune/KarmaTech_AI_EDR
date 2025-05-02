using Moq;
using NJS.Application.CQRS.WorkBreakdownStructures.Commands;
using NJS.Application.CQRS.WorkBreakdownStructures.Handlers;
using NJS.Application.Dtos;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Domain.UnitWork;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace NJS.Application.Tests.Handler
{
    public class AddWBSTaskCommandHandlerTests
    {
        private readonly Mock<ProjectManagementContext> _mockContext;
        private readonly Mock<IUnitOfWork> _mockUnitOfWork;
        private readonly AddWBSTaskCommandHandler _handler;

        public AddWBSTaskCommandHandlerTests()
        {
            _mockContext = new Mock<ProjectManagementContext>();
            _mockUnitOfWork = new Mock<IUnitOfWork>();
            _handler = new AddWBSTaskCommandHandler(_mockContext.Object, _mockUnitOfWork.Object);
        }

        [Fact]
        public async Task Handle_ValidCommand_AddsTaskAndReturnsId()
        {
            // Arrange
            var mockContext = new Mock<ProjectManagementContext>();
            var mockUnitOfWork = new Mock<IUnitOfWork>();
            var handler = new AddWBSTaskCommandHandler(mockContext.Object, mockUnitOfWork.Object);

            var dto = new WBSTaskDto
            {
                Title = "Test Task",
                Description = "Some description",
                Id = 0, // New tasks should have ID 0
                TaskType = TaskType.Manpower,
                MonthlyHours = new List<MonthlyHourDto>()
            };

            var command = new AddWBSTaskCommand(projectId: 1, taskDto: dto);

            // Mock the active WBS
            var mockWbs = new WorkBreakdownStructure
            {
                Id = 5,
                ProjectId = 1,
                IsActive = true,
                Tasks = new List<WBSTask>()
            };

            // Mock DbSet for WBS
            var mockWbsDbSet = MockDbSet(new List<WorkBreakdownStructure> { mockWbs });
            mockContext.Setup(c => c.WorkBreakdownStructures).Returns(mockWbsDbSet.Object);

            // Mock DbSet for WBSTasks
            var mockTasksDbSet = MockDbSet(new List<WBSTask>());
            mockContext.Setup(c => c.WBSTasks).Returns(mockTasksDbSet.Object);

            // Setup SaveChangesAsync to set the ID of the new task
            mockUnitOfWork.Setup(u => u.SaveChangesAsync())
                .Callback(() => {
                    // Find the task that was added to the context and set its ID
                    var addedTask = mockTasksDbSet.Object.Local.FirstOrDefault();
                    if (addedTask != null)
                    {
                        // Use reflection to set the ID since it might be private setter
                        var idProperty = typeof(WBSTask).GetProperty("Id");
                        idProperty?.SetValue(addedTask, 123);
                    }
                })
                .Returns(Task.FromResult(1));

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            mockTasksDbSet.Verify(m => m.Add(It.IsAny<WBSTask>()), Times.Once);
            mockUnitOfWork.Verify(u => u.SaveChangesAsync(), Times.Once);
            Assert.Equal(123, result);
        }

        // Helper method to mock DbSet
        private static Mock<DbSet<T>> MockDbSet<T>(List<T> data) where T : class
        {
            var queryable = data.AsQueryable();
            var mockSet = new Mock<DbSet<T>>();

            mockSet.As<IQueryable<T>>().Setup(m => m.Provider).Returns(queryable.Provider);
            mockSet.As<IQueryable<T>>().Setup(m => m.Expression).Returns(queryable.Expression);
            mockSet.As<IQueryable<T>>().Setup(m => m.ElementType).Returns(queryable.ElementType);
            mockSet.As<IQueryable<T>>().Setup(m => m.GetEnumerator()).Returns(() => queryable.GetEnumerator());

            // Setup Include method
            mockSet.Setup(m => m.Include(It.IsAny<string>())).Returns(mockSet.Object);

            // Setup Local property
            var localMockSet = new Mock<Microsoft.EntityFrameworkCore.ChangeTracking.LocalView<T>>();
            mockSet.Setup(m => m.Local).Returns(localMockSet.Object);

            return mockSet;
        }
    }
}
