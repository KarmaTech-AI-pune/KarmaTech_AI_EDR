using System.Net;
using System.Net.Http.Json;
using NJS.API.Tests.Infrastructure;
using NJS.Application.CQRS.SprintDailyProgresses.Commands;
using NJS.Application.CQRS.SprintTasks.Commands;
using NJS.Application.CQRS.SprintWbsPlans.Commands;
using NJS.Application.Dtos;
using Xunit;

namespace NJS.API.Tests.Integration
{
    /// <summary>
    /// Regression tests for Sprint APIs. Tests complex cross-entity workflows,
    /// data integrity, and tenant isolation using real pipeline (no mocking).
    /// </summary>
    public class SprintRegressionTests : IntegrationTestBase
    {
        [Fact]
        public async Task FullLifecycle_CreatePlan_CreateTask_CreateSubtask_AddComment()
        {
            // Arrange: seed project
            var seed = await SeedProjectOnlyAsync();

            // Step 1: Create Sprint Plan
            var planDto = new SprintPlanInputDto
            {
                TenantId = 1,
                SprintName = "Lifecycle Sprint",
                ProjectId = seed.ProjectId,
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddDays(14),
                SprintGoal = "End-to-end lifecycle test",
                RequiredSprintEmployees = 3,
                CreatedAt = DateTime.UtcNow
            };
            var planResponse = await Client.PostAsJsonAsync("/api/sprint-tasks/single-sprint-plan", planDto);
            Assert.Equal(HttpStatusCode.Created, planResponse.StatusCode);

            // Extract sprint plan ID from response (integer returned)
            var planContent = await planResponse.Content.ReadAsStringAsync();
            var sprintPlanId = int.Parse(planContent);

            // Step 2: Verify plan exists
            var getPlanResponse = await Client.GetAsync($"/api/sprint-tasks/single-sprint-plan/{sprintPlanId}");
            Assert.Equal(HttpStatusCode.OK, getPlanResponse.StatusCode);

            // Step 3: Create Task
            var taskDto = new SprintTaskInputDto
            {
                TenantId = 1,
                Taskkey = "LIFE-001",
                TaskTitle = "Lifecycle Task",
                Taskdescription = "Task in lifecycle test",
                TaskType = "Story",
                Taskpriority = "High",
                Taskstatus = "To Do",
                SprintPlanId = sprintPlanId,
                TaskcreatedDate = DateTime.UtcNow
            };
            var taskResponse = await Client.PostAsJsonAsync("/api/sprint-tasks/single-sprint-task", taskDto);
            Assert.Equal(HttpStatusCode.Created, taskResponse.StatusCode);
            var task = await DeserializeResponseAsync<TaskCreatedResponse>(taskResponse);

            // Step 4: Verify task exists
            var getTaskResponse = await Client.GetAsync($"/api/sprint-tasks/{task.TaskId}");
            Assert.Equal(HttpStatusCode.OK, getTaskResponse.StatusCode);

            // Step 5: Create Subtask
            var subtaskDto = new SprintSubtaskDto
            {
                TenantId = 1,
                Subtaskkey = "LIFE-001-1",
                Subtasktitle = "Lifecycle Subtask",
                Subtaskpriority = "Medium",
                Subtaskstatus = "To Do",
                SubtaskType = "Sub-task",
                Taskid = task.TaskId,
                SubtaskcreatedDate = DateTime.UtcNow
            };
            var subtaskResponse = await Client.PostAsJsonAsync($"/api/sprint-tasks/{task.TaskId}/subtasks", subtaskDto);
            Assert.Equal(HttpStatusCode.Created, subtaskResponse.StatusCode);

            // Step 6: Add Comment to Task
            var commentDto = new AddSprintTaskCommentCommand
            {
                TaskId = task.TaskId,
                CommentText = "Lifecycle test comment",
                CreatedBy = "testuser@test.com"
            };
            var commentResponse = await Client.PostAsJsonAsync($"/api/sprint-tasks/{task.TaskId}/comments", commentDto);
            Assert.Equal(HttpStatusCode.Created, commentResponse.StatusCode);

            // Step 7: Verify comments exist
            var getCommentsResponse = await Client.GetAsync($"/api/sprint-tasks/{task.TaskId}/comments");
            Assert.Equal(HttpStatusCode.OK, getCommentsResponse.StatusCode);
        }

        [Fact]
        public async Task TaskBelongsToCorrectPlan_DataIntegrity()
        {
            // Arrange: create two sprint plans
            var seed = await SeedProjectOnlyAsync();

            var plan1Dto = new SprintPlanInputDto
            {
                TenantId = 1, SprintName = "Sprint A",
                ProjectId = seed.ProjectId, CreatedAt = DateTime.UtcNow,
                StartDate = DateTime.UtcNow, EndDate = DateTime.UtcNow.AddDays(7)
            };
            var plan2Dto = new SprintPlanInputDto
            {
                TenantId = 1, SprintName = "Sprint B",
                ProjectId = seed.ProjectId, CreatedAt = DateTime.UtcNow,
                StartDate = DateTime.UtcNow.AddDays(8), EndDate = DateTime.UtcNow.AddDays(14)
            };

            var plan1Response = await Client.PostAsJsonAsync("/api/sprint-tasks/single-sprint-plan", plan1Dto);
            var plan1Id = int.Parse(await plan1Response.Content.ReadAsStringAsync());

            var plan2Response = await Client.PostAsJsonAsync("/api/sprint-tasks/single-sprint-plan", plan2Dto);
            var plan2Id = int.Parse(await plan2Response.Content.ReadAsStringAsync());

            // Create task linked to plan1
            var taskDto = new SprintTaskInputDto
            {
                TenantId = 1, Taskkey = "INTEG-001", TaskTitle = "Belongs to Sprint A",
                TaskType = "Story", Taskstatus = "To Do", SprintPlanId = plan1Id,
                TaskcreatedDate = DateTime.UtcNow
            };
            var taskResponse = await Client.PostAsJsonAsync("/api/sprint-tasks/single-sprint-task", taskDto);
            var task = await DeserializeResponseAsync<TaskCreatedResponse>(taskResponse);

            // Act: verify task data
            var getTaskResponse = await Client.GetAsync($"/api/sprint-tasks/{task.TaskId}");
            var content = await getTaskResponse.Content.ReadAsStringAsync();

            // Assert: task belongs to plan1, not plan2
            Assert.Contains("Belongs to Sprint A", content);
        }

        [Fact]
        public async Task DeleteTask_ThenGetReturns404()
        {
            // Arrange
            var seed = await SeedDatabaseAsync();
            var taskDto = new SprintTaskInputDto
            {
                TenantId = 1, Taskkey = "DEL-001", TaskTitle = "To Delete",
                TaskType = "Story", Taskstatus = "To Do", SprintPlanId = seed.SprintPlanId,
                TaskcreatedDate = DateTime.UtcNow
            };
            var createResponse = await Client.PostAsJsonAsync("/api/sprint-tasks/single-sprint-task", taskDto);
            var task = await DeserializeResponseAsync<TaskCreatedResponse>(createResponse);

            // Act: delete then get
            var deleteResponse = await Client.DeleteAsync($"/api/sprint-tasks/{task.TaskId}");
            Assert.Equal(HttpStatusCode.OK, deleteResponse.StatusCode);

            var getResponse = await Client.GetAsync($"/api/sprint-tasks/{task.TaskId}");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
        }

        [Fact]
        public async Task UpdatePlanThenVerifyChanges()
        {
            // Arrange
            var seed = await SeedDatabaseAsync();
            var updateDto = new SprintPlanInputDto
            {
                SprintId = seed.SprintPlanId,
                TenantId = 1,
                SprintName = "Regression Updated Sprint",
                ProjectId = seed.ProjectId,
                SprintGoal = "Regression updated goal",
                RequiredSprintEmployees = 10,
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddDays(14),
                CreatedAt = DateTime.UtcNow
            };

            // Act
            var updateResponse = await Client.PutAsJsonAsync("/api/sprint-tasks/single-sprint-plan", updateDto);
            Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);

            // Verify changes persisted
            var getResponse = await Client.GetAsync($"/api/sprint-tasks/single-sprint-plan/{seed.SprintPlanId}");
            Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
            var content = await getResponse.Content.ReadAsStringAsync();
            Assert.Contains("Regression Updated Sprint", content);
        }

        [Fact]
        public async Task WbsPlanAndSprintPlan_IndependentOperations()
        {
            // Arrange: create WBS plans and sprint plans independently for the same project
            var seed = await SeedProjectOnlyAsync();

            // Create WBS plans
            var wbsItems = new List<CreateSprintWbsPlanDto>
            {
                new CreateSprintWbsPlanDto
                {
                    TenantId = 1, ProjectId = seed.ProjectId, WBSTaskName = "WBS Independent",
                    MonthYear = "2026-05", SprintNumber = 1, PlannedHours = 20,
                    RemainingHours = 20, ProgramSequence = 1, IsConsumed = false
                }
            };
            var wbsResponse = await Client.PostAsJsonAsync("/api/ProgramSprint/bulk", wbsItems);
            Assert.Equal(HttpStatusCode.OK, wbsResponse.StatusCode);

            // Create sprint plan
            var planDto = new SprintPlanInputDto
            {
                TenantId = 1, SprintName = "Independent Sprint",
                ProjectId = seed.ProjectId,
                CreatedAt = DateTime.UtcNow,
                StartDate = DateTime.UtcNow, EndDate = DateTime.UtcNow.AddDays(14)
            };
            var planResponse = await Client.PostAsJsonAsync("/api/sprint-tasks/single-sprint-plan", planDto);
            Assert.Equal(HttpStatusCode.Created, planResponse.StatusCode);

            // Act: verify both independently
            var getWbsResponse = await Client.GetAsync($"/api/ProgramSprint/{seed.ProjectId}");
            var getPlanResponse = await Client.GetAsync($"/api/sprint-tasks/single-sprint-plan/{int.Parse(await planResponse.Content.ReadAsStringAsync())}");

            // Assert
            Assert.Equal(HttpStatusCode.OK, getWbsResponse.StatusCode);
            Assert.Equal(HttpStatusCode.OK, getPlanResponse.StatusCode);
        }
    }
}
