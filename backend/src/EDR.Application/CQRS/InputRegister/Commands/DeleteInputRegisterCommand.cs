using MediatR;
using System.ComponentModel.DataAnnotations;

namespace EDR.Application.CQRS.InputRegister.Commands
{
    public class DeleteInputRegisterCommand : IRequest<bool>
    {
        [Required]
        public int Id { get; set; }

        public DeleteInputRegisterCommand(int id)
        {
            Id = id;
        }
    }
}

