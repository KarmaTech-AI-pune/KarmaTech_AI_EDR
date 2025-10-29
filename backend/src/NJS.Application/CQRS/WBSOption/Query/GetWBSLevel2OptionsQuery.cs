using MediatR;
using NJS.Application.Dtos;
using NJS.Domain.Entities;
using System.Collections.Generic;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Queries
{
    public record GetWBSLevel2OptionsQuery : IRequest<List<WBSOptionDto>>
    {
        public FormType? FormType { get; init; }
    }
}
