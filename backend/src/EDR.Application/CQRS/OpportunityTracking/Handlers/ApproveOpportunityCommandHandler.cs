﻿using MediatR;
using EDR.Application.CQRS.OpportunityTracking.Commands;
using EDR.Application.Dtos;
using EDR.Application.Services.IContract;
using EDR.Domain.Entities;
using EDR.Domain.Enums;
using EDR.Domain.GenericRepository;
using Microsoft.AspNetCore.Identity;
using EDR.Application.CQRS.Email.Notifications;

namespace EDR.Application.CQRS.OpportunityTracking.Handlers
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
        private readonly IMediator _mediator;
        private readonly UserManager<User> _userManager;


        public ApproveOpportunityCommandHandler(
            IRepository<Domain.Entities.OpportunityTracking> opportunityRepository,
            IRepository<OpportunityHistory> historyRepository,
            IUserContext userContext,
            IMediator mediator,
            UserManager<User> userManager)
        {
            _opportunityRepository = opportunityRepository;
            _historyRepository = historyRepository;
            _userContext = userContext;
            _mediator = mediator;
            _userManager = userManager;
        }
        public async Task<OpportunityTrackingDto> Handle(SendToApproveCommand request, CancellationToken cancellationToken)
        {
            var currentUser = _userContext.GetCurrentUserId();
            var currentUsername = _userContext.GetCurrentUserName();
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
                    StatusId = 5,//Approval Changes
                    Action = "Approval Changes",
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
                    StatusId = 6,//Approved
                    Action = "Approved",
                    Comments = request.Comments,
                    ActionBy = currentUser,
                    ActionDate = DateTime.UtcNow
                };
            }


            await _historyRepository.AddAsync(history);
            await _historyRepository.SaveChangesAsync();

            if (request.Action.Equals("Reject"))
            {
                // Send email to Regional Manager
                var regionalManager = await _userManager.FindByIdAsync(opportunity.ReviewManagerId);
                if (regionalManager?.Email != null)
                {
                    await _mediator.Publish(new OpportunityStatusEmailNotification(
                        opportunity,
                        currentUsername,
                        OpportunityWorkFlowStatus.ApprovalChanges,
                        request.Comments ?? "Opportunity requires changes and has been sent back for review",
                        regionalManager.Email
                    ), cancellationToken);
                }
            }
            else
            {
                // Send approval email to Bid Manager
                var bidManager = await _userManager.FindByIdAsync(opportunity.BidManagerId);
                if (bidManager?.Email != null)
                {
                    await _mediator.Publish(new OpportunityStatusEmailNotification(
                        opportunity,
                        currentUsername,
                        OpportunityWorkFlowStatus.Approved,
                        request.Comments ?? "Opportunity has been approved",
                        bidManager.Email
                    ), cancellationToken);
                }
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
                    StatusId= history.StatusId,
                    Action = history.StatusId == 6 ? "Approved" : "Approval Changes",
                    Comments = request.Comments,
                    ActionBy = currentUser,
                    ActionDate = DateTime.UtcNow
                }
            };
        }
    }
}

