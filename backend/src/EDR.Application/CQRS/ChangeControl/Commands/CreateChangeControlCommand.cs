using MediatR;
using EDR.Application.Dtos;
using System.ComponentModel.DataAnnotations;

namespace EDR.Application.CQRS.ChangeControl.Commands
{
    public class CreateChangeControlCommand : IRequest<int>
    {
        [Required]
        public ChangeControlDto ChangeControlDto { get; set; }

        public CreateChangeControlCommand(ChangeControlDto changeControlDto)
        {
            ChangeControlDto = changeControlDto;
        }
    }
}

