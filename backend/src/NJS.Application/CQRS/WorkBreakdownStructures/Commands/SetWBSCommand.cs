using MediatR;
using NJS.Application.Dtos; // For WBSMasterDto
using System.Collections.Generic;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Commands
{
    /// <summary>
    /// Command to create or replace the entire Work Breakdown Structure for a project using WBSMasterDto.
    /// </summary>
    public record SetWBSCommand(int ProjectId, WBSMasterDto WBSMaster) : IRequest<WBSMasterDto>;
}
