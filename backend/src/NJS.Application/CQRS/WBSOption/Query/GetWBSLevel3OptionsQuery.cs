using MediatR;
using NJS.Application.Dtos;
using NJS.Domain.Entities;
using System.Collections.Generic;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Queries
{
    public record GetWBSLevel3OptionsQuery : IRequest<List<WBSOptionDto>>
    {
        public string Level2Value { get; init; }
        public FormType? FormType { get; init; }
    }
}
