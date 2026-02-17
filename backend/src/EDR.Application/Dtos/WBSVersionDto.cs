using EDR.Domain.Enums;
using EDR.Domain.Entities; // Added to resolve TaskType
using System;
using System.Collections.Generic;

namespace EDR.Application.Dtos
{
    public class WBSVersionDto
    {
        public int Id { get; set; }
        public int WBSHeaderId { get; set; }
        public string Version { get; set; }
        public string Comments { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; }
        public string CreatedByName { get; set; } // Added
        public int StatusId { get; set; }
        public string Status { get; set; } // Added
        public bool IsActive { get; set; }
        public bool IsLatest { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public string ApprovedBy { get; set; }
        public string ApprovedByName { get; set; } // Added
        public int TaskCount { get; set; } // Added

        public ICollection<WBSTaskVersionHistoryDto> TaskVersions { get; set; } // Assuming WBSTaskVersionHistoryDto exists
        public ICollection<WBSVersionWorkflowHistoryDto> WorkflowHistories { get; set; } // Assuming WBSVersionWorkflowHistoryDto exists
        public ICollection<WBSVersionWorkflowHistoryDto> WorkflowHistory { get; set; } // Added for consistency with handler
    }

    public class WBSTaskVersionHistoryDto
    {
        public int Id { get; set; }
        public int WBSVersionHistoryId { get; set; }
        public int WBSTaskId { get; set; }
        public int OriginalTaskId { get; set; } // Added
        public int? ParentId { get; set; } // Added
        public WBSTaskLevel Level { get; set; } // Added
        public string Title { get; set; } // Added
        public string Description { get; set; } // Added
        public int DisplayOrder { get; set; } // Added
        public decimal EstimatedBudget { get; set; } // Added
        public DateTime? StartDate { get; set; } // Added
        public DateTime? EndDate { get; set; } // Added
        public TaskType TaskType { get; set; } // Added
        public string? AssignedUserId { get; set; } // Added
        public string? AssignedUserName { get; set; } // Added
        public decimal CostRate { get; set; } // Added
        public string? ResourceName { get; set; } // Added
        public string? ResourceUnit { get; set; } // Added
        public string? ResourceRoleId { get; set; } // Added
        public string? ResourceRoleName { get; set; } // Added
        public List<PlannedHourDto> PlannedHours { get; set; } = new List<PlannedHourDto>(); // Added
        public decimal TotalHours { get; set; } // Added
        public decimal TotalCost { get; set; } // Added
        public List<WBSTaskVersionHistoryDto> Children { get; set; } = new List<WBSTaskVersionHistoryDto>(); // Added
        public string TaskName { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; }
    }

    public class WBSVersionWorkflowHistoryDto
    {
        public int Id { get; set; }
        public int WBSVersionId { get; set; }
        public int WBSVersionHistoryId { get; set; } // Added
        public int StatusId { get; set; } // Renamed from WorkflowStatusId
        public string Status { get; set; } // Renamed from StatusName
        public string Action { get; set; } // Added
        public string Comments { get; set; }
        public DateTime ActionDate { get; set; }
        public string ActionBy { get; set; }
        public string ActionByName { get; set; } // Added
        public string AssignedToId { get; set; } // Changed from int? to string
        public string AssignedToName { get; set; } // Added
    }

    public class WBSVersionDetailsDto : WBSVersionDto
    {
        public List<WBSTaskVersionDto> Tasks { get; set; }
    }

    public class WBSTaskVersionDto
    {
        public int Id { get; set; }
        public int WBSVersionHistoryId { get; set; } // Added
        public int OriginalTaskId { get; set; } // Added
        public int? ParentId { get; set; } // Added
        public WBSTaskLevel Level { get; set; } // Changed from int to WBSTaskLevel
        public string Title { get; set; } // Added
        public string Description { get; set; }
        public int DisplayOrder { get; set; } // Added
        public decimal EstimatedBudget { get; set; } // Added
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int StatusId { get; set; }
        public TaskType TaskType { get; set; } // Added
        public string? AssignedUserId { get; set; } // Added
        public string? AssignedUserName { get; set; } // Added
        public decimal CostRate { get; set; } // Added
        public string? ResourceName { get; set; } // Added
        public string? ResourceUnit { get; set; } // Added
        public string? ResourceRoleId { get; set; } // Added
        public string? ResourceRoleName { get; set; } // Added
        public List<PlannedHourDto> PlannedHours { get; set; } // Changed from decimal to List
        public decimal TotalHours { get; set; } // Added
        public decimal TotalCost { get; set; } // Added
    }
}

