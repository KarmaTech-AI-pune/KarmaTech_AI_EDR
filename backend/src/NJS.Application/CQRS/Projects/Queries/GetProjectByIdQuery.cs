using MediatR;
using NJS.Domain.Entities;

namespace NJS.Application.CQRS.Projects.Queries
{
    public record GetProjectByIdQuery : IRequest<Project>
    {
        public int Id { get; init; }
        public int? ProgramId { get; init; }
    }
}
