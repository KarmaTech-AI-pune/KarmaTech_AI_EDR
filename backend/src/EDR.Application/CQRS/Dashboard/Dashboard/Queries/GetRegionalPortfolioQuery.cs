using MediatR;
using EDR.Application.Dtos.Dashboard;
using System.Collections.Generic;

namespace EDR.Application.CQRS.Dashboard.Dashboard.Queries
{
    public class GetRegionalPortfolioQuery : IRequest<List<RegionalPortfolioDto>>
    {
    }
}

