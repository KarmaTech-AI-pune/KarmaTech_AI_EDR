using MediatR;
using Microsoft.EntityFrameworkCore;
using NJS.Application.CQRS.PMWorkflow.Commands;
using NJS.Application.Dtos;
using NJS.Application.Services.IContract;
using NJS.Domain.Database;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.PMWorkflow.Handlers
{
    public class RequestChangesCommandHandler : IRequestHandler<RequestChangesCommand, PMWorkflowDto>
    {
        private readonly ProjectManagementContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly IEntityWorkflowStrategySelector _strategySelector;

        public RequestChangesCommandHandler(ProjectManagementContext context, ICurrentUserService currentUserService, IEntityWorkflowStrategySelector strategySelector)
        {
            _context = context;
            _currentUserService = currentUserService;
            _strategySelector = strategySelector;
        }
        public async Task<PMWorkflowDto> Handle(RequestChangesCommand request, CancellationToken cancellationToken)
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
