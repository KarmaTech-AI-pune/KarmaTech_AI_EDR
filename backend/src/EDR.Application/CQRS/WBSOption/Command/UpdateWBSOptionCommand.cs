using MediatR;
using EDR.Application.Dtos;
using System.Collections.Generic;

namespace EDR.Application.CQRS.WorkBreakdownStructures.Commands
{
    public class UpdateWBSOptionCommand : IRequest<List<WBSOptionDto>>
    {
        public int? Level1Id { get; set; }
        public List<WBSOptionDto> Options { get; set; } = new List<WBSOptionDto>();
    }
}

