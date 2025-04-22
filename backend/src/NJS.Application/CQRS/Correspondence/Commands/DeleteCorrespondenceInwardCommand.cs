using MediatR;
using System.ComponentModel.DataAnnotations;

namespace NJS.Application.CQRS.Correspondence.Commands
{
    public class DeleteCorrespondenceInwardCommand : IRequest<bool>
    {
        [Required]
        public int Id { get; set; }
    }
}
