using MediatR;
using EDR.Application.Dtos;
using System.Collections.Generic;

namespace EDR.Application.CQRS.WorkBreakdownStructures.Queries
{
    /// <summary>
    /// Query to get the complete WBS structure for a project using WBSMasterDto
    /// </summary>
    public record GetWBSByProjectIdQuery(int ProjectId) : IRequest<WBSMasterDto>;
}

