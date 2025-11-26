using MediatR;
using NJS.Application.Dtos;
using NJS.Domain.Entities;
using System.Collections.Generic;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Queries
{
    public record GetWBSLevel3OptionsQuery : IRequest<List<WBSOptionDto>>
    {
        public int Level2Id { get; set; }
        public FormType? FormType { get; set; }
    }
}
