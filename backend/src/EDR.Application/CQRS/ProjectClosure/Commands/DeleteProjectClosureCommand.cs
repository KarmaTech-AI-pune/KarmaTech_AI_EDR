using MediatR;

namespace EDR.Application.CQRS.ProjectClosure.Commands
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

