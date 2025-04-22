using MediatR;
using NJS.Application.DTOs;
using System.ComponentModel.DataAnnotations;

namespace NJS.Application.CQRS.InputRegister.Queries
{
    public class GetInputRegisterByIdQuery : IRequest<InputRegisterDto>
    {
        [Required]
        public int Id { get; set; }

        public GetInputRegisterByIdQuery(int id)
        {
            Id = id;
        }
    }
}
