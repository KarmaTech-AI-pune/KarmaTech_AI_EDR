using MediatR;
using NJS.Application.DTOs;

namespace NJS.Application.CQRS.Cashflow.Queries
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
