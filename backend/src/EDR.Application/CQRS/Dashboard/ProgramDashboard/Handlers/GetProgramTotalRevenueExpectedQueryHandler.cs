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
    public class GetProgramTotalRevenueExpectedQueryHandler : IRequestHandler<GetProgramTotalRevenueExpectedQuery, TotalRevenueExpectedDto>
    {
        private readonly IProgramDashboardRepository _programDashboardRepository;

        public GetProgramTotalRevenueExpectedQueryHandler(IProgramDashboardRepository programDashboardRepository)
        {
            _programDashboardRepository = programDashboardRepository;
        }

        public async Task<TotalRevenueExpectedDto> Handle(GetProgramTotalRevenueExpectedQuery request, CancellationToken cancellationToken)
        {
            var projects = await _programDashboardRepository.GetProjectsByProgramIdAsync(request.ProgramId, cancellationToken);
            if (!projects.Any()) return null;

            var allJsf = await _programDashboardRepository.GetJobStartFormsByProjectIdsAsync(projects.Select(p => p.Id), cancellationToken);

            var totalRevenueExpected = projects.Sum(p => (p.EstimatedProjectCost ?? 0) + (p.EstimatedProjectFee ?? 0));

            // Quarterly Changes
            var currentDate = DateTime.Now;
            var currentYear = currentDate.Year;
            var currentMonth = currentDate.Month;
            var currentQuarter = (currentMonth - 1) / 3 + 1;
            
            var previousQuarter = currentQuarter == 1 ? 4 : currentQuarter - 1;
            var previousQuarterYear = currentQuarter == 1 ? currentYear - 1 : currentYear;

            var currentQuarterRev = allJsf
                .Where(jsf => jsf.CreatedDate.Year == currentYear && ((jsf.CreatedDate.Month - 1) / 3 + 1) == currentQuarter)
                .Sum(jsf => jsf.GrandTotal + jsf.TotalProjectFees);
            
            var prevQuarterRev = allJsf
                .Where(jsf => jsf.CreatedDate.Year == previousQuarterYear && ((jsf.CreatedDate.Month - 1) / 3 + 1) == previousQuarter)
                .Sum(jsf => jsf.GrandTotal + jsf.TotalProjectFees);

            var revChange = prevQuarterRev > 0 ? ((currentQuarterRev - prevQuarterRev) / prevQuarterRev) * 100 : 0;

            return new TotalRevenueExpectedDto
            {
                TotalRevenue = Math.Round(totalRevenueExpected, 2),
                ChangeDescription = $"{revChange:F1}% vs last quarter",
                ChangeType = revChange > 0 ? "positive" : (revChange < 0 ? "negative" : "neutral")
            };
        }
    }
}
