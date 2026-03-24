using EDR.Application.CQRS.SprintTasks.Queries;
using EDR.Application.CQRS.SprintTasks.Handlers;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using EDR.Application.Dtos;
using Xunit;

namespace EDR.API.Tests.CQRS.SprintTasks
{
    public class SprintTaskQueryHandlersTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly Mock<ICurrentTenantService> _tenantServiceMock;

        public SprintTaskQueryHandlersTests()
        {
            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _tenantServiceMock = new Mock<ICurrentTenantService>();
            _tenantServiceMock.SetupProperty(t => t.TenantId, 1);

            var configMock = new Mock<IConfiguration>();
            _context = new ProjectManagementContext(options, _tenantServiceMock.Object, configMock.Object);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public async Task GetSingleSprintTaskQueryHandler_ReturnsTask()
        {
            // Arrange
            var task = new SprintTask { Taskid = 1, TaskTitle = "Task 1", TenantId = 1 };
            _context.SprintTasks.Add(task);
            await _context.SaveChangesAsync();

            var loggerMock = new Mock<ILogger<GetSingleSprintTaskQueryHandler>>();
            var handler = new GetSingleSprintTaskQueryHandler(_context, loggerMock.Object);
            var query = new GetSingleSprintTaskQuery { TaskId = 1 };

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Task 1", result.TaskTitle);
        }

        [Fact]
        public async Task GetSprintTasksByProjectIdQueryHandler_ReturnsTasks()
        {
            // Arrange
            _context.SprintPlans.Add(new SprintPlan { SprintId = 10, ProjectId = 10, TenantId = 1 });
            _context.SprintPlans.Add(new SprintPlan { SprintId = 20, ProjectId = 20, TenantId = 1 });
            
            _context.SprintTasks.Add(new SprintTask { Taskid = 1, TaskTitle = "T1", SprintPlanId = 10, TenantId = 1 });
            _context.SprintTasks.Add(new SprintTask { Taskid = 2, TaskTitle = "T2", SprintPlanId = 10, TenantId = 1 });
            _context.SprintTasks.Add(new SprintTask { Taskid = 3, TaskTitle = "T3", SprintPlanId = 20, TenantId = 1 });
            await _context.SaveChangesAsync();

            var loggerMock = new Mock<ILogger<GetSprintTasksByProjectIdQueryHandler>>();
            var handler = new GetSprintTasksByProjectIdQueryHandler(_context, loggerMock.Object);
            var query = new GetSprintTasksByProjectIdQuery { ProjectId = 10 };

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Equal(2, result.Count());
        }

        [Fact]
        public async Task GetSprintTaskCommentsByTaskIdQueryHandler_ReturnsComments()
        {
            // Arrange
            _context.SprintTaskComments.Add(new SprintTaskComment { CommentId = 1, Taskid = 1, CommentText = "C1", TenantId = 1 });
            _context.SprintTaskComments.Add(new SprintTaskComment { CommentId = 2, Taskid = 1, CommentText = "C2", TenantId = 1 });
            await _context.SaveChangesAsync();

            var handler = new GetSprintTaskCommentsByTaskIdQueryHandler(_context);
            var query = new GetSprintTaskCommentsByTaskIdQuery { Taskid = 1 };

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Equal(2, result.Comments.Count);
        }

        [Fact]
        public async Task GetAllSprintSubtasksByTaskIdQueryHandler_ReturnsSubtasks()
        {
            // Arrange
            _context.SprintSubtasks.Add(new SprintSubtask { SubtaskId = 1, Taskid = 1, Subtasktitle = "S1", TenantId = 1 });
            _context.SprintSubtasks.Add(new SprintSubtask { SubtaskId = 2, Taskid = 1, Subtasktitle = "S2", TenantId = 1 });
            await _context.SaveChangesAsync();

            var loggerMock = new Mock<ILogger<GetAllSprintSubtasksByTaskIdQueryHandler>>();
            var handler = new GetAllSprintSubtasksByTaskIdQueryHandler(_context, loggerMock.Object);
            var query = new GetAllSprintSubtasksByTaskIdQuery { TaskId = 1 };

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Equal(2, result.Count());
        }

        [Fact]
        public async Task GetSprintTaskCommentByIdQueryHandler_ReturnsComment()
        {
            // Arrange
            _context.SprintTaskComments.Add(new SprintTaskComment { CommentId = 1, Taskid = 1, CommentText = "C1", TenantId = 1 });
            await _context.SaveChangesAsync();

            var handler = new GetSprintTaskCommentByIdQueryHandler(_context);
            var query = new GetSprintTaskCommentByIdQuery { CommentId = 1 };

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("C1", result.CommentText);
        }

        [Fact]
        public async Task GetSprintSubtaskByIdQueryHandler_ReturnsSubtask()
        {
            // Arrange
            var subtask = new SprintSubtask { SubtaskId = 1, Subtasktitle = "Subtask 1", TenantId = 1 };
            _context.SprintSubtasks.Add(subtask);
            await _context.SaveChangesAsync();

            var loggerMock = new Mock<ILogger<GetSprintSubtaskByIdQueryHandler>>();
            var handler = new GetSprintSubtaskByIdQueryHandler(_context, loggerMock.Object);
            var query = new GetSprintSubtaskByIdQuery { SubtaskId = 1 };

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Subtask 1", result.Subtasktitle);
        }

        [Fact]
        public async Task GetSprintTaskCommentQueryHandler_ReturnsComments()
        {
            // Arrange
            _context.SprintTaskComments.Add(new SprintTaskComment { CommentId = 1, Taskid = 1, CommentText = "C1", TenantId = 1 });
            _context.SprintTaskComments.Add(new SprintTaskComment { CommentId = 2, Taskid = 1, CommentText = "C2", TenantId = 1 });
            await _context.SaveChangesAsync();

            var loggerMock = new Mock<ILogger<GetSprintTaskCommentQueryHandler>>();
            var handler = new GetSprintTaskCommentQueryHandler(_context, loggerMock.Object);
            var query = new GetSprintTaskCommentQuery { TaskId = 1 };

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Equal(2, result.Count);
        }
    }
}
