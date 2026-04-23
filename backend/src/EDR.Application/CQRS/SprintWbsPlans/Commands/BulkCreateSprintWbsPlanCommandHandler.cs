using MediatR;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
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
                    int totalHours = (int)Math.Round(item.PlannedHours);
                    int sprintCount = 2; // Default to 2 sprints

                    int baseHours = totalHours / sprintCount;
                    int remainder = totalHours % sprintCount;

                    for (int i = 1; i <= sprintCount; i++)
                    {
                        int allocatedHours = baseHours + (remainder > 0 ? 1 : 0);
                        if (remainder > 0)
                        {
                            remainder--;
                        }

                        entities.Add(CreateEntity(item, tenantId, i, allocatedHours, allocatedHours));
                    }
                }
                else
                {
                    int allocatedHours = (int)Math.Round(item.PlannedHours);
                    int remainingHours = (int)Math.Round(item.RemainingHours);
                    entities.Add(CreateEntity(item, tenantId, item.SprintNumber, allocatedHours, remainingHours));
                }
            }

            // ─── Backlog Versioning Logic ───────────────────────────────────────────
            // Collect distinct ProjectIds from the incoming batch
            var projectIds = entities.Select(e => e.ProjectId).Distinct().ToList();

            foreach (var projectId in projectIds)
            {
                // Find the highest existing BacklogVersion for this project (using EF async query)
                var maxVersion = await _context.SprintWbsPlans
                    .Where(x => x.ProjectId == projectId)
                    .Select(x => (int?)x.BacklogVersion)
                    .MaxAsync(cancellationToken);

                int newVersion = (maxVersion ?? 0) + 1;

                // Assign new version to all incoming entities for this project
                foreach (var e in entities.Where(e => e.ProjectId == projectId))
                {
                    e.BacklogVersion = newVersion;
                }
            }
            // ───────────────────────────────────────────────────────────────────────

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
                // BacklogVersion is set by the versioning logic above
            };
        }
    }
}
