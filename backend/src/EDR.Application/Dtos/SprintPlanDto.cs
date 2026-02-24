using System;
using System.Collections.Generic;
using System.Text.Json.Serialization; // Added for JsonIgnore attribute

namespace EDR.Application.Dtos
{
    public class SprintPlanDto
    {
        public int? SprintId { get; set; }
        public int? SprintNumber { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? SprintGoal { get; set; }
        public int? ProjectId { get; set; }
        public List<SprintEmployeeDto>? SprintEmployee { get; set; }

        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public List<SprintTaskDto>? SprintTasks { get; set; }

        public string? SprintName { get; set; }
        public int PlannedStoryPoints { get; set; }
        public int ActualStoryPoints { get; set; }
        public decimal Velocity { get; set; }
        public int Status { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}

