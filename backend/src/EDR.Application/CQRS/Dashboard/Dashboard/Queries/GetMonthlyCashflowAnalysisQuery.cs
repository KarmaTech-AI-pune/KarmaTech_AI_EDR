using MediatR;
using EDR.Application.Dtos.Dashboard;
using System.Collections.Generic;

namespace EDR.Application.CQRS.Dashboard.Dashboard.Queries
{
    public class GetMonthlyCashflowAnalysisQuery : IRequest<List<MonthlyCashflowDto>>
    {
        public string Timeframe { get; set; } // "This Year", "Last Year", etc. - optional for now but good to have
    }
}

