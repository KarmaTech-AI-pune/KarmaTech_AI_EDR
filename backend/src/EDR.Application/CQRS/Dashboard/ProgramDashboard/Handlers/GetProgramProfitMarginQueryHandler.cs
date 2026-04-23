using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using EDR.Application.CQRS.Dashboard.ProgramDashboard.Queries;
using EDR.Repositories.Interfaces;
using EDR.Application.Dtos.ProgramDashboard;

namespace EDR.Application.CQRS.Dashboard.ProgramDashboard.Handlers
{
    public class GetProgramProfitMarginQueryHandler : IRequestHandler<GetProgramProfitMarginQuery, ProgramProfitMarginDto>
    {
        private readonly IProgramDashboardRepository _programDashboardRepository;

        public GetProgramProfitMarginQueryHandler(IProgramDashboardRepository programDashboardRepository)
        {
            _programDashboardRepository = programDashboardRepository;
        }

        public async Task<ProgramProfitMarginDto> Handle(GetProgramProfitMarginQuery request, CancellationToken cancellationToken)
        {
            var projects = await _programDashboardRepository.GetProjectsByProgramIdAsync(request.ProgramId, cancellationToken);
            if (!projects.Any()) return new ProgramProfitMarginDto
            {
                ExpectedProfitMargin = 0,
                ExpectedProfitMarginChangeDescription = "0% improvement",
                ExpectedProfitMarginChangeType = "neutral",
                ActualProfitMargin = 0,
                ActualProfitMarginChangeDescription = "0% improvement",
                ActualProfitMarginChangeType = "neutral"
            };

            var projectIds = projects.Select(p => p.Id).ToList();
            var allJsf = await _programDashboardRepository.GetJobStartFormsByProjectIdsAsync(projectIds, cancellationToken);
            var progressReports = await _programDashboardRepository.GetMonthlyProgressesByProjectIdsAsync(projectIds, cancellationToken);

            // Latest JSF per project
            var latestJsfs = allJsf
                .GroupBy(jsf => jsf.ProjectId)
                .Select(g => g.OrderByDescending(jsf => jsf.CreatedDate).FirstOrDefault())
                .Where(jsf => jsf != null)
                .ToList();

            // Latest Monthly Progress per project
            var latestReports = progressReports
                .GroupBy(mp => mp.ProjectId)
                .Select(g => g.OrderByDescending(mp => mp.Year).ThenByDescending(mp => mp.Month).FirstOrDefault())
                .Where(mp => mp?.CTCEAC != null)
                .ToList();

            var expectedProfitMargin = latestJsfs.Any() ? (double)latestJsfs.Average(jsf => jsf.ProfitPercentage) : 0;
            var actualProfitMargin = latestReports.Any() ? (double)latestReports.Average(mp => mp.CTCEAC.GrossProfitPercentage ?? 0) : 0;

            // Quarterly Changes logic
            var currentDate = DateTime.Now;
            var currentYear = currentDate.Year;
            var currentMonth = currentDate.Month;
            var currentQuarter = (currentMonth - 1) / 3 + 1;
            
            var previousQuarter = currentQuarter == 1 ? 4 : currentQuarter - 1;
            var previousQuarterYear = currentQuarter == 1 ? currentYear - 1 : currentYear;

            // Expected Changes
            var currentQuarterExpected = allJsf
                .Where(jsf => jsf.CreatedDate.Year == currentYear && ((jsf.CreatedDate.Month - 1) / 3 + 1) == currentQuarter)
                .Select(jsf => jsf.ProfitPercentage).DefaultIfEmpty(0).Average();
            
            var prevQuarterExpected = allJsf
                .Where(jsf => jsf.CreatedDate.Year == previousQuarterYear && ((jsf.CreatedDate.Month - 1) / 3 + 1) == previousQuarter)
                .Select(jsf => jsf.ProfitPercentage).DefaultIfEmpty(0).Average();

            var expectedChange = prevQuarterExpected > 0 ? ((currentQuarterExpected - prevQuarterExpected) / prevQuarterExpected) * 100 : 0;

            // Actual Changes
            var currentQuarterActual = progressReports
                .Where(mp => mp.Year == currentYear && ((mp.Month - 1) / 3 + 1) == currentQuarter)
                .Select(mp => mp.CTCEAC?.GrossProfitPercentage ?? 0).DefaultIfEmpty(0).Average();
            
            var prevQuarterActual = progressReports
                .Where(mp => mp.Year == previousQuarterYear && ((mp.Month - 1) / 3 + 1) == previousQuarter)
                .Select(mp => mp.CTCEAC?.GrossProfitPercentage ?? 0).DefaultIfEmpty(0).Average();

            var actualChange = prevQuarterActual > 0 ? ((currentQuarterActual - prevQuarterActual) / prevQuarterActual) * 100 : 0;

            return new ProgramProfitMarginDto
            {
                ExpectedProfitMargin = Math.Round((decimal)expectedProfitMargin, 2),
                ExpectedProfitMarginChangeDescription = $"{expectedChange:F1}% improvement",
                ExpectedProfitMarginChangeType = expectedChange > 0 ? "positive" : (expectedChange < 0 ? "negative" : "neutral"),

                ActualProfitMargin = Math.Round((decimal)actualProfitMargin, 2),
                ActualProfitMarginChangeDescription = $"{actualChange:F1}% improvement",
                ActualProfitMarginChangeType = actualChange > 0 ? "positive" : (actualChange < 0 ? "negative" : "neutral")
            };
        }
    }
}
