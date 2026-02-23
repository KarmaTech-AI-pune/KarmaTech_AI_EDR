using MediatR;
using NJS.Application.Dtos;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using NJS.Application.CQRS.Cashflow.Queries;
using NJS.Repositories.Interfaces;
using System.Linq;

namespace NJS.Application.CQRS.Cashflow.Handlers
{
    public class GetPaymentMilestonesQueryHandler : IRequestHandler<GetPaymentMilestonesQuery, List<PaymentMilestoneDto>>
    {
        private readonly IPaymentMilestoneRepository _repository;

        public GetPaymentMilestonesQueryHandler(IPaymentMilestoneRepository repository)
        {
            _repository = repository;
        }

        public async Task<List<PaymentMilestoneDto>> Handle(GetPaymentMilestonesQuery request, CancellationToken cancellationToken)
        {
            var milestones = await _repository.GetByProjectIdAsync(request.ProjectId);
            
            return milestones.Select(m => new PaymentMilestoneDto
            {
                Id = m.Id,
                Description = m.Description,
                Percentage = m.Percentage,
                AmountINR = m.AmountINR,
                DueDate = m.DueDate
            }).ToList();
        }
    }
}
