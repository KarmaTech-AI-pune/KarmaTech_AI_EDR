using MediatR;

namespace NJS.Application.CQRS.Projects.Commands
{
    public class DeleteProjectCommand : IRequest<bool>
    {
        public int Id { get; set; }
    }
}
