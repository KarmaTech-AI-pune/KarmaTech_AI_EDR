using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDR.Application.CQRS.Dashboard.ProgramDashboard.Queries;
using EDR.Repositories.Interfaces;
using EDR.Domain.Enums;
using EDR.Application.Dtos.ProgramDashboard;
using EDR.Domain.Entities;

namespace EDR.Application.CQRS.Dashboard.ProgramDashboard.Handlers
{
    public class GetProgramNpvQueryHandler : IRequestHandler<GetProgramNpvQuery, ProgramNpvDto>
    {
        private readonly IProgramDashboardRepository _programDashboardRepository;

        public GetProgramNpvQueryHandler(IProgramDashboardRepository programDashboardRepository)
        {
            _programDashboardRepository = programDashboardRepository;
        }

        public async Task<ProgramNpvDto> Handle(GetProgramNpvQuery request, CancellationToken cancellationToken)
        {
            var projects = await _programDashboardRepository.GetProjectsByProgramIdAsync(request.ProgramId, cancellationToken);
            if (!projects.Any()) return null;

            var projectIds = projects.Select(p => p.Id).ToList();
            var allJsf = await _programDashboardRepository.GetJobStartFormsByProjectIdsAsync(projectIds, cancellationToken);
            
            decimal expectedRevenue = projects.Sum(p => (p.EstimatedProjectCost ?? 0) + (p.EstimatedProjectFee ?? 0));
            
            var progressReports = await _programDashboardRepository.GetMonthlyProgressesByProjectIdsAsync(projectIds, cancellationToken);
            decimal actualRevenue = progressReports
                .SelectMany(mp => (IEnumerable<ProgressDeliverable>?)mp.ProgressDeliverables ?? Array.Empty<ProgressDeliverable>())
                .Where(pd => pd.PaymentReceivedDate.HasValue)
                .Sum(pd => pd.PaymentDue ?? 0);

            decimal currentNpv = projects.Sum(p => p.EstimatedProjectFee ?? 0);

            // Profitability Categories
            int highProfitCount = 0;
            int mediumProfitCount = 0;
            int lowProfitCount = 0;

            foreach (var p in projects)
            {
                var projectJsf = allJsf.Where(j => j.ProjectId == p.Id).ToList();
                var avgProfit = projectJsf.Any() ? projectJsf.Average(j => j.ProfitPercentage) : 0;
                
                if (avgProfit >= 25) highProfitCount++;
                else if (avgProfit >= 15) mediumProfitCount++;
                else lowProfitCount++;
            }

            // What-If Logic (Program Level)
            double totalApprovalDelayDays = 0;
            int approvalHistoriesCount = 0;

            foreach (var form in allJsf)
            {
                if (form.Header?.JobStartFormHistories != null)
                {
                    var histories = form.Header.JobStartFormHistories.OrderBy(h => h.ActionDate).ToList();
                    var sent = histories.FirstOrDefault(h => h.StatusId == (int)PMWorkflowStatusEnum.SentForApproval);
                    var approved = histories.FirstOrDefault(h => h.StatusId == (int)PMWorkflowStatusEnum.Approved && (sent == null || h.ActionDate > sent.ActionDate));

                    if (sent != null && approved != null)
                    {
                        var delay = (approved.ActionDate - sent.ActionDate).TotalDays;
                        if (delay > 0)
                        {
                            totalApprovalDelayDays += delay;
                            approvalHistoriesCount++;
                        }
                    }
                }
            }

            string whatIf = "Not enough history for Program NPV simulation";
            if (approvalHistoriesCount > 0)
            {
                double avgDelay = totalApprovalDelayDays / approvalHistoriesCount;
                decimal estimatedGain = expectedRevenue * 0.08m * (decimal)((avgDelay * 0.4) / 365.0);
                whatIf = estimatedGain > 0 
                    ? $"Reducing approval delays by 40% across this program could improve NPV by {estimatedGain:C0}"
                    : "Program approval cycles are within target parameters.";
            }

            return new ProgramNpvDto
            {
                CurrentNpv = Math.Round(currentNpv, 2),
                ExpectedRevenue = expectedRevenue,
                ActualRevenue = actualRevenue,
                HighProfitProjectsCount = highProfitCount,
                MediumProfitProjectsCount = mediumProfitCount,
                LowProfitProjectsCount = lowProfitCount,
                WhatIfAnalysis = whatIf
            };
        }
    }
}
