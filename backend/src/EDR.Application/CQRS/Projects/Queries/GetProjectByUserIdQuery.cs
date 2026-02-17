using MediatR;
using EDR.Domain.Entities;

namespace EDR.Application.CQRS.Projects.Queries
{
    public record GetProjectByUserIdQuery : IRequest<IEnumerable<Project>>
    {
        public string UserId { get; init; }
    }
}

