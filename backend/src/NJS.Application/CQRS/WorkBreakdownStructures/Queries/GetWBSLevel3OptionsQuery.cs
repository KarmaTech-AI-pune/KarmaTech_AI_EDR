using MediatR;
using NJS.Application.Dtos;
using System.Collections.Generic;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Queries
{
    public record GetWBSLevel3OptionsQuery : IRequest<List<WBSOptionDto>>
    {
        public string Level2Value { get; init; }
    }
}
