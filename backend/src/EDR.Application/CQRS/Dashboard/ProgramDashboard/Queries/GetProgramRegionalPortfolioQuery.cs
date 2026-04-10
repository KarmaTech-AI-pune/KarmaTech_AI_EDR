using System.Collections.Generic;
using MediatR;
using EDR.Application.Dtos.ProgramDashboard;

namespace EDR.Application.CQRS.Dashboard.ProgramDashboard.Queries
{
    public class GetProgramRegionalPortfolioQuery : IRequest<List<RegionalPortfolioDto>>
    {
        public int ProgramId { get; set; }
    }
}
