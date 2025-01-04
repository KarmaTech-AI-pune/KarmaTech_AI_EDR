using MediatR;
using NJS.Application.CQRS.OpportunityTracking.Commands;
using NJS.Application.Dtos;
using NJS.Application.Services.IContract;
using NJS.Domain.Entities;
using NJS.Domain.Enums;
using NJS.Domain.GenericRepository;

namespace NJS.Application.CQRS.OpportunityTracking.Handlers
{
    /// <summary>
    /// Action performed by Regional Director, Actions- 1. Approve and Reject
    /// This handler to use for sent the opportunity to Reginal Manager if it rejected
    /// </summary>
    public class ApproveOpportunityCommandHandler : IRequestHandler<SendToApproveCommand, OpportunityTrackingDto>
    {
        private readonly IRepository<Domain.Entities.OpportunityTracking> _opportunityRepository;
        private readonly IRepository<OpportunityHistory> _historyRepository;
        private readonly IUserContext _userContext;


        public ApproveOpportunityCommandHandler(
            IRepository<Domain.Entities.OpportunityTracking> opportunityRepository,
            IRepository<OpportunityHistory> historyRepository,
            IUserContext userContext)
        {
            _opportunityRepository = opportunityRepository;
            _historyRepository = historyRepository;
            _userContext = userContext;
        }
        public async Task<OpportunityTrackingDto> Handle(SendToApproveCommand request, CancellationToken cancellationToken)
        {
            var currentUser = _userContext.GetCurrentUserId();
            var opportunity = await _opportunityRepository.GetByIdAsync(request.OpportunityId);
            if (opportunity == null)
                throw new Exception($"Opportunity with ID {request.OpportunityId} not found");

            // Update opportunity status will need to verify

            var history = new OpportunityHistory();
            // Create history entry
            if (request.Action.Equals("Reject"))
            {
                opportunity.Status = OpportunityTrackingStatus.BID_REJECTED;
                await _opportunityRepository.UpdateAsync(opportunity);
                history = new OpportunityHistory
                {
                    OpportunityId = opportunity.Id,
                    Id = 5,//Approval Changes
                    Action = "Rejected",
                    Comments = request.Comments,
                    ActionBy = currentUser,
                    AssignedToId = opportunity.ReviewManagerId, // Reassign to Regional Manager
                    ActionDate = DateTime.UtcNow
                };
            }
            else
            {
                //This is final flow, once  opportuniy has been approved
                opportunity.Status = OpportunityTrackingStatus.BID_ACCEPTED;
                await _opportunityRepository.UpdateAsync(opportunity);
                history = new OpportunityHistory
                {
                    OpportunityId = opportunity.Id,
                    Id = 6,//Approved
                    Action = "Approved",
                    Comments = request.Comments,
                    ActionBy = currentUser,
                    ActionDate = DateTime.UtcNow
                };
            }


            await _historyRepository.AddAsync(history);

            // Return updated opportunity
            return new OpportunityTrackingDto
            {
                Id = opportunity.Id,
                Status = opportunity.Status,
                BidManagerId = opportunity.BidManagerId,
                ReviewManagerId = opportunity.ReviewManagerId,
                ApprovalManagerId = opportunity.ApprovalManagerId,
                Operation = opportunity.Operation,
                WorkName = opportunity.WorkName,
                Client = opportunity.Client,
                ClientSector = opportunity.ClientSector,
                Currency = opportunity.Currency,
                CapitalValue = opportunity.CapitalValue,
                Stage = opportunity.Stage,
                CurrentHistory = new OpportunityHistoryDto
                {
                    Action = history.Id == 6 ? "Approved" : "Approval Changes",
                    Comments = request.Comments,
                    ActionBy = currentUser,
                    ActionDate = DateTime.UtcNow
                }
            };
        }
    }
}
