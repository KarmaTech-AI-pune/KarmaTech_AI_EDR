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

            foreach (var item in request.Items)
            {
                var entity = new SprintWbsPlan
                {
                    TenantId = _context.TenantId ?? 0,
                    ProjectId = item.ProjectId,
                    WBSTaskId = item.WBSTaskId,
                    WBSTaskName = item.WBSTaskName,
                    ParentWBSTaskId = item.ParentWBSTaskId,
                    AssignedUserId = item.AssignedUserId,
                    AssignedUserName = item.AssignedUserName,
                    RoleId = item.RoleId,
                    RoleName = item.RoleName,
                    MonthYear = item.MonthYear,
                    SprintNumber = item.SprintNumber,
                    PlannedHours = item.PlannedHours,
                    RemainingHours = item.RemainingHours,
                    ProgramSequence = item.ProgramSequence,
                    IsConsumed = item.IsConsumed,
                    AcceptanceCriteria = item.AcceptanceCriteria,
                    TaskDescription = item.TaskDescription,
                    CreatedOn = DateTime.UtcNow
                };
                entities.Add(entity);
            }

            _context.SprintWbsPlans.AddRange(entities);
            await _context.SaveChangesAsync(cancellationToken);

            foreach (var entity in entities)
            {
                ids.Add(entity.SprintWbsPlanId);
            }

            return ids;
        }
    }
}

