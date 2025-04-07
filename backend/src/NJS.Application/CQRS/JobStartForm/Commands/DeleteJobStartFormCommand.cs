using MediatR;

namespace NJS.Application.CQRS.JobStartForm.Commands
{
    public class DeleteJobStartFormCommand : IRequest
    {
        public int Id { get; set; }

        public DeleteJobStartFormCommand(int id)
        {
            Id = id;
        }
    }
}
