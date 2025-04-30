using MediatR;
using System.ComponentModel.DataAnnotations;

namespace NJS.Application.CQRS.ChangeControl.Commands
{
    public class DeleteChangeControlCommand : IRequest<Unit>
    {
        [Required]
        public int Id { get; set; }

        public DeleteChangeControlCommand(int id)
        {
            Id = id;
        }
    }
}
