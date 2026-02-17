using MediatR;
using EDR.Application.Dtos;
using System.ComponentModel.DataAnnotations;

namespace EDR.Application.CQRS.ChangeControl.Queries
{
    public class GetChangeControlByIdQuery : IRequest<ChangeControlDto>
    {
        [Required]
        public int Id { get; set; }

        public GetChangeControlByIdQuery(int id)
        {
            Id = id;
        }
    }
}

