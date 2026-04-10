using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDR.Application.CQRS.Dashboard.Dashboard.Queries;
using Microsoft.EntityFrameworkCore;
using EDR.Application.Dtos.Dashboard;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Enums;

namespace EDR.Application.CQRS.Dashboard.Dashboard.Handlers
{
    public class GetRevenueAtRiskQueryHandler : IRequestHandler<GetRevenueAtRiskQuery, RevenueAtRiskDto>
    {
        private readonly ProjectManagementContext _context;

        public GetRevenueAtRiskQueryHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<RevenueAtRiskDto> Handle(GetRevenueAtRiskQuery request, CancellationToken cancellationToken)
        {
            var riskProjects = await (
                from p in _context.Projects
                join jsf in _context.JobStartForms on p.Id equals jsf.ProjectId into ps_jsf
                from jsf in ps_jsf.DefaultIfEmpty()
                where p.Status == ProjectStatus.OnHold
                select new { Project = p, JobStartForm = jsf }
            ).ToListAsync(cancellationToken);

            var now = DateTime.Now;
            var delayedProjects = await (
                from p in _context.Projects
                join mp in _context.MonthlyProgresses on p.Id equals mp.ProjectId // Changed p.ProjectId to p.Id
                join s in _context.Schedules on mp.Id equals s.MonthlyProgressId
                join jsf in _context.JobStartForms on p.Id equals jsf.ProjectId into ps_jsf_delayed
                from jsf in ps_jsf_delayed.DefaultIfEmpty()
                where s.CompletionDateAsPerContract.HasValue &&
                      (s.ExpectedCompletionDate ?? now) > s.CompletionDateAsPerContract.Value.AddDays(15)
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

