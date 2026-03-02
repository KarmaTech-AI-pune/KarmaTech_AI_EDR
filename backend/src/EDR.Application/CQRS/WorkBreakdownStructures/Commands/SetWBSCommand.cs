using MediatR;
using EDR.Application.Dtos; // For WBSMasterDto
using System.Collections.Generic;

namespace EDR.Application.CQRS.WorkBreakdownStructures.Commands
{
    /// <summary>
    /// Command to create or replace the entire Work Breakdown Structure for a project using WBSMasterDto.
    /// </summary>
    public record SetWBSCommand(int ProjectId, WBSMasterDto WBSMaster) : IRequest<WBSMasterDto>;
}

