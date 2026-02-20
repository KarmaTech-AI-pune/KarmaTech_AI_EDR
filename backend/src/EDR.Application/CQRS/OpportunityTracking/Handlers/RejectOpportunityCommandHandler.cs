using MediatR;
using EDR.Application.Dtos;
using EDR.Domain.Entities;
using EDR.Domain.Enums;
using EDR.Domain.GenericRepository;
using EDR.Application.CQRS.OpportunityTracking.Commands;
using EDR.Application.Services.IContract;
using Microsoft.AspNetCore.Identity;
using EDR.Application.CQRS.Email.Notifications;

namespace EDR.Application.CQRS.OpportunityTracking.Handlers
{
    /// <summary>
    /// Action performed by Regional Manager, Review Changes
    /// This handler to use for sent the opportunity to Bid Manager
    /// </summary>
    public class RejectOpportunityCommandHandler : IRequestHandler<RejectOpportunityCommand, OpportunityTrackingDto>
    {
        private readonly IRepository<Domain.Entities.OpportunityTracking> _opportunityRepository;
        private readonly IRepository<OpportunityHistory> _historyRepository;
        private readonly IUserContext _userContext;
        private readonly IOpportunityHistoryService _opportunityHistoryService;
        private readonly IMediator _mediator;
        private readonly UserManager<User> _userManager;


        public RejectOpportunityCommandHandler(
            IRepository<Domain.Entities.OpportunityTracking> opportunityRepository,
            IRepository<OpportunityHistory> historyRepository,
            IUserContext userContext,
            IOpportunityHistoryService opportunityHistoryService,
            IMediator mediator,
            UserManager<User> userManager)
        {
            _opportunityRepository = opportunityRepository;
            _historyRepository = historyRepository;
            _userContext = userContext;
            _opportunityHistoryService = opportunityHistoryService;
            _mediator = mediator;
            _userManager = userManager;
        }

        public async Task<OpportunityTrackingDto> Handle(RejectOpportunityCommand request, CancellationToken cancellationToken)
        {
            var currentUser = _userContext.GetCurrentUserId();
            // Get the opportunity
            var opportunity = await _opportunityRepository.GetByIdAsync(request.OpportunityId);
            if (opportunity == null)
                throw new Exception($"Opportunity with ID {request.OpportunityId} not found");

            // Update opportunity status
            opportunity.UpdatedAt = DateTime.UtcNow;
            opportunity.UpdatedBy = currentUser;    
            opportunity.Status = OpportunityTrackingStatus.BID_REJECTED;
            await _opportunityRepository.UpdateAsync(opportunity);

            // Create history entry
            var history = new OpportunityHistory
            {
                OpportunityId = opportunity.Id,
                StatusId = 3,
                Action = "Review Changes",
                Comments = request.Comments,
                ActionBy = currentUser,
                AssignedToId = opportunity.BidManagerId, // Reassign to Bid Manager
                ActionDate = DateTime.UtcNow
            };

            await _historyRepository.AddAsync(history).ConfigureAwait(false);
            await _historyRepository.SaveChangesAsync();

            // Get the Bid Manager's email and send notification
            var bidManager = await _userManager.FindByIdAsync(opportunity.BidManagerId);
            if (bidManager?.Email != null)
            {
                await _mediator.Publish(new OpportunityStatusEmailNotification(
                    opportunity,
                    _userContext.GetCurrentUserName(),
                    OpportunityWorkFlowStatus.ReviewChanges,
                    request.Comments ?? "Opportunity has been rejected and requires review",
                    bidManager.Email
                ), cancellationToken);
            }

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
                    StatusId = 3,
                    Action = "Review Changes",
                    Comments = request.Comments,
                    ActionBy = currentUser,
                    AssignedToId = opportunity.BidManagerId,
                    ActionDate = DateTime.UtcNow
                }
            };
        }
    }
}

