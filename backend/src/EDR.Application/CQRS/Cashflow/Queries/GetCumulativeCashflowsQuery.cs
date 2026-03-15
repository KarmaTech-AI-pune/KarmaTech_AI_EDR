using System.Collections.Generic;
using MediatR;
using EDR.Application.DTOs;

namespace EDR.Application.CQRS.Cashflow.Queries
{
    public class GetCumulativeCashflowsQuery : IRequest<List<CumulativeCashflowDto>>
    {
        public int ProjectId { get; set; }

        public GetCumulativeCashflowsQuery(int projectId)
        {
            ProjectId = projectId;
        }
    }
}
