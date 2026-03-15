using EDR.Application.CQRS.SprintTasks.Commands;
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
using MediatR;
using Microsoft.Extensions.Logging;
using EDR.Application.Dtos;
using Xunit;

namespace EDR.API.Tests.CQRS.SprintTasks
{
    public class SprintTaskCommandHandlersTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly Mock<ICurrentTenantService> _tenantServiceMock;

        public SprintTaskCommandHandlersTests()
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
        public async Task CreateSprintTaskCommandHandler_CreatesTask()
        {
            // Arrange
            var loggerMock = new Mock<ILogger<CreateSprintTaskCommandHandler>>();
            var handler = new CreateSprintTaskCommandHandler(_context, loggerMock.Object);
            var command = new CreateSprintTaskCommand 
            { 
                SprintTask = new SprintTaskInputDto
                {
                    TaskTitle = "Test Task", 
                    Taskdescription = "Desc",
                    SprintPlanId = 0 // Using 0 to skip exists check for now
                }
            };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result > 0);
            Assert.True(_context.SprintTasks.Any(t => t.TaskTitle == "Test Task"));
        }

        [Fact]
        public async Task UpdateSprintTaskCommandHandler_UpdatesTask()
        {
            // Arrange
            var task = new SprintTask { Taskid = 1, TaskTitle = "Old Title", TenantId = 1 };
            _context.SprintTasks.Add(task);
            await _context.SaveChangesAsync();

            var loggerMock = new Mock<ILogger<UpdateSprintTaskCommandHandler>>();
            var handler = new UpdateSprintTaskCommandHandler(_context, loggerMock.Object);
            var command = new UpdateSprintTaskCommand 
            { 
                SprintTask = new SprintTaskInputDto
                {
                    Taskid = 1, 
                    TaskTitle = "New Title" 
                }
            };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result);
            
            var updatedTask = await _context.SprintTasks.FindAsync(1);
            Assert.Equal("New Title", updatedTask.TaskTitle);
        }

        [Fact]
        public async Task DeleteSprintTaskCommandHandler_DeletesTask()
        {
            // Arrange
            var task = new SprintTask { Taskid = 1, TaskTitle = "To Delete", TenantId = 1 };
            _context.SprintTasks.Add(task);
            await _context.SaveChangesAsync();

            var loggerMock = new Mock<ILogger<DeleteSprintTaskCommandHandler>>();
            var handler = new DeleteSprintTaskCommandHandler(_context, loggerMock.Object);
            var command = new DeleteSprintTaskCommand { TaskId = 1 };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result);
            Assert.False(_context.SprintTasks.Any(t => t.Taskid == 1));
        }

        [Fact]
        public async Task AddSprintTaskCommentCommandHandler_AddsComment()
        {
            // Arrange
            var task = new SprintTask { Taskid = 1, TaskTitle = "Task", TenantId = 1 };
            _context.SprintTasks.Add(task);
            await _context.SaveChangesAsync();

            var handler = new AddSprintTaskCommentCommandHandler(_context);
            var command = new AddSprintTaskCommentCommand 
            { 
                TaskId = 1, 
                CommentText = "Nice task!",
                CreatedBy = "user1"
            };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result);
            Assert.True(_context.SprintTaskComments.Any(c => c.CommentText == "Nice task!"));
        }

        [Fact]
        public async Task CreateSprintSubtaskCommandHandler_CreatesSubtask()
        {
            // Arrange
            var task = new SprintTask { Taskid = 1, TaskTitle = "Parent Task", TenantId = 1 };
            _context.SprintTasks.Add(task);
            await _context.SaveChangesAsync();

            var loggerMock = new Mock<ILogger<CreateSprintSubtaskCommandHandler>>();
            var handler = new CreateSprintSubtaskCommandHandler(_context, loggerMock.Object);
            var command = new CreateSprintSubtaskCommand 
            { 
                SprintSubtask = new SprintSubtaskDto
                {
                    Taskid = 1, 
                    Subtasktitle = "Subtask 1" 
                }
            };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result > 0);
            Assert.True(_context.SprintSubtasks.Any(s => s.Subtasktitle == "Subtask 1"));
        }

        [Fact]
        public async Task UpdateSprintSubtaskCommandHandler_UpdatesSubtask()
        {
            // Arrange
            var subtask = new SprintSubtask { SubtaskId = 1, Subtasktitle = "Old Sub", Taskid = 1, TenantId = 1 };
            _context.SprintSubtasks.Add(subtask);
            await _context.SaveChangesAsync();

            var loggerMock = new Mock<ILogger<UpdateSprintSubtaskCommandHandler>>();
            var handler = new UpdateSprintSubtaskCommandHandler(_context, loggerMock.Object);
            var command = new UpdateSprintSubtaskCommand 
            { 
                TaskId = 1,
                SprintSubtask = new SprintSubtaskDto
                {
                    SubtaskId = 1, 
                    Subtasktitle = "New Sub" 
                }
            };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.Equal(Unit.Value, result);
            Assert.Equal("New Sub", _context.SprintSubtasks.Find(1).Subtasktitle);
        }

        [Fact]
        public async Task DeleteSprintSubtaskCommandHandler_DeletesSubtask()
        {
            // Arrange
            var subtask = new SprintSubtask { SubtaskId = 1, Subtasktitle = "To Delete", Taskid = 1, TenantId = 1 };
            _context.SprintSubtasks.Add(subtask);
            await _context.SaveChangesAsync();

            var loggerMock = new Mock<ILogger<DeleteSprintSubtaskCommandHandler>>();
            var handler = new DeleteSprintSubtaskCommandHandler(_context, loggerMock.Object);
            var command = new DeleteSprintSubtaskCommand { SubtaskId = 1 };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result);
            Assert.False(_context.SprintSubtasks.Any(s => s.SubtaskId == 1));
        }

        [Fact]
        public async Task UpdateSprintTaskCommentCommandHandler_UpdatesComment()
        {
            // Arrange
            var comment = new SprintTaskComment { CommentId = 1, CommentText = "Old", Taskid = 1, TenantId = 1 };
            _context.SprintTaskComments.Add(comment);
            await _context.SaveChangesAsync();

            var handler = new UpdateSprintTaskCommentCommandHandler(_context);
            var command = new UpdateSprintTaskCommentCommand 
            { 
                CommentId = 1, 
                Taskid = 1,
                CommentText = "New" 
            };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result);
            Assert.Equal("New", _context.SprintTaskComments.Find(1).CommentText);
        }

        [Fact]
        public async Task DeleteSprintTaskCommentCommandHandler_DeletesComment()
        {
            // Arrange
            var comment = new SprintTaskComment { CommentId = 1, CommentText = "Delete Me", Taskid = 1, TenantId = 1 };
            _context.SprintTaskComments.Add(comment);
            await _context.SaveChangesAsync();

            var handler = new DeleteSprintTaskCommentCommandHandler(_context);
            var command = new DeleteSprintTaskCommentCommand { CommentId = 1 };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result);
            Assert.False(_context.SprintTaskComments.Any(c => c.CommentId == 1));
        }
    }
}
