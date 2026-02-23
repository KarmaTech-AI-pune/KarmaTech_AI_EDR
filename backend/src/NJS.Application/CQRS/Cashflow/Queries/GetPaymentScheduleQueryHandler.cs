using MediatR;
using NJS.Application.Dtos.Cashflow;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using NJS.Application.CQRS.Cashflow.Queries;

namespace NJS.Application.CQRS.Cashflow.Queries
{
    public class GetPaymentScheduleQueryHandler : IRequestHandler<GetPaymentScheduleQuery, PaymentScheduleDto>
    {
        // TODO: Inject repository for database access
        private readonly IMediator _mediator;

        public GetPaymentScheduleQueryHandler(IMediator mediator)
        {
            _mediator = mediator;
        }

        public async Task<PaymentScheduleDto> Handle(GetPaymentScheduleQuery request, CancellationToken cancellationToken)
        {
            // For now, return dummy data. In a real scenario, fetch from database.
            var milestones = new List<PaymentScheduleItemDto>
            {
                new PaymentScheduleItemDto { Id = 1, Description = "Advance Payment", Percentage = 10, AmountINR = 100000, DueDate = "2024-03-15", Status = "Planned" },
                new PaymentScheduleItemDto { Id = 2, Description = "Milestone 1 Completion", Percentage = 20, AmountINR = 200000, DueDate = "2024-06-30", Status = "Planned" },
                new PaymentScheduleItemDto { Id = 3, Description = "Mid-project Review", Percentage = 30, AmountINR = 300000, DueDate = "2024-09-30", Status = "Completed" },
                new PaymentScheduleItemDto { Id = 4, Description = "Final Delivery", Percentage = 40, AmountINR = 400000, DueDate = "2024-12-15", Status = "Planned" }
            };

            // Calculate totals
            decimal totalPercentage = milestones.Sum(m => m.Percentage);
            decimal totalAmountINR = milestones.Sum(m => m.AmountINR);

            // Get the monthly budget summary to get the QuotedPrice (Total Project Fee)
            var cashflowQuery = new GetAllCashflowsQuery { ProjectId = request.ProjectId };
            var cashflowResult = await _mediator.Send(cashflowQuery, cancellationToken);
            var totalProjectFee = cashflowResult?.Summary?.QuotedPrice ?? 0; // Handle nulls if no cashflow data

            return new PaymentScheduleDto
            {
                Milestones = milestones,
                TotalPercentage = totalPercentage,
                TotalAmountINR = totalAmountINR,
                TotalProjectFee = totalProjectFee
            };
        }
    }
}