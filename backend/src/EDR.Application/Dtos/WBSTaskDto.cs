using System;
using System.Collections.Generic;
using EDR.Domain.Enums; // Required for WBSTaskLevel
using EDR.Domain.Entities; // Required for TaskType

namespace EDR.Application.Dtos
{
    public class WBSTaskDto
    {
        public int Id { get; set; }
        public int WorkBreakdownStructureId { get; set; } // Needed for context if creating WBS + tasks together
        public WBSTaskLevel Level { get; set; }
        public string? Title { get; set; }
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

        public int WBSOptionId { get; set; } // Added for WBS Option relationship
        public string? WBSOptionLabel { get; set; } // Added for displaying WBS Option label

        public int? ParentId { get; set; } // Added to reflect parent-child relationship
    }
}

