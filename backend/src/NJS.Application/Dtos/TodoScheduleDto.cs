using System;
using System.Collections.Generic;

namespace NJS.Application.Dtos
{
    public class TodoScheduleDto
    {
        public int ProjectID { get; set; }
        public DateTime? Date { get; set; }
        public string? ProjectName { get; set; }
        public string? Location { get; set; }
        public string? WorkingHours { get; set; }
        public string? ProjectLeadName { get; set; }
        public string? ProjectLeadEmail { get; set; }
        public List<TodoTaskDto>? Tasks { get; set; }
    }

    public class TodoTaskDto
    {
        public int TaskID { get; set; }
        public int ProjectID { get; set; }
        public string? TimeSlot { get; set; }
        public string? Phase { get; set; }
        public decimal? Cost { get; set; }
        public decimal? CostImpact { get; set; }
        public List<ActivityDto>? Activities { get; set; }
        public List<AssignedToDto>? AssignedTo { get; set; }
    }

    public class ActivityDto
    {
        public int ActivityID { get; set; }
        public int TaskID { get; set; }
        public string? Activity { get; set; }
        public decimal? ActivityCost { get; set; }
    }

    public class AssignedToDto
    {
        public int AssigneeID { get; set; }
        public int TaskID { get; set; }
        public string? AssigneeName { get; set; }
    }

    // Response DTO for POST endpoint
    public class TodoScheduleResponseDto
    {
        public TodoScheduleDto Data { get; set; }
        public string AccessLink { get; set; }
        public int ProjectId { get; set; }
        public string Message { get; set; } = "Project schedule created successfully!";
    }
}
