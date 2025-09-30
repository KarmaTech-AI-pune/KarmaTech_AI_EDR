using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    public class TodoNewSubtask
    {
        [Key]
        public string? Subtaskkey { get; set; }  // e.g. "PROJ-101-1"

        public string? Subtasktitle { get; set; }

        public string? Subtaskdescription { get; set; }

        public string? Subtaskpriority { get; set; }

        public string? Subtaskstatus { get; set; }

        // Assignee fields (stored as regular strings, not foreign keys)
        public string? SubtaskAssineid { get; set; }
        public string? SubtaskAssigneeName { get; set; }
        public string? SubtaskAssigneeAvatar { get; set; }

        // Reporter fields (stored as regular strings, not foreign keys)
        public string? SubtaskReporterId { get; set; }
        public string? SubtaskReporterName { get; set; }
        public string? SubtaskReporterAvatar { get; set; }

        public int? Attachments { get; set; }

        public int? Subtaskcomments { get; set; }

        public DateTime? SubtaskcreatedDate { get; set; }

        public DateTime? SubtaskupdatedDate { get; set; }

        public string? SubtaskType { get; set; } = "Sub-task";

        [ForeignKey("ParentTask")]
        public string? Taskid { get; set; }
        public TodoNewTask? ParentTask { get; set; }
    }
}
