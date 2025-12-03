using MediatR;
using NJS.Application.DTOs;

namespace NJS.Application.CQRS.Programs.Queries
{
    public class GetProgramByIdQuery : IRequest<ProgramDto>
    {
        public int Id { get; set; }
    }
}
