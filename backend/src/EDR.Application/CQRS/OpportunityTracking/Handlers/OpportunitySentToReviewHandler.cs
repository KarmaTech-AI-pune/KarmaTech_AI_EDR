﻿using MediatR;
using Microsoft.AspNetCore.Identity;
using EDR.Application.CQRS.Email.Notifications;
using EDR.Application.CQRS.OpportunityTracking.Commands;
using EDR.Application.Dtos;
using EDR.Application.Services.IContract;
using EDR.Domain.Entities;
using EDR.Domain.Enums;
using EDR.Domain.GenericRepository;

namespace EDR.Application.CQRS.OpportunityTracking.Handlers
{
    public class OpportunitySentToReviewHandler : IRequestHandler<SendToReviewCommand, OpportunityTrackingDto>
    {
        private readonly IOpportunityHistoryService _opportunityHistoryService;
        private readonly IUserContext _userContext;
        private readonly UserManager<User> _userManager;
        private readonly IRepository<Domain.Entities.OpportunityTracking> _opportunityRepository;
        private readonly IMediator _mediator;

        public OpportunitySentToReviewHandler(
            IOpportunityHistoryService opportunityHistoryService,
            IUserContext userContext,
            UserManager<User> userManager,
            IRepository<Domain.Entities.OpportunityTracking> opportunityRepository,
            IMediator mediator)
        {
            _opportunityHistoryService = opportunityHistoryService;
            _userContext = userContext;
            _userManager = userManager;
            _opportunityRepository = opportunityRepository;
            _mediator = mediator;
        }

        public async Task<OpportunityTrackingDto> Handle(SendToReviewCommand request, CancellationToken cancellationToken)
        {
            // Validate input parameters
            if (request.OpportunityId <= 0)
                throw new ArgumentException("Invalid Opportunity ID");

            if (string.IsNullOrWhiteSpace(request.AssignedToId))
                throw new ArgumentException("Regional Manager must be selected");

            var currentUser = _userContext.GetCurrentUserId();
            
            // Fetch the opportunity
            var opportunity = await _opportunityRepository.GetByIdAsync(request.OpportunityId);
            if (opportunity == null)
                throw new InvalidOperationException($"Opportunity with ID {request.OpportunityId} not found");

            // Validate the assigned regional manager exists
            var assignedManager = await _userManager.FindByIdAsync(request.AssignedToId);
            if (assignedManager == null)
                throw new InvalidOperationException($"Regional Manager with ID {request.AssignedToId} not found");

            // Validate the assigned manager has the correct role
            var isRegionalManager = await _userManager.IsInRoleAsync(assignedManager, "Regional Manager");
            if (!isRegionalManager)
                throw new InvalidOperationException($"User {request.AssignedToId} is not a Regional Manager");

            // Update opportunity with the regional manager
            opportunity.ReviewManagerId = request.AssignedToId;
            opportunity.Status = OpportunityTrackingStatus.BID_SUBMITTED;
            await _opportunityRepository.UpdateAsync(opportunity);

            // Create opportunity history record
            var entity = new OpportunityHistory
            {
                OpportunityId = request.OpportunityId,
                Action = "Sent to review",
                ActionBy = currentUser,
                StatusId = 2, // Status for "Sent to Review"
                ActionDate = DateTime.UtcNow,
                AssignedToId = request.AssignedToId,
                Comments = request.Comments ?? "Opportunity sent for review"
            };

            await _opportunityHistoryService.AddHistoryAsync(entity);

            // Send email notification to the regional manager
            await _mediator.Publish(notification: new OpportunityStatusEmailNotification(
                opportunity,
                _userContext.GetCurrentUserName(),
                OpportunityWorkFlowStatus.SentForReview,
                request.Comments ?? "Opportunity sent for review",
                assignedManager.Email
            ), cancellationToken);

            // Return updated opportunity details
            return new OpportunityTrackingDto
            {
                Id = opportunity.Id,
                Status = OpportunityTrackingStatus.BID_SUBMITTED, // Use the enum directly
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
                    StatusId = 2,
                    Action = "Sent to review",
                    Comments = request.Comments ?? string.Empty,
                    ActionBy = entity.ActionBy,
                    AssignedToId = entity.AssignedToId,
                    ActionDate = DateTime.UtcNow
                }
            };
        }
    }
}

