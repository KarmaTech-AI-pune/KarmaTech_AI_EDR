using MediatR;
using NJS.Application.Dtos;
using System.ComponentModel.DataAnnotations;

namespace NJS.Application.CQRS.ChangeControl.Commands
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
