using MediatR;
using Microsoft.AspNetCore.Identity;
using NJS.Application.CQRS.OpportunityTracking.Commands;
using NJS.Application.Dtos;
using NJS.Application.Services.IContract;
using NJS.Domain.Entities;
using NJS.Domain.Enums;
using NJS.Domain.GenericRepository;

namespace NJS.Application.CQRS.OpportunityTracking.Handlers
{
    /// <summary>
    /// Action performed by Regional Manager, sent to approval
    /// This handler to use for sent the opportunity to Regional Director 
    /// </summary>
    public class OpportunitySentToApprovalHandler : IRequestHandler<SendToApprovalCommand, OpportunityTrackingDto>
    {
        private readonly IOpportunityHistoryService _opportunityHistoryService;
        private readonly IRepository<Domain.Entities.OpportunityTracking> _opportunityRepository;
        private readonly IUserContext _userContext;
        private readonly RoleManager<Role> _roleManager;
        private readonly UserManager<User> _userManager;
       

        public OpportunitySentToApprovalHandler(IOpportunityHistoryService opportunityHistoryService,
          IUserContext userContext,
          UserManager<User> userManager,
          RoleManager<Role> roleManager,       
         IRepository<Domain.Entities.OpportunityTracking> opportunityRepository)

        {
            _opportunityHistoryService = opportunityHistoryService;
            _userContext = userContext;
            _userManager = userManager;
            _roleManager = roleManager;
           
            _opportunityRepository = opportunityRepository;
        }
        public async Task<OpportunityTrackingDto> Handle(SendToApprovalCommand request, CancellationToken cancellationToken)
        {
            //Here we expecting the Approve action performed by Regional Manager
            var currentUser = _userContext.GetCurrentUserId();
            var opportunity = await _opportunityRepository.GetByIdAsync(request.OpportunityId);
            if (opportunity == null)
                throw new Exception($"Opportunity with ID {request.OpportunityId} not found");

            // Update opportunity Regional Director
            opportunity.ApprovalManagerId = request.AssignedToId;
            await _opportunityRepository.UpdateAsync(opportunity);

            var opportunityHistory = new OpportunityHistory
            {
                //Regional Manager have two action 1.Approve, 2.Reject
                //If Approve need to select regional Manager
                // If Approve => Action should be Sent to Approval
                // If reject => Action should be Review Changes and sent back to Bid manager


                OpportunityId = request.OpportunityId,
                Action = request.Action,
                ActionBy = currentUser,
                StatusId = 4, // consider is a fixed Id for status, please Db opportunityStatuses table and seed
                ActionDate = DateTime.UtcNow,
                AssignedToId = request.AssignedToId,//Sent to Regional Director
                Comments = request.Comments
            };
            await _opportunityHistoryService.AddHistoryAsync(opportunityHistory);
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
                    Action = "Sent for Approval",
                    Comments = request.Comments,
                    ActionBy = currentUser,
                    AssignedToId = opportunityHistory.AssignedToId,
                    ActionDate = DateTime.UtcNow
                }
            };

        }

    }
}

