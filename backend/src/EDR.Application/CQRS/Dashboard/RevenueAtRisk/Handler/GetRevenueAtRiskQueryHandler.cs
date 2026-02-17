using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using EDR.Application.Dtos.Dashboard;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Enums;

namespace EDR.Application.CQRS.Dashboard.RevenueAtRisk.Handler
{
    public class GetRevenueAtRiskQueryHandler : IRequestHandler<Query.GetRevenueAtRiskQuery, RevenueAtRiskDto>
    {
        private readonly ProjectManagementContext _context;

        public GetRevenueAtRiskQueryHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<RevenueAtRiskDto> Handle(Query.GetRevenueAtRiskQuery request, CancellationToken cancellationToken)
        {
            var riskProjects = await (
                from p in _context.Projects
                join jsf in _context.JobStartForms on p.Id equals jsf.ProjectId into ps_jsf
                from jsf in ps_jsf.DefaultIfEmpty()
                where p.Status == ProjectStatus.OnHold
                select new { Project = p, JobStartForm = jsf }
            ).ToListAsync(cancellationToken);

            var delayedProjects = await (
                from p in _context.Projects
                join mp in _context.MonthlyProgresses on p.Id equals mp.ProjectId // Changed p.ProjectId to p.Id
                join s in _context.Schedules on mp.Id equals s.MonthlyProgressId
                join jsf in _context.JobStartForms on p.Id equals jsf.ProjectId into ps_jsf_delayed
                from jsf in ps_jsf_delayed.DefaultIfEmpty()
                where s.CompletionDateAsPerContract.HasValue &&
                      EF.Functions.DateDiffDay(s.CompletionDateAsPerContract.Value,
                          s.ExpectedCompletionDate ?? DateTime.Now) > 15
                select new { Project = p, JobStartForm = jsf }
            ).ToListAsync(cancellationToken);

            var allRiskProjects = riskProjects.Union(delayedProjects).Distinct();
            var revenueAtRisk = allRiskProjects.Sum(p => p.JobStartForm?.TotalProjectFees ?? 0m);
            var projectCount = allRiskProjects.Count();

            return new RevenueAtRiskDto
            {
                RevenueAtRisk = revenueAtRisk,
                ProjectsAffectedDescription = $"{projectCount} projects affected",
                ChangeType = "negative"
            };
        }
    }
}

