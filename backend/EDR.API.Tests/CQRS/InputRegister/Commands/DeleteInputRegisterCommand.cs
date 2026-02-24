using MediatR;
using System.ComponentModel.DataAnnotations;

namespace EDR.API.Tests.CQRS.InputRegister.Commands
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

