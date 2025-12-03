using MediatR;
using NJS.Application.Dtos.Dashboard;
using System.Collections.Generic;

namespace NJS.Application.CQRS.Dashboard.Cashflow.Queries
{
    public class GetMonthlyCashflowAnalysisQuery : IRequest<List<MonthlyCashflowDto>>
    {
        public string Timeframe { get; set; } // "This Year", "Last Year", etc. - optional for now but good to have
    }
}
