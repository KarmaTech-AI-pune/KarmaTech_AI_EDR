using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.Projects.Commands
{
    public record CreateProjectCommand : IRequest<int>
    {
        public ProjectDto ProjectDto { get; init; }

        public CreateProjectCommand(ProjectDto projectDto)
        {
            ProjectDto = projectDto;
        }
    }
}
