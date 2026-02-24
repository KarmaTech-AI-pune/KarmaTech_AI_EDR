using System.Collections.Generic;
using MediatR;
using EDR.Application.DTOs;

namespace EDR.Application.CQRS.Programs.Queries
{
    public class GetAllProgramsQuery : IRequest<IEnumerable<ProgramDto>>
    {
        // Add any necessary parameters for pagination or filtering here if needed in the future
        // For now, it's a simple request to get all programs.
    }
}

