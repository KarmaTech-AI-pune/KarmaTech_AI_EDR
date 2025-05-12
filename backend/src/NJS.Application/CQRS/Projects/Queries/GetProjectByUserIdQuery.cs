using MediatR;
using NJS.Domain.Entities;

namespace NJS.Application.CQRS.Projects.Queries
{
    public record GetProjectByUserIdQuery : IRequest<IEnumerable<Project>>
    {
        public string UserId { get; init; }
    }
}
