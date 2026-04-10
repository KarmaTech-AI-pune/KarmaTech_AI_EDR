using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDR.Application.CQRS.Dashboard.ProjectDashboard.Queries;
using EDR.Repositories.Interfaces;
using EDR.Domain.Enums;

namespace EDR.Application.CQRS.Dashboard.ProjectDashboard.Handlers
{
    public class GetProjectNpvQueryHandler : IRequestHandler<GetProjectNpvQuery, ProjectNpvDto>
    {
        private readonly IProjectDashboardRepository _projectDashboardRepository;

        public GetProjectNpvQueryHandler(IProjectDashboardRepository projectDashboardRepository)
        {
            _projectDashboardRepository = projectDashboardRepository;
        }

        public async Task<ProjectNpvDto> Handle(GetProjectNpvQuery request, CancellationToken cancellationToken)
        {
            var project = await _projectDashboardRepository.GetProjectByIdAsync(request.ProjectId, cancellationToken);
            if (project == null) return null;

            var allJsf = await _projectDashboardRepository.GetJobStartFormsByProjectIdAsync(request.ProjectId, cancellationToken);
            var totalRevenueExpected = project.EstimatedProjectFee ?? 0;

            // NPV & What-If Logic
            decimal currentNpv = totalRevenueExpected;
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

            string whatIf = "Not enough history for NPV simulation";
            if (approvalHistoriesCount > 0)
            {
                double avgDelay = totalApprovalDelayDays / approvalHistoriesCount;
                decimal estimatedGain = totalRevenueExpected * 0.10m * (decimal)((avgDelay * 0.5) / 365.0);
                whatIf = estimatedGain > 0 
                    ? $"If approval delays reduced by 50%, project NPV could increase by {estimatedGain:C0}"
                    : "Approval cycle is efficient; minimal NPV impact projected.";
            }

            return new ProjectNpvDto
            {
                CurrentNpv = Math.Round(currentNpv, 2),
                WhatIfAnalysis = whatIf
            };
        }
    }
}
