using MediatR;
using NJS.Application.Dtos;
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
            // Hardcoded values matching the provided image structure
            var milestones = new List<PaymentMilestoneDto>
            {
                new PaymentMilestoneDto
                {
                    Id = 1,
                    Description = "Inception Report",
                    DueDate = "2025-03-15",
                    AmountINR = 843601,
                    Percentage = 10,
                    Status = "Received"
                },
                new PaymentMilestoneDto
                {
                    Id = 2,
                    Description = "Feasibility Report",
                    DueDate = "2025-04-15",
                    AmountINR = 1265402,
                    Percentage = 15,
                    Status = "Received"
                },
                new PaymentMilestoneDto
                {
                    Id = 3,
                    Description = "Draft Detailed Project Report",
                    DueDate = "2025-09-25",
                    AmountINR = 2952604,
                    Percentage = 35,
                    Status = "Pending"
                },
                new PaymentMilestoneDto
                {
                    Id = 4,
                    Description = "Detailed Project Report",
                    DueDate = "2025-12-25",
                    AmountINR = 3374404,
                    Percentage = 40,
                    Status = "Scheduled"
                }
            };

            return Task.FromResult(milestones);
        }
    }
}
