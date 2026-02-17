using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDR.Application.CQRS.OpportunityTracking.Commands;
using EDR.Repositories.Interfaces;

namespace EDR.Application.CQRS.OpportunityTracking.Handlers
{
    public class DeleteOpportunityTrackingCommandHandler : IRequestHandler<DeleteOpportunityTrackingCommand, bool>
    {
        private readonly IOpportunityTrackingRepository _repository;

        public DeleteOpportunityTrackingCommandHandler(IOpportunityTrackingRepository repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public async Task<bool> Handle(DeleteOpportunityTrackingCommand request, CancellationToken cancellationToken)
        {
            var entity = await _repository.GetByIdAsync(request.Id);
            if (entity == null)
            {
                throw new Exception($"Opportunity Tracking with ID {request.Id} not found.");
            }

            await _repository.DeleteAsync(request.Id);
            return true;
        }
    }
}

