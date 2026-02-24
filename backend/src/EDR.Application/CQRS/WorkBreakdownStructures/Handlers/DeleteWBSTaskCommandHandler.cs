using MediatR;
using Microsoft.EntityFrameworkCore;
using EDR.Application.CQRS.WorkBreakdownStructures.Commands;
using EDR.Application.Dtos;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.UnitWork;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.WorkBreakdownStructures.Handlers
{
    public class DeleteWBSTaskCommandHandler : IRequestHandler<DeleteWBSTaskCommand, bool>
    {
        private readonly ProjectManagementContext _context;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<DeleteWBSTaskCommandHandler> _logger;

        public DeleteWBSTaskCommandHandler(ProjectManagementContext context, IUnitOfWork unitOfWork, ILogger<DeleteWBSTaskCommandHandler> logger)
        {
            _context = context;
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<bool> Handle(DeleteWBSTaskCommand request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Handling DeleteWBSTaskCommand for ProjectId {ProjectId}, WBSTaskId {WBSTaskId}",
                request.ProjectId, request.WBSTaskId);

            // Fetch the target task to verify it exists and get its WBS ID
            var targetTask = await _context.WBSTasks
                .Include(t => t.WorkBreakdownStructure)
                    .ThenInclude(wbs => wbs.WBSHeader)
                .Include(t => t.PlannedHours)
                .Include(t => t.UserWBSTasks)
                .FirstOrDefaultAsync(t => t.Id == request.WBSTaskId && t.WorkBreakdownStructure.WBSHeader.ProjectId == request.ProjectId, cancellationToken);
            
            if (targetTask == null)
            {
                _logger.LogWarning("WBSTask with Id {WBSTaskId} not found in Project {ProjectId}", request.WBSTaskId, request.ProjectId);
                return false;
            }

            // Fetch all tasks in the same Work Breakdown Structure to find children
            // We fetch only tasks in the same WBS Group as parents/children are within the same group usually
            var allTasksInWbs = await _context.WBSTasks
                .Where(t => t.WorkBreakdownStructureId == targetTask.WorkBreakdownStructureId)
                .Include(t => t.PlannedHours)
                .Include(t => t.UserWBSTasks)
                .ToListAsync(cancellationToken);

            var tasksToDelete = new List<WBSTask>();
            CollectTasksToDelete(targetTask, allTasksInWbs, tasksToDelete);

            if (tasksToDelete.Count > 0)
            {
                 _logger.LogInformation("Found {Count} tasks to delete (Target + Children)", tasksToDelete.Count);
                _context.WBSTasks.RemoveRange(tasksToDelete);
                await _unitOfWork.SaveChangesAsync();
            }

            _logger.LogInformation("WBSTask {WBSTaskId} and its children deleted successfully for ProjectId {ProjectId}", request.WBSTaskId, request.ProjectId);

            return true;
        }

        private void CollectTasksToDelete(WBSTask currentTask, List<WBSTask> allTasks, List<WBSTask> tasksToDelete)
        {
            tasksToDelete.Add(currentTask);

            // Find direct children
            var children = allTasks.Where(t => t.ParentId == currentTask.Id).ToList();

            foreach (var child in children)
            {
                // Recursive call for each child
                CollectTasksToDelete(child, allTasks, tasksToDelete);
            }
        }
    }
}

