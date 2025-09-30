using MediatR;
using Microsoft.EntityFrameworkCore;
using NJS.Application.CQRS.WorkBreakdownStructures.Commands;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Domain.UnitWork;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Handlers
{
    public class DeleteWBSTaskCommandHandler : IRequestHandler<DeleteWBSTaskCommand, Unit>
    {
        private readonly ProjectManagementContext _context;
        private readonly IUnitOfWork _unitOfWork;

        // TODO: Inject ICurrentUserService or similar
        private readonly string _currentUser = "System"; // Placeholder

        public DeleteWBSTaskCommandHandler(ProjectManagementContext context, IUnitOfWork unitOfWork)
        {
            _context = context;
            _unitOfWork = unitOfWork;
        }

        public async Task<Unit> Handle(DeleteWBSTaskCommand request, CancellationToken cancellationToken)
        {
            // --- 1. Find the task to delete ---
            var taskEntity = await _context.WBSTasks
                .Include(t => t.WorkBreakdownStructure) // Include WBS to check ProjectId
                .FirstOrDefaultAsync(t => t.Id == request.TaskId, cancellationToken);

            if (taskEntity == null)
            {
                // Task already deleted or never existed, return success (idempotent)
                return Unit.Value;
                // Or throw NotFoundException if strict checking is required
                // throw new NotFoundException(nameof(WBSTask), request.TaskId);
            }

            // --- 2. Verify task belongs to the correct project's WBS ---
            if (taskEntity.WorkBreakdownStructure == null || taskEntity.WorkBreakdownStructure.ProjectId != request.ProjectId)
            {
                // Or throw an authorization/forbidden exception
                throw new Exception($"Task {request.TaskId} does not belong to Project {request.ProjectId}.");
            }

            // --- 3. Delete the task (Hard Delete) ---
            _context.WBSTasks.Remove(taskEntity);

            // --- 4. Cascade delete child tasks ---
            await DeleteChildTasks(request.ProjectId, request.TaskId, cancellationToken);

            // --- 5. Save Changes ---
            await _unitOfWork.SaveChangesAsync();

            return Unit.Value;
        }

        private async Task DeleteChildTasks(int projectId, int taskId, CancellationToken cancellationToken)
        {
            var childTasks = await _context.WBSTasks
                .Include(t => t.WorkBreakdownStructure)
                .Where(t => t.WorkBreakdownStructure.ProjectId == projectId && t.ParentId == taskId && !t.IsDeleted && t.WorkBreakdownStructure.ProjectId == projectId)
                .ToListAsync(cancellationToken);

            foreach (var childTask in childTasks)
            {
                _context.WBSTasks.Remove(childTask);
                await DeleteChildTasks(projectId, childTask.Id, cancellationToken); // Recursive call
            }
        }
    }
}
