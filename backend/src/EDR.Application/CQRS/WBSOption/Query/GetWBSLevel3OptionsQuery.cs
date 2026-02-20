using MediatR;
using EDR.Application.Dtos;
using EDR.Domain.Entities;
using System.Collections.Generic;

namespace EDR.Application.CQRS.WorkBreakdownStructures.Queries
{
    public record GetWBSLevel3OptionsQuery : IRequest<List<WBSOptionDto>>
    {
        public int Level2Id { get; set; }
        public FormType? FormType { get; set; }
    }
}

