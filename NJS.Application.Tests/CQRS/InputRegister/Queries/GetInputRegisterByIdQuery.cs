using MediatR;
using System.ComponentModel.DataAnnotations;

namespace NJS.Application.Tests.CQRS.InputRegister.Queries
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
