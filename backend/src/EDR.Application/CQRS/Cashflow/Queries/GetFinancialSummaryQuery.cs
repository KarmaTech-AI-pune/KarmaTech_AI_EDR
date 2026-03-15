using MediatR;
using EDR.Application.DTOs;

namespace EDR.Application.CQRS.Cashflow.Queries
{
    public class GetFinancialSummaryQuery : IRequest<FinancialSummaryDto>
    {
        public int ProjectId { get; set; }

        public GetFinancialSummaryQuery(int projectId)
        {
            ProjectId = projectId;
        }
    }
}
