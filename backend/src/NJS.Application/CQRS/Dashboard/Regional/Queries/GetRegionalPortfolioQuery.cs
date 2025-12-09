using MediatR;
using NJS.Application.Dtos.Dashboard;
using System.Collections.Generic;

namespace NJS.Application.CQRS.Dashboard.Regional.Queries
{
    public class GetRegionalPortfolioQuery : IRequest<List<RegionalPortfolioDto>>
    {
    }
}
