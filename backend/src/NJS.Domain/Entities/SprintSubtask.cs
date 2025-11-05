using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NJS.Domain.GenericRepository; // Added for ITenantEntity

namespace NJS.Domain.Entities
{
    public class SprintSubtask : ITenantEntity
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)] // Assuming auto-generated primary key
        public int SubtaskId { get; set; } // New primary key

        public string? Subtaskkey { get; set; }  // e.g. "PROJ-101-1" - now a regular property

        public int TenantId { get; set; } // Added TenantId

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

        public bool? SubtaskisExpanded { get; set; }

        public DateTime? SubtaskcreatedDate { get; set; }

        public DateTime? SubtaskupdatedDate { get; set; }

        public string? SubtaskType { get; set; } = "Sub-task";

        // Foreign key to SprintTask table
        public string? Taskid { get; set; }
        [ForeignKey("Taskid")]
        public SprintTask? ParentTask { get; set; } // Keep this relation
    }
}
