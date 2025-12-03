using MediatR;
using Microsoft.EntityFrameworkCore;
using NJS.Application.CQRS.Dashboard.NpvProfitability.Queries;
using NJS.Application.Dtos.Dashboard;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.Dashboard.NpvProfitability.Handlers
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
                .Where(jsf => !jsf.IsDeleted && 
                              (jsf.Project.Status == ProjectStatus.Active || jsf.Project.Status == ProjectStatus.InProgress))
                .ToListAsync(cancellationToken);

            decimal currentNpv = 0;
            int highProfitCount = 0;
            int mediumProfitCount = 0;
            int lowProfitCount = 0;

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
            }

            return new NpvProfitabilityDto
            {
                CurrentNpv = currentNpv,
                HighProfitProjectsCount = highProfitCount,
                MediumProfitProjectsCount = mediumProfitCount,
                LowProfitProjectsCount = lowProfitCount,
                WhatIfAnalysis = "If approval delays reduced by 50%, NPV could increase by $340K" // Placeholder logic as per requirements
            };
        }
    }
}
