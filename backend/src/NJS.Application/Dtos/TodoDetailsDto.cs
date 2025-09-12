using System;
using System.Collections.Generic;

namespace NJS.Application.Dtos
{
    public class SprintDto
    {
        public int Id { get; set; }
        public string? SprintName { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? ProjectId { get; set; }
        public List<PhaseDto>? Phases { get; set; }
    }

    public class PhaseDto
    {
        public int Id { get; set; }
        public string? PhaseName { get; set; }
        public int? SprintId { get; set; }
        public List<PhaseActivityDto>? Activities { get; set; }
    }

    public class PhaseActivityDto
    {
        public int Id { get; set; }
        public int? ActivityID { get; set; } // External from JSON
        public DateTime? Date { get; set; }
        public string? StartTime { get; set; }
        public string? EndTime { get; set; }
        public int? PhaseId { get; set; }
        public List<SubTaskDto>? SubTasks { get; set; }
    }

    public class SubTaskDto
    {
        public int Id { get; set; }
        public int? SubTaskID { get; set; } // External from JSON
        public string? Description { get; set; }
        public int? TaskId { get; set; }
        public int? PhaseActivityId { get; set; } // Added
    }
}
