using MediatR;
using EDR.Application.CQRS.Dashboard.Dashboard.Queries;
using Microsoft.EntityFrameworkCore;
using EDR.Application.CQRS.Dashboard.Dashboard.Queries;
using EDR.Application.Dtos.Dashboard;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.Dashboard.Dashboard.Handlers
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

        private string CalculateStatus(EDR.Domain.Entities.ProgressDeliverable deliverable)
        {
            // Only mark as Completed if PaymentReceivedDate is present AND it is not in the future
            if (deliverable.PaymentReceivedDate.HasValue && deliverable.PaymentReceivedDate.Value.Date <= DateTime.UtcNow.Date)
            {
                return "Completed";
            }

            if (deliverable.DueDateContract.HasValue)
            {
                var dueDate = deliverable.DueDateContract.Value.Date;
                var today = DateTime.UtcNow.Date;

                // If currently overdue (payment not received, and past due date)
                if (dueDate < today)
                {
                    return "Overdue";
                }
                
                // At Risk: Due within 7 days
                if (dueDate <= today.AddDays(7))
                {
                    return "At Risk";
                }
            }

            return "On Track";
        }

        private int CalculateDaysDelayed(EDR.Domain.Entities.ProgressDeliverable deliverable)
        {
            var dueDate = deliverable.DueDateContract?.Date;
            if (!dueDate.HasValue) return 0;

            // If we have a Payment Received Date (even if future/projected), calculate delay against it
            if (deliverable.PaymentReceivedDate.HasValue)
            {
                var paymentDate = deliverable.PaymentReceivedDate.Value.Date;
                if (paymentDate > dueDate.Value)
                {
                    return (paymentDate - dueDate.Value).Days;
                }
                return 0; // Paid on time or early
            }

            // If pending and overdue
            if (dueDate.Value < DateTime.UtcNow.Date)
            {
                return (DateTime.UtcNow.Date - dueDate.Value).Days;
            }

            return 0;
        }

        private decimal CalculatePenalty(EDR.Domain.Entities.ProgressDeliverable deliverable)
        {
            // Logic: If there is a delay (DaysDelayed > 0), calculate penalty.
            // Penalty is dynamically calculated based on the number of days delayed.
            
            var daysDelayed = CalculateDaysDelayed(deliverable);
            
            if (daysDelayed > 0)
            {
                 // Rate: $100 per day delayed
                 return daysDelayed * 100;
            }

            return 0;
        }
    }
}

