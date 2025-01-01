using MediatR;
using Microsoft.AspNetCore.Identity;
using NJS.Application.CQRS.OpportunityTracking.Commands;
using NJS.Application.CQRS.Users.Queries;
using NJS.Application.Dtos;
using NJS.Application.Services;
using NJS.Application.Services.IContract;
using NJS.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace NJS.Application.CQRS.OpportunityTracking.Handlers
{
    public class OpportunitySentToApprovalHandler : IRequestHandler<OppertunityWorkflowCommand, OppertunityWorkflowDto>
    {
        private readonly IOpportunityHistoryService _opportunityHistoryService;
        private readonly IUserContext _userContext;
        private readonly RoleManager<Role> _roleManager;
        private readonly UserManager<User> _userManager;
        private readonly IMediator _mediator;
        private readonly OpportunityHistoryService _historyService;

        public OpportunitySentToApprovalHandler(IOpportunityHistoryService opportunityHistoryService,
          IUserContext userContext,
          UserManager<User> userManager,
          RoleManager<Role> roleManager,
         IMediator mediator,
         OpportunityHistoryService historyService)

        {
            _opportunityHistoryService = opportunityHistoryService;
            _userContext = userContext;
            _userManager = userManager;
            _roleManager = roleManager;
            _mediator = mediator;
            _historyService = historyService;
        }
        public async Task<OppertunityWorkflowDto> Handle(OppertunityWorkflowCommand request, CancellationToken cancellationToken)
        {
            var currentUser = _userContext.GetCurrentUserId();

            var user = await _userManager.FindByIdAsync(request.AssignedToId).ConfigureAwait(false);

            var roleDto = new GetRolesByUserIdQuery(user);
            var roles = await _mediator.Send(roleDto);

            var history = _historyService.GetCurrentStatusForTractingAsync(request.OppertunityId);

            var opportunityHistory = new OpportunityHistory();

            if (roles.Any(x => x.Name.Equals("Regional Manager")))
            {

                opportunityHistory = new OpportunityHistory
                {
                    //Regional Manager have two action 1.Approve, 2.Reject
                    //If Approve need to select regional Manager
                    // If Approve => Action should be Sent to Approval
                    // If reject => Action should be Review Changes and sent back to Bid manager


                    OpportunityId = request.OppertunityId,
                    Action = "Sent for Approval",
                    ActionBy = currentUser,
                    StatusId = 4, // consider is a fixed Id for status, please Db opportunityStatuses table and seed
                    ActionDate = DateTime.UtcNow,
                    AssignedToId = request.AssignedToId,
                    Comments = request.Commnets
                };
                if (request.Action == "Reject")
                {
                    opportunityHistory = new OpportunityHistory
                    {
                        OpportunityId = request.OppertunityId,
                        Action = "Sent for Approval",
                        ActionBy = currentUser,
                        StatusId = 3, // consider is a fixed Id for status, please Db opportunityStatuses table and seed
                        ActionDate = DateTime.UtcNow,
                        AssignedToId = "Back to Bid Mananger",
                        Comments = request.Commnets
                    };
                }
            }

            var entity = new OpportunityHistory
            {
                OpportunityId = request.OppertunityId,
                Action = "Sent to review",
                ActionBy = currentUser,
                StatusId = 2, // consider is a fixed Id for status, please Db opportunityStatuses table and seed
                ActionDate = DateTime.UtcNow,
                AssignedToId = request.AssignedToId,
                Comments = request.Commnets
            };
            return new OppertunityWorkflowDto();
        }
    }
}
