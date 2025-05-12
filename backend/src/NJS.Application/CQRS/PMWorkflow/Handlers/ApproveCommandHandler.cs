using MediatR;
using Microsoft.EntityFrameworkCore;
using NJS.Application.CQRS.PMWorkflow.Commands;
using NJS.Application.Dtos;
using NJS.Application.Services.IContract;
using NJS.Domain.Database;

namespace NJS.Application.CQRS.PMWorkflow.Handlers
{
    public class ApproveCommandHandler : IRequestHandler<ApproveCommand, PMWorkflowDto>
    {
        private readonly ProjectManagementContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly IEntityWorkflowStrategySelector _strategySelector;

        public ApproveCommandHandler(ProjectManagementContext context, ICurrentUserService currentUserService, IEntityWorkflowStrategySelector strategySelector)
        {
            _context = context;
            _currentUserService = currentUserService;
            _strategySelector = strategySelector;
        }
        public async Task<PMWorkflowDto> Handle(ApproveCommand request, CancellationToken cancellationToken)
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

            };
            return await strategy.ExecuteAsync(context, cancellationToken);
        }
    }
}
