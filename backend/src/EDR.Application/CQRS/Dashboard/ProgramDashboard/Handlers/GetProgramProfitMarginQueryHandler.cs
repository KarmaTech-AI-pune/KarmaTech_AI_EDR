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
            if (!projects.Any()) return null;

            var projectIds = projects.Select(p => p.Id).ToList();
            var allJsf = await _programDashboardRepository.GetJobStartFormsByProjectIdsAsync(projectIds, cancellationToken);
            var progressReports = await _programDashboardRepository.GetMonthlyProgressesByProjectIdsAsync(projectIds, cancellationToken);

            var profitMargin = allJsf.Any() ? (double)allJsf.Average(jsf => jsf.ProfitPercentage) : 0;

            // Quarterly Changes
            var currentDate = DateTime.Now;
            var currentYear = currentDate.Year;
            var currentMonth = currentDate.Month;
            var currentQuarter = (currentMonth - 1) / 3 + 1;
            
            var previousQuarter = currentQuarter == 1 ? 4 : currentQuarter - 1;
            var previousQuarterYear = currentQuarter == 1 ? currentYear - 1 : currentYear;

            var currentQuarterProfit = allJsf
                .Where(jsf => jsf.CreatedDate.Year == currentYear && ((jsf.CreatedDate.Month - 1) / 3 + 1) == currentQuarter)
                .Select(jsf => jsf.ProfitPercentage).DefaultIfEmpty(0).Average();
            
            var prevQuarterProfit = allJsf
                .Where(jsf => jsf.CreatedDate.Year == previousQuarterYear && ((jsf.CreatedDate.Month - 1) / 3 + 1) == previousQuarter)
                .Select(jsf => jsf.ProfitPercentage).DefaultIfEmpty(0).Average();

            var profitChange = prevQuarterProfit > 0 ? ((currentQuarterProfit - prevQuarterProfit) / prevQuarterProfit) * 100 : 0;

            return new ProgramProfitMarginDto
            {
                ProfitMargin = Math.Round((decimal)profitMargin, 2),
                ProfitMarginChangeDescription = $"{profitChange:F1}% vs last quarter",
                ProfitMarginChangeType = profitChange > 0 ? "positive" : (profitChange < 0 ? "negative" : "neutral")
            };
        }
    }
}
