using MediatR;
using EDR.Application.Dtos;
using System.Collections.Generic;

namespace EDR.Application.CQRS.WorkBreakdownStructures.Queries
{
    public record GetWBSTasksQuery(int ProjectId) : IRequest<List<WBSTaskDto>>;
}

