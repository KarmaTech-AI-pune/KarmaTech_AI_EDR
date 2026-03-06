using MediatR;
using EDR.Application.Dtos;
using System.Collections.Generic;

namespace EDR.Application.CQRS.Cashflow.Queries
{
    public class GetPaymentMilestonesQuery : IRequest<List<PaymentMilestoneDto>>
    {
        public int ProjectId { get; set; }

        public GetPaymentMilestonesQuery(int projectId)
        {
            ProjectId = projectId;
        }
    }
}
