using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.Projects.Commands
{
    public record UpdateProjectCommand : IRequest<Unit>
    {
        public int Id { get; init; }
        public ProjectDto? ProjectDto { get; init; }
    }
}
