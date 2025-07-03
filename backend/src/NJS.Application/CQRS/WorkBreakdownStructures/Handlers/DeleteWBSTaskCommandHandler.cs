using MediatR;
using Microsoft.EntityFrameworkCore;
using NJS.Application.CQRS.WorkBreakdownStructures.Commands;
using NJS.Application.Dtos;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Domain.UnitWork;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Handlers
{
    public class DeleteWBSTaskCommandHandler : IRequestHandler<DeleteWBSTaskCommand, WBSTaskDto>
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

        public async Task<WBSTaskDto> Handle(DeleteWBSTaskCommand request, CancellationToken cancellationToken)
        {
            // --- 1. Find the task to delete with all related data ---
            var taskEntity = await _context.WBSTasks
                .Include(t => t.WorkBreakdownStructure) // Include WBS to check ProjectId
                .Include(t => t.UserWBSTasks)
                    .ThenInclude(ut => ut.User)
                .Include(t => t.UserWBSTasks)
                    .ThenInclude(ut => ut.ResourceRole)
                .Include(t => t.PlannedHours)
                .FirstOrDefaultAsync(t => t.Id == request.TaskId && !t.IsDeleted, cancellationToken);

            if (taskEntity == null)
            {
                // Task already deleted or never existed, throw exception for clarity
                throw new Exception($"WBSTask with ID {request.TaskId} not found or already deleted.");
            }

            // --- 2. Verify task belongs to the correct project's WBS ---
            if (taskEntity.WorkBreakdownStructure == null || taskEntity.WorkBreakdownStructure.ProjectId != request.ProjectId)
            {
                // Or throw an authorization/forbidden exception
                throw new Exception($"Task {request.TaskId} does not belong to Project {request.ProjectId}.");
            }

            // --- 3. Capture task data before deletion ---
            var userTask = taskEntity.UserWBSTasks.FirstOrDefault();
            var deletedTaskDto = new WBSTaskDto
            {
                Id = taskEntity.Id,
                WorkBreakdownStructureId = taskEntity.WorkBreakdownStructureId,
                ParentId = taskEntity.ParentId,
                Level = taskEntity.Level,
                Title = taskEntity.Title,
                Description = taskEntity.Description,
                DisplayOrder = taskEntity.DisplayOrder,
                EstimatedBudget = taskEntity.EstimatedBudget,
                StartDate = taskEntity.StartDate,
                EndDate = taskEntity.EndDate,
                TaskType = taskEntity.TaskType,
                AssignedUserId = userTask?.UserId,
                AssignedUserName = userTask?.User?.UserName ?? userTask?.Name,
                CostRate = userTask?.CostRate ?? 0,
                ResourceName = userTask?.Name,
                ResourceUnit = userTask?.Unit,
                ResourceRoleId = userTask?.ResourceRoleId,
                ResourceRoleName = userTask?.ResourceRole?.Name,
                PlannedHours = taskEntity.PlannedHours.Select(ph => new PlannedHourDto
                {
                    Year = int.Parse(ph.Year),
                    MonthNo = ph.Month,
                    Date = ph.Date,
                    WeekNo = ph.WeekNumber,
                    PlannedHours = ph.PlannedHours
                }).ToList(),
                TotalHours = taskEntity.PlannedHours.Sum(ph => ph.PlannedHours),
                TotalCost = userTask?.TotalCost ?? 0,
                FrontendTempId = null,
                ParentFrontendTempId = null
            };

            // --- 4. Mark as deleted (Soft Delete) ---
            taskEntity.IsDeleted = true;
            taskEntity.UpdatedAt = DateTime.UtcNow;
            taskEntity.UpdatedBy = _currentUser;

            // TODO: Consider cascading soft delete for child tasks if required by business logic.
            // This would involve recursively finding and marking children as deleted.
            // For now, only the specified task is marked.

            // --- 5. Save Changes ---
            await _unitOfWork.SaveChangesAsync();

            return deletedTaskDto;
        }
    }
}
