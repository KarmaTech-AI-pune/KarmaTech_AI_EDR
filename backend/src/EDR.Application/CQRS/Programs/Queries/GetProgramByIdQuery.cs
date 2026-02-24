using MediatR;
using EDR.Application.DTOs;

namespace EDR.Application.CQRS.Programs.Queries
{
    public class GetProgramByIdQuery : IRequest<ProgramDto>
    {
        public int Id { get; set; }
    }
}

