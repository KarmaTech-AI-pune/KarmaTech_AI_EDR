using MediatR;
using NJS.Application.Dtos; // For WBSHeaderDto
using System.Collections.Generic;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Commands
{
    /// <summary>
    /// Command to create or replace the entire Work Breakdown Structure for a project.
    /// </summary>
    public record SetWBSCommand(int ProjectId, WBSHeaderDto WBSHeader) : IRequest<Unit>; // Returns Unit (void)
}
