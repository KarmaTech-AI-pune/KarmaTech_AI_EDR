using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.ProjectClosure.Commands
{
    public class CreateProjectClosureCommand : IRequest<int>
    {
        public ProjectClosureDto ProjectClosureDto { get; }

        public CreateProjectClosureCommand(ProjectClosureDto projectClosureDto)
        {
            ProjectClosureDto = projectClosureDto ?? throw new ArgumentNullException(nameof(projectClosureDto));
        }
    }
}

