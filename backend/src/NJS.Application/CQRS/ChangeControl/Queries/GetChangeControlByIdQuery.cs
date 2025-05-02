using MediatR;
using NJS.Application.Dtos;
using System.ComponentModel.DataAnnotations;

namespace NJS.Application.CQRS.ChangeControl.Queries
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
