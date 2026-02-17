using MediatR;
using EDR.Application.Dtos;
using System.Collections.Generic;

namespace EDR.Application.CQRS.WorkBreakdownStructures.Queries
{
    public class GetApprovedWBSQuery : IRequest<List<WBSDetailsDto>>
    {
        // Optional: Add ProjectId if you want to filter by project.
        public int? ProjectId { get; set; }
    }
}

