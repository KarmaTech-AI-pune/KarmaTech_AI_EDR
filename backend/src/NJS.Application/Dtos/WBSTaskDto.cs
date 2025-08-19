using System;
using System.Collections.Generic;
using NJS.Domain.Enums; // Required for WBSTaskLevel
using NJS.Domain.Entities; // Required for TaskType

namespace NJS.Application.Dtos
{
    public class WBSTaskDto
    {
        // Frontend might send temporary IDs for new tasks, handle appropriately
        public int Id { get; set; }
        public int WorkBreakdownStructureId { get; set; } // Needed for context if creating WBS + tasks together
        public int? ParentId { get; set; }
        public WBSTaskLevel Level { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int DisplayOrder { get; set; } // To maintain order from frontend
        public decimal EstimatedBudget { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public TaskType TaskType { get; set; } = TaskType.Manpower; // Default to Manpower for backward compatibility

        // Resource/Cost Info (Primarily for Level 3)
        public string? AssignedUserId { get; set; }
        public string? AssignedUserName { get; set; } // For display, populated in query
        public decimal CostRate { get; set; }
        public string? ResourceName { get; set; } // Added Resource Name
        public string? ResourceUnit { get; set; } // Added Resource Unit
        public string? ResourceRoleId { get; set; } // Added Resource Role ID
        public string? ResourceRoleName { get; set; } // Added Resource Role Name for display

        // Planned Hours
        public List<PlannedHourDto> PlannedHours { get; set; } = new();

        // Calculated Totals (Calculated in backend query/handler, not expected from frontend on save)
        public double TotalHours { get; set; }
        public decimal TotalCost { get; set; }

        // Used to map parent/child relationships for newly created tasks
        public string? FrontendTempId { get; set; }
        // If the parent task is also new, this holds the parent's temporary frontend ID
        public string? ParentFrontendTempId { get; set; }

        // Flag to indicate if this DTO represents a new task (frontend might not send Id=0)
        // public bool IsNew { get; set; } // Optional: Could help backend diffing logic

        public int? TodoProjectScheduleId { get; set; }
    }
}
