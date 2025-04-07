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
                .FirstOrDefaultAsync(t => t.Id == request.TaskId && !t.IsDeleted, cancellationToken);

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

            // --- 3. Mark as deleted (Soft Delete) ---
            taskEntity.IsDeleted = true;
            taskEntity.UpdatedAt = DateTime.UtcNow;
            taskEntity.UpdatedBy = _currentUser;

            // TODO: Consider cascading soft delete for child tasks if required by business logic.
            // This would involve recursively finding and marking children as deleted.
            // For now, only the specified task is marked.

            // --- 4. Save Changes ---
            await _unitOfWork.SaveChangesAsync();

            return Unit.Value;
        }
    }
}
