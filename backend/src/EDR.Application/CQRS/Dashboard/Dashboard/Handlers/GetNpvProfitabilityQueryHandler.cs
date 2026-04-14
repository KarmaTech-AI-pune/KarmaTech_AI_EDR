using MediatR;
using EDR.Application.CQRS.Dashboard.Dashboard.Queries;
using Microsoft.EntityFrameworkCore;
using EDR.Application.CQRS.Dashboard.Dashboard.Queries;
using EDR.Application.Dtos.Dashboard;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using EDR.Domain.Enums;

namespace EDR.Application.CQRS.Dashboard.Dashboard.Handlers
{
    public class GetNpvProfitabilityQueryHandler : IRequestHandler<GetNpvProfitabilityQuery, NpvProfitabilityDto>
    {
        private readonly ProjectManagementContext _context;

        public GetNpvProfitabilityQueryHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<NpvProfitabilityDto> Handle(GetNpvProfitabilityQuery request, CancellationToken cancellationToken)
        {
            // Fetch JobStartForms for active projects
            var jobStartForms = await _context.JobStartForms
                .Include(jsf => jsf.Project)
                .Include(jsf => jsf.Header)
                    .ThenInclude(h => h.JobStartFormHistories)
                .Where(jsf => !jsf.IsDeleted && 
                              (jsf.Project.Status == ProjectStatus.Active || jsf.Project.Status == ProjectStatus.InProgress))
                .ToListAsync(cancellationToken);

            decimal currentNpv = 0;
            int highProfitCount = 0;
            int mediumProfitCount = 0;
            int lowProfitCount = 0;
            
            // Variables for What-If Analysis
            double totalApprovalDelayDays = 0;
            int projectsWithApprovalHistory = 0;
            decimal totalProjectFeesForDelayedProjects = 0;

            // Calculate Expected Revenue (Total Portfolio)
            var activeProjects = await _context.Projects
                .Where(p => p.Status == ProjectStatus.Active || p.Status == ProjectStatus.InProgress)
                .ToListAsync(cancellationToken);
            
            decimal expectedRevenue = activeProjects.Sum(p => (p.EstimatedProjectCost ?? 0) + (p.EstimatedProjectFee ?? 0));
            string currencyCode = activeProjects.FirstOrDefault()?.Currency ?? "USD";

            // Calculate Actual Revenue (Total Portfolio)
            var activeProjectIds = activeProjects.Select(p => p.Id).ToList();
            var actualRevenue = await _context.ProgressDeliverables
                .Where(pd => activeProjectIds.Contains(pd.MonthlyProgress.ProjectId) && pd.PaymentReceivedDate != null)
                .SumAsync(pd => pd.PaymentDue ?? 0, cancellationToken);

            foreach (var form in jobStartForms)
            {
                currentNpv += form.TotalProjectFees;

                var profitMargin = form.ProfitPercentage; // Assuming 0-100 scale

                if (profitMargin >= 20)
                {
                    highProfitCount++;
                }
                else if (profitMargin >= 10)
                {
                    mediumProfitCount++;
                }
                else if (profitMargin >= 5)
                {
                    lowProfitCount++;
                }

                // Calculate Approval Delay
                if (form.Header != null && form.Header.JobStartFormHistories != null)
                {
                    var histories = form.Header.JobStartFormHistories.OrderBy(h => h.ActionDate).ToList();
                    
                    // Find the first time it was sent for approval
                    var sentForApproval = histories.FirstOrDefault(h => h.StatusId == (int)PMWorkflowStatusEnum.SentForApproval);
                    // Find the time it was approved (after being sent)
                    var approved = histories.FirstOrDefault(h => h.StatusId == (int)PMWorkflowStatusEnum.Approved && 
                                                                 (sentForApproval == null || h.ActionDate > sentForApproval.ActionDate));

                    if (sentForApproval != null && approved != null)
                    {
                        var delay = (approved.ActionDate - sentForApproval.ActionDate).TotalDays;
                        if (delay > 0)
                        {
                            totalApprovalDelayDays += delay;
                            projectsWithApprovalHistory++;
                            totalProjectFeesForDelayedProjects += form.TotalProjectFees;
                        }
                    }
                }
            }

            string whatIfAnalysis = "Not enough data for analysis";

            if (projectsWithApprovalHistory > 0)
            {
                double averageDelayDays = totalApprovalDelayDays / projectsWithApprovalHistory;
                
                // Assumption: 50% reduction in delay
                double savedDays = averageDelayDays * 0.5;
                
                // Assumption: Cost of Capital is 10% annually
                // Gain = Total Fees * 10% * (Saved Days / 365)
                // We use the total fees of the projects that had delays to estimate the impact on that portfolio subset
                // Or we could extrapolate to the whole portfolio. Let's stick to the affected projects for accuracy.
                decimal estimatedGain = totalProjectFeesForDelayedProjects * 0.10m * (decimal)(savedDays / 365.0);

                if (estimatedGain > 0)
                {
                    whatIfAnalysis = $"If approval delays reduced by 50%, NPV could increase by {estimatedGain:C0}";
                }
                else
                {
                     whatIfAnalysis = "Approval delays are negligible; minimal NPV impact projected.";
                }
            }

            return new NpvProfitabilityDto
            {
                CurrentNpv = currentNpv,
                ExpectedRevenue = expectedRevenue,
                ActualRevenue = actualRevenue,
                CurrencyCode = currencyCode,
                HighProfitProjectsCount = highProfitCount,
                MediumProfitProjectsCount = mediumProfitCount,
                LowProfitProjectsCount = lowProfitCount,
                WhatIfAnalysis = whatIfAnalysis
            };
        }
    }
}

