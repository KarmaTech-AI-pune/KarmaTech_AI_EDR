using System;
using System.Collections.Generic;

namespace NJS.Application.Dtos
{
    public class CurrentSprintWbsPlanResponseDto
    {
        public WbsProjectDto? Project { get; set; }
        public WbsSprintContextDto? Sprint { get; set; }
        public List<WbsPlanDto> WbsPlans { get; set; } = new();
    }

    public class WbsProjectDto
    {
        public int ProjectId { get; set; }
        public string? ProjectName { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int SprintDurationDays { get; set; }
    }

    public class WbsSprintContextDto
    {
        public string? MonthYear { get; set; }
        public int SprintNumber { get; set; }
    }

    public class WbsPlanDto
    {
        public int SprintWbsPlanId { get; set; }
        public int? WbsTaskId { get; set; }
        public string? WbsTaskName { get; set; }
        public string? AssignedUserName { get; set; }
        public string? RoleName { get; set; }
        public decimal PlannedHours { get; set; }
        public decimal RemainingHours { get; set; }
        public int ProgramSequence { get; set; }
        public bool IsConsumed { get; set; }
        public string? AcceptanceCriteria { get; set; }
        public string? TaskDescription { get; set; }
    }
}
