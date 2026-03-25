using MediatR;
using EDR.Application.Dtos.Dashboard;

namespace EDR.Application.CQRS.Dashboard.TotalRevenueExpected.Queries
{
    public class GetTotalRevenueExpectedQuery : IRequest<TotalRevenueExpectedDto>
    {
    }
}

