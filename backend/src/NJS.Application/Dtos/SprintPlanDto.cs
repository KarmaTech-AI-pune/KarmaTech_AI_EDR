using System;
using System.Collections.Generic;

namespace NJS.Application.Dtos
{
    public class SprintPlanDto
    {
        public int? SprintId { get; set; }
        public string? SprintName { get; set; }
        public int? SprintNumber { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? SprintGoal { get; set; }
        public string? Status { get; set; }
        public DateTime? CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
        public int ProjectId { get; set; }
        public List<SprintTaskDto>? SprintTasks { get; set; }
    }
}
