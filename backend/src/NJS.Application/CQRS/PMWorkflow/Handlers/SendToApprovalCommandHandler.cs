using MediatR;
using NJS.Application.CQRS.PMWorkflow.Commands;
using NJS.Application.Dtos;
using NJS.Application.Services.IContract;
using NJS.Domain.Database;
using Microsoft.EntityFrameworkCore;

namespace NJS.Application.CQRS.PMWorkflow.Handlers
{
    public class SendToApprovalCommandHandler : IRequestHandler<ProjectSendToApprovalCommand, PMWorkflowDto>
    {
        private readonly ProjectManagementContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly IEntityWorkflowStrategySelector _strategySelector;

        public SendToApprovalCommandHandler(ProjectManagementContext context, ICurrentUserService currentUserService, IEntityWorkflowStrategySelector strategySelector)
        {
            _context = context;
            _currentUserService = currentUserService;
            _strategySelector = strategySelector;
        }


        public async Task<PMWorkflowDto> Handle(ProjectSendToApprovalCommand request, CancellationToken cancellationToken)
        {
            var currentUserId = _currentUserService.UserId;
            var currentUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == currentUserId, cancellationToken);
            var assignedToUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == request.AssignedToId, cancellationToken);

            var strategy = _strategySelector.GetStrategy(request.EntityType);
            var context = new WorkflowActionContext
            {
                Action = request.Action,
                EntityId = request.EntityId,
                CurrentUser = currentUser!,
                AssignedToUser = assignedToUser!,
                AssignedToId = request.AssignedToId,
                Comments = request.Comments
            };

            return await strategy.ExecuteAsync(context, cancellationToken);
        }
    }
}
