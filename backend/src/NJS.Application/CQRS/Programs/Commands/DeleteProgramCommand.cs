using MediatR;

namespace NJS.Application.CQRS.Programs.Commands
{
    public class DeleteProgramCommand : IRequest<Unit> // Using Unit as we don't return a specific value on delete
    {
        public int Id { get; set; }
    }
}
