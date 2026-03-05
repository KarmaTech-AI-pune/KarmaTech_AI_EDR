using MediatR;
using EDR.Application.Dtos.Cashflow;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.Cashflow.Commands
{
    public class CreatePaymentScheduleCommandHandler : IRequestHandler<CreatePaymentScheduleCommand, List<PaymentScheduleItemDto>>
    {
        // TODO: Inject repository for database interaction

        public async Task<List<PaymentScheduleItemDto>> Handle(CreatePaymentScheduleCommand request, CancellationToken cancellationToken)
        {
            // Simulate saving to a database and returning the created items with generated IDs and default status
            var createdMilestones = new List<PaymentScheduleItemDto>();
            int nextId = 5; // Starting ID for dummy data

            foreach (var milestone in request.Milestones)
            {
                createdMilestones.Add(new PaymentScheduleItemDto
                {
                    Id = nextId++,
                    Description = milestone.Description,
                    Percentage = milestone.Percentage,
                    AmountINR = milestone.AmountINR,
                    DueDate = milestone.DueDate,
                    Status = "Planned" // Default status for new items
                });
            }

            // In a real application, you would save these to the database and retrieve the actual saved entities.

            return await Task.FromResult(createdMilestones);
        }
    }
}