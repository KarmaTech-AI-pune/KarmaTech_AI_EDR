using MediatR;
using EDR.Application.Dtos;
using System.ComponentModel.DataAnnotations;

namespace EDR.Application.CQRS.ChangeControl.Commands
{
    public class UpdateChangeControlCommand : IRequest<ChangeControlDto>
    {
        [Required]
        public ChangeControlDto ChangeControlDto { get; set; }

        public UpdateChangeControlCommand(ChangeControlDto changeControlDto)
        {
            ChangeControlDto = changeControlDto;
        }
    }
}

