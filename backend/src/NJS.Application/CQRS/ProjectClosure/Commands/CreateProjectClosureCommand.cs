using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.ProjectClosure.Commands
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
