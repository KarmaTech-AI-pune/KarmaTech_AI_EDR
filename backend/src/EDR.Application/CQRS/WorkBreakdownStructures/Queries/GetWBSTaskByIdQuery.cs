using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.WorkBreakdownStructures.Queries
{
    public record GetWBSTaskByIdQuery : IRequest<WBSTaskDto>
    {
        public int Id { get; init; }
    }
}

