using System;
using System.Collections.Generic;

namespace EDR.Application.Dtos
{
    public class ProjectScheduleDto
    {
        public int? SprintId { get; set; }
        public int? TenantId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? SprintGoal { get; set; }
        public int? ProjectId { get; set; }
        public int? RequiredSprintEmployees { get; set; }
        public string? SprintName { get; set; }
        public int? PlannedStoryPoints { get; set; }
        public int? ActualStoryPoints { get; set; }
        public int? Velocity { get; set; }
        public int? Status { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public List<SprintTaskDto>? Tasks { get; set; }
    }
}

