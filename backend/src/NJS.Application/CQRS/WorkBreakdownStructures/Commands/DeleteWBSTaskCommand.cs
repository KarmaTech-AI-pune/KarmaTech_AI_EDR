using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Commands
{
    /// <summary>
    /// Command to delete a task from Work Breakdown Structure by its ID.
    /// </summary>
    public record DeleteWBSTaskCommand(int ProjectId, int WBSTaskId) : IRequest<bool>;
}
