using MediatR;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Commands
{
    /// <summary>
    /// Command to delete (soft delete) a specific task within a Work Breakdown Structure.
    /// </summary>
    public record DeleteWBSTaskCommand(int ProjectId, int TaskId) : IRequest<Unit>; // Returns Unit
}
