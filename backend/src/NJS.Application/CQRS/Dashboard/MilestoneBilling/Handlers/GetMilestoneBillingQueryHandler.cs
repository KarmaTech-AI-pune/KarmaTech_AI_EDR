using MediatR;
using Microsoft.EntityFrameworkCore;
using NJS.Application.CQRS.Dashboard.MilestoneBilling.Queries;
using NJS.Application.Dtos.Dashboard;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.Dashboard.MilestoneBilling.Handlers
{
    public class GetMilestoneBillingQueryHandler : IRequestHandler<GetMilestoneBillingQuery, List<MilestoneBillingDto>>
    {
        private readonly ProjectManagementContext _context;

        public GetMilestoneBillingQueryHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<List<MilestoneBillingDto>> Handle(GetMilestoneBillingQuery request, CancellationToken cancellationToken)
        {
            // 1. Get active projects
            var activeProjects = await _context.Projects
                .Where(p => p.Status == ProjectStatus.Active || p.Status == ProjectStatus.InProgress)
                .Select(p => p.Id)
                .ToListAsync(cancellationToken);

            var result = new List<MilestoneBillingDto>();

            foreach (var projectId in activeProjects)
            {
                // 2. Get the latest MonthlyProgress for each project
                var latestMonthlyProgress = await _context.MonthlyProgresses
                    .Include(mp => mp.Project)
                    .Include(mp => mp.ProgressDeliverables)
                    .Where(mp => mp.ProjectId == projectId)
                    .OrderByDescending(mp => mp.Year)
                    .ThenByDescending(mp => mp.Month)
                    .FirstOrDefaultAsync(cancellationToken);

                if (latestMonthlyProgress != null && latestMonthlyProgress.ProgressDeliverables != null)
                {
                    foreach (var deliverable in latestMonthlyProgress.ProgressDeliverables)
                    {
                        // 3. Map to DTO
                        var dto = new MilestoneBillingDto
                        {
                            Id = deliverable.Id,
                            Project = latestMonthlyProgress.Project.Name,
                            Milestone = deliverable.Milestone ?? "Unknown Milestone",
                            ExpectedAmount = deliverable.PaymentDue ?? 0,
                            Status = CalculateStatus(deliverable),
                            DaysDelayed = CalculateDaysDelayed(deliverable),
                            Penalty = CalculatePenalty(deliverable)
                        };

                        result.Add(dto);
                    }
                }
            }

            return result;
        }

        private string CalculateStatus(NJS.Domain.Entities.ProgressDeliverable deliverable)
        {
            if (deliverable.AchievedDate.HasValue)
            {
                return "Completed"; // Or "On Track" if we want to stick to the specific statuses
            }

            if (deliverable.DueDateContract.HasValue && deliverable.DueDateContract.Value < DateTime.UtcNow.Date)
            {
                return "Overdue";
            }
            
            // Logic for "At Risk" could be added here (e.g., within 7 days of due date)
            if (deliverable.DueDateContract.HasValue && deliverable.DueDateContract.Value <= DateTime.UtcNow.Date.AddDays(7))
            {
                return "At Risk";
            }

            return "On Track";
        }

        private int CalculateDaysDelayed(NJS.Domain.Entities.ProgressDeliverable deliverable)
        {
            if (deliverable.AchievedDate.HasValue)
            {
                return 0;
            }

            if (deliverable.DueDateContract.HasValue && deliverable.DueDateContract.Value < DateTime.UtcNow.Date)
            {
                return (DateTime.UtcNow.Date - deliverable.DueDateContract.Value).Days;
            }

            return 0;
        }

        private decimal CalculatePenalty(NJS.Domain.Entities.ProgressDeliverable deliverable)
        {
            // Placeholder logic: 
            // If overdue, maybe 1% of PaymentDue per 10 days? 
            // For now returning 0 as per plan unless specific logic is provided.
            // Or we can mock some penalty for demo purposes if overdue.
            
            if (CalculateStatus(deliverable) == "Overdue")
            {
                 // Example: $100 per day delayed
                 return CalculateDaysDelayed(deliverable) * 100;
            }

            return 0;
        }
    }
}
