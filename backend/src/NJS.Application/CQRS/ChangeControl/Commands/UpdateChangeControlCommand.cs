using MediatR;
using NJS.Application.Dtos;
using System.ComponentModel.DataAnnotations;

namespace NJS.Application.CQRS.ChangeControl.Commands
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
