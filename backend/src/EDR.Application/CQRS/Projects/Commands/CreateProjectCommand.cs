using MediatR;
using EDR.Application.Dtos;
using EDR.Domain.Entities;

namespace EDR.Application.CQRS.Projects.Commands
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

