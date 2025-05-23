using MediatR;
using Microsoft.EntityFrameworkCore;
using NJS.Application.CQRS.PMWorkflow.Commands;
using NJS.Application.Dtos;
using NJS.Application.Services.IContract;
using NJS.Domain.Database;
using NJS.Domain.Entities;

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
            try
            {
                var currentUserId = _currentUserService.UserId;
                var currentUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == currentUserId, cancellationToken);

                // For approval, assignedToId might be null or empty
                User? assignedToUser = null;
                if (!string.IsNullOrEmpty(request.AssignedToId))
                {
                    assignedToUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == request.AssignedToId, cancellationToken);
                }

                Console.WriteLine($"Approving {request.EntityType} with ID {request.EntityId}");
                Console.WriteLine($"Action: {request.Action}, AssignedToId: {request.AssignedToId ?? "null"}");

                var strategy = _strategySelector.GetStrategy(request.EntityType);
                var context = new WorkflowActionContext
                {
                    Action = request.Action,
                    EntityId = request.EntityId,
                    CurrentUser = currentUser!,
                    AssignedToUser = assignedToUser,
                    AssignedToId = request.AssignedToId,
                    Comments = request.Comments
                };

                return await strategy.ExecuteAsync(context, cancellationToken);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in ApproveCommandHandler: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                throw;
            }
        }
    }
}
