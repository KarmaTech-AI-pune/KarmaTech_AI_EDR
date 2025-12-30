using MediatR;
using NJS.Application.DTOs;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using NJS.Application.CQRS.Cashflow.Queries;

namespace NJS.Application.CQRS.Cashflow.Handlers
{
    public class GetPaymentMilestonesQueryHandler : IRequestHandler<GetPaymentMilestonesQuery, List<PaymentMilestoneDto>>
    {
        public Task<List<PaymentMilestoneDto>> Handle(GetPaymentMilestonesQuery request, CancellationToken cancellationToken)
        {
            // Hardcoded values as requested to match the provided image
            var milestones = new List<PaymentMilestoneDto>
            {
                new PaymentMilestoneDto
                {
                    MilestoneName = "Inception Report",
                    DueDate = "15-Mar-25",
                    Amount = 843601,
                    Percentage = "10% of total",
                    Status = "Received"
                },
                new PaymentMilestoneDto
                {
                    MilestoneName = "Feasibility Report",
                    DueDate = "15-Apr-25",
                    Amount = 1265402,
                    Percentage = "15% of total",
                    Status = "Received"
                },
                new PaymentMilestoneDto
                {
                    MilestoneName = "Draft Detailed Project Report",
                    DueDate = "25-Sep-25",
                    Amount = 2952604,
                    Percentage = "35% of total",
                    Status = "Pending"
                },
                new PaymentMilestoneDto
                {
                    MilestoneName = "Detailed Project Report",
                    DueDate = "25-Dec-25",
                    Amount = 3374404,
                    Percentage = "40% of total",
                    Status = "Scheduled"
                }
            };

            return Task.FromResult(milestones);
        }
    }
}
