using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Queries
{
    public record GetWBSTaskByIdQuery : IRequest<WBSTaskDto>
    {
        public int Id { get; init; }
    }
}
