using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.Projects.Commands
{
    public record UpdateProjectCommand : IRequest<Unit>
    {
        public int Id { get; init; }
        public ProjectDto ProjectDto { get; init; }
    }
}
