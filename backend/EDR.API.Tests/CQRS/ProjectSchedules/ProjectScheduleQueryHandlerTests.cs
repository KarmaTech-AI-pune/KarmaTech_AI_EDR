using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;
using EDR.Application.CQRS.ProjectSchedules.Handlers;
using EDR.Application.CQRS.ProjectSchedules.Command;
using EDR.Application.CQRS.ProjectSchedules.Query;
using EDR.Application.Dtos;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Services;
using EDR.Repositories.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace EDR.API.Tests.CQRS.ProjectSchedules
{
    public class ProjectScheduleQueryHandlerTests : IDisposable
    {
        private readonly ProjectManagementContext _context;
        private readonly Mock<ICurrentTenantService> _mockTenantService;
        private readonly Mock<IProjectScheduleRepository> _mockRepo;
        private readonly Mock<ILogger<CreateProjectScheduleCommandHandler>> _mockCreateLogger;
        private readonly Mock<IConfiguration> _mockConfig;

        public ProjectScheduleQueryHandlerTests()
        {
            _mockTenantService = new Mock<ICurrentTenantService>();
            _mockTenantService.Setup(s => s.TenantId).Returns(1);

            _mockConfig = new Mock<IConfiguration>();
            _mockRepo = new Mock<IProjectScheduleRepository>();
            _mockCreateLogger = new Mock<ILogger<CreateProjectScheduleCommandHandler>>();

            var options = new DbContextOptionsBuilder<ProjectManagementContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new ProjectManagementContext(options, _mockTenantService.Object, _mockConfig.Object);
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Fact]
        public async Task Handle_GetProjectScheduleQuery_ProjectNotFound_ReturnsNull()
        {
            // Arrange
            var handler = new GetProjectScheduleQueryHandler(_context);
            var query = new GetProjectScheduleQuery { ProjectId = 99 };

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task Handle_GetProjectScheduleQuery_Success_ReturnsDto()
        {
            // Arrange
            var project = new Project { Id = 1, Name = "Test Project", TenantId = 1, ProgramId = 1, CreatedBy = "Test" };
            _context.Projects.Add(project);

            var sprintPlan = new SprintPlan
            {
                SprintId = 1,
                ProjectId = 1,
                SprintName = "Sprint 1",
                Status = 0, // Planned
                TenantId = 1
            };
            _context.SprintPlans.Add(sprintPlan);
            
            var task = new SprintTask { Taskid = 1, SprintPlanId = 1, TaskTitle = "Task 1", TenantId = 1 };
            _context.SprintTasks.Add(task);

            await _context.SaveChangesAsync();

            var handler = new GetProjectScheduleQueryHandler(_context);
            var query = new GetProjectScheduleQuery { ProjectId = 1 };

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Sprint 1", result.SprintName);
            Assert.Single(result.Tasks);
            Assert.Equal("Task 1", result.Tasks[0].TaskTitle);
        }

        [Fact]
        public async Task Handle_CreateProjectScheduleCommand_Success_AddsRecords()
        {
            // Arrange
            var project = new Project { Id = 1, Name = "Test Project", TenantId = 1, ProgramId = 1, CreatedBy = "Test" };
            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            var handler = new CreateProjectScheduleCommandHandler(_mockRepo.Object, _context, _mockCreateLogger.Object);
            
            var command = new CreateProjectScheduleCommand
            {
                ProjectSchedule = new ProjectScheduleDto
                {
                    ProjectId = 1,
                    SprintName = "New Sprint",
                    Tasks = new List<SprintTaskDto>
                    {
                        new SprintTaskDto 
                        { 
                            TaskTitle = "New Task",
                            Subtasks = new List<SprintSubtaskDto>
                            {
                                new SprintSubtaskDto { Subtasktitle = "New Subtask" }
                            }
                        }
                    }
                }
            };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.Equal(1, result);
            var savedSprint = await _context.SprintPlans.OrderByDescending(s => s.SprintId).FirstOrDefaultAsync(s => s.SprintName == "New Sprint");
            Assert.NotNull(savedSprint);
            Assert.Equal(1, savedSprint.ProjectId);

            var savedTask = await _context.SprintTasks.FirstOrDefaultAsync(t => t.SprintPlanId == savedSprint.SprintId);
            Assert.NotNull(savedTask);
            Assert.Equal("New Task", savedTask.TaskTitle);

            var savedSubtask = await _context.SprintSubtasks.FirstOrDefaultAsync(s => s.Taskid == savedTask.Taskid);
            Assert.NotNull(savedSubtask);
            Assert.Equal("New Subtask", savedSubtask.Subtasktitle);
        }

        [Fact]
        public async Task Handle_CreateProjectScheduleCommand_ProjectNotFound_ThrowsException()
        {
            // Arrange
            var handler = new CreateProjectScheduleCommandHandler(_mockRepo.Object, _context, _mockCreateLogger.Object);
            var command = new CreateProjectScheduleCommand
            {
                ProjectSchedule = new ProjectScheduleDto
                {
                    ProjectId = 99,
                    Tasks = new List<SprintTaskDto> { new SprintTaskDto { TaskTitle = "T" } }
                }
            };

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => handler.Handle(command, CancellationToken.None));
        }
    }
}
