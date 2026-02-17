using MediatR;

namespace EDR.Application.CQRS.JobStartForm.Commands
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

