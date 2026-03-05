using EDR.Application.CQRS.SprintSubtasks.Commands;
using EDR.Application.CQRS.SprintSubtasks.Handlers;
using EDR.Application.CQRS.SprintSubtasks.Queries;
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

namespace EDR.API.Tests.CQRS.SprintSubtasks
{
    public class SprintSubtaskCommentHandlersTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly Mock<ICurrentTenantService> _tenantServiceMock;

        public SprintSubtaskCommentHandlersTests()
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
        public async Task AddSprintSubtaskCommentCommandHandler_AddsComment()
        {
            // Arrange
            _context.SprintTasks.Add(new SprintTask { Taskid = 1, TenantId = 1 });
            _context.SprintSubtasks.Add(new SprintSubtask { SubtaskId = 1, Taskid = 1, TenantId = 1 });
            await _context.SaveChangesAsync();

            var handler = new AddSprintSubtaskCommentCommandHandler(_context);
            var command = new AddSprintSubtaskCommentCommand 
            { 
                Taskid = 1,
                SubtaskId = 1, 
                CommentText = "Subcomment",
                CreatedBy = "user"
            };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result);
            Assert.True(_context.SprintSubtaskComments.Any(c => c.CommentText == "Subcomment"));
        }

        [Fact]
        public async Task UpdateSprintSubtaskCommentCommandHandler_UpdatesComment()
        {
            // Arrange
            _context.SprintSubtaskComments.Add(new SprintSubtaskComment { SubtaskCommentId = 1, CommentText = "Old", SubtaskId = 1, Taskid = 1, TenantId = 1 });
            await _context.SaveChangesAsync();

            var handler = new UpdateSprintSubtaskCommentCommandHandler(_context);
            var command = new UpdateSprintSubtaskCommentCommand 
            { 
                SubtaskCommentId = 1, 
                Taskid = 1,
                SubtaskId = 1,
                CommentText = "New" 
            };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result);
            Assert.Equal("New", _context.SprintSubtaskComments.Find(1).CommentText);
        }

        [Fact]
        public async Task DeleteSprintSubtaskCommentCommandHandler_DeletesComment()
        {
            // Arrange
            _context.SprintSubtaskComments.Add(new SprintSubtaskComment { SubtaskCommentId = 1, SubtaskId = 1, Taskid = 1, TenantId = 1 });
            await _context.SaveChangesAsync();

            var handler = new DeleteSprintSubtaskCommentCommandHandler(_context);
            var command = new DeleteSprintSubtaskCommentCommand { SubtaskCommentId = 1 };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result);
            Assert.False(_context.SprintSubtaskComments.Any(c => c.SubtaskCommentId == 1));
        }

        [Fact]
        public async Task GetSprintSubtaskCommentsBySubtaskIdQueryHandler_ReturnsComments()
        {
            // Arrange
            _context.SprintSubtaskComments.Add(new SprintSubtaskComment { SubtaskCommentId = 1, SubtaskId = 1, Taskid = 1, CommentText = "C1", TenantId = 1 });
            _context.SprintSubtaskComments.Add(new SprintSubtaskComment { SubtaskCommentId = 2, SubtaskId = 1, Taskid = 1, CommentText = "C2", TenantId = 1 });
            await _context.SaveChangesAsync();

            var handler = new GetSprintSubtaskCommentsBySubtaskIdQueryHandler(_context);
            var query = new GetSprintSubtaskCommentsBySubtaskIdQuery { SubtaskId = 1 };

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Equal(2, result.Count());
        }

        [Fact]
        public async Task GetSprintSubtaskCommentByIdQueryHandler_ReturnsComment()
        {
            // Arrange
            _context.SprintSubtaskComments.Add(new SprintSubtaskComment { SubtaskCommentId = 1, SubtaskId = 1, Taskid = 1, CommentText = "C1", TenantId = 1 });
            await _context.SaveChangesAsync();

            var handler = new GetSprintSubtaskCommentByIdQueryHandler(_context);
            var query = new GetSprintSubtaskCommentByIdQuery { SubtaskCommentId = 1 };

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("C1", result.CommentText);
        }
    }
}
