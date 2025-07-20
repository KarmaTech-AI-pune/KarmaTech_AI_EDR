using MediatR;
using NJS.Application.Dtos;
using System.Collections.Generic;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Commands
{
    /// <summary>
    /// Command to create a new WBS version
    /// </summary>
    public record CreateWBSVersionCommand(int ProjectId, List<WBSTaskDto> Tasks, string Comments) : IRequest<string>;

    /// <summary>
    /// Command to update WBS version workflow status
    /// </summary>
    public record UpdateWBSVersionWorkflowCommand(int WBSVersionHistoryId, string Action, string Comments, string AssignedToId) : IRequest<WBSVersionWorkflowHistoryDto>;

    /// <summary>
    /// Command to activate a WBS version
    /// </summary>
    public record ActivateWBSVersionCommand(int ProjectId, string Version) : IRequest<Unit>;

    /// <summary>
    /// Command to restore to a specific WBS version
    /// </summary>
    public record RestoreWBSVersionCommand(int ProjectId, string Version) : IRequest<string>;

    /// <summary>
    /// Command to delete a WBS version
    /// </summary>
    public record DeleteWBSVersionCommand(int ProjectId, string Version) : IRequest<Unit>;

    /// <summary>
    /// Command to approve a WBS version
    /// </summary>
    public record ApproveWBSVersionCommand(int WBSVersionHistoryId, string Comments) : IRequest<WBSVersionWorkflowHistoryDto>;

    /// <summary>
    /// Command to reject a WBS version
    /// </summary>
    public record RejectWBSVersionCommand(int WBSVersionHistoryId, string Comments, bool IsApprovalChanges = false) : IRequest<WBSVersionWorkflowHistoryDto>;
} 