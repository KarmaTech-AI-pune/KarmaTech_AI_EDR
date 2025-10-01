using System;
using System.Collections.Generic;

namespace NJS.Application.Dtos
{
    public class ProjectScheduleDto
    {
        public int ProjectId { get; set; }
        public string? ProjectName { get; set; }
        public string? Description { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public List<TodoNewTaskDto>? Tasks { get; set; }
    }

    public class TodoNewTaskDto
    {
        public string? Taskid { get; set; }  // e.g. "T-101"
        public string? Taskkey { get; set; } // e.g. "PROJ-101"
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
        public List<TodoNewSubtaskDto>? Subtasks { get; set; }
    }

    public class TodoNewSubtaskDto
    {
        public string? Subtaskkey { get; set; }  // e.g. "PROJ-101-1"
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
        public DateTime? SubtaskcreatedDate { get; set; }
        public DateTime? SubtaskupdatedDate { get; set; }
        public string? SubtaskType { get; set; }
        public string? Taskid { get; set; }
        public bool? SubtaskisExpanded { get; set; } // optional, not persisted yet
    }

    public class TodoNewTeamMemberDto
    {
        public string? Assineid { get; set; }
        public string? Assinename { get; set; }
        public string? Assineavatar { get; set; }
    }

    // Response DTO for POST endpoint  
    public class ProjectScheduleResponseDto
    {
        public ProjectScheduleDto Data { get; set; }
        public string AccessLink { get; set; }
        public int ProjectId { get; set; }
        public string Message { get; set; } = "Project schedule created successfully!";
    }
    
    // Response DTO for GET endpoint - Only tasks
    public class ProjectTasksOnlyDto
    {
        public List<TodoNewTaskDto>? Tasks { get; set; }
    }
}
