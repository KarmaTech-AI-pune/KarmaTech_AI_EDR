using MediatR;
using NJS.Application.Dtos;
using System.Collections.Generic;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Commands
{
    /// <summary>
    /// Command to create or replace the entire Work Breakdown Structure for a project.
    /// </summary>
    public record SetWBSCommand(int ProjectId, List<WBSTaskDto> Tasks) : IRequest<Unit>; // Returns Unit (void)
}
