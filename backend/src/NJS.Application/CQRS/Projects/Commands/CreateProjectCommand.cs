using MediatR;
using NJS.Application.Dtos;
using NJS.Domain.Entities;

namespace NJS.Application.CQRS.Projects.Commands
{
    public record CreateProjectCommand : IRequest<Project>
    {
        public ProjectDto ProjectDto { get; init; }

        public CreateProjectCommand(ProjectDto projectDto)
        {
            ProjectDto = projectDto;
        }
    }
}
