using System;
using System.Collections.Generic;

namespace NJS.Application.Dtos
{
    public class SprintTaskInputDto
    {
        public int? Taskid { get; set; }
        public int TenantId { get; set; }
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
        public int? Attachments { get; set; }
        public bool? IsExpanded { get; set; }
        public DateTime? TaskcreatedDate { get; set; }
        public DateTime? TaskupdatedDate { get; set; }
        public int? SprintPlanId { get; set; }
        public int? WbsPlanId { get; set; }
        public int? UserTaskId { get; set; }
        public string? AcceptanceCriteria { get; set; }
        public int DisplayOrder { get; set; }
        public int EstimatedHours { get; set; }
        public int ActualHours { get; set; }
        public int RemainingHours { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
    }
}
