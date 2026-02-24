using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.ProjectClosure.Commands
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

