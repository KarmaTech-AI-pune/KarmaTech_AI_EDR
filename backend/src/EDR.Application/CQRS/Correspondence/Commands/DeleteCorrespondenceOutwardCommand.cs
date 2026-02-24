using MediatR;
using System.ComponentModel.DataAnnotations;

namespace EDR.Application.CQRS.Correspondence.Commands
{
    public class DeleteCorrespondenceOutwardCommand : IRequest<bool>
    {
        [Required]
        public int Id { get; set; }
    }
}

