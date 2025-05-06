using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.ProjectClosure.Commands
{
    public class UpdateProjectClosureCommand : IRequest<bool>
    {
        public ProjectClosureDto ProjectClosureDto { get; }

        public UpdateProjectClosureCommand(ProjectClosureDto projectClosureDto)
        {
            ProjectClosureDto = projectClosureDto ?? throw new ArgumentNullException(nameof(projectClosureDto));
        }
    }
}
