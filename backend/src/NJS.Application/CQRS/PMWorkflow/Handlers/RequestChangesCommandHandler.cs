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

            // Check if the current user is RM/RD (by role)
            var userRoles = await _context.UserRoles
                .Where(ur => ur.UserId == currentUserId)
                .Join(_context.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => r.Name)
                .ToListAsync(cancellationToken);

            bool isRMorRD = userRoles.Any(r => r == "Regional Manager" || r == "Regional Director");

            // Log the current state
            Console.WriteLine($"RequestChangesCommandHandler: Current user: {currentUserId}, IsRMorRD: {isRMorRD}");
            Console.WriteLine($"RequestChangesCommandHandler: AssignedToId: {request.AssignedToId}, IsApprovalChanges: {request.IsApprovalChanges}");
            Console.WriteLine($"RequestChangesCommandHandler: EntityType: {request.EntityType}, EntityId: {request.EntityId}");

            // If this is an RM/RD rejection, always assign to SPM regardless of IsApprovalChanges flag
            if (isRMorRD)
            {
                Console.WriteLine($"RM/RD user detected: {currentUserId}, roles: {string.Join(", ", userRoles)}");

                // If assignedToId is already provided, use it (from frontend)
                if (!string.IsNullOrEmpty(request.AssignedToId))
                {
                    Console.WriteLine($"Using provided assignedToId: {request.AssignedToId} (likely SPM)");
                }
                // Otherwise, find the SPM ID from the project
                else
                {
                    // If RM/RD is rejecting, find the project and get the SPM
                    if (request.EntityType == "WBS")
                    {
                        var wbsHeader = await _context.Set<Domain.Entities.WBSTaskMonthlyHourHeader>()
                            .FirstOrDefaultAsync(w => w.Id == request.EntityId, cancellationToken);

                        if (wbsHeader != null)
                        {
                            var project = await _context.Projects
                                .FirstOrDefaultAsync(p => p.Id == wbsHeader.ProjectId, cancellationToken);

                            if (project != null && !string.IsNullOrEmpty(project.SeniorProjectManagerId))
                            {
                                // Assign to SPM instead of PM
                                request.AssignedToId = project.SeniorProjectManagerId;
                                Console.WriteLine($"RM/RD rejection: Assigning to SPM {request.AssignedToId} instead of PM");
                            }
                        }
                    }
                    else if (request.EntityType == "ChangeControl" || request.EntityType == "ProjectClosure")
                    {
                        // For other entity types, find the project and get the SPM
                        int projectId = 0;

                        if (request.EntityType == "ChangeControl")
                        {
                            var changeControl = await _context.ChangeControls
                                .FirstOrDefaultAsync(c => c.Id == request.EntityId, cancellationToken);

                            if (changeControl != null)
                                projectId = changeControl.ProjectId;
                        }
                        else if (request.EntityType == "ProjectClosure")
                        {
                            var projectClosure = await _context.ProjectClosures
                                .FirstOrDefaultAsync(p => p.Id == request.EntityId, cancellationToken);

                            if (projectClosure != null)
                                projectId = projectClosure.ProjectId;
                        }

                        if (projectId > 0)
                        {
                            var project = await _context.Projects
                                .FirstOrDefaultAsync(p => p.Id == projectId, cancellationToken);

                            if (project != null && !string.IsNullOrEmpty(project.SeniorProjectManagerId))
                            {
                                // Assign to SPM instead of PM
                                request.AssignedToId = project.SeniorProjectManagerId;
                                Console.WriteLine($"RM/RD rejection: Assigning to SPM {request.AssignedToId} instead of PM");
                            }
                        }
                    }
                }

                // Double-check that we have an assignedToId
                if (string.IsNullOrEmpty(request.AssignedToId))
                {
                    Console.WriteLine("WARNING: Could not determine SPM ID for RM/RD rejection");
                }

                // Ensure the action is set correctly for RM/RD rejection
                if (request.Action != "Approval Changes")
                {
                    request.Action = "Reject";
                }

                // For RM/RD rejections, always set IsApprovalChanges to true
                // This ensures the status will be set to 5 (ApprovalChanges) instead of 3 (ReviewChanges)
                request.IsApprovalChanges = true;

                Console.WriteLine($"Final AssignedToId for RM/RD rejection: {request.AssignedToId}");
                Console.WriteLine($"Setting IsApprovalChanges to true for RM/RD rejection");
            }

            // Get the assigned user if an ID is provided
            var assignedToUser = !string.IsNullOrEmpty(request.AssignedToId)
                ? await _context.Users.FirstOrDefaultAsync(u => u.Id == request.AssignedToId, cancellationToken)
                : null;

            var strategy = _strategySelector.GetStrategy(request.EntityType);
            var context = new WorkflowActionContext
            {
                Action = request.Action,
                EntityId = request.EntityId,
                CurrentUser = currentUser!,
                AssignedToUser = assignedToUser, // This can be null if no assignedToId is provided
                AssignedToId = request.AssignedToId,
                Comments = request.Comments
            };

            return await strategy.ExecuteAsync(context, cancellationToken);
        }
    }
}
