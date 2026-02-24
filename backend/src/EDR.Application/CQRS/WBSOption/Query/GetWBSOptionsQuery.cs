using MediatR;
using EDR.Application.Dtos;
using EDR.Domain.Entities;

namespace EDR.Application.CQRS.WorkBreakdownStructures.Queries
{
    public record GetWBSOptionsQuery : IRequest<WBSLevelOptionsDto>
    {
        public FormType? FormType { get; init; }
    }
}

