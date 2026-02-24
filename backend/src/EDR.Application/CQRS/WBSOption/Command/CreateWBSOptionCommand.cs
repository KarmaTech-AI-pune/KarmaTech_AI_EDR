using MediatR;
using EDR.Application.Dtos;
using System.Collections.Generic;

namespace EDR.Application.CQRS.WorkBreakdownStructures.Commands
{
    public class CreateWBSOptionCommand : IRequest<List<WBSOptionDto>>
    {
        public List<WBSOptionDto> Options { get; set; } = new List<WBSOptionDto>();
    }
}

