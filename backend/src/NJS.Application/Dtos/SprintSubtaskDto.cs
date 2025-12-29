using System;

namespace NJS.Application.Dtos
{
    public class SprintSubtaskDto
    {
        public int? SubtaskId { get; set; }
        public string? Subtaskkey { get; set; }
        public int TenantId { get; set; }
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
        public int? Attachments { get; set; }
        // public string? Subtaskcomments { get; set; } // Removed as per payload
        public bool? SubtaskisExpanded { get; set; }
        public DateTime? SubtaskcreatedDate { get; set; }
        public DateTime? SubtaskupdatedDate { get; set; }
        public string? SubtaskType { get; set; }
        public int Taskid { get; set; }
        public int? DisplayOrder { get; set; }
        public int? EstimatedHours { get; set; }
        public int? ActualHours { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
    }
}
