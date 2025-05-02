using MediatR;
using NJS.Application.Dtos;
using System.Collections.Generic;

namespace NJS.Application.CQRS.ChangeControl.Queries
{
    public class GetAllChangeControlsQuery : IRequest<IEnumerable<ChangeControlDto>>
    {
        // No parameters needed for getting all records
    }
}
