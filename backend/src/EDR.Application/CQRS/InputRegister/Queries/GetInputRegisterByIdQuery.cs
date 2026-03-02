using MediatR;
using EDR.Application.DTOs;
using System.ComponentModel.DataAnnotations;

namespace EDR.Application.CQRS.InputRegister.Queries
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

