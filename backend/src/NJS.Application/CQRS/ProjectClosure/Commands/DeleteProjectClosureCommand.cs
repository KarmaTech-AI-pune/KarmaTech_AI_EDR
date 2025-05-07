using MediatR;

namespace NJS.Application.CQRS.ProjectClosure.Commands
{
    public class DeleteProjectClosureCommand : IRequest<bool>
    {
        public int Id { get; }

        public DeleteProjectClosureCommand(int id)
        {
            Id = id;
        }
    }
}
