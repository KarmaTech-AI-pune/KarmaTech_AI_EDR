using MediatR;
using NJS.Application.Dtos;
using System.Collections.Generic;

namespace NJS.Application.CQRS.Cashflow.Queries
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
