using MediatR;
using NJS.Application.Dtos;
using NJS.Domain.Entities;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Queries
{
    public record GetWBSOptionsQuery : IRequest<WBSLevelOptionsDto>
    {
        public FormType? FormType { get; init; }
    }
}
