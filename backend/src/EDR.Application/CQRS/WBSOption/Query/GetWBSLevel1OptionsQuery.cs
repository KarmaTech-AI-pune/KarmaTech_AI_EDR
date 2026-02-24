using MediatR;
using EDR.Application.Dtos;
using EDR.Domain.Entities;
using System.Collections.Generic;

namespace EDR.Application.CQRS.WorkBreakdownStructures.Queries
{
    public record GetWBSLevel1OptionsQuery : IRequest<List<WBSOptionDto>>
    {
        public FormType? FormType { get; init; }
    }
}

