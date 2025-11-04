using System;

namespace NJS.Application.Dtos
{
    public class SprintPlanInputDto
    {
        public int? SprintId { get; set; }
        public int? SprintNumber { get; set; }
        public int? TenantId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? SprintGoal { get; set; }
        public int? ProjectId { get; set; }
        public int? SprintEmployee { get; set; }
    }
}
