using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NJS.Domain.GenericRepository; // Added for ITenantEntity

namespace NJS.Domain.Entities
{
    public class SprintTask : ITenantEntity
    {
        [Key]
        public string? Taskid { get; set; }  // e.g. "T-101"

        public int TenantId { get; set; } // Added TenantId

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

        public bool? IsExpanded { get; set; }

        public DateTime? TaskcreatedDate { get; set; }

        public DateTime? TaskupdatedDate { get; set; }

        // Navigation property to SprintSubtasks
        public ICollection<SprintSubtask>? Subtasks { get; set; }

        // New Foreign Keys and Navigation Properties
        public int? SprintPlanId { get; set; }
        [ForeignKey("SprintPlanId")]
        public SprintPlan? SprintPlan { get; set; }

        public int? WbsPlanId { get; set; }
        [ForeignKey("WbsPlanId")]
        public WBSTaskPlannedHour? WbsPlan { get; set; }

        public int? UserTaskId { get; set; }
        [ForeignKey("UserTaskId")]
        public UserWBSTask? UserTask { get; set; }
    }
}
