using System;
using System.Collections.Generic;
using NJS.Domain.Enums;
using NJS.Domain.Entities;

namespace NJS.Application.Dtos
{
    /// <summary>
    /// DTO for WBS version summary information
    /// </summary>
    public class WBSVersionDto
    {
        public int Id { get; set; }
        public int WorkBreakdownStructureId { get; set; }
        public string Version { get; set; }
        public string Comments { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; }
        public string CreatedByName { get; set; }
        public int StatusId { get; set; }
        public string Status { get; set; }
        public bool IsActive { get; set; }
        public bool IsLatest { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public string ApprovedBy { get; set; }
        public string ApprovedByName { get; set; }
        public int TaskCount { get; set; }
        public List<WBSVersionWorkflowHistoryDto> WorkflowHistory { get; set; } = new();
    }

    /// <summary>
    /// DTO for WBS version with full task details
    /// </summary>
    public class WBSVersionDetailsDto
    {
        public int Id { get; set; }
        public int WorkBreakdownStructureId { get; set; }
        public string Version { get; set; }
        public string Comments { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatedBy { get; set; }
        public string CreatedByName { get; set; }
        public int StatusId { get; set; }
        public string Status { get; set; }
        public bool IsActive { get; set; }
        public bool IsLatest { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public string ApprovedBy { get; set; }
        public string ApprovedByName { get; set; }
        public List<WBSTaskVersionDto> Tasks { get; set; } = new();
        public List<WBSVersionWorkflowHistoryDto> WorkflowHistory { get; set; } = new();
    }

    /// <summary>
    /// DTO for WBS task version
    /// </summary>
    public class WBSTaskVersionDto
    {
        public int Id { get; set; }
        public int WBSVersionHistoryId { get; set; }
        public int OriginalTaskId { get; set; }
        public int? ParentId { get; set; }
        public WBSTaskLevel Level { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int DisplayOrder { get; set; }
        public decimal EstimatedBudget { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public TaskType TaskType { get; set; }

        // Resource/Cost Info
        public string? AssignedUserId { get; set; }
        public string? AssignedUserName { get; set; }
        public decimal CostRate { get; set; }
        public string? ResourceName { get; set; }
        public string? ResourceUnit { get; set; }
        public string? ResourceRoleId { get; set; }
        public string? ResourceRoleName { get; set; }

        // Planned Hours
        public List<PlannedHourDto> PlannedHours { get; set; } = new();

        // Calculated Totals
        public double TotalHours { get; set; }
        public decimal TotalCost { get; set; }

        // Children for hierarchical structure
        public List<WBSTaskVersionDto> Children { get; set; } = new();
    }

    /// <summary>
    /// DTO for WBS version workflow history
    /// </summary>
    public class WBSVersionWorkflowHistoryDto
    {
        public int Id { get; set; }
        public int WBSVersionHistoryId { get; set; }
        public int StatusId { get; set; }
        public string Status { get; set; }
        public string Action { get; set; }
        public string Comments { get; set; }
        public DateTime ActionDate { get; set; }
        public string ActionBy { get; set; }
        public string ActionByName { get; set; }
        public string AssignedToId { get; set; }
        public string AssignedToName { get; set; }
    }

    /// <summary>
    /// DTO for WBS version comparison
    /// </summary>
    public class WBSVersionComparisonDto
    {
        public int ProjectId { get; set; }
        public WBSVersionDto Version1 { get; set; }
        public WBSVersionDto Version2 { get; set; }
        public List<WBSTaskComparisonDto> TaskComparisons { get; set; } = new();
        public WBSVersionSummaryDto Summary { get; set; }
    }

    /// <summary>
    /// DTO for WBS task comparison
    /// </summary>
    public class WBSTaskComparisonDto
    {
        public int OriginalTaskId { get; set; }
        public WBSTaskVersionDto Version1Task { get; set; }
        public WBSTaskVersionDto Version2Task { get; set; }
        public string ChangeType { get; set; } // "Added", "Removed", "Modified", "Unchanged"
        public List<string> Changes { get; set; } = new();
    }

    /// <summary>
    /// DTO for WBS version summary
    /// </summary>
    public class WBSVersionSummaryDto
    {
        public int TotalTasks { get; set; }
        public int AddedTasks { get; set; }
        public int RemovedTasks { get; set; }
        public int ModifiedTasks { get; set; }
        public decimal TotalBudgetChange { get; set; }
        public double TotalHoursChange { get; set; }
        public decimal TotalCostChange { get; set; }
    }
} 