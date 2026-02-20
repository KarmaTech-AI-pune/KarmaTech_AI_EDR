using System.Net;
using System.Net.Http.Json;
using NJS.API.Tests.Infrastructure;
using NJS.Application.CQRS.SprintTasks.Commands;
using NJS.Application.Dtos;
using Xunit;

namespace NJS.API.Tests.Integration
{
    /// <summary>
    /// Integration tests for SprintTaskController: Sprint Plans, Tasks, Subtasks, and Comments.
    /// Uses WebApplicationFactory with InMemory database — no mocking.
    /// </summary>
    public class SprintTaskControllerIntegrationTests : IntegrationTestBase
    {
        private const string BaseUrl = "/api/sprint-tasks";

        #region Sprint Plan CRUD

        [Fact]
        public async Task CreateSingleSprintPlan_ShouldReturn201_WithSprintPlanId()
        {
            // Arrange
            var seed = await SeedProjectOnlyAsync();
            var dto = new SprintPlanInputDto
            {
                TenantId = 1,
                SprintName = "Integration Sprint 1",
                ProjectId = seed.ProjectId,
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddDays(14),
                SprintGoal = "Complete integration features",
                RequiredSprintEmployees = 3,
                CreatedAt = DateTime.UtcNow
            };

            // Act
            var response = await Client.PostAsJsonAsync($"{BaseUrl}/single-sprint-plan", dto);

            // Assert
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        }

        [Fact]
        public async Task GetSingleSprintPlan_ShouldReturn200_WhenPlanExists()
        {
            // Arrange
            var seed = await SeedDatabaseAsync();

            // Act
            var response = await Client.GetAsync($"{BaseUrl}/single-sprint-plan/{seed.SprintPlanId}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var content = await response.Content.ReadAsStringAsync();
            Assert.Contains("Sprint 1", content);
        }

        [Fact]
        public async Task GetSingleSprintPlan_ShouldReturn404_WhenPlanDoesNotExist()
        {
            // Act
            var response = await Client.GetAsync($"{BaseUrl}/single-sprint-plan/99999");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task UpdateSingleSprintPlan_ShouldReturn200_WhenPlanExists()
        {
            // Arrange
            var seed = await SeedDatabaseAsync();
            var dto = new SprintPlanInputDto
            {
                SprintId = seed.SprintPlanId,
                TenantId = 1,
                SprintName = "Updated Sprint 1",
                ProjectId = seed.ProjectId,
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddDays(14),
                SprintGoal = "Updated goal",
                RequiredSprintEmployees = 5,
                CreatedAt = DateTime.UtcNow
            };

            // Act
            var response = await Client.PutAsJsonAsync($"{BaseUrl}/single-sprint-plan", dto);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task UpdateSingleSprintPlan_ShouldReturn404_WhenPlanDoesNotExist()
        {
            // Arrange
            var dto = new SprintPlanInputDto
            {
                SprintId = 99999,
                TenantId = 1,
                SprintName = "Nonexistent Sprint",
                ProjectId = 1
            };

            // Act
            var response = await Client.PutAsJsonAsync($"{BaseUrl}/single-sprint-plan", dto);

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        #endregion

        #region Sprint Task CRUD

        [Fact]
        public async Task CreateSingleSprintTask_ShouldReturn201_WithTaskId()
        {
            // Arrange
            var seed = await SeedDatabaseAsync();
            var dto = new SprintTaskInputDto
            {
                TenantId = 1,
                Taskkey = "PROJ-101",
                TaskTitle = "Integration Test Task",
                Taskdescription = "A task created via integration test",
                TaskType = "Story",
                Taskpriority = "High",
                Taskstatus = "To Do",
                SprintPlanId = seed.SprintPlanId,
                TaskcreatedDate = DateTime.UtcNow
            };

            // Act
            var response = await Client.PostAsJsonAsync($"{BaseUrl}/single-sprint-task", dto);

            // Assert
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        }

        [Fact]
        public async Task GetSingleSprintTask_ShouldReturn200_WhenTaskExists()
        {
            // Arrange: create a task first
            var seed = await SeedDatabaseAsync();
            var createDto = new SprintTaskInputDto
            {
                TenantId = 1,
                Taskkey = "PROJ-102",
                TaskTitle = "Get Test Task",
                TaskType = "Story",
                Taskstatus = "To Do",
                SprintPlanId = seed.SprintPlanId,
                TaskcreatedDate = DateTime.UtcNow
            };
            var createResponse = await Client.PostAsJsonAsync($"{BaseUrl}/single-sprint-task", createDto);
            Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
            var created = await DeserializeResponseAsync<TaskCreatedResponse>(createResponse);

            // Act
            var response = await Client.GetAsync($"{BaseUrl}/{created.TaskId}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task GetSingleSprintTask_ShouldReturn404_WhenTaskDoesNotExist()
        {
            // Act
            var response = await Client.GetAsync($"{BaseUrl}/99999");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task UpdateSingleSprintTask_ShouldReturn200_WhenTaskExists()
        {
            // Arrange: create a task first
            var seed = await SeedDatabaseAsync();
            var createDto = new SprintTaskInputDto
            {
                TenantId = 1,
                Taskkey = "PROJ-103",
                TaskTitle = "Update Test Task",
                TaskType = "Story",
                Taskstatus = "To Do",
                SprintPlanId = seed.SprintPlanId,
                TaskcreatedDate = DateTime.UtcNow
            };
            var createResponse = await Client.PostAsJsonAsync($"{BaseUrl}/single-sprint-task", createDto);
            var created = await DeserializeResponseAsync<TaskCreatedResponse>(createResponse);

            var updateDto = new SprintTaskInputDto
            {
                Taskid = created.TaskId,
                TenantId = 1,
                Taskkey = "PROJ-103",
                TaskTitle = "Updated Task Title",
                TaskType = "Story",
                Taskstatus = "In Progress",
                SprintPlanId = seed.SprintPlanId,
                TaskupdatedDate = DateTime.UtcNow
            };

            // Act
            var response = await Client.PutAsJsonAsync($"{BaseUrl}/single-sprint-task", updateDto);

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }

        [Fact]
        public async Task DeleteSprintTask_ShouldReturn200_WhenTaskExists()
        {
            // Arrange: create a task first
            var seed = await SeedDatabaseAsync();
            var createDto = new SprintTaskInputDto
            {
                TenantId = 1,
                Taskkey = "PROJ-104",
                TaskTitle = "Delete Test Task",
                TaskType = "Story",
                Taskstatus = "To Do",
                SprintPlanId = seed.SprintPlanId,
                TaskcreatedDate = DateTime.UtcNow
            };
            var createResponse = await Client.PostAsJsonAsync($"{BaseUrl}/single-sprint-task", createDto);
            var created = await DeserializeResponseAsync<TaskCreatedResponse>(createResponse);

            // Act
            var response = await Client.DeleteAsync($"{BaseUrl}/{created.TaskId}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            // Verify task is actually deleted
            var getResponse = await Client.GetAsync($"{BaseUrl}/{created.TaskId}");
            Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
        }

        [Fact]
        public async Task DeleteSprintTask_ShouldReturn404_WhenTaskDoesNotExist()
        {
            // Act
            var response = await Client.DeleteAsync($"{BaseUrl}/99999");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        #endregion

        #region Subtask CRUD

        [Fact]
        public async Task CreateSprintSubtask_ShouldReturn201_WhenValidData()
        {
            // Arrange: create parent task first
            var seed = await SeedDatabaseAsync();
            var taskDto = new SprintTaskInputDto
            {
                TenantId = 1,
                Taskkey = "PROJ-200",
                TaskTitle = "Subtask Parent Task",
                TaskType = "Story",
                Taskstatus = "To Do",
                SprintPlanId = seed.SprintPlanId,
                TaskcreatedDate = DateTime.UtcNow
            };
            var taskResponse = await Client.PostAsJsonAsync($"{BaseUrl}/single-sprint-task", taskDto);
            var task = await DeserializeResponseAsync<TaskCreatedResponse>(taskResponse);

            var subtaskDto = new SprintSubtaskDto
            {
                TenantId = 1,
                Subtaskkey = "PROJ-200-1",
                Subtasktitle = "Integration Subtask",
                Subtaskdescription = "Test subtask",
                Subtaskpriority = "Medium",
                Subtaskstatus = "To Do",
                SubtaskType = "Sub-task",
                Taskid = task.TaskId,
                SubtaskcreatedDate = DateTime.UtcNow
            };

            // Act
            var response = await Client.PostAsJsonAsync($"{BaseUrl}/{task.TaskId}/subtasks", subtaskDto);

            // Assert
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        }

        [Fact]
        public async Task GetSprintSubtaskById_ShouldReturn404_WhenNotExists()
        {
            // Act
            var response = await Client.GetAsync($"{BaseUrl}/subtasks/99999");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task DeleteSprintSubtask_ShouldReturn404_WhenNotExists()
        {
            // Act
            var response = await Client.DeleteAsync($"{BaseUrl}/subtasks/99999");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        #endregion

        #region Task Comment CRUD

        [Fact]
        public async Task AddSprintTaskComment_ShouldReturn201_WhenValid()
        {
            // Arrange: create a task first
            var seed = await SeedDatabaseAsync();
            var taskDto = new SprintTaskInputDto
            {
                TenantId = 1,
                Taskkey = "PROJ-300",
                TaskTitle = "Comment Parent Task",
                TaskType = "Story",
                Taskstatus = "To Do",
                SprintPlanId = seed.SprintPlanId,
                TaskcreatedDate = DateTime.UtcNow
            };
            var taskResponse = await Client.PostAsJsonAsync($"{BaseUrl}/single-sprint-task", taskDto);
            var task = await DeserializeResponseAsync<TaskCreatedResponse>(taskResponse);

            var commentDto = new AddSprintTaskCommentCommand
            {
                TaskId = task.TaskId,
                CommentText = "Integration test comment",
                CreatedBy = "testuser@test.com"
            };

            // Act
            var response = await Client.PostAsJsonAsync($"{BaseUrl}/{task.TaskId}/comments", commentDto);

            // Assert
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        }

        [Fact]
        public async Task GetSprintTaskCommentById_ShouldReturn404_WhenNotExists()
        {
            // Act
            var response = await Client.GetAsync($"{BaseUrl}/comments/99999");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task DeleteSprintTaskComment_ShouldReturn404_WhenNotExists()
        {
            // Act
            var response = await Client.DeleteAsync($"{BaseUrl}/comments/99999");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        #endregion

        #region Edge Cases

        [Fact]
        public async Task DeleteSprintTask_ShouldReturnBadRequest_WhenIdIsZero()
        {
            // Act
            var response = await Client.DeleteAsync($"{BaseUrl}/0");

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task DeleteSprintSubtask_ShouldReturnBadRequest_WhenIdIsZero()
        {
            // Act
            var response = await Client.DeleteAsync($"{BaseUrl}/subtasks/0");

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Fact]
        public async Task DeleteSprintTaskComment_ShouldReturnBadRequest_WhenIdIsZero()
        {
            // Act
            var response = await Client.DeleteAsync($"{BaseUrl}/comments/0");

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        #endregion
    }

    /// <summary>
    /// Helper class for deserializing create task response.
    /// </summary>
    public class TaskCreatedResponse
    {
        public int TaskId { get; set; }
        public string Message { get; set; }
    }
}
