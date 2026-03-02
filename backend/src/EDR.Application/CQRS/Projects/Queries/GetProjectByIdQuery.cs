using MediatR;
using EDR.Domain.Entities;

namespace EDR.Application.CQRS.Projects.Queries
{
    public record GetProjectByIdQuery : IRequest<Project>
    {
        public int Id { get; init; }
    }
}
