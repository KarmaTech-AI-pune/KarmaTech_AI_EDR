using MediatR;
using EDR.Application.Dtos;
using System.Collections.Generic;

namespace EDR.Application.CQRS.ChangeControl.Queries
{
    public class GetAllChangeControlsQuery : IRequest<IEnumerable<ChangeControlDto>>
    {
        // No parameters needed for getting all records
    }
}

