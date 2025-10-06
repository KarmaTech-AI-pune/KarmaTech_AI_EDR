using System;
using System.Collections.Generic;

namespace NJS.Application.Dtos
{
    public class ProjectScheduleDto
    {
        public SprintPlanDto? SprintPlan { get; set; }
    }

    public class SprintTaskDto
    {
        public string? Taskid { get; set; }
        public string? Taskkey { get; set; }
        public string? TaskTitle { get; set; }
        public string? Taskdescription { get; set; }
        public string? TaskType { get; set; }
        public string? Taskpriority { get; set; }
        public string? TaskAssineid { get; set; }
        public string? TaskAssigneeName { get; set; }
        public string? TaskAssigneeAvatar { get; set; }
        public string? TaskReporterId { get; set; }
        public string? TaskReporterName { get; set; }
        public string? TaskReporterAvatar { get; set; }
        public string? Taskstatus { get; set; }
        public int? StoryPoints { get; set; }
        public int? Taskattachments { get; set; } // renamed from Attachments
        public int? Taskcomments { get; set; } // renamed from Comments
        public bool? TaskisExpanded { get; set; } // renamed from IsExpanded
        public DateTime? TaskcreatedDate { get; set; }
        public DateTime? TaskupdatedDate { get; set; }
        public int? SprintPlanId { get; set; }
        public int? WbsPlanId { get; set; }
        public int? UserTaskId { get; set; }
        public List<SprintSubtaskDto>? Subtasks { get; set; }
    }

    public class SprintSubtaskDto
    {
        public string? Subtaskkey { get; set; }
        public string? Subtasktitle { get; set; }
        public string? Subtaskdescription { get; set; }
        public string? Subtaskpriority { get; set; }
        public string? Subtaskstatus { get; set; }
        public string? SubtaskAssineid { get; set; }
        public string? SubtaskAssigneeName { get; set; }
        public string? SubtaskAssigneeAvatar { get; set; }
        public string? SubtaskReporterId { get; set; }
        public string? SubtaskReporterName { get; set; }
        public string? SubtaskReporterAvatar { get; set; }
        public int? Subtaskattachments { get; set; } // renamed from Attachments
        public int? Subtaskcomments { get; set; }
        public bool? SubtaskisExpanded { get; set; }
        public DateTime? SubtaskcreatedDate { get; set; }
        public DateTime? SubtaskupdatedDate { get; set; }
        public string? SubtaskType { get; set; }
        public string? Taskid { get; set; } // Foreign key to SprintTask
    }

    // Response DTO for POST endpoint  
    public class ProjectScheduleResponseDto
    {
        public SprintPlanDto? Data { get; set; } // Changed to SprintPlanDto
        public string AccessLink { get; set; }
        public int ProjectId { get; set; } // Keep ProjectId for response context
        public string Message { get; set; } = "Project schedule created successfully!";
    }

}
