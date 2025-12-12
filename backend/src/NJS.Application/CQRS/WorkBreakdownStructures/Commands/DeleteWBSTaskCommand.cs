using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Commands
{
    /// <summary>
    /// Command to delete tasks from Work Breakdown Structure using WBSMasterDto.
    /// </summary>
    public record DeleteWBSTaskCommand(int ProjectId, WBSMasterDto WBSMaster) : IRequest<WBSMasterDto>;
}
