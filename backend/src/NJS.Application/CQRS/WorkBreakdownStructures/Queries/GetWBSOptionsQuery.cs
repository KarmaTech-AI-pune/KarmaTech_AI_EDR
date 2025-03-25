using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Queries
{
    public record GetWBSOptionsQuery : IRequest<WBSLevelOptionsDto>
    {
    }
}
