using MediatR;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.SprintWbsPlans.Commands
{
    public class BulkCreateSprintWbsPlanCommandHandler : IRequestHandler<BulkCreateSprintWbsPlanCommand, List<int>>
    {
        private readonly ProjectManagementContext _context;

        public BulkCreateSprintWbsPlanCommandHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<List<int>> Handle(BulkCreateSprintWbsPlanCommand request, CancellationToken cancellationToken)
        {
            var ids = new List<int>();
            var entities = new List<SprintWbsPlan>();
            var tenantId = _context.TenantId ?? 0;

            foreach (var item in request.Items)
            {
                if (item.PlannedHours <= 0)
                {
                    throw new ArgumentException("PlannedHours must be greater than 0.");
                }

                if (item.SprintNumber < 0)
                {
                    throw new ArgumentException("SprintNumber cannot be negative.");
                }

                if (item.SprintNumber == 0)
                {
                    var firstHalf = item.PlannedHours / 2;
                    var secondHalf = item.PlannedHours - firstHalf;

                    entities.Add(CreateEntity(item, tenantId, 1, firstHalf, firstHalf));
                    entities.Add(CreateEntity(item, tenantId, 2, secondHalf, secondHalf));
                }
                else
                {
                    entities.Add(CreateEntity(item, tenantId, item.SprintNumber, item.PlannedHours, item.RemainingHours));
                }
            }

            _context.SprintWbsPlans.AddRange(entities);
            await _context.SaveChangesAsync(cancellationToken);

            foreach (var entity in entities)
            {
                ids.Add(entity.SprintWbsPlanId);
            }

            return ids;
        }

        private SprintWbsPlan CreateEntity(CreateSprintWbsPlanDto item, int tenantId, int sprintNumber, decimal plannedHours, decimal remainingHours)
        {
            return new SprintWbsPlan
            {
                TenantId = tenantId,
                ProjectId = item.ProjectId,
                WBSTaskId = item.WBSTaskId,
                WBSTaskName = item.WBSTaskName,
                ParentWBSTaskId = item.ParentWBSTaskId,
                AssignedUserId = item.AssignedUserId,
                AssignedUserName = item.AssignedUserName,
                RoleId = item.RoleId,
                RoleName = item.RoleName,
                MonthYear = item.MonthYear,
                SprintNumber = sprintNumber,
                PlannedHours = plannedHours,
                RemainingHours = remainingHours,
                ProgramSequence = item.ProgramSequence,
                IsConsumed = item.IsConsumed,
                AcceptanceCriteria = item.AcceptanceCriteria,
                TaskDescription = item.TaskDescription,
                CreatedOn = DateTime.UtcNow
            };
        }
    }
}

