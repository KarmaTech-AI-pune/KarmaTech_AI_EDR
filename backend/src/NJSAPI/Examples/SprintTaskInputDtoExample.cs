using Swashbuckle.AspNetCore.Filters;
using NJS.Application.Dtos;
using System;

namespace NJSAPI.Examples
{
    public class SprintTaskInputDtoExample : IExamplesProvider<SprintTaskInputDto>
    {
        public SprintTaskInputDto GetExamples()
        {
            return new SprintTaskInputDto
            {
                Taskid = "1",
                TenantId = 1,
                Taskkey = "PROJ-FEAT-002",
                TaskTitle = "Design User Profile Page",
                Taskdescription = "Create the UI/UX design for the user profile section.",
                TaskType = "Design",
                Taskpriority = "Medium",
                TaskAssineid = "user101",
                TaskAssigneeName = "Alice Johnson",
                TaskAssigneeAvatar = "avatar_alice.png",
                TaskReporterId = "user202",
                TaskReporterName = "Bob Williams",
                TaskReporterAvatar = "avatar_bob.png",
                Taskstatus = "To Do",
                StoryPoints = 5,
                Attachments = 0,
                IsExpanded = false,
                TaskcreatedDate = DateTime.Parse("2025-10-31T11:00:00Z"),
                TaskupdatedDate = DateTime.Parse("2025-10-31T11:00:00Z"),
                SprintPlanId = 1,
                WbsPlanId = null,
                UserTaskId = null
            };
        }
    }
}
