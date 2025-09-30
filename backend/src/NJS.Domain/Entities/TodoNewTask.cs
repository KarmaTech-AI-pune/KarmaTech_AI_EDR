using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    public class TodoNewTask
    {
        [Key]
        public string? Taskid { get; set; }  // e.g. "T-101"

        public string? Taskkey { get; set; } // e.g. "PROJ-101"

        public string? TaskTitle { get; set; }

        public string? Taskdescription { get; set; }

        public string? TaskType { get; set; }

        public string? Taskpriority { get; set; }

        // Assignee fields (stored as regular strings, not foreign keys)
        public string? TaskAssineid { get; set; }
        public string? TaskAssigneeName { get; set; }
        public string? TaskAssigneeAvatar { get; set; }

        // Reporter fields (stored as regular strings, not foreign keys)
        public string? TaskReporterId { get; set; }
        public string? TaskReporterName { get; set; }
        public string? TaskReporterAvatar { get; set; }

        public string? Taskstatus { get; set; }

        public int? StoryPoints { get; set; }

        public int? Attachments { get; set; }

        public int? Comments { get; set; }

        public bool? IsExpanded { get; set; }

        public DateTime? TaskcreatedDate { get; set; }

        public DateTime? TaskupdatedDate { get; set; }

        [ForeignKey("Project")]
        public int ProjectId { get; set; }
        public TodoNewProject? Project { get; set; }

        public ICollection<TodoNewSubtask>? Subtasks { get; set; }
    }
}
