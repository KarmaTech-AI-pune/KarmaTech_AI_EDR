using MediatR;
using NJS.Application.Dtos;
using System.Collections.Generic;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Queries
{
    public record GetWBSLevel1OptionsQuery : IRequest<List<WBSOptionDto>>
    {
    }
}
